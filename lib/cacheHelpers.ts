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
 * Area update type for enhanced caching
 */
interface AreaUpdate {
  areaName: string;
  changes: Array<{
    row: number;
    col: number;
    value: any;
  }>;
}

/**
 * Normalizes area updates for consistent hashing
 * Sorts areas by name and changes by row/col to ensure identical updates produce identical hashes
 */
function normalizeAreaUpdates(areaUpdates: AreaUpdate[] | undefined): any {
  if (!areaUpdates || areaUpdates.length === 0) {
    return null; // No area changes - use null for consistency
  }

  // Sort areas by name, and within each area, sort changes by row then col
  return areaUpdates
    .map(update => ({
      areaName: update.areaName,
      changes: update.changes
        .slice() // Create copy to avoid mutating original
        .sort((a, b) => {
          // Sort by row first
          if (a.row !== b.row) return a.row - b.row;
          // Then by column
          return a.col - b.col;
        })
        .map(change => ({
          row: change.row,
          col: change.col,
          value: change.value
        }))
    }))
    .sort((a, b) => a.areaName.localeCompare(b.areaName));
}

/**
 * Generates a cache hash that includes both inputs AND area updates
 * This ensures different area states produce different cache keys, preventing cache poisoning
 *
 * @param inputs - Calculation input parameters
 * @param areaUpdates - Optional area modifications
 * @returns Hash string that uniquely identifies this inputs+areas combination
 *
 * @example
 * // Standard calculation (no areas)
 * generateEnhancedCacheHash({ price: 100 })
 * // => "a1b2c3d4e5f6g7h8"
 *
 * // Calculation with area updates
 * generateEnhancedCacheHash(
 *   { income: 50000 },
 *   [{ areaName: 'tax_brackets', changes: [{ row: 0, col: 1, value: 0.10 }] }]
 * )
 * // => "x9y8z7w6v5u4t3s2"
 *
 * // Same inputs but different area value = different hash!
 * generateEnhancedCacheHash(
 *   { income: 50000 },
 *   [{ areaName: 'tax_brackets', changes: [{ row: 0, col: 1, value: 0.20 }] }]
 * )
 * // => "m1n2o3p4q5r6s7t8"  ← Different!
 */
export function generateEnhancedCacheHash(
  inputs: Record<string, any>,
  areaUpdates?: AreaUpdate[]
): string {
  // Sort inputs for consistent hashing
  const sortedKeys = Object.keys(inputs).sort();
  const sortedInputs: Record<string, any> = {};

  for (const key of sortedKeys) {
    sortedInputs[key] = inputs[key];
  }

  // Normalize area updates (sorted consistently)
  const normalizedAreas = normalizeAreaUpdates(areaUpdates);

  // Combine inputs and areas into single hashable object
  const cacheData = {
    inputs: sortedInputs,
    areas: normalizedAreas
  };

  // Create hash of combined data
  const dataString = JSON.stringify(cacheData);
  return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
}

/**
 * Cache key patterns for the new structure
 */
export const CACHE_KEYS = {
  // API definition cache
  apiCache: (serviceId: string) => `service:${serviceId}:cache:api`,

  // Calculation result cache - Hash containing all results for a service
  // Hash fields are inputHash -> JSON stringified result
  // Allows O(1) invalidation by deleting entire hash on publish
  resultCache: (serviceId: string) => `service:${serviceId}:cache:results`,

  // Enhanced result cache (includes area state) - Used by MCP for area-aware caching
  enhancedResultCache: (serviceId: string, enhancedHash: string) => `service:${serviceId}:cache:result:enhanced:${enhancedHash}`,

  // Workbook process cache (if needed in future)
  workbookCache: (serviceId: string) => `service:${serviceId}:cache:workbook`
};

/**
 * Cache TTL values in seconds
 */
export const CACHE_TTL = {
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
 * @param redis - Redis client instance
 * @param serviceId - Service ID to invalidate
 * @returns Number of keys deleted
 */
export async function invalidateServiceCache(redis: any, serviceId: string): Promise<number> {
  try {
    // Delete ALL caches for this service when republished
    // Use multi for atomic deletion in single round-trip
    const apiCacheKey = CACHE_KEYS.apiCache(serviceId);
    const resultCacheKey = `service:${serviceId}:cache:results`; // Hash-based result cache
    const workbookKey = CACHE_KEYS.workbookCache(serviceId);

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