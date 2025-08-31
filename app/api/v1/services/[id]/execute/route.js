import { NextResponse } from 'next/server';
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

/**
 * Execute a SpreadAPI service calculation
 * 
 * POST /api/v1/services/{id}/execute
 * Body: { "inputs": { "param1": "value1", "param2": "value2" } }
 * 
 * GET /api/v1/services/{id}/execute?param1=value1&param2=value2
 */

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

// Direct calculation function - avoids HTTP call
async function calculateDirect(serviceId, inputs, apiToken, options = {}) {
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
          type: "input",
          name: inputDef.name ?? input.name,
          alias: inputDef.alias ?? input.alias,
          title: inputDef.title || inputDef.name || input.name,  // Include title field
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
        type: "output",
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
        spreadJSLoadTime: timeSpreadJSLoad,
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
    
    // Performance metrics logging removed for production
    
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

export async function POST(request, { params }) {
  const totalStart = Date.now();
  try {
    const { id: serviceId } = await params;
    const body = await request.json();
    console.log(`[v1/execute] Request parsing: ${Date.now() - totalStart}ms`);
    
    // Validate request
    if (!body.inputs || typeof body.inputs !== 'object') {
      return NextResponse.json({
        error: 'Invalid request',
        message: 'Request body must contain "inputs" object'
      }, { status: 400 });
    }
    
    // Check if service exists and is published
    const checkStart = Date.now();
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    console.log(`[v1/execute] Redis check: ${Date.now() - checkStart}ms`);
    
    if (!isPublished) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found or not published'
      }, { status: 404 });
    }
    
    // Check service settings
    const serviceData = await redis.hGetAll(`service:${serviceId}:published`);
    const useCaching = serviceData.useCaching !== 'false' && !body.nocache;
    
    // First check cache if enabled
    if (useCaching) {
      const inputHash = generateResultCacheHash(body.inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId, inputHash);
      
      try {
        const cacheExists = await redis.exists(cacheKey);
        if (cacheExists > 0) {
          const cacheResult = await redis.json.get(cacheKey);
          if (cacheResult) {
            // Track cache hit
            redis.hIncrBy(`service:${serviceId}:analytics`, 'cache:hits', 1).catch(() => {});
            
            const totalTime = Date.now() - totalStart;
            console.log(`[v1/execute] Cache hit, total time: ${totalTime}ms`);
            
            return NextResponse.json({
              serviceId,
              inputs: body.inputs,
              outputs: cacheResult.outputs || [],
              metadata: {
                ...cacheResult.metadata,
                executionTime: 0,
                totalTime,
                timestamp: new Date().toISOString(),
                version: 'v1',
                cached: true,
                fromResultCache: true
              }
            });
          }
        }
      } catch (cacheError) {
        console.error(`Cache check error for ${serviceId}:`, cacheError);
      }
    }
    
    // Use direct calculation instead of HTTP call
    const calcStart = Date.now();
    const result = await calculateDirect(serviceId, body.inputs, body.token, {
      nocache: body.nocache
    });
    console.log(`[v1/execute] Direct calculation: ${Date.now() - calcStart}ms`);
    
    if (result.error) {
      return NextResponse.json({
        error: result.error,
        message: result.message || result.error,
        serviceId,
        inputs: body.inputs,
        details: result.parameters || result.details || null
      }, { status: 400 });
    }
    
    const totalTime = Date.now() - totalStart;
    console.log(`[v1/execute] Total execution time: ${totalTime}ms`);
    
    // Track response time analytics
    const responseTime = result.metadata?.executionTime || totalTime;
    if (responseTime > 0) {
      Promise.resolve().then(async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const multi = redis.multi();
          
          // Store response time for this request
          multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:response_time_sum`, responseTime);
          multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:response_time_count`, 1);
          
          // Track response time distribution
          let bucket = '0-50ms';
          if (responseTime > 1000) bucket = '>1000ms';
          else if (responseTime > 500) bucket = '500-1000ms';
          else if (responseTime > 200) bucket = '200-500ms';
          else if (responseTime > 100) bucket = '100-200ms';
          else if (responseTime > 50) bucket = '50-100ms';
          
          multi.hIncrBy(`service:${serviceId}:analytics`, `response_dist:${bucket}`, 1);
          
          await multi.exec();
          
          // Calculate average
          const [sumStr, countStr] = await redis.hmGet(
            `service:${serviceId}:analytics`,
            [`${today}:response_time_sum`, `${today}:response_time_count`]
          );
          
          if (sumStr && countStr) {
            const sum = parseInt(sumStr);
            const count = parseInt(countStr);
            const avg = Math.round(sum / count);
            await redis.hSet(`service:${serviceId}:analytics`, {
              [`${today}:avg_response_time`]: avg.toString(),
              'avg_response_time': avg.toString()
            });
          }
        } catch (err) {
          console.error('Error tracking response time:', err);
        }
      });
    }
    
    return NextResponse.json({
      serviceId,
      inputs: body.inputs,
      outputs: result.outputs || [],
      metadata: {
        ...result.metadata,
        totalTime,
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
    
  } catch (error) {
    console.error('Service execution error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// GET method for simple calculations (Excel, browser testing, etc.)
export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Check if service exists and is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found or not published'
      }, { status: 404 });
    }
    
    // For GET requests, token is passed as query parameter
    // The getresults API will handle token validation
    
    // Extract special parameters
    const format = searchParams.get('_format') || 'json'; // json, csv, plain
    const pretty = searchParams.get('_pretty') === 'true';
    
    // Convert query params to inputs object (excluding special params)
    const inputs = {};
    let token = null;
    
    for (const [key, value] of searchParams) {
      if (key === 'token') {
        token = value;
      } else if (!key.startsWith('_')) {
        // Try to parse numbers
        const numValue = Number(value);
        inputs[key] = !isNaN(numValue) && value !== '' ? numValue : value;
      }
    }
    
    // Delegate to POST handler
    const postBody = { inputs };
    if (token) {
      postBody.token = token;
    }
    
    // Create a new request with proper headers
    const newHeaders = new Headers();
    // Copy necessary headers
    const contentType = request.headers.get('content-type');
    if (contentType) newHeaders.set('content-type', contentType);
    const auth = request.headers.get('authorization');
    if (auth) newHeaders.set('authorization', auth);
    const cookie = request.headers.get('cookie');
    if (cookie) newHeaders.set('cookie', cookie);
    
    // Set content-type for JSON
    newHeaders.set('content-type', 'application/json');
    
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: newHeaders,
      body: JSON.stringify(postBody)
    });
    
    const response = await POST(postRequest, { params: await params });
    
    // Check if the response is an error
    if (!response.ok) {
      return response; // Return error response as-is
    }
    
    const data = await response.json();
    
    // Format response based on _format parameter
    if (format === 'plain') {
      // Plain text for Excel WEBSERVICE function
      const outputs = data.outputs || [];
      let text = '';
      
      // Handle both object and array formats
      if (Array.isArray(outputs)) {
        text = outputs
          .map(output => `${output.alias || output.name}: ${output.value}`)
          .join('\n');
      } else if (typeof outputs === 'object') {
        text = Object.entries(outputs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }
      
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      });
    }
    
    if (format === 'csv') {
      // CSV format for Excel import
      const outputs = data.outputs || [];
      let headers = '';
      let values = '';
      
      // Handle both object and array formats
      if (Array.isArray(outputs)) {
        headers = outputs.map(o => o.alias || o.name).join(',');
        values = outputs.map(o => o.value).join(',');
      } else if (typeof outputs === 'object') {
        headers = Object.keys(outputs).join(',');
        values = Object.values(outputs).join(',');
      }
      
      const csv = `${headers}\n${values}`;
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      });
    }
    
    // Default JSON response
    if (pretty) {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      });
    }
    
    // Return the data as JSON with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    });
    
  } catch (error) {
    console.error('GET execution error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}