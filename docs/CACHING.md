# SpreadAPI Caching Documentation

## Overview

SpreadAPI implements a multi-layer caching strategy to optimize performance:

1. **Process-Level Cache (L1)** - Ultra-fast in-memory workbook cache
2. **Redis Cache (L2)** - Distributed cache for calculation results
3. **Blob Storage (L3)** - Persistent storage for spreadsheet definitions

## Process-Level Cache

### Configuration

Located in `lib/spreadjs-server.js`:

```javascript
const CACHE_MAX_SIZE = 1000;     // Maximum cached workbooks
const CACHE_TTL_MS = 20 * 60 * 1000;  // 20 minutes TTL
```

### How It Works

1. **Cache Key Generation**: Based on API ID and input parameters
   ```
   Example: "api-123:input1=10,input2=20"
   ```

2. **Cache Hit**: Workbook is already loaded with tables fetched
   - Response time: 5-20ms
   - No blob storage access
   - No JSON parsing
   - No table fetching

3. **Cache Miss**: Creates and caches new workbook
   - Loads from blob storage
   - Parses JSON
   - Fetches table data
   - Stores in cache for future use

### Memory Management

- **LRU Eviction**: Oldest workbook removed when cache is full
- **TTL Cleanup**: Expired entries removed every minute
- **Memory Usage**: ~500MB for 1000 workbooks (100-500KB each)

## API Response Cache Information

The `getresults` endpoint includes cache statistics:

```json
{
  "apiId": "your-api",
  "info": {
    "timeAll": 15,
    "timeApiData": 5,
    "timeCalculation": 10,
    "useCaching": true,
    "fromProcessCache": true,
    "processCacheStats": {
      "size": 245,
      "maxSize": 1000,
      "ttlMs": 1200000
    },
    "memoryUsed": "287MB"
  },
  "inputs": [...],
  "outputs": [...]
}
```

## Cache Monitoring

Access cache statistics at `/api/cache-stats`:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "processCache": {
    "size": 245,
    "maxSize": 1000,
    "ttlMs": 1200000,
    "hitRate": "92%",
    "estimatedMemoryUsage": "74MB"
  },
  "redisCache": {
    "connected": true,
    "cacheKeyCount": 1523,
    "sampleKeys": [...]
  },
  "memory": {
    "heapUsed": "287MB",
    "heapTotal": "322MB",
    "rss": "424MB"
  },
  "uptime": "3600s"
}
```

## Performance Characteristics

### Without Process Cache
- Blob fetch: ~50ms
- JSON parse: ~20ms
- Workbook create: ~30ms
- Table fetch: ~100ms
- **Total: 200-300ms**

### With Process Cache
- Cache lookup: ~0.1ms
- Calculation only: ~10-20ms
- **Total: 10-20ms** (10-15x faster!)

## Configuration Options

### Adjusting Cache Size

For different Vercel plans:

```javascript
// Hobby (1GB memory)
const CACHE_MAX_SIZE = 200;  // ~100MB cache

// Pro (3GB memory) - Current
const CACHE_MAX_SIZE = 1000; // ~500MB cache

// Enterprise (10GB memory)
const CACHE_MAX_SIZE = 5000; // ~2.5GB cache
```

### Disabling Process Cache

Set `useCaching: false` in the API configuration to disable all caching.

## Best Practices

1. **Cache Key Design**: Ensure consistent parameter ordering
2. **Memory Monitoring**: Watch `/api/cache-stats` for memory usage
3. **TTL Configuration**: Balance between performance and data freshness
4. **Warm-up Strategy**: Consider pre-loading popular spreadsheets

## Troubleshooting

### High Memory Usage
- Reduce `CACHE_MAX_SIZE`
- Decrease `CACHE_TTL_MS`
- Check for memory leaks in `/api/cache-stats`

### Low Hit Rate
- Increase `CACHE_MAX_SIZE` if memory allows
- Analyze access patterns
- Consider longer TTL for stable data

### Cache Misses After Deploy
- Normal behavior - cache is process-local
- Redis cache provides fallback
- Consider cache warming strategy