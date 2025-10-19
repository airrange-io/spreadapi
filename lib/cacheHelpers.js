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
 * Uses Redis Hash to group all cached results per service for efficient invalidation
 */
const CACHE_KEYS = {
  // API definition cache
  apiCache: (serviceId) => `service:${serviceId}:cache:api`,

  // Calculation result cache - Hash containing all results for a service
  // Hash fields are inputHash -> JSON stringified result
  // Allows O(1) invalidation by deleting entire hash on publish
  resultCache: (serviceId) => `service:${serviceId}:cache:results`,

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
 * Uses hash-based storage: deletes single hash containing all results (O(1) operation)
 * Much more efficient than scanning/deleting individual keys
 *
 * @param {Object} redis - Redis client instance
 * @param {string} serviceId - Service ID to invalidate
 * @returns {Promise<number>} Number of keys deleted (1 if hash existed, 0 otherwise)
 */
async function invalidateServiceCache(redis, serviceId) {
  try {
    // Delete the entire results hash - this removes ALL cached results instantly
    // Use multi for atomic deletion of both caches in single round-trip
    const resultCacheKey = CACHE_KEYS.resultCache(serviceId);
    const workbookKey = CACHE_KEYS.workbookCache(serviceId);

    const multi = redis.multi();
    multi.del(resultCacheKey);
    multi.del(workbookKey);
    const results = await multi.exec();

    const deleted = results[0]; // Number of result cache keys deleted

    console.log(`[Cache] Invalidated ${deleted > 0 ? 'all' : 'no'} cached results for service ${serviceId}`);

    return deleted;
  } catch (error) {
    console.error(`Error invalidating cache for ${serviceId}:`, error);
    return 0;
  }
}

module.exports = {
  generateResultCacheHash,
  CACHE_KEYS,
  CACHE_TTL,
  invalidateServiceCache
};