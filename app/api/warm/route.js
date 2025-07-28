import { NextResponse } from 'next/server';
// Lazy load heavy dependencies
let redis;
let spreadjsModule;

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // Log headers for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      const headers = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('[WARM] Request headers:', headers);
    }
    
    // Note: Vercel cron jobs can only be triggered by Vercel itself
    // They are inherently secure, so additional auth is optional
    // If you want to add auth, set CRON_SECRET in Vercel env vars
    
    // Lazy load and initialize SpreadJS
    let spreadJsStatus = 'not tested';
    let spreadJsError = null;
    
    try {
      console.log('[WARM] Loading SpreadJS module...');
      if (!spreadjsModule) {
        spreadjsModule = require('../../../lib/spreadjs-server');
      }
      
      console.log('[WARM] Initializing SpreadJS...');
      spreadjsModule.initializeSpreadJS();
      
      // Only create workbook if initialization succeeded
      console.log('[WARM] Creating test workbook...');
      const testWorkbook = spreadjsModule.createWorkbook();
      
      // Simple operation to verify it's working
      const sheet = testWorkbook.getActiveSheet();
      sheet.setValue(0, 0, "warm");
      
      // Just warm the SpreadJS module and helper functions
      // This keeps the serverless function and dependencies warm
      try {
        // Load helper modules to warm them
        const { getApiDefinition } = require('../../../utils/helperApi');
        const { generateResultCacheHash } = require('../../../lib/cacheHelpers');
        
        // Create a simple test calculation to ensure all paths are warm
        const testSheet = testWorkbook.getActiveSheet();
        testSheet.setValue(1, 0, 10);
        testSheet.setValue(2, 0, 20);
        testSheet.setFormula(3, 0, "=A2+A3");
        const result = testSheet.getValue(3, 0);
        
        console.log(`[WARM] Test calculation result: ${result}`);
      } catch (e) {
        console.log('[WARM] Error during warming test:', e.message);
      }
      
      spreadJsStatus = 'initialized';
    } catch (sjsError) {
      console.error('[WARM] SpreadJS initialization failed:', sjsError.message);
      spreadJsStatus = 'failed';
      spreadJsError = sjsError.message;
    }
    
    // Test Redis connection if available
    let redisStatus = 'not tested';
    let redisError = null;
    
    try {
      console.log('[WARM] Loading Redis module...');
      if (!redis) {
        redis = (await import('../../../lib/redis')).default;
      }
      
      console.log('[WARM] Testing Redis connection...');
      await redis.ping();
      redisStatus = 'connected';
    } catch (err) {
      console.error('[WARM] Redis test failed:', err.message);
      redisStatus = 'failed';
      redisError = err.message;
    }
    
    const response = {
      status: 'warm',
      timeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      message: 'Warming completed',
      services: {
        spreadJs: {
          status: spreadJsStatus,
          error: spreadJsError
        },
        redis: {
          status: redisStatus,
          error: redisError
        }
      },
      environment: process.env.NODE_ENV,
      headers: {
        'x-vercel-cron': request.headers.get('x-vercel-cron'),
        'user-agent': request.headers.get('user-agent')
      }
    };
    
    console.log('[WARM] Warming completed:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[WARM] Warming failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timeMs: Date.now() - startTime
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}