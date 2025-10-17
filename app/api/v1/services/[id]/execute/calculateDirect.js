import redis from '@/lib/redis';
import { generateResultCacheHash, CACHE_KEYS, CACHE_TTL } from '@/lib/cacheHelpers';
import { getApiDefinition } from '@/utils/helperApi';
import { validateServiceToken } from '@/utils/tokenAuth';
import {
  getSheetNameFromAddress,
  getIsSingleCellFromAddress,
  getRangeAsOffset,
  getDateForCallsLog,
} from '@/utils/helper';

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

// Helper function to log API calls
async function logCalls(apiId, apiToken) {
  try {
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

    // Execute in a non-blocking way
    multi.exec().catch((err) => console.error("Redis log error:", err));
    return true;
  } catch (error) {
    console.error("Log calls error:", error);
    return false;
  }
}

/**
 * Direct calculation function - avoids HTTP call overhead
 * This is the core calculation engine used by:
 * - V1 API route (/api/v1/services/[id]/execute)
 * - MCP server (/api/mcp/v1)
 * - Chat route (/api/chat)
 *
 * @param {string} serviceId - The service ID to execute
 * @param {object} inputs - Key-value pairs of input parameters
 * @param {string|null} apiToken - Optional API token for authentication
 * @param {object} options - Optional settings (nocache, etc.)
 * @returns {Promise<object>} Result object with inputs, outputs, metadata, or error
 */
export async function calculateDirect(serviceId, inputs, apiToken, options = {}) {
  const timeAll = Date.now();

  try {
    // Log the call
    logCalls(serviceId, apiToken);

    // Track cache miss
    redis.hIncrBy(`service:${serviceId}:analytics`, 'cache:misses', 1).catch(() => {});

    // Get API definition
    const apiDataStart = Date.now();
    const apiDefinition = await getApiDefinition(serviceId, apiToken);
    const timeApiData = Date.now() - apiDataStart;

    if (!apiDefinition || apiDefinition.error) {
      return { error: apiDefinition?.error || 'Service not found' };
    }

    // Check token authentication if required
    if (apiDefinition.needsToken || apiDefinition.requireToken) {
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
    const useCaching = apiDefinition.useCaching !== false && !options.nocache;

    let spread;
    let fromProcessCache = false;
    let fromRedisCache = false;
    const processCacheKey = serviceId; // Cache by API ID only

    if (useCaching) {
      // First try Redis workbook cache
      const workbookCacheKey = CACHE_KEYS.workbookCache(serviceId);
      try {
        const cachedWorkbookJson = await redis.json.get(workbookCacheKey);
        if (cachedWorkbookJson) {
          console.log(`[calculateDirect] Found workbook in Redis cache for ${serviceId}`);
          spread = createWorkbook();
          spread.fromJSON(cachedWorkbookJson, {
            calcOnDemand: false,
            doNotRecalculateAfterLoad: false,
          });
          fromRedisCache = true;
        }
      } catch (err) {
        console.error('Redis workbook cache error:', err);
      }

      // If not in Redis, try process cache
      if (!spread) {
        const cacheResult = await getCachedWorkbook(
          serviceId,
          processCacheKey,
          async (workbook) => {
            workbook.fromJSON(fileJson, {
              calcOnDemand: false,
              doNotRecalculateAfterLoad: false,
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

            // Save to Redis for other instances (non-blocking)
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
        );
        spread = cacheResult.workbook;
        fromProcessCache = cacheResult.fromCache;
      }
    } else {
      spread = createWorkbook();
      spread.fromJSON(fileJson, {
        calcOnDemand: false,
        doNotRecalculateAfterLoad: false,
      });
    }

    let actualSheet = spread.getActiveSheet();
    let actualSheetName = actualSheet.name();

    // Process inputs
    const answerInputs = [];
    const inputList = Object.entries(inputs).map(([key, value]) => ({
      name: key.toLowerCase(),
      value: value
    }));

    for (const input of inputList) {
      const inputDef = apiInputs.find(
        (apiInput) =>
          apiInput.name?.toLowerCase() === input.name ||
          apiInput.alias?.toLowerCase() === input.name ||
          apiInput.address?.toLowerCase() === input.name
      );

      if (inputDef) {
        let inputSheetName = getSheetNameFromAddress(inputDef.address);
        if (inputSheetName !== actualSheetName) {
          actualSheet = spread.getSheetFromName(inputSheetName);
          if (!actualSheet) {
            return { error: `sheet not found: ${inputSheetName}` };
          }
          actualSheetName = actualSheet.name();
        }

        actualSheet.getCell(inputDef.row, inputDef.col).value(input.value);
        answerInputs.push({
          name: inputDef.name ?? input.name,
          alias: inputDef.alias ?? input.alias,
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
        const range = getRangeAsOffset(output.address);
        const rowTo = range.rowTo - range.rowFrom + 1;
        const colTo = range.colTo - range.colFrom + 1;
        cellResult = actualSheet.getArray(
          output.row,
          output.col,
          rowTo,
          colTo,
          false
        );
      }

      answerOutputs.push({
        name: output.name,
        alias: output.alias,
        title: output.title || output.name,  // Include title field
        value: cellResult,
      });
    }

    const result = {
      apiId: serviceId,
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
        processCacheStats: spreadjsModule && spreadjsModule.getCacheStats ? spreadjsModule.getCacheStats() : null,
        memoryUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      }
    };

    // Cache result if caching enabled
    if (useCaching) {
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId, inputHash);

      // Fire and forget cache write
      Promise.resolve().then(async () => {
        try {
          const multi = redis.multi();
          multi.json.set(cacheKey, "$", result);
          multi.expire(cacheKey, CACHE_TTL.result);
          await multi.exec();
        } catch (cacheError) {
          console.error(`Failed to set cache for ${cacheKey}:`, cacheError);
        }
      });
    }

    return result;

  } catch (error) {
    console.error("Direct calculation error:", error);
    // Track error
    redis.hIncrBy(`service:${serviceId}:analytics`, 'errors', 1).catch(() => {});
    return { error: "calculation failed: " + (error.message || "unknown error") };
  }
}
