import { NextResponse } from 'next/server';
import { getApiDefinition } from '../../../utils/helperApi';
const { initializeSpreadJS, createWorkbook } = require('../../../lib/spreadjs-server');

// Pre-warm popular APIs
const POPULAR_APIS = [
  'ab3202cb-d0af-41af-88ce-7e51f5f6b6d3'
];

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // Initialize SpreadJS if not already done
    initializeSpreadJS();
    
    // Pre-fetch popular API definitions
    const promises = POPULAR_APIS.map(apiId => 
      getApiDefinition(apiId, null).catch(err => ({
        apiId,
        error: err.message
      }))
    );
    
    const results = await Promise.all(promises);
    
    // Create a test workbook to warm up the library
    const testWorkbook = createWorkbook();
    
    // IMPORTANT: Also warm the actual getResults endpoint
    // This ensures the main calculation function stays warm
    try {
      const warmUrl = `${request.url.replace('/warm', '/getresults')}?service=${POPULAR_APIS[0]}&token=hiqelc-b-o&interest=5&monthly=100&months=12&starting=1000`;
      await fetch(warmUrl);
    } catch (e) {
      // Ignore errors, just warming
    }
    
    const endTime = Date.now();
    
    return NextResponse.json({
      status: 'warm',
      timeMs: endTime - startTime,
      timestamp: new Date().toISOString(),
      preloaded: results.map(r => ({
        apiId: r.apiId || POPULAR_APIS[0],
        cached: !r.error
      })),
      spreadJsInitialized: true
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}