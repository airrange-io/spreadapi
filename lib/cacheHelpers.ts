import crypto from 'crypto';

/**
 * Generates a consistent hash for caching calculation results
 * Sorts input keys to ensure consistent hashing regardless of order
 */
export function generateResultCacheHash(inputs: Record<string, any>): string {
  // Sort keys for consistent hashing
  const sortedKeys = Object.keys(inputs).sort();
  const sortedInputs: Record<string, any> = {};
  
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
export const CACHE_KEYS = {
  // API definition cache
  apiCache: (serviceId: string) => `service:${serviceId}:cache:api`,
  
  // Calculation result cache
  resultCache: (serviceId: string, inputHash: string) => `service:${serviceId}:cache:result:${inputHash}`,
  
  // Workbook process cache (if needed in future)
  workbookCache: (serviceId: string) => `service:${serviceId}:cache:workbook`
};

/**
 * Cache TTL values in seconds
 */
export const CACHE_TTL = {
  api: 30 * 60,      // 30 minutes for API definitions
  result: 5 * 60,    // 5 minutes for calculation results
  workbook: 60 * 60  // 60 minutes for workbooks
};