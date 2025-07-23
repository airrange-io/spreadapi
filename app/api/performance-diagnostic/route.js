import { NextResponse } from 'next/server';
import redis, { isRedisConnected } from '../../../lib/redis';
import { getApiDefinition } from '../../../utils/helperApi';
const { createWorkbook, getCacheStats } = require('../../../lib/spreadjs-server');

export async function GET(request) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      isVercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION || 'unknown',
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME || 'unknown',
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      }
    },
    timings: {},
    operations: []
  };

  const timeOperation = async (name, operation) => {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      diagnostics.timings[name] = duration;
      diagnostics.operations.push({
        name,
        duration,
        status: 'success',
        result: result
      });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      diagnostics.timings[name] = duration;
      diagnostics.operations.push({
        name,
        duration,
        status: 'error',
        error: error.message
      });
      throw error;
    }
  };

  try {
    // Test 1: Basic JS operation
    await timeOperation('basicMath', async () => {
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += i;
      }
      return sum;
    });

    // Test 2: Redis connection
    const redisConnected = await timeOperation('redisConnection', async () => {
      if (!isRedisConnected()) return false;
      await redis.ping();
      return true;
    });

    // Test 3: Redis read operation
    if (redisConnected) {
      await timeOperation('redisRead', async () => {
        const keys = await redis.keys('service:*');
        return keys.length;
      });
    }

    // Test 4: Blob fetch simulation (using API definition)
    const apiId = 'test1234_mdejqoua8ptor'; // Warming service
    let apiDef;
    await timeOperation('apiDefinitionFetch', async () => {
      apiDef = await getApiDefinition(apiId, null);
      return !!apiDef;
    });

    // Test 5: SpreadJS workbook creation
    await timeOperation('workbookCreation', async () => {
      const workbook = createWorkbook();
      return !!workbook;
    });

    // Test 6: SpreadJS JSON loading
    if (apiDef && apiDef.fileJson) {
      await timeOperation('workbookJSONLoad', async () => {
        const workbook = createWorkbook();
        workbook.fromJSON(apiDef.fileJson, {
          calcOnDemand: false,
          doNotRecalculateAfterLoad: false,
        });
        return true;
      });
    }

    // Test 7: Process cache stats
    await timeOperation('processCacheCheck', async () => {
      return getCacheStats();
    });

    // Test 8: Network request to external service
    await timeOperation('externalNetworkTest', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.github.com/zen', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      return response.status;
    });

    // Calculate statistics
    const timingValues = Object.values(diagnostics.timings);
    diagnostics.summary = {
      totalOperations: timingValues.length,
      totalTime: timingValues.reduce((a, b) => a + b, 0),
      averageTime: Math.round(timingValues.reduce((a, b) => a + b, 0) / timingValues.length),
      slowestOperation: Object.entries(diagnostics.timings)
        .sort(([,a], [,b]) => b - a)[0],
      recommendations: []
    };

    // Generate recommendations
    if (diagnostics.timings.workbookJSONLoad > 1000) {
      diagnostics.summary.recommendations.push(
        'SpreadJS JSON loading is slow. This is the main bottleneck on cold starts.'
      );
    }

    if (diagnostics.timings.apiDefinitionFetch > 300) {
      diagnostics.summary.recommendations.push(
        'API definition fetch is slow. Check blob storage latency and Redis caching.'
      );
    }

    if (diagnostics.timings.externalNetworkTest > 500) {
      diagnostics.summary.recommendations.push(
        'External network requests are slow. Consider the Vercel region and network latency.'
      );
    }

    if (!process.env.VERCEL) {
      diagnostics.summary.recommendations.push(
        'Running on localhost. Performance will differ from Vercel production.'
      );
    }

    return NextResponse.json(diagnostics, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    diagnostics.error = error.message;
    return NextResponse.json(diagnostics, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}