import redis from '@/lib/redis';
import { generateResultCacheHash, CACHE_KEYS, CACHE_TTL } from '@/lib/cacheHelpers';
import { getApiDefinition } from '@/utils/helperApi';
import { validateServiceToken } from '@/utils/tokenAuth';
import { validateParameters, applyDefaults, coerceTypes } from '@/lib/parameterValidation.js';
import { getSheetNameFromAddress, getIsSingleCellFromAddress, getRangeAsOffset } from '@/utils/helper';
import { triggerWebhook } from '@/lib/webhookHelpers.js';

// Lazy load SpreadJS
let spreadjsModule = null;
let spreadjsInitialized = false;

const getSpreadjsModule = () => {
  if (!spreadjsModule) {
    spreadjsModule = require('@/lib/spreadjs-server');
  }
  if (!spreadjsInitialized) {
    spreadjsModule.initializeSpreadJS();
    spreadjsInitialized = true;
  }
  return spreadjsModule;
};

const tableSheetCache = require('@/lib/tableSheetDataCache');

/**
 * Direct calculation function
 */
export async function calculateDirect(serviceId, inputs, apiToken, options = {}) {
  const timeAll = Date.now();
  const { nocache = false, isWebAppAuthenticated = false } = options;

  try {
    // L1: Check result cache first
    if (!nocache) {
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId);

      try {
        const cachedResultString = await redis.hGet(cacheKey, inputHash);
        if (cachedResultString) {
          const cachedResult = JSON.parse(cachedResultString);
          return {
            ...cachedResult,
            metadata: {
              executionTime: Date.now() - timeAll,
              cached: true
            }
          };
        }
      } catch {}
    }

    // Get API definition
    const apiDefinition = await getApiDefinition(serviceId, apiToken);
    if (!apiDefinition || apiDefinition.error) {
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
        return { error: tokenValidation.error || 'Authentication required' };
      }
    }

    const fileJson = apiDefinition?.fileJson ?? {};
    if (!fileJson) return { error: "no service data" };

    const apiJson = apiDefinition?.apiJson ?? {};
    const apiInputs = apiJson?.inputs || apiJson?.input || [];
    const apiOutputs = apiJson?.outputs || apiJson?.output || [];

    // Validate parameters
    const validation = validateParameters(inputs, apiInputs);
    if (!validation.valid) {
      return { error: validation.error, message: validation.message, details: validation.details };
    }

    const inputsWithDefaults = applyDefaults(inputs, apiInputs);
    const finalInputs = coerceTypes(inputsWithDefaults, apiInputs);

    // Load SpreadJS
    const spreadjs = getSpreadjsModule();
    const { getCachedWorkbook, createWorkbook, needsTablesheetModule, loadTablesheetModule } = spreadjs;

    const withTables = needsTablesheetModule(fileJson);
    if (withTables && !loadTablesheetModule()) {
      return { error: "error loading modules" };
    }

    const useCaching = apiDefinition.useCaching !== false && !nocache;
    let spread;
    let fromCache = false;

    if (useCaching) {
      const workbookCacheKey = CACHE_KEYS.workbookCache(serviceId);

      const cacheResult = await getCachedWorkbook(
        serviceId,
        serviceId,
        async (workbook) => {
          // Try Redis cache
          try {
            const cachedWorkbookJson = await redis.json.get(workbookCacheKey);
            if (cachedWorkbookJson) {
              workbook.fromJSON(cachedWorkbookJson, { calcOnDemand: false, doNotRecalculateAfterLoad: true });
              return;
            }
          } catch {}

          // Load from blob
          workbook.fromJSON(fileJson, { calcOnDemand: false, doNotRecalculateAfterLoad: true });

          // Handle TableSheets
          if (withTables) {
            const dataManager = workbook.dataManager();
            if (dataManager?.tables) {
              await Promise.all(
                Object.entries(dataManager.tables).map(async ([rowKey, table]) => {
                  try {
                    let tableUrl = table.source?.remote?.read || table.source?.remote?.url;
                    const cacheKey = `${serviceId}:table:${rowKey}:${tableUrl || 'local'}`;
                    const ttl = parseInt(apiDefinition.tableSheetCacheTTL) || 300;

                    const cachedData = tableSheetCache.getCachedTableSheetData(cacheKey, ttl);
                    if (cachedData) {
                      if (table.setDataSource) table.setDataSource(cachedData);
                      return;
                    }

                    const freshData = await table.fetch(true);
                    if (tableUrl && freshData) {
                      tableSheetCache.cacheTableSheetData(cacheKey, freshData, tableUrl, JSON.stringify(freshData).length);
                    }
                  } catch {}
                })
              );
            }
          }

          // Save to Redis (non-blocking)
          if (!withTables) {
            Promise.resolve().then(async () => {
              try {
                const multi = redis.multi();
                multi.json.set(workbookCacheKey, "$", workbook.toJSON());
                multi.expire(workbookCacheKey, CACHE_TTL.workbook);
                await multi.exec();
              } catch {}
            });
          }
        },
        false,
        JSON.stringify(fileJson).length
      );

      spread = cacheResult.workbook;
      fromCache = cacheResult.fromCache;
    } else {
      spread = createWorkbook();
      spread.fromJSON(fileJson, { calcOnDemand: false, doNotRecalculateAfterLoad: true });
    }

    let actualSheet = spread.getActiveSheet();
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
          if (!actualSheet) return { error: `sheet not found: ${inputSheetName}` };
          actualSheetName = actualSheet.name();
        }

        actualSheet.getCell(inputDef.row, inputDef.col).value(input.value);
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
        if (!actualSheet) return { error: `output sheet not found: ${outputSheetName}` };
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
        let rowCount, colCount;
        if (output.rowCount && output.colCount) {
          rowCount = output.rowCount;
          colCount = output.colCount;
        } else {
          const range = getRangeAsOffset(output.address);
          rowCount = range.rowTo - range.rowFrom + 1;
          colCount = range.colTo - range.colFrom + 1;
        }
        cellResult = actualSheet.getArray(output.row, output.col, rowCount, colCount, false);
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

    const result = {
      apiId: serviceId,
      serviceName: apiJson?.name || apiJson?.title || null,
      serviceDescription: apiJson?.description || null,
      inputs: answerInputs,
      outputs: answerOutputs,
      metadata: {
        executionTime: Date.now() - timeAll,
        cached: fromCache
      }
    };

    // Cache result
    if (useCaching) {
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId);

      try {
        const multi = redis.multi();
        multi.hSet(cacheKey, inputHash, JSON.stringify(result));
        multi.expire(cacheKey, CACHE_TTL.result);
        await multi.exec();
      } catch {}
    }

    // Trigger webhook (non-blocking)
    triggerWebhook(apiDefinition, result);

    return result;

  } catch (error) {
    console.error("Calculation error:", error);
    return { error: "calculation failed: " + (error.message || "unknown error") };
  }
}
