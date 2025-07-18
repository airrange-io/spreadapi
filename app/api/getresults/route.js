import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import {
  getSheetNameFromAddress,
  isNumber,
  sanitizeRedisKey,
  getError,
  getIsSingleCellFromAddress,
  getRangeAsOffset,
  getDateForCallsLog,
} from '../../../utils/helper';
import { getApiDefinition } from '../../../utils/helperApi';

// Server-only import
const { createWorkbook, getCachedWorkbook, loadTablesheetModule, getCacheStats } = require('../../../lib/spreadjs-server');

//===============================================
// Function
//===============================================

function generateProcessCacheKey(apiId, inputs) {
  // Cache by API ID only - the workbook can handle any inputs!
  return apiId;
}

async function logCalls(apiId, apiToken) {
  try {
    // Get tenantId first to avoid unnecessary calls if it fails
    const tenantId = await redis
      .HGET(`service:${apiId}`, "tenantId")
      .catch(() => null);
    const dateString = getDateForCallsLog();
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

    multi.hIncrBy(`service:${apiId}`, "calls", 1);
    multi.hIncrBy(`service:${apiId}`, `calls:${dateString}`, 1);

    if (apiToken) {
      multi.hIncrBy(`service:${apiId}`, `calls:token:${apiToken}`, 1);
      multi.hIncrBy(
        `service:${apiId}`,
        `calls:${dateString}:token:${apiToken}`,
        1
      );
    }

    // Execute in a non-blocking way, we don't need to wait for the result
    multi.exec().catch((err) => console.error("Redis log error:", err));
    return true;
  } catch (error) {
    console.error("Log calls error:", error);
    return false;
  }
}

function getInputFromName(inputs, name) {
  if (!inputs || !Array.isArray(inputs)) {
    console.error("Invalid inputs array provided to getInputFromName");
    return null;
  }

  if (!name) {
    console.error("No name provided to getInputFromName");
    return null;
  }

  try {
    return inputs.find(
      (input) =>
        input.name?.toLowerCase() === name ||
        input.alias?.toLowerCase() === name ||
        input.address?.toLowerCase() === name
    );
  } catch (error) {
    console.error("Error in getInputFromName:", error);
    return null;
  }
}

