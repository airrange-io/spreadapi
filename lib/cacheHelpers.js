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

    // Use KEYS for now - simpler and works for small datasets
    // For production with many keys, would use SCAN iterator
    const matchingKeys = await redis.keys(pattern);

    if (matchingKeys.length === 0) {
      // Also try to invalidate workbook cache
      const workbookKey = CACHE_KEYS.workbookCache(serviceId);
      await redis.del(workbookKey).catch(() => {});
      return 0;
    }

    // Delete all found keys
    const deleted = await redis.del(matchingKeys);

    // Also invalidate workbook cache for this service
    const workbookKey = CACHE_KEYS.workbookCache(serviceId);
    await redis.del(workbookKey).catch(() => {});

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