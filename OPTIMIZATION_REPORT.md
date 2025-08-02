# Service Detail Route Optimization Report

## Current Loading Flow

1. **ServicePageClient** makes 2 parallel requests:
   - `/api/services/${serviceId}/full` - Gets service metadata
   - `/api/workbook/${serviceId}` - Gets workbook data (with ETag)

2. **Redis Operations** in `/full` endpoint:
   ```javascript
   const multi = redis.multi();
   multi.hGetAll(`service:${id}`);
   multi.exists(`service:${id}:published`);
   multi.hGetAll(`service:${id}:published`);
   const [serviceData, isPublished, publishedData] = await multi.exec();
   ```
   ✅ This is correctly using Redis pipeline for efficiency

3. **Workbook Loading**:
   - Checks ETag from localStorage
   - Returns 304 if unchanged
   - Downloads from Blob storage if changed
   - Base64 encodes SJS files (inefficient for large files)

## Issues Identified

### 1. Multiple Network Round Trips
- Client makes 2 separate API calls that could be combined
- Each call has its own network latency

### 2. Base64 Encoding Overhead
```javascript
const base64 = Buffer.from(arrayBuffer).toString('base64');
```
- Large SJS files are base64 encoded, increasing size by ~33%
- This happens in-memory, potentially causing memory spikes

### 3. LocalStorage for ETags
- ETags stored in localStorage are not reliable (can be cleared)
- Not integrated with Next.js caching mechanisms

### 4. Missing Streaming for Large Files
- Entire workbook loaded into memory before sending
- No streaming support for large workbooks

## Important Note: Redis Client Compatibility

The optimization examples use `pipeline()` for demonstration, but the `node-redis` client used in this project uses `multi()` for both transactions and pipelining. When implementing, use:

```javascript
// For node-redis client
const multi = redis.multi();
multi.hGetAll(`service:${id}`);
multi.exists(`service:${id}:published`);
const [serviceData, isPublished] = await multi.exec();
```

The `multi()` method in node-redis automatically pipelines commands when used without WATCH, providing the same performance benefits.

## Recommendations

### 1. Combine API Endpoints
Create a single endpoint that returns both service data and workbook in one response:

```javascript
// New: /api/services/[id]/complete
export async function GET(request, { params }) {
  // Use pipeline for all Redis operations
  const pipeline = redis.pipeline();
  pipeline.hGetAll(`service:${id}`);
  pipeline.exists(`service:${id}:published`);
  pipeline.hGetAll(`service:${id}:published`);
  
  const results = await pipeline.exec();
  
  // Return combined response with workbook URL
  return {
    service: serviceData,
    status: statusData,
    workbook: {
      url: service.workbookUrl, // Direct blob URL
      etag: generateETag(service),
      size: service.workbookSize
    }
  };
}
```

### 2. Stream Large Workbooks Directly
Instead of base64 encoding, return the blob URL directly:

```javascript
// Client-side
if (workbook.url) {
  // Fetch directly from blob storage with proper caching
  const response = await fetch(workbook.url, {
    headers: {
      'If-None-Match': workbook.etag
    }
  });
}
```

### 3. Implement Proper Caching Headers
```javascript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'private, max-age=0, must-revalidate',
    'ETag': etag,
    'Vercel-CDN-Cache-Control': 'max-age=300, stale-while-revalidate=60'
  }
});
```

### 4. Use Next.js 15 Caching Patterns
```javascript
// Use unstable_cache for Redis operations
import { unstable_cache } from 'next/cache';

const getServiceData = unstable_cache(
  async (serviceId) => {
    // Redis operations
  },
  ['service-data'],
  {
    revalidate: 60,
    tags: [`service-${serviceId}`]
  }
);
```

### 5. Optimize Blob Storage Pattern
```javascript
// Use immutable blobs with versioning
const uploadPath = `users/${userId}/workbooks/${id}-${timestamp}.sjs`;
await putBlob(uploadPath, workbookBuffer, {
  access: 'public',
  contentType: contentType,
  addRandomSuffix: false, // Use timestamp instead
  cacheControlMaxAge: 31536000, // 1 year for immutable content
});
```

## Performance Impact

### Current Performance:
- 2 API calls = ~100-200ms network overhead
- Base64 encoding large files = +33% data transfer
- In-memory processing = potential memory spikes

### Expected Improvements:
- Single API call = ~50-100ms saved
- Direct blob URLs = -33% data transfer reduction
- Streaming = lower memory usage
- Proper caching = fewer repeat downloads

## Implementation Priority

1. **High Priority**: Combine API endpoints to reduce round trips
2. **High Priority**: Remove base64 encoding for blob data
3. **Medium Priority**: Implement proper ETag/caching headers
4. **Low Priority**: Add streaming support for very large workbooks