function waitMilliSeconds(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function checkInputValues(apiInputs, inputList) {
  let inputErrors = [];
  try {
    for (const input of apiInputs) {
      const inputName = input.name?.toLowerCase();
      const inputAlias = input.alias?.toLowerCase();
      const inputAddress = input.address?.toLowerCase();
      // find the input in the inputList
      const inputFound = inputList.find(
        (item) =>
          item.name === inputAlias ||
          item.name === inputName ||
          item.name === inputAddress
      );
      // check for mandatory inputs
      if (input.mandatory && !inputFound) {
        inputErrors.push("missing mandatory input: " + inputAlias);
        continue;
      }
      // check the input min value
      if (input.min || input.min === 0) {
        if (!inputFound.value || inputFound.value < input.min) {
          inputErrors.push(
            "input value is less than the minimum allowed: " +
              input.alias +
              " min=" +
              input.min
          );
        }
      }
      // check the input min value
      if (input.max || input.max === 0) {
        if (!inputFound.value || inputFound.value > input.max) {
          inputErrors.push(
            "input value is bigger than the maximum allowed: " +
              input.alias +
              " max=" +
              input.max
          );
        }
      }
    }
  } catch (inputError) {
    inputErrors.push("Error input value check: " + inputError);
  }
  return inputErrors;
}

async function getResults(requestInfo) {
  if (!requestInfo) return getError("missing request info");
  if (!requestInfo.apiId) return getError("missing service id");

  let options = requestInfo.options ?? [];
  const useCaching = true && options.includes("nocache") === false;
  const timeAll = Date.now();

  // =====================================
  // log the call
  // =====================================

  logCalls(requestInfo.apiId, requestInfo.apiToken);

  // =====================================
  // check the cache
  // =====================================
  let cacheResult = null;
  const sanitizedApiId = sanitizeRedisKey(requestInfo.apiId);
  const cacheKey =
    "cache:" + sanitizedApiId + ":" + JSON.stringify(requestInfo.inputs);

  if (useCaching) {
    try {
      const cacheExists = await redis.exists(cacheKey);
      if (cacheExists > 0) {
        cacheResult = await redis.json.get(cacheKey);
        if (cacheResult) return cacheResult;
      }
    } catch (cacheError) {
      console.error(`Cache check error for ${sanitizedApiId}:`, cacheError);
      // Continue execution if cache check fails
    }
  }

  // =====================================
  // calculate the inputs
  // =====================================
  console.log("INFO RequestInfo", requestInfo);
  let result;
  let timeApiData = 0;
  let timeCalculation = 0;
  let answerInputs = [];
  let answerOutputs = [];
  let inputList = requestInfo.inputs || [];

  try {
    // =====================================
    // get the api definition
    // =====================================
    let timeStart = Date.now();
    const apiDefinition = await getApiDefinition(
      requestInfo.apiId,
      requestInfo.apiToken
    );
    let timeEnd = Date.now();
    timeApiData = timeEnd - timeStart;

    if (!apiDefinition) {
      return getError("no service found");
    }

    if (apiDefinition.error) {
      return getError(apiDefinition.error);
    }

    // =====================================
    // get the api properties
    // =====================================
    const apiJson = apiDefinition?.apiJson ?? {};
    if (!apiJson) return getError("no service definition");
    const apiInputs = apiJson?.input ?? [];
    const apiOutputs = apiJson?.output ?? [];
    if (!apiOutputs || apiOutputs.length === 0)
      return getError("no api outputs found");

    // =====================================
    // check inputs properties (min, max, ...)
    // =====================================
    const inputErrors = checkInputValues(apiInputs, inputList);
    if (inputErrors?.length > 0) return getError(inputErrors);

    // =====================================
    // get the file info
    // =====================================
    const fileJson = apiDefinition?.fileJson ?? {};
    if (!fileJson) return getError("no service data");

    // =====================================
    // are there any tables in fileJson?
    // =====================================
    const withTables = fileJson.sheetTabCount > 0;
    if (withTables) {
      const tablesheetLoaded = await loadTablesheetModule();
      if (!tablesheetLoaded) {
        return getError("error loading required modules");
      }
    }

    // =====================================
    // refresh the sheet if necessary or wanted
    // =====================================
    const specialRecalculation =
      options.includes("recalculate") === true ||
      (inputList?.length < 1 && withTables);

    // =====================================
    // get calculation results
    // =====================================
    let spread;
    let fromProcessCache = false;
    let processCacheKey = generateProcessCacheKey(requestInfo.apiId, inputList);
    
    try {
      timeStart = Date.now();
      
      // Try to get cached workbook first
      if (useCaching) {
        const cacheResult = await getCachedWorkbook(
          requestInfo.apiId,
          processCacheKey,
          async (workbook) => {
            // This function only runs if workbook is not cached
            workbook.fromJSON(fileJson, {
              calcOnDemand: false,
              doNotRecalculateAfterLoad: false,
            });
            
            // If there are tables, fetch them during cache initialization
            if (withTables) {
              const dataManager = workbook.dataManager();
              if (dataManager && dataManager.tables) {
                const tablePromises = [];
                for (const [rowKey, rowObject] of Object.entries(dataManager.tables)) {
                  const table = rowObject;
                  const tablePromise = table.fetch(true).catch((err) => {
                    console.error(`Error fetching table ${rowKey} during cache init:`, err);
                    return null;
                  });
                  tablePromises.push(tablePromise);
                }
                await Promise.all(tablePromises);
              }
            }
          }
        );
        spread = cacheResult.workbook;
        fromProcessCache = cacheResult.fromCache;
      } else {
        // If caching is disabled, create fresh workbook
        spread = createWorkbook();
        spread.fromJSON(fileJson, {
          calcOnDemand: false,
          doNotRecalculateAfterLoad: false,
        });
      }
    } catch (spreadError) {
      console.error("Error creating spreadsheet:", spreadError);
      return getError("error initializing calculation engine");
    }

    let actualSheet = spread.getActiveSheet();
    let actualSheetName = actualSheet.name();

    // =====================================
    // set the table data
    // =====================================
    timeStart = Date.now();
    let timeTableData = 0;
    if (withTables && !fromProcessCache) {
      try {
        const dataManager = spread.dataManager();
        if (!dataManager) {
          console.error("Failed to get dataManager");
          return getError("error accessing data manager");
        }

        let tablePromises = [];
        for (const [rowKey, rowObject] of Object.entries(
          dataManager?.tables || {}
        )) {
          const table = rowObject;
          let tablePromise = table.fetch(true).catch((err) => {
            console.error(`Error fetching table ${rowKey}:`, err);
            return null; // Return null for failed tables
          });
          tablePromises.push(tablePromise);
        }

        let tableResults = await Promise.all(tablePromises);
        for (const table of tableResults) {
          if (table) {
            console.log("INFO table rows:", table?.length);
          }
        }

        if (specialRecalculation) await waitMilliSeconds(100);
      } catch (tableError) {
        console.error("Error processing tables:", tableError);
        return getError("error processing table data");
      }
    }
    timeEnd = Date.now();
    timeTableData = timeEnd - timeStart;

    // =====================================
    // set the new input values
    // =====================================
    try {
      for (const input of inputList) {
        let inputDef = getInputFromName(apiInputs, input.name);
        if (inputDef) {
          let inputSheetName = getSheetNameFromAddress(inputDef.address);
          if (inputSheetName !== actualSheetName) {
            actualSheet = spread.getSheetFromName(inputSheetName);
            if (!actualSheet) {
              console.error(`Sheet not found: ${inputSheetName}`);
              return getError(`sheet not found: ${inputSheetName}`);
            }
            actualSheetName = actualSheet.name();
          }

          try {
            actualSheet.getCell(inputDef.row, inputDef.col).value(input.value);
            answerInputs.push({
              type: "input",
              name: inputDef.name ?? input.name,
              alias: inputDef.alias ?? input.alias,
              value: input.value,
            });
          } catch (cellError) {
            console.error(
              `Error setting cell value for ${input.name}:`,
              cellError
            );
            return getError(`error setting value for ${input.name}`);
          }
        }
      }
    } catch (inputError) {
      console.error("Error processing inputs:", inputError);
      return getError("error processing inputs");
    }

    // =====================================
    // get the output values
    // =====================================

    try {
      for (const output of apiOutputs) {
        // switch to the right sheet
        let outputSheetName = getSheetNameFromAddress(output.address);
        if (outputSheetName !== actualSheetName) {
          actualSheet = spread.getSheetFromName(outputSheetName);
          if (!actualSheet) {
            console.error(`Output sheet not found: ${outputSheetName}`);
            return getError(`output sheet not found: ${outputSheetName}`);
          }
          actualSheetName = actualSheet.name();
        }

        // load the cell or range values
        const isSingleCell = getIsSingleCellFromAddress(output.address);
        let row = output.row;
        let col = output.col;
        let cellResult;

        try {
          if (isSingleCell) {
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
            type: "output",
            name: output.name,
            alias: output.alias,
            value: cellResult,
          });
        } catch (cellError) {
          console.error(
            `Error reading cell value for ${output.name}:`,
            cellError
          );
          answerOutputs.push({
            type: "output",
            name: output.name,
            alias: output.alias,
            value: null,
            error: "Error reading value",
          });
        }
      }
    } catch (outputError) {
      console.error("Error processing outputs:", outputError);
      return getError("error processing outputs");
    }

    timeEnd = Date.now();
    timeCalculation = timeEnd - timeStart;
    const timers = {
      timeApiData: timeApiData,
      timeCalculation: timeCalculation,
      timeAll: timeEnd - timeAll,
      useCaching: useCaching,
      recalc: specialRecalculation,
      fromProcessCache: fromProcessCache,
      processCacheStats: getCacheStats(),
      memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    };
    if (withTables) timers.timeTableData = timeTableData;
    console.log("INFO Timers", timers);

    result = {
      apiId: requestInfo.apiId,
      info: timers,
      inputs: answerInputs,
      outputs: answerOutputs,
    };

    // write to cache
    if (useCaching && cacheKey) {
      try {
        const cacheResult = {
          apiId: requestInfo.apiId,
          info: { timeApiData: -1, timeCalculation: -1 },
          inputs: answerInputs,
          outputs: answerOutputs,
        };
        await redis.json.set(cacheKey, "$", cacheResult);
        await redis.expire(cacheKey, 60 * 5); // cache for 5 minutes
      } catch (cacheError) {
        console.error(`Failed to set cache for ${cacheKey}:`, cacheError);
        // Continue even if caching fails
      }
    }
  } catch (error) {
    console.error("ERROR getResults", error);
    // add the count to redis
    try {
      const errorUrl = "error:" + sanitizeRedisKey(requestInfo.apiId);
      await redis.incr(errorUrl).catch((err) => {
        console.error(`Failed to increment error count for ${errorUrl}:`, err);
      });
    } catch (statsError) {
      console.error("Failed to record error statistics:", statsError);
    }

    return getError(
      "calculation failed: " + (error.message || "unknown error")
    );
  }

  return result;
}

