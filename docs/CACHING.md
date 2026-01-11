# SpreadAPI Caching Architecture

## Overview

SpreadAPI uses a **multi-layer caching strategy** to optimize performance. Understanding this architecture is critical for debugging performance issues and ensuring data consistency.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT REQUEST                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: Process Cache (In-Memory Maps)                                    │
│  ────────────────────────────────────────                                   │
│  Location: Serverless function instance memory                              │
│  Speed: ~0.1ms                                                              │
│  Scope: Single instance only (NOT shared across instances)                  │
│  Invalidation: TTL-based only (cannot be invalidated cross-instance)        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │ MISS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: Redis Cache (Distributed)                                         │
│  ───────────────────────────────────                                        │
│  Location: Redis server (Upstash)                                           │
│  Speed: ~5-30ms                                                             │
│  Scope: Shared across ALL serverless instances                              │
│  Invalidation: On-demand via invalidateServiceCache() + TTL                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │ MISS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: Blob Storage (Persistent)                                         │
│  ──────────────────────────────────                                         │
│  Location: Vercel Blob Storage                                              │
│  Speed: ~50-300ms                                                           │
│  Scope: Permanent storage                                                   │
│  Invalidation: Replaced on publish                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Process-Level Caches (In-Memory)

These caches use JavaScript `Map` objects and exist **only within a single serverless function instance**. They provide the fastest access but have important limitations.

### 1.1 Workbook Cache

**File:** `lib/spreadjs-server.js`

```javascript
const workbookCache = new Map();
const CACHE_MAX_SIZE = 1000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes
const MAX_PROCESS_CACHE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max per workbook
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 60 minutes | Time until cached workbook expires |
| Max Size | 1000 entries | Maximum number of cached workbooks |
| Max Entry Size | 10 MB | Workbooks larger than this skip process cache |
| Eviction | LRU | Oldest entry removed when cache is full |
| Cleanup | Every 60 seconds | Expired entries removed periodically |

**What it caches:** Fully parsed SpreadJS workbook instances, ready for calculation.

**Size filtering:** Workbooks larger than 10MB are NOT cached in process memory to prevent a single large workbook from consuming too much memory. These fall back to Redis cache.

### 1.2 API Definition Cache

**File:** `utils/helperApi.js`

```javascript
const apiDefinitionCache = new Map();
const API_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 10 minutes | Time until cached definition expires |
| Max Size | Unlimited | No size limit (entries are small) |
| Eviction | None | Only TTL-based expiration |

**What it caches:** API metadata including inputs, outputs, flags, tokens, and the fileJson.

### 1.3 TableSheet Data Cache

**File:** `lib/tableSheetDataCache.js`

```javascript
const tableSheetDataCache = new Map();
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB total
// Per-entry max: 10MB
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | Configurable per service | `tableSheetCacheTTL` setting (default 300s) |
| Max Total Size | 100 MB | Total cache size limit |
| Max Entry Size | 10 MB | Single TableSheet data limit |
| Eviction | LRU | Least recently used when full |
| Cleanup | Every 5 minutes | Entries older than 1 hour removed |

**What it caches:** External data fetched for TableSheets (from remote URLs).

### 1.4 Service Metadata Cache

**File:** `lib/redis-optimized.js`

```javascript
const serviceMetadataCache = new Map();
const CACHE_TTL = 60000; // 1 minute
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 1 minute | Short TTL for frequently changing data |
| Max Size | Unlimited | Small entries |

**What it caches:** Basic service metadata (name, description, status, flags).

### 1.5 Token Validation Cache

**File:** `lib/redis-optimized.js`

```javascript
const tokenValidationCache = new Map();
const TOKEN_CACHE_TTL = 300000; // 5 minutes
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 5 minutes | Balance between security and performance |
| Max Size | 1000 entries | Cleanup triggered when exceeded |

**What it caches:** Token validation results (valid/invalid).

### 1.6 Analytics Cache

**File:** `app/api/getanalytics/route.js`

```javascript
const analyticsCache = new Map();
const CACHE_TTL = 30000; // 30 seconds
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 30 seconds | Very short for near-real-time data |

**What it caches:** Analytics query results.

---

## Layer 2: Redis Cache (Distributed)

Redis caches are **shared across all serverless instances** and can be explicitly invalidated.

### 2.1 API Cache

**Key Pattern:** `service:{serviceId}:cache:api`

```javascript
// From lib/cacheHelpers.ts
CACHE_TTL.api = 24 * 60 * 60; // 24 hours
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 24 hours | Long TTL, invalidated on publish |
| Storage | Redis JSON | Stores `{ apiJson, fileJson }` |
| Invalidation | On publish | `invalidateServiceCache()` |

**What it caches:** Complete API definition including the spreadsheet JSON.

### 2.2 Result Cache

**Key Pattern:** `service:{serviceId}:cache:results`

```javascript
// From lib/cacheHelpers.ts
CACHE_TTL.result = 15 * 60; // 15 minutes
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 15 minutes | Shorter TTL for calculation results |
| Storage | Redis Hash | Field = inputHash, Value = JSON result |
| Invalidation | On publish | `invalidateServiceCache()` |

