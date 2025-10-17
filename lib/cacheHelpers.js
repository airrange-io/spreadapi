const crypto = require('crypto');

/**
 * Generates a consistent hash for caching calculation results
 * Sorts input keys to ensure consistent hashing regardless of order
 */
function generateResultCacheHash(inputs) {
  // Sort keys for consistent hashing
  const sortedKeys = Object.keys(inputs).sort();
  const sortedInputs = {};
  
  for (const key of sortedKeys) {
    sortedInputs[key] = inputs[key];
  }
  
  // Create hash of sorted inputs
  const inputString = JSON.stringify(sortedInputs);
  return crypto.createHash('sha256').update(inputString).digest('hex').substring(0, 16);
}

/**
 * Cache key patterns for the new structure
 */
const CACHE_KEYS = {
  // API definition cache
  apiCache: (serviceId) => `service:${serviceId}:cache:api`,
  
  // Calculation result cache
  resultCache: (serviceId, inputHash) => `service:${serviceId}:cache:result:${inputHash}`,
  
  // Workbook process cache (if needed in future)
  workbookCache: (serviceId) => `service:${serviceId}:cache:workbook`
};

/**
 * Cache TTL values in seconds
 */
const CACHE_TTL = {
  api: 30 * 60,      // 30 minutes for API definitions
  result: 15 * 60,   // 15 minutes for calculation results (with invalidation on publish)
  workbook: 10 * 60  // 10 minutes for workbooks (future use)
};

/**
 * Invalidate all cached results for a service
 * Call this when a service is published/updated to ensure fresh calculations
 *
 * @param {Object} redis - Redis client instance
 * @param {string} serviceId - Service ID to invalidate
 * @returns {Promise<number>} Number of keys deleted
 */
async function invalidateServiceCache(redis, serviceId) {
  try {
    // Find all result cache keys for this service
    const pattern = `service:${serviceId}:cache:result:*`;
    const keys = [];

    // Scan for keys matching pattern (safer than KEYS for large datasets)
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== '0');

    if (keys.length === 0) {
      console.log(`[Cache Invalidation] No result cache keys found for ${serviceId}`);
      return 0;
    }

    // Delete all found keys
    const deleted = await redis.del(keys);
    console.log(`[Cache Invalidation] Deleted ${deleted} result cache keys for ${serviceId}`);

    // Also invalidate workbook cache for this service
    const workbookKey = CACHE_KEYS.workbookCache(serviceId);
    await redis.del(workbookKey).catch(() => {});

    return deleted;
  } catch (error) {
    console.error(`[Cache Invalidation] Error invalidating cache for ${serviceId}:`, error);
    return 0;
  }
}

module.exports = {
  generateResultCacheHash,
  CACHE_KEYS,
  CACHE_TTL,
  invalidateServiceCache
};