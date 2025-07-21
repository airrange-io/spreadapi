// Optimized Redis operations for better performance

/**
 * Batch fetch service data with published data in one operation
 */
export async function getServiceWithPublishedData(redis, serviceId) {
  const multi = redis.multi();
  
  // Batch all reads
  multi.hGetAll(`service:${serviceId}`);
  multi.exists(`service:${serviceId}:published`);
  multi.hGetAll(`service:${serviceId}:published`);
  
  const [serviceData, isPublished, publishedData] = await multi.exec();
  
  return {
    service: serviceData || {},
    isPublished: isPublished === 1,
    published: isPublished ? publishedData : null
  };
}

/**
 * Efficiently get multiple hash fields
 */
export async function getHashFields(redis, key, fields) {
  if (fields.length === 0) return {};
  
  const values = await redis.hmGet(key, ...fields);
  const result = {};
  
  fields.forEach((field, index) => {
    result[field] = values[index];
  });
  
  return result;
}

/**
 * Batch increment multiple counters
 */
export async function batchIncrementCounters(redis, increments) {
  const pipeline = redis.pipeline();
  
  increments.forEach(({ key, field, increment = 1 }) => {
    pipeline.hIncrBy(key, field, increment);
  });
  
  return pipeline.exec();
}

/**
 * Get service metadata with caching
 */
const serviceMetadataCache = new Map();
const CACHE_TTL = 60000; // 1 minute

export async function getCachedServiceMetadata(redis, serviceId) {
  const cacheKey = `meta:${serviceId}`;
  const cached = serviceMetadataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Use hmGet for specific fields instead of hGetAll
  const fields = ['name', 'description', 'status', 'requireToken', 'enableCaching'];
  const data = await getHashFields(redis, `service:${serviceId}`, fields);
  
  serviceMetadataCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}

/**
 * Efficient token validation with caching
 */
const tokenValidationCache = new Map();
const TOKEN_CACHE_TTL = 300000; // 5 minutes

export async function validateTokenCached(redis, token, serviceId) {
  const cacheKey = `${serviceId}:${token}`;
  const cached = tokenValidationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < TOKEN_CACHE_TTL) {
    return cached.valid;
  }
  
  // Check if token exists in service's token set
  const exists = await redis.sIsMember(`service:${serviceId}:tokens`, token);
  
  tokenValidationCache.set(cacheKey, {
    valid: exists,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries periodically
  if (tokenValidationCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of tokenValidationCache) {
      if (now - value.timestamp > TOKEN_CACHE_TTL) {
        tokenValidationCache.delete(key);
      }
    }
  }
  
  return exists;
}