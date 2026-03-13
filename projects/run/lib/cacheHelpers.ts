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

interface AreaUpdate {
  areaName: string;
  changes: Array<{
    row: number;
    col: number;
    value: any;
  }>;
}

function normalizeAreaUpdates(areaUpdates: AreaUpdate[] | undefined): any {
  if (!areaUpdates || areaUpdates.length === 0) return null;

  return areaUpdates
    .map(update => ({
      areaName: update.areaName,
      changes: update.changes
        .slice()
        .sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col)
        .map(change => ({ row: change.row, col: change.col, value: change.value }))
    }))
    .sort((a, b) => a.areaName.localeCompare(b.areaName));
}

export function generateEnhancedCacheHash(
  inputs: Record<string, any>,
  areaUpdates?: AreaUpdate[]
): string {
  const sortedKeys = Object.keys(inputs).sort();
  const sortedInputs: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedInputs[key] = inputs[key];
  }

  const cacheData = {
    inputs: sortedInputs,
    areas: normalizeAreaUpdates(areaUpdates)
  };

  const dataString = JSON.stringify(cacheData);
  return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
}

/**
 * Cache key patterns
 */
export const CACHE_KEYS = {
  apiCache: (serviceId: string) => `service:${serviceId}:cache:api`,
  resultCache: (serviceId: string) => `service:${serviceId}:cache:results`,
  enhancedResultCache: (serviceId: string, enhancedHash: string) => `service:${serviceId}:cache:result:enhanced:${enhancedHash}`,
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

/**
 * Invalidate all cached results for a service
 */
export async function invalidateServiceCache(redis: any, serviceId: string): Promise<number> {
  try {
    const apiCacheKey = CACHE_KEYS.apiCache(serviceId);
    const resultCacheKey = `service:${serviceId}:cache:results`;
    const workbookKey = CACHE_KEYS.workbookCache(serviceId);

    const multi = redis.multi();
    multi.del(apiCacheKey);
    multi.del(resultCacheKey);
    multi.del(workbookKey);
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