**What it caches:** Calculation results keyed by a hash of the input parameters.

**Hash generation:** Uses SHA-256 hash of sorted input parameters (first 16 chars).

### 2.3 Enhanced Result Cache (MCP)

**Key Pattern:** `service:{serviceId}:cache:result:enhanced:{hash}`

Used by MCP for caching results that include area state changes.

### 2.4 Workbook Cache

**Key Pattern:** `service:{serviceId}:cache:workbook`

```javascript
// From lib/cacheHelpers.ts
CACHE_TTL.workbook = 10 * 60; // 10 minutes
```

| Property | Value | Description |
|----------|-------|-------------|
| TTL | 10 minutes | Moderate TTL |
| Storage | Redis JSON | Stores workbook.toJSON() |
| Invalidation | On publish | `invalidateServiceCache()` |

**What it caches:** Serialized workbook JSON (for sharing between instances).

---

## Layer 3: Blob Storage (Persistent)

### Published Service Data

**URL Pattern:** `{NEXT_VERCEL_BLOB_URL}/{tenantId}/apis/{serviceId}.json`

| Property | Value | Description |
|----------|-------|-------------|
| TTL | Permanent | Never expires automatically |
| Invalidation | Replaced on publish | Old blob deleted, new blob created |

**What it stores:** The complete published service definition and spreadsheet data.

---

## Cache Invalidation

### When Publishing/Republishing a Service

**File:** `lib/publishService.js`

```javascript
// Called in createOrUpdateService()
await invalidateServiceCache(redis, apiId);
```

This clears:
- `service:{id}:cache:api` (Redis)
- `service:{id}:cache:results` (Redis)
- `service:{id}:cache:workbook` (Redis)

**NOT cleared:**
- Process-level caches on other instances
- These expire via TTL (up to 60 minutes for workbookCache, 10 minutes for apiDefinitionCache)

### The Stale Data Problem

```
                    Instance A              Instance B              Instance C
                    ──────────              ──────────              ──────────
Time 0:             Cache: v1               Cache: v1               Cache: v1

User publishes v2   ─────────────────────────────────────────────────────────►

Time 0+:            Redis cleared           Redis cleared           Redis cleared
                    Process: v1 (stale)     Process: v1 (stale)     Process: v1 (stale)

Time +10min:        Process: expired        Process: expired        Process: expired
                    Fetches v2              Fetches v2              Fetches v2
```

**Impact:** After publishing, users may see stale data for up to:
- 10 minutes (apiDefinitionCache TTL)
- 60 minutes (workbookCache TTL)

...depending on which instance handles their request.

---

## Cache Flow for API Execution

```
Request: POST /api/v1/services/{id}/execute

1. Check apiDefinitionCache (Process)
   ├─ HIT: Use cached API definition
   └─ MISS: Continue to step 2

2. Check Redis API cache
   ├─ HIT: Store in apiDefinitionCache, use data
   └─ MISS: Continue to step 3

3. Fetch from Redis published data + Blob
   └─ Store in Redis cache + apiDefinitionCache

4. Check workbookCache (Process)
   ├─ HIT: Use cached workbook (~0ms)
   └─ MISS: Continue to step 5

5. Check Redis workbook cache
   ├─ HIT: Parse JSON, store in workbookCache
   └─ MISS: Continue to step 6

6. Create workbook from fileJson
   ├─ Size ≤ 10MB: Store in workbookCache + Redis
   └─ Size > 10MB: Store in Redis only (skip process cache)

7. Perform calculation

8. Check Redis result cache
   ├─ HIT: Return cached result
   └─ MISS: Calculate, cache result, return
```

---

## Performance Characteristics

### Without Any Cache (Cold Start)
| Operation | Time |
|-----------|------|
| Blob fetch | ~50-100ms |
| JSON parse | ~20-50ms |
| Workbook create | ~30-50ms |
| Table fetch (if any) | ~100-500ms |
| Calculation | ~10-50ms |
| **Total** | **200-750ms** |

### With Redis Cache Only
| Operation | Time |
|-----------|------|
| Redis fetch | ~5-30ms |
| JSON parse | ~20-50ms |
| Workbook create | ~30-50ms |
| Calculation | ~10-50ms |
| **Total** | **65-180ms** |

### With Process Cache (Best Case)
| Operation | Time |
|-----------|------|
| Cache lookup | ~0.1ms |
| Calculation | ~10-50ms |
| **Total** | **10-50ms** |

