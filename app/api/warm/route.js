import { NextResponse } from 'next/server';
// Lazy load heavy dependencies
let redis;
let spreadjsModule;

// Warming cooldown: only warm once every 3 minutes (180 seconds)
// This prevents DDoS attacks from exhausting serverless resources
const WARMING_COOLDOWN_SECONDS = 180;
const WARMING_LOCK_KEY = 'system:warming:last_run';

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

    // DDoS Protection: Rate limit warming operations
    // Only actually warm if enough time has passed since last warm
    // This makes repeated calls harmless - they return cached status without doing work
    let shouldWarm = true;
    let cachedResponse = null;

    try {
      if (!redis) {
        redis = (await import('../../../lib/redis')).default;
      }

      // Check last warming time
      const lastWarmData = await redis.get(WARMING_LOCK_KEY);

      if (lastWarmData) {
        const lastWarm = JSON.parse(lastWarmData);
        const timeSinceLastWarm = (Date.now() - lastWarm.timestamp) / 1000;

        if (timeSinceLastWarm < WARMING_COOLDOWN_SECONDS) {
          shouldWarm = false;
          cachedResponse = {
            status: 'cached',
            message: 'Warming skipped - recently warmed',
            timeMs: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            lastWarm: {
              timestamp: new Date(lastWarm.timestamp).toISOString(),
              secondsAgo: Math.round(timeSinceLastWarm),
              nextWarmIn: Math.round(WARMING_COOLDOWN_SECONDS - timeSinceLastWarm)
            },
            services: lastWarm.services,
            environment: process.env.NODE_ENV
          };

          console.log(`[WARM] Skipped - last warm was ${Math.round(timeSinceLastWarm)}s ago`);
          return NextResponse.json(cachedResponse);
        }
      }
    } catch (err) {
      console.error('[WARM] Rate limit check failed, proceeding with warm:', err.message);
      // If rate limit check fails, allow warming to proceed
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

    // Cache this warming result in Redis for DDoS protection
    // Subsequent requests within cooldown period will use this cached response
    try {
      const cacheData = {
        timestamp: Date.now(),
        services: response.services
      };

      // Store with TTL slightly longer than cooldown to ensure it's available
      await redis.setEx(
        WARMING_LOCK_KEY,
        WARMING_COOLDOWN_SECONDS + 60,
        JSON.stringify(cacheData)
      );

      console.log('[WARM] Cached warming result for future requests');
    } catch (err) {
      console.error('[WARM] Failed to cache warming result:', err.message);
      // Don't fail the warming just because caching failed
    }

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