import redis from '../../lib/redis.js';
import { generateResultCacheHash, CACHE_KEYS, CACHE_TTL } from '../../lib/cacheHelpers.ts';
import { getApiDefinition } from '../../utils/helperApi.js';
import { validateServiceToken } from '../../utils/tokenAuth.js';
import { validateParameters, applyDefaults, coerceTypes } from '../../lib/parameterValidation.js';
import { getSheetNameFromAddress, getIsSingleCellFromAddress, getRangeAsOffset, getDateForCallsLog } from '../../utils/helper.js';
import { triggerWebhook } from '../../lib/webhookHelpers.js';
import { triggerPusherEvent } from '../../lib/pusher/server.js';

// Lazy load SpreadJS
let spreadjsModule = null;
let spreadjsInitialized = false;

const getSpreadjsModule = () => {
  if (!spreadjsModule) {
    spreadjsModule = require('../../lib/spreadjs-server.js');
  }
  if (!spreadjsInitialized) {
    spreadjsModule.initializeSpreadJS();
    spreadjsInitialized = true;
  }
  return spreadjsModule;
};

const tableSheetCache = require('../../lib/tableSheetDataCache.js');

// Helper function to log API calls
// Returns a promise that can be awaited with after() for Vercel compatibility
export async function logCalls(apiId, apiToken) {
  try {
    // Fetch tenantId and userId together
    const [tenantId, userId] = await Promise.all([
      redis.hGet(`service:${apiId}`, "tenantId").catch(() => null),
      redis.hGet(`service:${apiId}`, "userId").catch(() => null),
    ]);

    const dateString = getDateForCallsLog();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();

    const multi = redis.multi();

    if (tenantId) {
      multi.hIncrBy(`tenant:${tenantId}`, "calls", 1);
      multi.hIncrBy(`tenant:${tenantId}`, `calls:${dateString}`, 1);
      multi.hIncrBy(`tenant:${tenantId}`, `calls:${dateString}:service:${apiId}`, 1);
    }

    multi.hIncrBy(`service:${apiId}:published`, "calls", 1);
    multi.hIncrBy(`service:${apiId}`, `calls:${dateString}`, 1);

    // Analytics tracking
    multi.hIncrBy(`service:${apiId}:analytics`, 'total', 1);
    multi.hIncrBy(`service:${apiId}:analytics`, `${today}:${currentHour}`, 1);
    multi.hIncrBy(`service:${apiId}:analytics`, `${today}:calls`, 1);

    if (apiToken) {
      multi.hIncrBy(`service:${apiId}`, `calls:token:${apiToken}`, 1);
      multi.hIncrBy(`service:${apiId}`, `calls:${dateString}:token:${apiToken}`, 1);
    }

    // Real-time update: debounce check + count fetch at END of multi
    if (userId) {
      multi.set(`pusher:debounce:${apiId}`, '1', { EX: 5, NX: true });
      multi.hGet(`service:${apiId}:published`, 'calls');
    }

    const results = await multi.exec();

    // Trigger Pusher if debounce allows (last two results are debounce + count)
    if (userId && results && results.length >= 2) {
      const shouldSend = results[results.length - 2] === 'OK';
      const newCallCount = results[results.length - 1];
      if (shouldSend) {
        triggerPusherEvent(`private-user-${userId}`, 'call-count-update', {
          serviceId: apiId,
          calls: parseInt(newCallCount) || 0,
        });
      }
    }
  } catch (error) {
    console.error("[logCalls] Error logging API call:", error.message);
  }
}

// Track analytics (simplified version without queue)
function trackAnalytics(serviceId, metric, value) {
  setImmediate(async () => {
    try {
      await redis.hIncrBy(`service:${serviceId}:analytics`, metric, value);
    } catch (err) {
      console.error(`[trackAnalytics] Failed to track ${metric} for ${serviceId}:`, err.message);
    }
  });
}

/**
 * Direct calculation function - rock-solid execution engine
 *
 * @param {string} serviceId - The service ID to execute
 * @param {object} inputs - Key-value pairs of input parameters
 * @param {string|null} apiToken - Optional API token for authentication
 * @param {object} options - Optional settings (nocdn, nocache, etc.)
 * @returns {Promise<object>} Result object with inputs, outputs, metadata, or error
 */