//===============================================
// Route Handlers
//===============================================

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    let apiId = searchParams.get('api');
    if (!apiId) apiId = searchParams.get('service');
    if (!apiId) apiId = searchParams.get('id');

    if (!apiId) {
      return NextResponse.json({ error: "Missing API identifier" }, { status: 400 });
    }

    let apiToken = searchParams.get('token');
    let parameters = [];
    let outputParameters = [];
    let options = [];

    // get the parameters from the query string
    let i = 0;

    for (const [key, value] of searchParams.entries()) {
      // Skip empty values
      if (value === undefined || value === null) continue;

      if (i === 0 && value === "" && !apiId) apiId = key;
      if (["api", "service", "id", "token"].includes(key)) continue; // skip id and key parameters

      if (key === "nocache" && value === "true") {
        options.push("nocache");
        continue;
      }

      parameters.push({ name: key, value: value });
      i++;
    }

    let inputs = [];
    try {
      inputs = parameters.map((item) => {
        let inputName = item?.name?.toLowerCase();
        let inputValue = item?.value;

        if (typeof inputValue === "string") {
          const isPercentage = inputValue.includes("%");
          if (isPercentage) inputValue = inputValue.replace("%", "");

          if (isNumber(inputValue)) {
            inputValue = parseFloat(inputValue);
            if (isPercentage) {
              inputValue = inputValue / 100;
            }
          }
        }

        return { name: inputName, value: inputValue };
      });
    } catch (parseError) {
      console.error("Error parsing input parameters:", parseError);
      return NextResponse.json(
        { error: "Failed to parse input parameters" },
        { status: 400 }
      );
    }

    let requestInfo = {
      apiId: apiId,
      apiToken: apiToken,
      inputs: inputs,
      options: options,
    };

    if (outputParameters.length > 0) {
      requestInfo.outputParameters = outputParameters;
    }

    try {
      let result = await getResults(requestInfo);

      // Handle errors
      if (!result) {
        return NextResponse.json({ error: "No result returned" }, { status: 500 });
      }

      if (result.error) {
        return NextResponse.json(result, { status: 400 });
      }

      // Create response with security headers
      const response = NextResponse.json(result);
      response.headers.set('Content-Type', 'application/json');
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    } catch (processingError) {
      console.error("Error processing request:", processingError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (handlerError) {
    console.error("Unhandled error in API handler:", handlerError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}