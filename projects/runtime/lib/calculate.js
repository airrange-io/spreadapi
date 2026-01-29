// Core calculation engine
// Supports configurable caching modes via environment variables
// Thread-safe shared workbook access via mutex locks

const config = require('./config');
const { withWorkbook, clearCache } = require('./spreadjs');
const { logRequest } = require('./logger');
const resultCache = require('./resultCache');

/**
 * Special marker value indicating that a cell should be cleared to null.
 * Used when an optional parameter's default is explicitly "empty".
 */
const NULL_DEFAULT_VALUE = '__SPREADAPI_NULL__';

// Helper: get sheet name from address like "Sheet1!B2"
function getSheetName(address) {
  if (!address) return '';
  const idx = address.indexOf('!');
  if (idx === -1) return '';
  let name = address.substring(0, idx);
  if (name.startsWith("'") && name.endsWith("'")) {
    name = name.slice(1, -1);
  }
  return name;
}

// Helper: check if address is single cell vs range
function isSingleCell(address) {
  if (!address) return false;
  const idx = address.indexOf('!');
  const cellPart = idx > -1 ? address.substring(idx + 1) : address;
  const colonIdx = cellPart.indexOf(':');
  if (colonIdx === -1) return true;
  const left = cellPart.substring(0, colonIdx);
  const right = cellPart.substring(colonIdx + 1);
  return left === right;
}

// Validate and coerce input value
function validateInput(value, inputDef) {
  if (value === undefined || value === null || value === '') {
    if (inputDef.mandatory !== false) {
      return { valid: false, error: `Missing required parameter: ${inputDef.name}` };
    }
    if (inputDef.defaultValue !== undefined) {
      return { valid: true, value: inputDef.defaultValue };
    }
    return { valid: true, value: null };
  }

  let coerced = value;

  if (inputDef.type === 'number') {
    coerced = Number(value);
    if (isNaN(coerced)) {
      return { valid: false, error: `Expected number for ${inputDef.name}, got: ${value}` };
    }
    if (inputDef.min !== undefined && coerced < inputDef.min) {
      return { valid: false, error: `${inputDef.name} below minimum ${inputDef.min}` };
    }
    if (inputDef.max !== undefined && coerced > inputDef.max) {
      return { valid: false, error: `${inputDef.name} above maximum ${inputDef.max}` };
    }
  } else if (inputDef.type === 'boolean') {
    if (typeof value === 'boolean') {
      coerced = value;
    } else if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') coerced = true;
      else if (lower === 'false' || lower === '0' || lower === 'no') coerced = false;
      else return { valid: false, error: `Expected boolean for ${inputDef.name}` };
    } else if (typeof value === 'number') {
      coerced = value !== 0;
    }
  }

  return { valid: true, value: coerced };
}

