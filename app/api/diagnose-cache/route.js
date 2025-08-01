import { NextResponse } from 'next/server';
import redis, { isRedisConnected } from '../../../lib/redis';
import { CACHE_KEYS } from '../../../lib/cacheHelpers';
import { DEMO_SERVICE_IDS } from '@/lib/constants';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiId = searchParams.get('api') || DEMO_SERVICE_IDS[0]; // Warming service
    
    const diagnosis = {
      apiId,
      timestamp: new Date().toISOString(),
      redis: {
        connected: false,
        serviceInfo: null,
        publishedInfo: null,
        cacheExists: false,
        cacheKey: CACHE_KEYS.apiCache(apiId)
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
      // Check service definition
      try {
        const serviceExists = await redis.exists(`service:${apiId}`);
        if (serviceExists) {
          const serviceInfo = await redis.hGetAll(`service:${apiId}`);
          diagnosis.redis.serviceInfo = serviceInfo;
        } else {
          diagnosis.recommendations.push(`Service ${apiId} not found in Redis. Make sure the service exists.`);
        }
        
        // Check published data
        const publishedExists = await redis.exists(`service:${apiId}:published`);
        if (publishedExists) {
          const publishedInfo = await redis.HMGET(`service:${apiId}:published`, [
            "urlData",
            "tenantId", 
            "needsToken",
            "useCaching",
            "tokens"
          ]);
          
          diagnosis.redis.publishedInfo = {
            urlData: publishedInfo[0],
            tenantId: publishedInfo[1],
            needsToken: publishedInfo[2],
            useCaching: publishedInfo[3],
            tokens: publishedInfo[4]
          };
          
          if (!publishedInfo[0]) {
            diagnosis.recommendations.push(`Published service ${apiId} has no urlData. Re-publish the service.`);
          }
          
          if (publishedInfo[3] !== "true") {
            diagnosis.recommendations.push(`Caching is disabled for service ${apiId}. Enable caching in service settings.`);
          }
        } else {
          diagnosis.recommendations.push(`Service ${apiId} is not published. Publish the service to make it available.`);
        }
        
        // Check if cache exists
        const cacheKey = CACHE_KEYS.apiCache(apiId);
        const cacheExists = await redis.exists(cacheKey);
        diagnosis.redis.cacheExists = cacheExists > 0;
        
        if (!diagnosis.redis.cacheExists && diagnosis.redis.publishedInfo?.useCaching === "true") {
          diagnosis.recommendations.push('Cache is enabled but no cached data found. The first request will populate the cache.');
        }
        
        // Check cache TTL if exists
        if (diagnosis.redis.cacheExists) {
          const ttl = await redis.ttl(cacheKey);
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