import crypto from 'crypto';

/**
 * Generates a consistent hash for caching calculation results
 * Sorts input keys to ensure consistent hashing regardless of order
 */
export function generateResultCacheHash(inputs: Record<string, any>): string {
  const sortedKeys = Object.keys(inputs).sort();
  const sortedInputs: Record<string, any> = {};

  for (const key of sortedKeys) {
    sortedInputs[key] = inputs[key];
  }

  const inputString = JSON.stringify(sortedInputs);
  return crypto.createHash('sha256').update(inputString).digest('hex').substring(0, 16);
}

/**
 * Cache key patterns
 */
export const CACHE_KEYS = {
  apiCache: (serviceId: string) => `service:${serviceId}:cache:api`,
  resultCache: (serviceId: string) => `service:${serviceId}:cache:results`,
  workbookCache: (serviceId: string) => `service:${serviceId}:cache:workbook`
};

/**
 * Cache TTL values in seconds
 */
export const CACHE_TTL = {
  api: 24 * 60 * 60,
  result: 15 * 60,
  workbook: 10 * 60
};
