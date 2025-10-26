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
  api: 24 * 60 * 60, // 24 hours for API definitions (invalidated on publish)
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
    // Delete ALL caches for this service when republished
    // Use multi for atomic deletion in single round-trip
    const apiCacheKey = CACHE_KEYS.apiCache(serviceId);       // API definition cache
    const resultCacheKey = CACHE_KEYS.resultCache(serviceId); // Calculation results cache
    const workbookKey = CACHE_KEYS.workbookCache(serviceId);  // Workbook cache

    const multi = redis.multi();
    multi.del(apiCacheKey);    // Clear API metadata so fresh version is loaded
    multi.del(resultCacheKey); // Clear calculation results
    multi.del(workbookKey);    // Clear workbook cache
    const results = await multi.exec();

    const deletedApi = results[0];
    const deletedResults = results[1];

    console.log(`[Cache] Invalidated service ${serviceId}: API=${deletedApi > 0 ? 'yes' : 'no'}, Results=${deletedResults > 0 ? 'yes' : 'no'}`);

    return deletedApi + deletedResults;
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