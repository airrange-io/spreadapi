import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getApiDefinition } from '@/utils/helperApi';
import { generateResultCacheHash, CACHE_KEYS } from '@/lib/cacheHelpers';

/**
 * Optimized execute endpoint that directly accesses the calculation logic
 * instead of making an HTTP request to getresults
 */

export async function executeServiceDirect(serviceId, inputs, options = {}) {
  const startTime = Date.now();
  
  try {
    // Check if service exists and is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return {
        error: 'Not found',
        message: 'Service not found or not published',
        status: 404
      };
    }

    // Get API definition (this has its own caching)
    const apiDefinition = await getApiDefinition(serviceId, options.token);
    
    if (!apiDefinition || apiDefinition.error) {
      return {
        error: apiDefinition?.error || 'Service not available',
        message: 'Unable to load service definition',
        status: 404
      };
    }

    // Check if caching is enabled
    const useCaching = apiDefinition.useCaching !== false && !options.nocache;
    
    if (useCaching) {
      // Check cache first
      const inputHash = generateResultCacheHash(inputs);
      const cacheKey = CACHE_KEYS.resultCache(serviceId, inputHash);
      
      try {
        const cacheExists = await redis.exists(cacheKey);
        if (cacheExists > 0) {
          const cacheResult = await redis.json.get(cacheKey);
          if (cacheResult) {
            // Track cache hit
            redis.hIncrBy(`service:${serviceId}:analytics`, 'cache:hits', 1).catch(() => {});
            
            // Transform to v1 format
            return {
              serviceId,
              inputs,
              outputs: cacheResult.outputs || cacheResult.result || {},
              metadata: {
                executionTime: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                version: 'v1',
                cached: true
              }
            };
          }
        }
      } catch (cacheError) {
        console.error(`Cache check error for ${serviceId}:`, cacheError);
      }
    }

    // If we get here, we need to call the actual calculation
    // For now, we'll still make the HTTP request, but this is where
    // we could directly call the SpreadJS calculation logic
    return null; // Caller should fall back to HTTP request
    
  } catch (error) {
    console.error('Direct execution error:', error);
    return {
      error: 'Internal server error',
      message: error.message,
      status: 500
    };
  }
}

// Helper to extract service logic from getresults
export async function calculateDirectly(serviceId, inputs, apiDefinition) {
  // This would contain the actual SpreadJS calculation logic
  // extracted from the getresults endpoint
  // For now, returning null to indicate fallback needed
  return null;
}