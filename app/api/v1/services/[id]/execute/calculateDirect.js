import redis from '@/lib/redis';
import { generateResultCacheHash, CACHE_KEYS, CACHE_TTL } from '@/lib/cacheHelpers';
import { getApiDefinition } from '@/utils/helperApi';
import { validateServiceToken } from '@/utils/tokenAuth';
import { validateParameters, applyDefaults, coerceTypes } from '@/lib/parameterValidation.js';
import {
  getSheetNameFromAddress,
  getIsSingleCellFromAddress,
  getRangeAsOffset,
  getDateForCallsLog,
} from '@/utils/helper';
import { analyticsQueue } from '@/lib/analyticsQueue.js';
import { triggerWebhook } from '@/lib/webhookHelpers.js';

// Lazy load SpreadJS to improve cold start
let spreadjsModule = null;
let spreadjsInitialized = false;

const getSpreadjsModule = () => {
  if (!spreadjsModule) {
    spreadjsModule = require('@/lib/spreadjs-server');
  }
  // Initialize base SpreadJS only once per process
  if (!spreadjsInitialized) {
    spreadjsModule.initializeSpreadJS();
    spreadjsInitialized = true;
  }
  return spreadjsModule;
};

// TableSheet data caching
const tableSheetCache = require('@/lib/tableSheetDataCache');

// Helper function to log API calls (optimized for zero blocking)
function logCalls(apiId, apiToken) {
  // Defer to next event loop tick - completely non-blocking
  setImmediate(async () => {
    try {
      // This Redis call now happens AFTER the API response is sent
      const tenantId = await redis
        .HGET(`service:${apiId}`, "tenantId")
        .catch(() => null);
      const dateString = getDateForCallsLog();
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentHour = now.getUTCHours();

      const multi = redis.multi();

      if (tenantId) {
        multi.hIncrBy(`tenant:${tenantId}`, "calls", 1);
        multi.hIncrBy(`tenant:${tenantId}`, `calls:${dateString}`, 1);
        multi.hIncrBy(
          `tenant:${tenantId}`,
          `calls:${dateString}:service:${apiId}`,
          1
        );
      }

      multi.hIncrBy(`service:${apiId}:published`, "calls", 1);
      multi.hIncrBy(`service:${apiId}`, `calls:${dateString}`, 1);

      // New analytics tracking
      multi.hIncrBy(`service:${apiId}:analytics`, 'total', 1);
      multi.hIncrBy(`service:${apiId}:analytics`, `${today}:${currentHour}`, 1);
      multi.hIncrBy(`service:${apiId}:analytics`, `${today}:calls`, 1);

      if (apiToken) {
        multi.hIncrBy(`service:${apiId}`, `calls:token:${apiToken}`, 1);
        multi.hIncrBy(
          `service:${apiId}`,
          `calls:${dateString}:token:${apiToken}`,
          1
        );
      }

      // Execute - errors are logged but don't block
      await multi.exec();
    } catch (error) {
      console.error("Log calls error:", error);
    }
  });
}

/**
 * Direct calculation function - avoids HTTP call overhead
 * This is the core calculation engine used by:
 * - V1 API route (/api/v1/services/[id]/execute)
 * - MCP servers (/api/mcp, /api/mcp/bridge)
 * - Chat route (/api/chat)
 *
 * @param {string} serviceId - The service ID to execute
 * @param {object} inputs - Key-value pairs of input parameters
 * @param {string|null} apiToken - Optional API token for authentication
 * @param {object} options - Optional settings (nocdn, nocache, etc.)
 * @returns {Promise<object>} Result object with inputs, outputs, metadata, or error
 */
