import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { getApiDefinition } from '../../../utils/helperApi';
const { initializeSpreadJS, createWorkbook } = require('../../../lib/spreadjs-server');

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // Initialize SpreadJS if not already done
    initializeSpreadJS();
    
    // Create a simple test workbook to ensure SpreadJS is fully warmed
    const testWorkbook = createWorkbook();
    
    // Optional: Do a simple operation to ensure the library is fully loaded
    const sheet = testWorkbook.getActiveSheet();
    sheet.setValue(0, 0, "warm");
    
    return NextResponse.json({
      status: 'warm',
      timeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      message: 'SpreadJS warmed successfully',
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