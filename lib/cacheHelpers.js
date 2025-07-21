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
  result: 5 * 60,    // 5 minutes for calculation results
  workbook: 10 * 60  // 10 minutes for workbooks (future use)
};

module.exports = {
  generateResultCacheHash,
  CACHE_KEYS,
  CACHE_TTL
};