export async function calculateDirect(serviceId, inputs, apiToken, options = {}) {
  const timeAll = Date.now();
  const { nocache = false, isWebAppAuthenticated = false } = options;

  try {
    // Note: logCalls is now called from route.js with after() for Vercel compatibility

    // L1: Check result cache first (fastest path)
    if (!nocache) {
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId);

      try {
        const cachedResultString = await redis.hGet(cacheKey, inputHash);
        if (cachedResultString) {
          const cachedResult = JSON.parse(cachedResultString);

          // Track cache hit
          trackAnalytics(serviceId, 'cache:hits', 1);

          const totalTime = Date.now() - timeAll;
          console.log(`[calculateDirect] Result cache HIT for ${serviceId}, total time: ${totalTime}ms`);

          return {
            ...cachedResult,
            metadata: {
              executionTime: totalTime,
              timestamp: new Date().toISOString(),
              fromResultCache: true,
              cached: true,
              useCaching: cachedResult.metadata?.useCaching,
              hasTableSheets: cachedResult.metadata?.hasTableSheets,
              cacheLayer: 'L1:Result'
            }
          };
        }
      } catch (cacheError) {
        console.error(`[calculateDirect] Result cache check error for ${serviceId}:`, cacheError.message);
        // Continue without cache - don't fail the request
      }
    } else {
      console.log(`[calculateDirect] Result cache BYPASS (nocache=true) for ${serviceId}`);
    }

    // Track cache miss
    trackAnalytics(serviceId, 'cache:misses', 1);

    // Get API definition
    const apiDataStart = Date.now();
    const apiDefinition = await getApiDefinition(serviceId, apiToken);
    const timeApiData = Date.now() - apiDataStart;

    if (!apiDefinition || apiDefinition.error) {
      console.error(`[calculateDirect] API definition error for ${serviceId}:`, apiDefinition?.error);
      return { error: apiDefinition?.error || 'Service not found' };
    }

    // Check token if required
    if ((apiDefinition.needsToken || apiDefinition.requireToken) && !isWebAppAuthenticated) {
      const mockRequest = {
        headers: {
          get: (name) => name.toLowerCase() === 'authorization' && apiToken ? `Bearer ${apiToken}` : null
        },
        url: `http://localhost?token=${apiToken || ''}`
      };

      const tokenValidation = await validateServiceToken(mockRequest, serviceId);
      if (!tokenValidation.valid) {
        console.error(`[calculateDirect] Token validation failed for ${serviceId}:`, tokenValidation.error);
        return { error: tokenValidation.error || 'Authentication required' };
      }
    }

    const fileJson = apiDefinition?.fileJson ?? {};
    if (!fileJson || Object.keys(fileJson).length === 0) {
      console.error(`[calculateDirect] No service data (fileJson) for ${serviceId}`);
      return { error: "no service data" };
    }

    // Estimate fileJson size for cache size filtering
    let fileJsonSizeBytes = 0;
    try {
      fileJsonSizeBytes = JSON.stringify(fileJson).length;
    } catch (sizeError) {
      console.error(`[calculateDirect] Failed to calculate fileJson size for ${serviceId}:`, sizeError.message);
      fileJsonSizeBytes = 10 * 1024 * 1024; // Assume 10MB if we can't calculate
    }

    const apiJson = apiDefinition?.apiJson ?? {};
    const apiInputs = apiJson?.inputs || apiJson?.input || [];
    const apiOutputs = apiJson?.outputs || apiJson?.output || [];

    // Validate parameters (before expensive operations)
    const validation = validateParameters(inputs, apiInputs);
    if (!validation.valid) {
      console.error(`[calculateDirect] Parameter validation failed for ${serviceId}:`, validation.error);
      return { error: validation.error, message: validation.message, details: validation.details };
    }

    const inputsWithDefaults = applyDefaults(inputs, apiInputs);
    const finalInputs = coerceTypes(inputsWithDefaults, apiInputs);

    // Load SpreadJS
    const spreadjsLoadStart = Date.now();
    let spreadjs;
    try {
      spreadjs = getSpreadjsModule();
    } catch (spreadjsError) {
      console.error(`[calculateDirect] Failed to load SpreadJS for ${serviceId}:`, spreadjsError.message);
      return { error: "calculation engine failed to load" };
    }
    const { getCachedWorkbook, createWorkbook, needsTablesheetModule, loadTablesheetModule } = spreadjs;
    const timeSpreadJSLoad = Date.now() - spreadjsLoadStart;

    const withTables = needsTablesheetModule(fileJson);
    let timeTableSheetLoad = 0;
    if (withTables) {
      const tablesheetLoadStart = Date.now();
      const tablesheetLoaded = loadTablesheetModule();
      timeTableSheetLoad = Date.now() - tablesheetLoadStart;
      if (!tablesheetLoaded) {
        console.error(`[calculateDirect] Failed to load TableSheet module for ${serviceId}`);
        return { error: "error loading required modules" };
      }
    }

    const useCaching = apiDefinition.useCaching !== false && !nocache;
    let spread;
    let fromProcessCache = false;
    let fromRedisCache = false;

    if (useCaching) {
      const workbookCacheKey = CACHE_KEYS.workbookCache(serviceId);

      const cacheResult = await getCachedWorkbook(
        serviceId,
        serviceId,
        async (workbook) => {
          // Try Redis cache (L2b)
          let loadedFromRedis = false;
          try {
            const cachedWorkbookJson = await redis.json.get(workbookCacheKey);
            if (cachedWorkbookJson) {
              console.log(`[calculateDirect] Found workbook in Redis cache for ${serviceId}`);
              workbook.fromJSON(cachedWorkbookJson, { calcOnDemand: false, doNotRecalculateAfterLoad: true });
              loadedFromRedis = true;
              fromRedisCache = true;
            }
          } catch (redisError) {
            console.error(`[calculateDirect] Redis workbook cache error for ${serviceId}:`, redisError.message);
            // Continue to load from blob
          }

          // Load from blob if not in Redis (L3)
          if (!loadedFromRedis) {
            console.log(`[calculateDirect] Loading workbook from blob for ${serviceId}`);
            workbook.fromJSON(fileJson, { calcOnDemand: false, doNotRecalculateAfterLoad: true });

            // Handle TableSheets
            if (withTables) {
              const dataManager = workbook.dataManager();
              if (dataManager?.tables) {
                const cacheTableSheetData = apiDefinition.cacheTableSheetData !== 'false';
                const tableSheetCacheTTL = parseInt(apiDefinition.tableSheetCacheTTL) || 300;

                await Promise.all(
                  Object.entries(dataManager.tables).map(async ([rowKey, table]) => {
                    try {
                      let tableUrl = table.source?.remote?.read || table.source?.remote?.url;
                      const cacheKey = `${serviceId}:table:${rowKey}:${tableUrl || 'local'}`;

                      if (cacheTableSheetData && tableUrl) {
                        const cachedData = tableSheetCache.getCachedTableSheetData(cacheKey, tableSheetCacheTTL);
                        if (cachedData) {
                          console.log(`[TableSheet Cache HIT] ${rowKey} for service ${serviceId}`);
                          if (table.setDataSource) table.setDataSource(cachedData);
                          return cachedData;
                        }
                      }

                      console.log(`[TableSheet Cache MISS] Fetching ${rowKey} for service ${serviceId}`);
                      const freshData = await table.fetch(true);
                      if (cacheTableSheetData && tableUrl && freshData) {
                        const dataSize = JSON.stringify(freshData).length;
                        tableSheetCache.cacheTableSheetData(cacheKey, freshData, tableUrl, dataSize);
                      }
                      return freshData;
                    } catch (tableError) {
                      console.error(`[calculateDirect] Error fetching table ${rowKey} for ${serviceId}:`, tableError.message);
                      return null;
                    }
                  })
                );
              }
            }

            // Save to Redis for other Lambda instances (non-blocking)
            if (!withTables) {
              Promise.resolve().then(async () => {
                try {
                  const multi = redis.multi();
                  multi.json.set(workbookCacheKey, "$", workbook.toJSON());
                  multi.expire(workbookCacheKey, CACHE_TTL.workbook);
                  await multi.exec();
                  console.log(`[calculateDirect] Saved workbook to Redis cache for ${serviceId}`);
                } catch (cacheSetError) {
                  console.error(`[calculateDirect] Failed to cache workbook in Redis for ${serviceId}:`, cacheSetError.message);
                }
              });
            }
          }
        },
        false,
        fileJsonSizeBytes
      );

      spread = cacheResult.workbook;
      fromProcessCache = cacheResult.fromCache;
    } else {
      spread = createWorkbook();
      spread.fromJSON(fileJson, { calcOnDemand: false, doNotRecalculateAfterLoad: true });
    }

    let actualSheet = spread.getActiveSheet();
    if (!actualSheet) {
      console.error(`[calculateDirect] No active sheet found for ${serviceId}`);
      return { error: "no active sheet in workbook" };
    }
    let actualSheetName = actualSheet.name();

    // Process inputs
    const answerInputs = [];
    const inputList = Object.entries(finalInputs).map(([key, value]) => ({ name: key.toLowerCase(), value }));

    const inputDefMap = new Map();
    for (const inp of apiInputs) {
      if (inp.name) inputDefMap.set(inp.name.toLowerCase(), inp);
      if (inp.address) inputDefMap.set(inp.address.toLowerCase(), inp);
    }

    for (const input of inputList) {
      const inputDef = inputDefMap.get(input.name);
      if (inputDef) {
        let inputSheetName = getSheetNameFromAddress(inputDef.address);
        if (inputSheetName !== actualSheetName) {
          actualSheet = spread.getSheetFromName(inputSheetName);
          if (!actualSheet) {
            console.error(`[calculateDirect] Sheet not found: ${inputSheetName} for ${serviceId}`);
            return { error: `sheet not found: ${inputSheetName}` };
          }
          actualSheetName = actualSheet.name();
        }

        try {
          actualSheet.getCell(inputDef.row, inputDef.col).value(input.value);
        } catch (cellError) {
          console.error(`[calculateDirect] Failed to set input cell for ${input.name} in ${serviceId}:`, cellError.message);
          return { error: `failed to set input: ${input.name}` };
        }

        answerInputs.push({
          name: inputDef.name ?? input.name,
          title: inputDef.title || inputDef.name || input.name,
          value: input.value,
        });
      }
    }

    // Get outputs
    const answerOutputs = [];
    for (const output of apiOutputs) {
      let outputSheetName = getSheetNameFromAddress(output.address);
      if (outputSheetName !== actualSheetName) {
        actualSheet = spread.getSheetFromName(outputSheetName);
        if (!actualSheet) {
          console.error(`[calculateDirect] Output sheet not found: ${outputSheetName} for ${serviceId}`);
          return { error: `output sheet not found: ${outputSheetName}` };
        }
        actualSheetName = actualSheet.name();
      }

      const isSingleCell = getIsSingleCellFromAddress(output.address);
      let cellResult;

      try {
        if (isSingleCell) {
          let row = output.row;
          let col = output.col;
          if (row === undefined || col === undefined) {
            const range = getRangeAsOffset(output.address);
            row = range?.row ?? 0;
            col = range?.col ?? 0;
          }
          cellResult = actualSheet.getCell(row, col).value();
        } else {
          let rowCount, colCount;
          if (output.rowCount && output.colCount) {
            rowCount = output.rowCount;
            colCount = output.colCount;
          } else {
            const range = getRangeAsOffset(output.address);
            rowCount = (range?.rowTo ?? 0) - (range?.rowFrom ?? 0) + 1;
            colCount = (range?.colTo ?? 0) - (range?.colFrom ?? 0) + 1;
          }
          cellResult = actualSheet.getArray(output.row, output.col, rowCount, colCount, false);
        }
      } catch (outputError) {
        console.error(`[calculateDirect] Failed to get output ${output.name} for ${serviceId}:`, outputError.message);
        return { error: `failed to get output: ${output.name}` };
      }

      const outputObj = {
        name: output.name,
        title: output.title || output.name,
        value: cellResult,
      };

      if (output.formatString) {
        outputObj.formatString = output.formatString;
      }

      answerOutputs.push(outputObj);
    }

    // Determine cache layer for metadata
    let cacheLayer = 'L3:Blob';
    if (fromProcessCache) {
      cacheLayer = 'L2a:Process';
    } else if (fromRedisCache) {
      cacheLayer = 'L2b:Redis';
    }

    const executionTime = Date.now() - timeAll;
    const result = {
      apiId: serviceId,
      serviceName: apiJson?.name || apiJson?.title || null,
      serviceDescription: apiJson?.description || null,
      inputs: answerInputs,
      outputs: answerOutputs,
      metadata: {
        dataFetchTime: timeApiData,
        executionTime: executionTime,
        engineLoadTime: timeSpreadJSLoad,
        tableSheetLoadTime: timeTableSheetLoad,
        hasTableSheets: withTables,
        useCaching: useCaching,
        recalc: false,
        fromProcessCache: fromProcessCache,
        fromRedisCache: fromRedisCache,
        cached: fromProcessCache || fromRedisCache,
        cacheLayer: cacheLayer,
        memoryUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      }
    };

    console.log(`[calculateDirect] Calculation complete for ${serviceId}: ${executionTime}ms (cache: ${cacheLayer})`);

    // Cache result (blocking to ensure next request hits cache)
    if (useCaching) {
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId);

      try {
        const multi = redis.multi();
        multi.hSet(cacheKey, inputHash, JSON.stringify(result));
        multi.expire(cacheKey, CACHE_TTL.result);
        await multi.exec();
        console.log(`[calculateDirect] Saved result to cache hash: ${cacheKey}[${inputHash}]`);
      } catch (cacheSetError) {
        console.error(`[calculateDirect] Failed to cache result for ${serviceId}:`, cacheSetError.message);
        // Don't fail the request - caching is best-effort
      }
    }

    // Trigger webhook (non-blocking)
    triggerWebhook(apiDefinition, result);

    return result;

  } catch (error) {
    console.error(`[calculateDirect] CRITICAL ERROR for ${serviceId}:`, error);
    trackAnalytics(serviceId, 'errors', 1);
    return { error: "calculation failed: " + (error.message || "unknown error") };
  }
}
