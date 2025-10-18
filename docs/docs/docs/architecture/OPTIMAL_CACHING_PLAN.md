# Optimal Caching Strategy for SpreadAPI

## Current Performance Issues
- API definition fetch: ~370ms (every request)
- Calculation: ~5ms (with process cache)
- Total: ~460-500ms

## Target Performance
- API definition fetch: 0-1ms (process cache hit)
- Calculation: 2ms (process cache hit)
- Total: <20ms

## Three-Layer Caching Architecture

### Layer 1: Process-Level Cache (Fastest)
**Purpose**: Skip network calls entirely for frequently accessed data
**Location**: In-memory on each Lambda instance
**Implementation**: JavaScript Map objects

#### 1.1 Workbook Cache
```javascript
// lib/spreadjs-server.js
const workbookCache = new Map();
const CACHE_MAX_SIZE = 1000;
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

// Cache key: Just API ID (not input-specific)
// Stores: Initialized SpreadJS workbook object
```

#### 1.2 API Definition Cache
```javascript
// utils/helperApi.js
const apiDefinitionCache = new Map();
const API_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Cache key: `${apiId}:${token}`
// Stores: Complete API definition including fileJson
```

### Layer 2: Redis Cache (Distributed)
**Purpose**: Share data across Lambda instances
**TTL**: 30 minutes for API definitions, 5 minutes for results

```javascript
// API definitions
await redis.json.set("cache:blob:" + apiId, "$", responseJson);
await redis.expire("cache:blob:" + apiId, 60 * 30); // 30 minutes

// Calculation results
await redis.json.set(cacheKey, "$", result);
await redis.expire(cacheKey, 60 * 5); // 5 minutes
```

### Layer 3: Blob Storage (Persistent)
**Purpose**: Source of truth for API definitions
**Access**: Only when both caches miss

## Request Flow

### First Request (Cold Start)
1. Check process cache for API definition → Miss
2. Check Redis cache → Miss (or expired)
3. Fetch from Blob storage → ~370ms
4. Store in Redis cache
5. Store in process cache
6. Create workbook from fileJson
7. Store workbook in process cache
8. Calculate result
9. Return response

**Total: ~400ms**

### Second Request (Same Lambda)
1. Check process cache for API definition → **HIT! (0ms)**
2. Check workbook cache → **HIT! (0ms)**
3. Calculate result → 2ms
4. Return response

**Total: ~20ms**

### Third Request (Different Lambda)
1. Check process cache for API definition → Miss
2. Check Redis cache → **HIT! (~30ms)**
3. Store in process cache
4. Create workbook
5. Store workbook in cache
6. Calculate result
7. Return response

**Total: ~100ms**

## Implementation Checklist

### 1. Fix API Definition Process Cache
The code exists but isn't working on Vercel. Need to:
- Verify the cache is being populated
- Check if cache lookups are working
- Add logging to debug cache hits/misses

### 2. Optimize Cache Keys
- Workbook cache: Use only API ID (current)
- API definition cache: Use `${apiId}:${token}` (current)
- Don't include inputs in cache keys

### 3. Memory Management
- Monitor memory usage via `/api/cache-stats`
- Implement LRU eviction (current)
- Set appropriate cache sizes based on workbook size

### 4. Error Handling
- Gracefully handle cache failures
- Continue operation if cache unavailable
- Log cache errors for monitoring

## Code Changes Needed

### 1. Debug Why API Cache Isn't Working
```javascript
// In getApiDefinition()
console.log(`Checking cache for ${cacheKey}`);
if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
  console.log(`API definition cache hit for ${apiId}`);
  return cached.data;
}
console.log(`API definition cache miss for ${apiId}`);
```

### 2. Ensure Proper Cache Flow
```javascript
// In V1 API execution route (/api/v1/services/[id]/execute)
1. Try process cache for both API def and workbook
2. If API def not cached, fetch it
3. If workbook not cached, create it
4. Always update caches after fetch/create
```

### 3. Add Cache Warmup (Optional)
```javascript
// Preload frequently used APIs on Lambda start
const PRELOAD_APIS = ['ab3202cb-d0af-41af-88ce-7e51f5f6b6d3'];
for (const apiId of PRELOAD_APIS) {
  getApiDefinition(apiId).catch(() => {});
}
```

## Testing Strategy

### 1. Local Testing
- Verify cache hits with console logs
- Check memory usage
- Measure timing improvements

### 2. Production Testing
- Use `/api/cache-stats` to monitor
- Make rapid sequential requests
- Check if hitting same Lambda instance

### 3. Performance Benchmarks
- First request: ~400ms (acceptable)
- Cached requests: <20ms (target)
- Cache hit rate: >90% (target)

## Common Issues & Solutions

### Issue: API cache not working on Vercel
**Possible Causes:**
1. Different Lambda instances
2. Cache code not deployed
3. Environment differences

**Solutions:**
1. Add detailed logging
2. Verify deployment includes cache code
3. Test with rapid requests to same instance

### Issue: High memory usage
**Solutions:**
1. Reduce cache sizes
2. Shorter TTLs
3. More aggressive eviction

### Issue: Cache inconsistency
**Solutions:**
1. Add cache versioning
2. Clear cache on API updates
3. Use cache tags for invalidation

## Next Steps

1. **Debug Current Issue**: Add logging to understand why API definition cache isn't working
2. **Test Thoroughly**: Ensure caching works in both local and Vercel environments
3. **Monitor Performance**: Use cache stats endpoint to track improvements
4. **Optimize Further**: Consider edge caching, CDN, or other optimizations

## Expected Results

With proper caching:
- **95%+ cache hit rate** for popular APIs
- **<20ms response time** for cached requests
- **10-20x performance improvement**
- **Reduced Vercel costs** (less compute time)
- **Better user experience**