# Improved SpreadAPI Architecture

## Redis Key Structure

### User & Tenant Management
```
user:{userId}                    → Hash
  - id: string
  - email: string  
  - tenantId: string
  - role: string
  - createdAt: ISO timestamp

tenant:{tenantId}               → Hash
  - id: string
  - name: string
  - plan: string
  - limits: JSON (rate limits, storage, etc)

tenant:{tenantId}:users         → Set of userIds
```

### Service Definition
```
service:{serviceId}             → Hash (always exists)
  - id: string
  - userId: string
  - name: string
  - description: string
  - status: "draft" | "published" | "archived"
  - createdAt: ISO timestamp
  - updatedAt: ISO timestamp
  - publishedAt: ISO timestamp (if published)
  - workbookUrl: string (blob URL)
  - workbookSize: string (bytes)
  - inputs: JSON array
  - outputs: JSON array
  - cacheEnabled: "true" | "false"
  - cacheDuration: string (seconds)
  - requireToken: "true" | "false"
  - rateLimitRequests: string
  - rateLimitWindow: string (seconds)
  - tags: comma-separated string
```

### Published Service Data (only when published)
```
service:{serviceId}:published   → Hash
  - apiPath: string (relative blob path)
  - apiSize: string (bytes)
  - tokens: comma-separated string
  - calls: string (counter)
  - lastUsed: ISO timestamp
```

### Caching
```
service:{serviceId}:cache:api           → JSON (TTL: 30m)
service:{serviceId}:cache:result:{hash} → JSON (TTL: 5m)
```

### Analytics
```
service:{serviceId}:analytics           → Hash
  - total: string (total calls)
  - cache:hits: string
  - cache:misses: string
  - avg_response_time: string (ms)
  - {date}:calls: string (calls per day)
  - {date}:errors: string (errors per day)
  - {date}:{hour}: string (calls per hour)
```

### Rate Limiting
```
service:{serviceId}:rate:{clientId}     → String counter (TTL: rateLimitWindow)
```

### User Indices
```
user:{userId}:services          → Set of serviceIds
```

## API Flow

### 1. Service Creation
```javascript
// Generate ID with user prefix
const serviceId = generateServiceId(userId); // user123_abc789xyz

// Create service
await redis.hSet(`service:${serviceId}`, {
  id: serviceId,
  userId,
  status: 'draft',
  createdAt: new Date().toISOString(),
  ...defaultSettings
});

// Add to user's services
await redis.sAdd(`user:${userId}:services`, serviceId);
```

### 2. Publishing
```javascript
// Upload to blob (store relative path)
const apiPath = `/${tenantId}/apis/${serviceId}.json`;
await uploadToBlob(apiPath, apiData);

// Update service status
await redis.hSet(`service:${serviceId}`, {
  status: 'published',
  publishedAt: new Date().toISOString()
});

// Create published data
await redis.hSet(`service:${serviceId}:published`, {
  apiPath,
  apiSize: size,
  tokens: tokens.join(','),
  calls: '0'
});
```

### 3. API Calculation
```javascript
// Check rate limit
const rateLimitKey = `service:${serviceId}:rate:${clientId}`;
const requests = await redis.incr(rateLimitKey);
if (requests === 1) {
  await redis.expire(rateLimitKey, rateLimitWindow);
}
if (requests > rateLimitRequests) {
  return { error: 'Rate limit exceeded', status: 429 };
}

// Get service data
const service = await redis.hGetAll(`service:${serviceId}`);
if (service.status !== 'published') {
  return { error: 'Service not published', status: 404 };
}

// Get published data
const published = await redis.hGetAll(`service:${serviceId}:published`);

// Check cache
const cacheKey = CACHE_KEYS.apiCache(serviceId);
let apiData = await redis.json.get(cacheKey);

if (!apiData) {
  // Fetch from blob using relative path
  const blobUrl = process.env.BLOB_URL + published.apiPath;
  apiData = await fetch(blobUrl).then(r => r.json());
  
  // Cache it
  await redis.json.set(cacheKey, '$', apiData);
  await redis.expire(cacheKey, CACHE_TTL.api);
}

// Process calculation...
```

## Benefits of This Structure

1. **Single Source of Truth**: Service status is in one place
2. **Clear Ownership**: User relationship is explicit
3. **Scalable**: Tenant-based isolation ready
4. **Efficient Queries**: Can list user's services, published services, etc.
5. **Rate Limiting Ready**: Built into the structure
6. **Clean Separation**: Draft vs published data
7. **Consistent Paths**: Always use relative paths in Redis, full URLs only when fetching

## Migration Path

1. Add `status` field to existing services
2. Move published data to `:published` keys only
3. Update calculation engine to use new structure
4. Implement rate limiting
5. Add proper user/tenant management