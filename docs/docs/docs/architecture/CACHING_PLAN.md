# Process-Level Caching Implementation Plan for SpreadAPI

## Overview
Implement high-performance process-level caching for SpreadAPI to dramatically reduce calculation times from 200-300ms to 10-20ms for frequently accessed spreadsheets.

## Current State Analysis
- **Spreadsheet Size**: 100-500KB per workbook
- **Current Performance**: 200-300ms per calculation
- **Infrastructure**: Vercel Pro plan with 3GB memory limit
- **Existing Caching**: Redis-based with 5-minute TTL

## Implementation Plan

### Phase 1: Core Caching Infrastructure ✅
**Already Completed:**
- Added process-level cache Map to `lib/spreadjs-server.js`
- Configured for 1000 workbooks max (~500MB memory)
- 20-minute TTL with automatic cleanup
- LRU eviction when cache is full
- `getCachedWorkbook()` function for cache management

### Phase 2: Integration with V1 API Route
**Note:** `/api/getresults` has been migrated to `/api/v1/services/[id]/execute`

**Tasks:**
1. **Modify V1 execution route to use process cache**
   - Generate cache keys from apiId + input parameters
   - Use `getCachedWorkbook()` for workbook retrieval
   - Preserve existing Redis caching as L2 cache

2. **Cache Key Generation Strategy**
   ```javascript
   // Example: "api-123:input1=10,input2=20,input3=hello"
   const cacheKey = generateCacheKey(apiId, inputList);
   ```

3. **Dual-Layer Caching**
   - L1: Process cache (5-20ms)
   - L2: Redis cache (50-100ms)
   - L3: Blob storage (200-300ms)

### Phase 3: Enhanced Monitoring
1. **Add cache statistics to API responses**
   ```json
   {
     "info": {
       "timeAll": 15,
       "fromProcessCache": true,
       "processCacheStats": {
         "size": 245,
         "maxSize": 1000,
         "hitRate": "92%"
       },
       "memoryUsed": "156MB"
     }
   }
   ```

2. **Create cache monitoring endpoint**
   - `/api/cache-stats` - View cache performance metrics
   - Hit/miss ratios
   - Memory usage
   - Most frequently cached items

### Phase 4: Optimization & Testing
1. **Performance Testing**
   - Measure response times with/without cache
   - Test cache eviction behavior
   - Verify memory usage stays within limits

2. **Cache Warming Strategy** (Optional)
   - Pre-load frequently used spreadsheets on startup
   - Background refresh of popular calculations

## Expected Outcomes

### Performance Improvements
- **Cached Requests**: 10-20ms (10-15x faster)
- **Cache Hit Rate**: 85-95% for common calculations
- **Throughput**: 1000+ requests/second per instance

### Memory Usage
- **Base**: ~150MB (Node.js + SpreadJS)
- **Cache**: ~500MB (1000 workbooks)
- **Buffer**: ~2350MB available headroom

### Cost Benefits
- Reduced compute time = lower Vercel costs
- Better user experience
- Higher capacity per function instance

## Implementation Timeline
1. ✅ Core caching infrastructure (Complete)
2. ⏳ Route integration (30 minutes)
3. ⏳ Monitoring setup (20 minutes)
4. ⏳ Testing & optimization (20 minutes)

## Configuration Options
```javascript
// Adjustable based on needs:
CACHE_MAX_SIZE = 1000;  // Can go up to 4000 safely
CACHE_TTL_MS = 20 * 60 * 1000;  // 20 minutes
```

## Risks & Mitigations
- **Risk**: Memory pressure under high load
  - **Mitigation**: Conservative cache size, monitoring alerts
  
- **Risk**: Stale data from long TTL
  - **Mitigation**: Cache invalidation on data updates
  
- **Risk**: Cold starts lose cache
  - **Mitigation**: Redis as L2 cache fallback