export async function calculateDirect(serviceId, inputs, apiToken, options = {}) {
  const timeAll = Date.now();
  const { nocdn = false, nocache = false, isWebAppAuthenticated = false } = options;

  try {
    // Log the call
    logCalls(serviceId, apiToken);

    // L1: Check result cache FIRST (fastest - complete result cached)
    // This is the express lane: if exact same calculation was done before, return it immediately
    // Uses Redis Hash: all results for a service stored in single hash for efficient invalidation
    // nocdn = bypass HTTP/edge cache only (doesn't affect Redis caching)
    // nocache = bypass ALL caches (HTTP/edge + Redis result cache + workbook cache)
    if (!nocache) {
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId);

      try {
        // Get result from hash field
        const cachedResultString = await redis.hGet(cacheKey, inputHash);
        if (cachedResultString) {
          const cachedResult = JSON.parse(cachedResultString);

          // Track cache hit (using analytics queue for better performance)
          analyticsQueue.track(serviceId, 'cache:hits', 1);

          const totalTime = Date.now() - timeAll;
          console.log(`[calculateDirect] Result cache HIT for ${serviceId}, total time: ${totalTime}ms`);

          return {
            ...cachedResult,
            metadata: {
              // Clear timing metadata - not relevant for cached results
              executionTime: totalTime,
              timestamp: new Date().toISOString(),
              fromResultCache: true,
              cached: true,
              // Preserve non-timing metadata
              useCaching: cachedResult.metadata?.useCaching,
              hasTableSheets: cachedResult.metadata?.hasTableSheets,
              // Indicate this was served from result cache
              cacheLayer: 'L1:Result'
            }
          };
        }
      } catch (cacheError) {
        console.error(`Result cache check error for ${serviceId}:`, cacheError);
      }
    } else {
      console.log(`[Result Cache] BYPASS due to nocache=true`);
    }

    // Result cache miss - track it (using analytics queue for better performance)
    analyticsQueue.track(serviceId, 'cache:misses', 1);

    // Get API definition
    const apiDataStart = Date.now();
    const apiDefinition = await getApiDefinition(serviceId, apiToken);
    const timeApiData = Date.now() - apiDataStart;

    if (!apiDefinition || apiDefinition.error) {
      return { error: apiDefinition?.error || 'Service not found' };
    }

    // Check token authentication if required
    // Skip validation if request is from authenticated WebApp
    if ((apiDefinition.needsToken || apiDefinition.requireToken) && !isWebAppAuthenticated) {
      const mockRequest = {
        headers: {
          get: (name) => {
            if (name.toLowerCase() === 'authorization' && apiToken) {
              return `Bearer ${apiToken}`;
            }
            return null;
          }
        },
        url: `http://localhost?token=${apiToken || ''}`
      };

      const tokenValidation = await validateServiceToken(mockRequest, serviceId);

      if (!tokenValidation.valid) {
        return { error: tokenValidation.error || 'Authentication required' };
      }
    }

    // Get the file JSON
    const fileJson = apiDefinition?.fileJson ?? {};
    if (!fileJson) return { error: "no service data" };

    const apiJson = apiDefinition?.apiJson ?? {};
    const apiInputs = apiJson?.inputs || apiJson?.input || [];
    const apiOutputs = apiJson?.outputs || apiJson?.output || [];

    // ============================================================================
    // VALIDATION: Do this BEFORE loading any expensive modules or workbooks
    // ============================================================================

    // Step 1: Validate provided inputs (mandatory, type, bounds, enums)
    const validation = validateParameters(inputs, apiInputs);
    if (!validation.valid) {
      return {
        error: validation.error,
        message: validation.message,
        details: validation.details
      };
    }

    // Step 2: Apply default values for missing optional parameters
    const inputsWithDefaults = applyDefaults(inputs, apiInputs);

    // Step 3: Coerce types (convert strings to numbers/booleans)
    const finalInputs = coerceTypes(inputsWithDefaults, apiInputs);

    // ============================================================================
    // End of validation - now safe to proceed with expensive operations
    // ============================================================================

    // Get SpreadJS functions early - this initializes base SpreadJS
    const spreadjsLoadStart = Date.now();
    const spreadjs = getSpreadjsModule();
    const { getCachedWorkbook, createWorkbook, needsTablesheetModule, loadTablesheetModule } = spreadjs;
    const timeSpreadJSLoad = Date.now() - spreadjsLoadStart;

    // Check if we need TableSheet module (only load if actually needed)
    const withTables = needsTablesheetModule(fileJson);
    let timeTableSheetLoad = 0;
    if (withTables) {
      const tablesheetLoadStart = Date.now();
      const tablesheetLoaded = loadTablesheetModule();
      timeTableSheetLoad = Date.now() - tablesheetLoadStart;
      if (!tablesheetLoaded) {
        return { error: "error loading required modules" };
      }
    }
    // Server-side caching (result cache, workbook cache, process cache)
    // nocdn = bypass HTTP/edge cache only (doesn't affect Redis caching)
    // nocache = bypass ALL caches including Redis (forces fresh calculation)
    const useCaching = apiDefinition.useCaching !== false && !nocache;

    let spread;
    let fromProcessCache = false;
    let fromRedisCache = false;
    const processCacheKey = serviceId; // Cache by API ID only

    if (useCaching) {
      const workbookCacheKey = CACHE_KEYS.workbookCache(serviceId);

      // Three-layer caching strategy:
      // L1: Process cache (0ms) - check first
      // L2: Redis cache (~30ms) - fallback for other Lambda instances
      // L3: Blob storage (~300ms) - create from fileJson

      // First try process cache (fastest - same Lambda instance)
      const cacheResult = await getCachedWorkbook(
        serviceId,
        processCacheKey,
        async (workbook) => {
          // Process cache miss - try Redis workbook cache (L2)
          let loadedFromRedis = false;

          try {
            const cachedWorkbookJson = await redis.json.get(workbookCacheKey);
            if (cachedWorkbookJson) {
              console.log(`[calculateDirect] Found workbook in Redis cache for ${serviceId}`);
              workbook.fromJSON(cachedWorkbookJson, {
                calcOnDemand: false,
                doNotRecalculateAfterLoad: true,  // Performance optimization: Skip initial calc
              });
              loadedFromRedis = true;
              fromRedisCache = true; // Set flag for metadata
            }
          } catch (err) {
            console.error('Redis workbook cache error:', err);
          }

          // If not in Redis either, create from fileJson (L3 - blob storage)
          if (!loadedFromRedis) {
            workbook.fromJSON(fileJson, {
              calcOnDemand: false,
              doNotRecalculateAfterLoad: true,  // Performance optimization: Skip initial calc
            });

            // Initialize tables if needed
            if (withTables) {
              const dataManager = workbook.dataManager();
              if (dataManager && dataManager.tables) {
                const tablePromises = [];

                // Get caching settings
                const cacheTableSheetData = apiDefinition.cacheTableSheetData !== 'false';
                const tableSheetCacheTTL = parseInt(apiDefinition.tableSheetCacheTTL) || 300;

                for (const [rowKey, rowObject] of Object.entries(dataManager.tables)) {
                  const table = rowObject;
                  const tablePromise = (async () => {
                    try {
                      // Try to get table URL for caching
                      let tableUrl = null;
                      if (table.source && typeof table.source === 'object' && table.source.remote) {
                        tableUrl = table.source.remote.read || table.source.remote.url;
                      }

                      // Create cache key
                      const cacheKey = `${serviceId}:table:${rowKey}:${tableUrl || 'local'}`;

                      // Check cache if enabled
                      if (cacheTableSheetData && tableUrl) {
                        const cachedData = tableSheetCache.getCachedTableSheetData(cacheKey, tableSheetCacheTTL);
                        if (cachedData) {
                          console.log(`[TableSheet Cache HIT] ${rowKey} for service ${serviceId}`);
                          // Apply cached data to table
                          if (table.setDataSource) {
                            table.setDataSource(cachedData);
                          }
                          return cachedData;
                        }
                      }

                      // Fetch fresh data
                      console.log(`[TableSheet Cache MISS] Fetching ${rowKey} for service ${serviceId}`);
                      const freshData = await table.fetch(true);

                      // Cache if enabled and reasonable size
                      if (cacheTableSheetData && tableUrl && freshData) {
                        const dataSize = JSON.stringify(freshData).length;
                        tableSheetCache.cacheTableSheetData(cacheKey, freshData, tableUrl, dataSize);
                      }

                      return freshData;
                    } catch (err) {
                      console.error(`Error fetching table ${rowKey}:`, err);
                      return null;
                    }
                  })();
                  tablePromises.push(tablePromise);
                }
                await Promise.all(tablePromises);
              }
            }

            // Save to Redis for other Lambda instances (non-blocking)
            if (!withTables) { // Only cache non-table workbooks for now
              Promise.resolve().then(async () => {
                try {
                  const workbookJson = workbook.toJSON();
                  const multi = redis.multi();
                  multi.json.set(workbookCacheKey, "$", workbookJson);
                  multi.expire(workbookCacheKey, CACHE_TTL.workbook);
                  await multi.exec();
                  console.log(`[calculateDirect] Saved workbook to Redis cache for ${serviceId}`);
                } catch (err) {
                  console.error('Failed to cache workbook in Redis:', err);
                }
              });
            }
          }
        }
      );
      spread = cacheResult.workbook;
      fromProcessCache = cacheResult.fromCache;
    } else {
      spread = createWorkbook();
      spread.fromJSON(fileJson, {
        calcOnDemand: false,
        doNotRecalculateAfterLoad: true,  // Performance optimization: Skip initial calc
      });
    }

    let actualSheet = spread.getActiveSheet();
    let actualSheetName = actualSheet.name();

    // Process inputs (validation and type coercion already done - just set cell values)
    const answerInputs = [];
    const inputList = Object.entries(finalInputs).map(([key, value]) => ({
      name: key.toLowerCase(),
      value: value
    }));

    // Create lookup map for O(1) input parameter lookup (instead of O(n) find)
    // This improves performance significantly with many input parameters
    const inputDefMap = new Map();
    for (const inp of apiInputs) {
      if (inp.name) inputDefMap.set(inp.name.toLowerCase(), inp);
      if (inp.address) inputDefMap.set(inp.address.toLowerCase(), inp);
    }

    for (const input of inputList) {
      const inputDef = inputDefMap.get(input.name);

      if (inputDef) {
        // Value is already validated and type-coerced
        const cellValue = input.value;

        let inputSheetName = getSheetNameFromAddress(inputDef.address);
        if (inputSheetName !== actualSheetName) {
          actualSheet = spread.getSheetFromName(inputSheetName);
          if (!actualSheet) {
            return { error: `sheet not found: ${inputSheetName}` };
          }
          actualSheetName = actualSheet.name();
        }

        actualSheet.getCell(inputDef.row, inputDef.col).value(cellValue);
        answerInputs.push({
          name: inputDef.name ?? input.name,
          title: inputDef.title || inputDef.name || input.name,
          value: cellValue,
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
          return { error: `output sheet not found: ${outputSheetName}` };
        }
        actualSheetName = actualSheet.name();
      }

      const isSingleCell = getIsSingleCellFromAddress(output.address);
      let cellResult;

      if (isSingleCell) {
        let row = output.row;
        let col = output.col;
        if (!row || !col) {
          const range = getRangeAsOffset(output.address);
          row = range.row ?? 0;
          col = range.col ?? 0;
        }
        cellResult = actualSheet.getCell(row, col).value();
      } else {
        // For cell ranges, prefer stored rowCount/colCount if available (more reliable)
        // Otherwise calculate from address
        let rowCount, colCount;

        if (output.rowCount && output.colCount) {
          // Use stored dimensions
          rowCount = output.rowCount;
          colCount = output.colCount;
        } else {
          // Calculate from address as fallback
          const range = getRangeAsOffset(output.address);
          // Make range inclusive: both start and end cells should be counted
          rowCount = range.rowTo - range.rowFrom + 1;
          colCount = range.colTo - range.colFrom + 1;
        }

        cellResult = actualSheet.getArray(
          output.row,
          output.col,
          rowCount,
          colCount,
          false
        );
      }

      const outputObj = {
        name: output.name,
        title: output.title || output.name,  // Include title field
        value: cellResult,
      };

      // Include simple format string if available (e.g., "€#,##0.00", "#,##0.0 kg")
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

    const result = {
      apiId: serviceId,
      serviceName: apiJson?.name || apiJson?.title || null,
      serviceDescription: apiJson?.description || null,
      inputs: answerInputs,
      outputs: answerOutputs,
      metadata: {
        dataFetchTime: timeApiData,
        executionTime: Date.now() - timeAll,
        engineLoadTime: timeSpreadJSLoad,
        tableSheetLoadTime: timeTableSheetLoad,
        hasTableSheets: withTables,
        useCaching: useCaching,
        recalc: false, // SpreadJS doesn't recalc when loading from cache
        fromProcessCache: fromProcessCache,
        fromRedisCache: fromRedisCache,
        cacheLayer: cacheLayer,
        processCacheStats: spreadjsModule && spreadjsModule.getCacheStats ? spreadjsModule.getCacheStats() : null,
        memoryUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      }
    };

    // Cache result if caching enabled
    // Store in Redis Hash: all results for service in single hash
    // TTL is reset on each write to keep active services cached
    if (useCaching) {
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId);

      // IMPORTANT: Make this BLOCKING to ensure cache is written before returning
      // This ensures the next request with same inputs will hit the cache
      try {
        // Store result as hash field and reset TTL on entire hash
        // Use multi() to batch hSet + expire in single round-trip (faster!)
        // This keeps frequently-used services cached indefinitely
        // Inactive services expire after 15 minutes
        const multi = redis.multi();
        multi.hSet(cacheKey, inputHash, JSON.stringify(result));
        multi.expire(cacheKey, CACHE_TTL.result);
        await multi.exec();
        console.log(`[calculateDirect] Saved result to cache hash: ${cacheKey}[${inputHash}]`);
      } catch (cacheError) {
        console.error(`Failed to set cache for ${cacheKey}[${inputHash}]:`, cacheError);
      }
    }

    // Trigger webhook if configured (non-blocking)
    triggerWebhook(apiDefinition, result);

    return result;

  } catch (error) {
    console.error("Direct calculation error:", error);
    // Track error (using analytics queue for better performance)
    analyticsQueue.track(serviceId, 'errors', 1);
    return { error: "calculation failed: " + (error.message || "unknown error") };
  }
}
