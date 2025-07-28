import { NextResponse } from 'next/server';
// Lazy load heavy dependencies
let redis;
let spreadjsModule;

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // Verify this is a legitimate cron job request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check if running locally or if cron secret matches
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        // For Vercel cron jobs, also check for internal Vercel headers
        const vercelCron = request.headers.get('x-vercel-cron');
        if (!vercelCron) {
          return NextResponse.json({
            status: 'error',
            error: 'Unauthorized'
          }, { status: 401 });
        }
      }
    }
    
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