async function executeCalculation(service, inputs, requestInfo = {}) {
  const startTime = Date.now();
  const { serviceId, apiJson, fileJson } = service;
  const apiInputs = apiJson?.inputs || [];
  const apiOutputs = apiJson?.outputs || [];

  try {
    // 1. Validate and prepare inputs
    const finalInputs = {};
    const validationErrors = [];

    for (const inputDef of apiInputs) {
      const providedValue = inputs[inputDef.name] ?? inputs[inputDef.name?.toLowerCase()];
      const result = validateInput(providedValue, inputDef);

      if (!result.valid) {
        validationErrors.push(result.error);
      } else if (result.value !== null) {
        finalInputs[inputDef.name] = result.value;
      }
    }

    if (validationErrors.length > 0) {
      const error = {
        error: 'VALIDATION_ERROR',
        message: validationErrors.join('; '),
        details: validationErrors,
      };
      logRequest({
        serviceId,
        status: 'error',
        errorCode: 'VALIDATION_ERROR',
        executionTime: Date.now() - startTime,
        ...requestInfo,
      });
      return error;
    }

    // 2. Check result cache (if enabled)
    if (config.resultCache) {
      const cachedResult = resultCache.get(serviceId, finalInputs);
      if (cachedResult) {
        const executionTime = Date.now() - startTime;
        logRequest({
          serviceId,
          inputs: finalInputs,
          outputCount: cachedResult.outputs?.length || 0,
          executionTime,
          cached: true,
          cacheLayer: 'result',
          status: 'success',
          ...requestInfo,
        });
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            executionTime,
            timestamp: new Date().toISOString(),
            fromCache: true,
            cacheLayer: 'result',
          },
        };
      }
    }

    // 3. Execute calculation with thread-safe workbook access
    const result = await withWorkbook(serviceId, fileJson, async (workbook, workbookFromCache) => {
      // 4. Set input values
      let activeSheet = workbook.getActiveSheet();
      let activeSheetName = activeSheet.name();
      const answerInputs = [];

      for (const inputDef of apiInputs) {
        const value = finalInputs[inputDef.name];
        if (value === undefined) continue;

        // Switch sheet if needed
        const sheetName = getSheetName(inputDef.address);
        if (sheetName && sheetName !== activeSheetName) {
          activeSheet = workbook.getSheetFromName(sheetName);
          if (!activeSheet) {
            throw new Error(`Sheet not found: ${sheetName}`);
          }
          activeSheetName = activeSheet.name();
        }

        // Set cell value - handle NULL_DEFAULT_VALUE marker by clearing the cell
        let cellValue = value;
        if (cellValue === NULL_DEFAULT_VALUE) {
          cellValue = null;
        }
        activeSheet.getCell(inputDef.row, inputDef.col).value(cellValue);
        answerInputs.push({
          name: inputDef.name,
          title: inputDef.title || inputDef.name,
          value: cellValue,
        });
      }

      // 5. Read output values
      const answerOutputs = [];

      for (const outputDef of apiOutputs) {
        const sheetName = getSheetName(outputDef.address);
        if (sheetName && sheetName !== activeSheetName) {
          activeSheet = workbook.getSheetFromName(sheetName);
          if (!activeSheet) {
            throw new Error(`Output sheet not found: ${sheetName}`);
          }
          activeSheetName = activeSheet.name();
        }

        let cellValue;
        if (isSingleCell(outputDef.address)) {
          cellValue = activeSheet.getCell(outputDef.row, outputDef.col).value();
        } else {
          // Range output
          const rowCount = outputDef.rowCount || 1;
          const colCount = outputDef.colCount || 1;
          cellValue = activeSheet.getArray(outputDef.row, outputDef.col, rowCount, colCount, false);
        }

        answerOutputs.push({
          name: outputDef.name,
          title: outputDef.title || outputDef.name,
          value: cellValue,
          ...(outputDef.formatString && { formatString: outputDef.formatString }),
        });
      }

      const executionTime = Date.now() - startTime;

      // 6. Build result
      return {
        serviceId,
        serviceName: apiJson?.title || apiJson?.name || serviceId,
        inputs: answerInputs,
        outputs: answerOutputs,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          workbookFromCache: workbookFromCache,
        },
      };
    });

    // 7. Cache result for future requests with same inputs (if enabled)
    if (config.resultCache) {
      resultCache.set(serviceId, finalInputs, result);
    }

    // 8. Log the request
    logRequest({
      serviceId,
      inputs: finalInputs,
      outputCount: result.outputs?.length || 0,
      executionTime: result.metadata?.executionTime,
      workbookCached: result.metadata?.workbookFromCache,
      status: 'success',
      ...requestInfo,
    });

    return result;

  } catch (err) {
    const executionTime = Date.now() - startTime;
    logRequest({
      serviceId,
      status: 'error',
      errorCode: 'CALCULATION_ERROR',
      errorMessage: err.message,
      executionTime,
      ...requestInfo,
    });
    return {
      error: 'CALCULATION_ERROR',
      message: err.message,
    };
  }
}

module.exports = {
  executeCalculation,
  clearCache,
  NULL_DEFAULT_VALUE,
};
