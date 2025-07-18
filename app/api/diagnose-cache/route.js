import { NextResponse } from 'next/server';
import redis, { isRedisConnected } from '../../../lib/redis';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiId = searchParams.get('api') || 'ab3202cb-d0af-41af-88ce-7e51f5f6b6d3';
    
    const diagnosis = {
      apiId,
      timestamp: new Date().toISOString(),
      redis: {
        connected: false,
        serviceInfo: null,
        cacheExists: false,
        cacheKey: `cache:blob:${apiId}`
      },
      recommendations: []
    };
    
    // Check Redis connection
    try {
      if (isRedisConnected()) {
        await redis.ping();
        diagnosis.redis.connected = true;
      }
    } catch (e) {
      diagnosis.redis.error = e.message;
      diagnosis.recommendations.push('Redis connection failed. Check REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD environment variables.');
    }
    
    if (diagnosis.redis.connected) {
      // Check service configuration
      try {
        const serviceInfo = await redis.HMGET(`service:${apiId}`, [
          "urlData",
          "tenantId", 
          "needsToken",
          "useCaching",
          "tokens"
        ]);
        
        diagnosis.redis.serviceInfo = {
          urlData: serviceInfo[0],
          tenantId: serviceInfo[1],
          needsToken: serviceInfo[2],
          useCaching: serviceInfo[3],
          tokens: serviceInfo[4]
        };
        
        if (!serviceInfo[0]) {
          diagnosis.recommendations.push(`Service ${apiId} not found in Redis. Make sure the service is properly configured.`);
        }
        
        if (serviceInfo[3] !== "true") {
          diagnosis.recommendations.push(`Caching is disabled for service ${apiId}. Set useCaching to "true" in Redis to enable caching.`);
          diagnosis.recommendations.push(`Run: redis-cli HSET service:${apiId} useCaching true`);
        }
        
        // Check if cache exists
        const cacheExists = await redis.exists(`cache:blob:${apiId}`);
        diagnosis.redis.cacheExists = cacheExists > 0;
        
        if (!diagnosis.redis.cacheExists && serviceInfo[3] === "true") {
          diagnosis.recommendations.push('Cache is enabled but no cached data found. The first request will populate the cache.');
        }
        
        // Check cache TTL if exists
        if (diagnosis.redis.cacheExists) {
          const ttl = await redis.ttl(`cache:blob:${apiId}`);
          diagnosis.redis.cacheTTL = ttl > 0 ? `${ttl} seconds` : 'no expiry';
        }
        
      } catch (e) {
        diagnosis.redis.serviceError = e.message;
        diagnosis.recommendations.push('Error accessing service information in Redis.');
      }
    }
    
    // Summary
    if (diagnosis.recommendations.length === 0) {
      diagnosis.status = 'OK';
      diagnosis.summary = 'Caching is properly configured and should be working.';
    } else {
      diagnosis.status = 'ISSUES_FOUND';
      diagnosis.summary = 'There are issues preventing optimal caching performance.';
    }
    
    return NextResponse.json(diagnosis, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error in diagnose-cache:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}