---

## Memory Limits

### Vercel Serverless Functions

| Plan | Memory Limit |
|------|--------------|
| Hobby | 1 GB |
| Pro | Up to 4 GB (configurable) |
| Enterprise | Up to 4 GB |

### Current Configuration Assumptions

The caching configuration assumes **~3GB available memory**:

```javascript
// lib/spreadjs-server.js
CACHE_MAX_SIZE = 1000;  // ~500MB for 100-500KB average workbooks
MAX_PROCESS_CACHE_SIZE_BYTES = 10MB;  // Skip caching workbooks larger than this

// lib/tableSheetDataCache.js
MAX_CACHE_SIZE = 100MB;  // Total TableSheet data
```

---

## Configuration Reference

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_VERCEL_BLOB_URL` | Base URL for Vercel Blob storage |
| `UPSTASH_REDIS_REST_URL` | Redis connection URL |

### Service-Level Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `useCaching` | true | Enable/disable all server caching |
| `cacheTableSheetData` | true | Cache external TableSheet data |
| `tableSheetCacheTTL` | 300 | TTL for TableSheet data in seconds |

---

## Monitoring

### Cache Statistics Endpoint

**GET `/api/cache-stats`**

Returns:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "processCache": {
    "workbookCache": {
      "size": 245,
      "maxSize": 1000,
      "ttlMs": 3600000
    },
    "apiDefinitionCache": {
      "size": 120,
      "ttlMs": 600000
    },
    "tableSheetCache": {
      "entries": 15,
      "sizeMB": "45.2",
      "maxSizeMB": "100"
    }
  },
  "memory": {
    "heapUsed": "287MB",
    "heapTotal": "322MB",
    "rss": "424MB"
  }
}
```

### Log Messages

| Message | Meaning |
|---------|---------|
| `[CACHE HIT] Process cache for {id}` | Found in apiDefinitionCache |
| `[CACHE MISS] Process cache for {id}` | Not in apiDefinitionCache |
| `[ProcessCache] Skipping cache for {id} - too large` | Workbook exceeds 10MB limit |
| `[Cache] Invalidated service {id}` | Redis caches cleared on publish |

---

## Troubleshooting

### Stale Data After Publishing

**Symptom:** Users see old data after publishing a service.

**Cause:** Process-level caches on other instances still have old data.

**Solution:** Wait for TTL expiration (up to 10-60 minutes) or redeploy to clear all instances.

### High Memory Usage

**Symptom:** Function crashes or slow response.

**Solutions:**
1. Reduce `CACHE_MAX_SIZE` in `lib/spreadjs-server.js`
2. Reduce `MAX_CACHE_SIZE` in `lib/tableSheetDataCache.js`
3. Lower TTLs to expire entries faster
4. Check `/api/cache-stats` for memory usage

### Low Cache Hit Rate

**Symptom:** Slow responses, high Redis/Blob usage.

**Solutions:**
1. Increase `CACHE_MAX_SIZE` if memory allows
2. Increase TTLs for stable services
3. Implement cache warming for popular services
4. Check if inputs vary too much (creates many cache keys)

### Cache Not Invalidating

**Symptom:** Old calculation results returned after publish.

**Checklist:**
1. Verify `invalidateServiceCache()` is called in publish flow
2. Check Redis connection is working
3. Remember: Process caches cannot be invalidated cross-instance

---

## Best Practices

1. **Use consistent input ordering** - Cache keys are based on sorted inputs
2. **Monitor memory** - Check `/api/cache-stats` regularly
3. **Set appropriate TTLs** - Balance freshness vs performance
4. **Consider cache warming** - Pre-load popular services after deploy
5. **Don't cache sensitive data** - Token validation cache has short TTL for security
6. **Large workbooks** - Accept that they use Redis-only caching (slower but safer)

---

## Summary Table

| Cache | Location | TTL | Max Size | Invalidation | Shared? |
|-------|----------|-----|----------|--------------|---------|
| workbookCache | Process | 60 min | 1000 entries, 10MB/entry | TTL only | No |
| apiDefinitionCache | Process | 10 min | Unlimited | TTL only | No |
| tableSheetDataCache | Process | Configurable | 100MB total | TTL + LRU | No |
| serviceMetadataCache | Process | 1 min | Unlimited | TTL only | No |
| tokenValidationCache | Process | 5 min | 1000 entries | TTL + cleanup | No |
| analyticsCache | Process | 30 sec | Unlimited | TTL only | No |
| API Cache | Redis | 24 hr | Unlimited | On publish | Yes |
| Result Cache | Redis | 15 min | Unlimited | On publish | Yes |
| Workbook Cache | Redis | 10 min | Unlimited | On publish | Yes |
| Blob Storage | Vercel | Permanent | Unlimited | On publish | Yes |
