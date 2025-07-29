import redis from './redis';
import { getApiDefinition } from '../utils/helperApi';
import { CACHE_KEYS, CACHE_TTL } from './cacheHelpers';

// Lazy load SpreadJS
let spreadjsModule = null;
const getSpreadjsModule = () => {
  if (!spreadjsModule) {
    spreadjsModule = require('./spreadjs-server');
  }
  return spreadjsModule;
};

/**
 * Prewarm a service by loading its workbook into cache
 * This improves the response time for the first calculation
 * 
 * @param {string} serviceId - The service ID to prewarm
 * @param {boolean} forceRefresh - Force refresh even if already cached
 * @returns {Promise<Object>} Result with status and timing
 */
export async function prewarmService(serviceId, forceRefresh = false) {
  const startTime = Date.now();
  
  try {
    // Check if service is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return {
        success: false,
        error: 'Service not published',
        timeMs: Date.now() - startTime
      };
    }
    
    // Check if already cached (unless force refresh)
    if (!forceRefresh) {
      const workbookCacheKey = CACHE_KEYS.workbookCache(serviceId);
      const cacheExists = await redis.exists(workbookCacheKey);
      if (cacheExists > 0) {
        // Also check process cache
        const { getCachedWorkbook } = getSpreadjsModule();
        const processCacheKey = serviceId;
        const cached = await getCachedWorkbook(serviceId, processCacheKey, null, true); // checkOnly flag
        
        if (cached.fromCache) {
          return {
            success: true,
            alreadyCached: true,
            cacheType: 'both',
            timeMs: Date.now() - startTime
          };
        }
      }
    }
    
    // Get API definition
    const apiDefinition = await getApiDefinition(serviceId);
    if (!apiDefinition || apiDefinition.error) {
      return {
        success: false,
        error: apiDefinition?.error || 'Service not found',
        timeMs: Date.now() - startTime
      };
    }
    
    // Get the file JSON
    const fileJson = apiDefinition?.fileJson ?? {};
    if (!fileJson) {
      return {
        success: false,
        error: 'No service data',
        timeMs: Date.now() - startTime
      };
    }
    
    // Check for tables
    const withTables = fileJson.sheetTabCount > 0;
    if (withTables) {
      const { loadTablesheetModule } = getSpreadjsModule();
      const tablesheetLoaded = await loadTablesheetModule();
      if (!tablesheetLoaded) {
        return {
          success: false,
          error: 'Error loading required modules',
          timeMs: Date.now() - startTime
        };
      }
    }
    
    // Load workbook into caches
    const { getCachedWorkbook, createWorkbook } = getSpreadjsModule();
    const processCacheKey = serviceId;
    
    const cacheResult = await getCachedWorkbook(
      serviceId,
      processCacheKey,
      async (workbook) => {
        workbook.fromJSON(fileJson, {
          calcOnDemand: false,
          doNotRecalculateAfterLoad: false,
        });
        
        // Initialize tables if needed
        if (withTables) {
          const dataManager = workbook.dataManager();
          if (dataManager && dataManager.tables) {
            const tablePromises = [];
            for (const [rowKey, rowObject] of Object.entries(dataManager.tables)) {
              const table = rowObject;
              const tablePromise = table.fetch(true).catch((err) => {
                console.error(`Error fetching table ${rowKey}:`, err);
                return null;
              });
              tablePromises.push(tablePromise);
            }
            await Promise.all(tablePromises);
          }
        }
        
        // Save to Redis for other instances
        if (!withTables) { // Only cache non-table workbooks for now
          try {
            const workbookCacheKey = CACHE_KEYS.workbookCache(serviceId);
            const workbookJson = workbook.toJSON();
            const multi = redis.multi();
            multi.json.set(workbookCacheKey, "$", workbookJson);
            multi.expire(workbookCacheKey, CACHE_TTL.workbook);
            await multi.exec();
            console.log(`[prewarmService] Saved workbook to Redis cache for ${serviceId}`);
          } catch (err) {
            console.error('Failed to cache workbook in Redis:', err);
          }
        }
      }
    );
    
    // Track prewarm in analytics
    redis.hIncrBy(`service:${serviceId}:analytics`, 'prewarms', 1).catch(() => {});
    
    return {
      success: true,
      fromCache: cacheResult.fromCache,
      withTables,
      timeMs: Date.now() - startTime
    };
    
  } catch (error) {
    console.error(`Error prewarming service ${serviceId}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      timeMs: Date.now() - startTime
    };
  }
}

/**
 * Prewarm multiple services in parallel
 * @param {string[]} serviceIds - Array of service IDs to prewarm
 * @returns {Promise<Object>} Results for each service
 */
export async function prewarmServices(serviceIds) {
  const results = await Promise.all(
    serviceIds.map(serviceId => 
      prewarmService(serviceId).catch(err => ({
        serviceId,
        success: false,
        error: err.message
      }))
    )
  );
  
  return serviceIds.reduce((acc, serviceId, index) => {
    acc[serviceId] = results[index];
    return acc;
  }, {});
}