import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
const { getCacheStats } = require('../../../lib/spreadjs-server');
import { getApiDefinitionCacheStats } from '../../../utils/helperApi';

export async function GET(request) {
  try {
    // Get process cache stats
    const processCacheStats = getCacheStats();
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    const memoryStats = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
    };
    
    // Get Redis cache info (sample of cache keys)
    let redisCacheInfo = {
      connected: false,
      cacheKeyCount: 0
    };
    
    try {
      // Check Redis connection
      await redis.ping();
      redisCacheInfo.connected = true;
      
      // Count cache keys (be careful with this in production)
      const cacheKeys = await redis.keys('cache:*');
      redisCacheInfo.cacheKeyCount = cacheKeys.length;
      
      // Get some sample cache keys info
      const sampleKeys = cacheKeys.slice(0, 5);
      const sampleInfo = [];
      
      for (const key of sampleKeys) {
        const ttl = await redis.ttl(key);
        sampleInfo.push({
          key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
          ttl: ttl > 0 ? ttl + 's' : 'no expiry'
        });
      }
      
      redisCacheInfo.sampleKeys = sampleInfo;
    } catch (redisError) {
      console.error('Redis error in cache-stats:', redisError);
      redisCacheInfo.error = redisError.message;
    }
    
    // Get API definition cache stats if available
    let apiCacheStats = { error: 'Not implemented' };
    try {
      if (typeof getApiDefinitionCacheStats === 'function') {
        apiCacheStats = getApiDefinitionCacheStats();
      }
    } catch (e) {
      apiCacheStats = { error: e.message };
    }
    
    const result = {
      timestamp: new Date().toISOString(),
      processCache: {
        workbookCache: {
          ...processCacheStats,
          hitRate: processCacheStats.size > 0 ? 'Not tracked yet' : '0%',
          estimatedMemoryUsage: Math.round(processCacheStats.size * 0.3) + 'MB' // Assuming ~300KB per workbook
        },
        apiDefinitionCache: apiCacheStats
      },
      redisCache: redisCacheInfo,
      memory: memoryStats,
      uptime: Math.round(process.uptime()) + 's'
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in cache-stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}