# Service Data Fetching Refactoring - Detailed TODO

## Overview
This document provides a detailed plan to eliminate redundant service data fetching calls across the SpreadAPI codebase by implementing centralized service helpers.

## Current State Analysis

### Problems Identified
1. **25+ instances** of direct Redis calls for service data
2. **7 different patterns** for fetching the same data
3. **No caching** - every request hits Redis
4. **Inconsistent data formats** returned by different methods
5. **Code duplication** across 30+ files

### Current Patterns to Replace
```javascript
// Pattern 1: Direct Redis basic service
await redis.hGetAll(`service:${serviceId}`)

// Pattern 2: Direct Redis published data
await redis.hGetAll(`service:${serviceId}:published`)

// Pattern 3: HTTP fetch to /full endpoint
await fetch(`/api/services/${serviceId}/full`)

// Pattern 4: HTTP fetch to basic endpoint
await fetch(`/api/services/${serviceId}`)

// Pattern 5: Multi Redis queries
const multi = redis.multi()
multi.hGetAll(`service:${serviceId}`)
multi.exists(`service:${serviceId}:published`)
multi.hGetAll(`service:${serviceId}:published`)
```

## Phase 1: Create Comprehensive Service Helper Module

### 1.1 Enhance `/utils/serviceHelpers.js`

```javascript
// Core functions to implement:

/**
 * Get basic service data (cached)
 * Replaces: redis.hGetAll(`service:${serviceId}`)
 */
export async function getServiceData(serviceId, options = {}) {
  // - Check cache first
  // - Verify ownership if userId provided
  // - Return consistent format
  // - Handle errors gracefully
}

/**
 * Get published service data (cached)
 * Replaces: redis.hGetAll(`service:${serviceId}:published`)
 */
export async function getPublishedData(serviceId) {
  // - Check cache
  // - Return null if not published
  // - Parse JSON fields automatically
}

/**
 * Get complete service details (basic + published + computed fields)
 * Replaces: /api/services/[id]/full endpoint
 */
export async function getFullServiceDetails(serviceId, userId = null) {
  // - Combines getServiceData + getPublishedData
  // - Adds computed fields (status, formatted dates, etc)
  // - Single cache entry for full details
}

/**
 * Get multiple services efficiently
 * Replaces: Multiple individual Redis calls in loops
 */
export async function batchGetServices(serviceIds, userId = null) {
  // - Use Redis pipeline/multi
  // - Batch cache checks
  // - Return map of serviceId -> details
}

/**
 * Check if service exists and is accessible
 * Replaces: Various existence checks
 */
export async function canAccessService(serviceId, userId) {
  // - Quick existence check
  // - Ownership verification
  // - Returns boolean
}

/**
 * Get service for API execution (includes workbook URL)
 * Replaces: getApiDefinition calls
 */
export async function getServiceForExecution(serviceId, apiToken = null) {
  // - Get published data
  // - Verify token if provided
  // - Include workbook URL
  // - Optimized for execution context
}
```

### 1.2 Add Caching Layer

```javascript
// In-memory cache with TTL
const serviceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache key generators
function getServiceCacheKey(serviceId, type = 'basic') {
  return `${type}:${serviceId}`;
}

// Cache helpers
function getCached(key) {
  const cached = serviceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCached(key, data) {
  serviceCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Cache invalidation
export function invalidateServiceCache(serviceId) {
  // Remove all cache entries for this service
  const keysToDelete = [];
  for (const key of serviceCache.keys()) {
    if (key.includes(serviceId)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => serviceCache.delete(key));
}
```

### 1.3 Add TypeScript Types

```typescript
// types/service.ts
export interface ServiceInput {
  name: string;
  alias: string;
  type: string;
  format?: string;
  mandatory?: boolean;
}

export interface ServiceOutput {
  name: string;
  alias: string;
  type: string;
  format?: string;
}

export interface ServiceArea {
  name: string;
  alias: string;
  address: string;
  type: 'read' | 'write' | 'read-write';
}

export interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  inputs: ServiceInput[];
  outputs: ServiceOutput[];
  areas: ServiceArea[];
  userId: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  // ... other fields
}

export interface PublishedServiceData extends ServiceDetails {
  publishedAt: string;
  version: string;
  calls: number;
  lastUsed: string;
  urlData: string;
}
```

## Phase 2: Update All Service Data Access Points

### 2.1 Create Migration Script

```javascript
// scripts/migrate-service-fetching.js
const filesToUpdate = [
  {
    path: '/api/mcp/v1/route.js',
    patterns: [
      {
        old: 'await redis.hGetAll(`service:${serviceId}:published`)',
        new: 'await getPublishedData(serviceId)',
        import: "import { getPublishedData } from '@/utils/serviceHelpers';"
      }
    ]
  },
  // ... more files
];

// Automated migration where possible
// Manual review required for complex cases
```

### 2.2 Update High-Priority Files (MCP Routes)

#### File: `/api/mcp/v1/route.js`
- [ ] Line 74: Replace `redis.hGetAll` with `getPublishedData()`
- [ ] Line 672: Replace `redis.hGetAll` with `getPublishedData()`
- [ ] Line 1061: Replace `redis.hGetAll` with `getPublishedData()`
- [ ] Line 1191: Replace `redis.hGetAll` with `getPublishedData()`
- [ ] Add import for serviceHelpers
- [ ] Test MCP functionality after changes

#### File: `/api/mcp/v1/executeEnhancedCalc.js`
- [ ] Line 31: Replace with `getPublishedData()`
- [ ] Consider if this needs full service details instead
- [ ] Update error handling

#### File: `/api/mcp/v1/areaExecutors.js`
- [ ] Line 19: Replace with `getPublishedData()`
- [ ] Line 133: Replace with `getPublishedData()`
- [ ] Ensure area parsing still works

### 2.3 Update Service Management Endpoints

#### File: `/api/services/[id]/route.js`
- [ ] Line 22: Replace with `getServiceData()`
- [ ] Line 39-42: Use `getPublishedData()` for published check
- [ ] Line 98: Replace with `getServiceData()`
- [ ] Line 155: After update, call `invalidateServiceCache()`

#### File: `/api/services/[id]/full/route.js`
- [ ] Replace entire implementation with:
```javascript
export async function GET(request, { params }) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const fullDetails = await getFullServiceDetails(id, userId);
  
  if (!fullDetails) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
  
  return NextResponse.json({ service: fullDetails });
}
```

### 2.4 Update Frontend API Calls

#### Pattern: Replace HTTP fetches with server actions or API route updates

Instead of:
```javascript
// Frontend component
const response = await fetch(`/api/services/${serviceId}/full`);
const data = await response.json();
```

Consider:
1. Keep the HTTP endpoint but update its implementation to use helpers
2. Or create server actions that use the helpers directly
3. Ensure consistent response format

### 2.5 Update Workbook and Other Routes

#### File: `/api/workbook/[id]/route.js`
- [ ] Line 29: Replace with `getServiceData()`
- [ ] Line 191: Replace with `getServiceData()`
- [ ] Line 244: Replace with `getPublishedData()`
- [ ] Line 298: Replace with `getServiceData()`

## Phase 3: Testing Strategy

### 3.1 Unit Tests for Helpers
```javascript
// __tests__/utils/serviceHelpers.test.js
describe('Service Helpers', () => {
  test('getServiceData returns cached data on second call', async () => {
    // First call hits Redis
    const data1 = await getServiceData('test-id');
    // Second call should use cache
    const data2 = await getServiceData('test-id');
    expect(mockRedis.hGetAll).toHaveBeenCalledTimes(1);
  });
  
  test('invalidateServiceCache removes all related entries', () => {
    // Test cache invalidation
  });
});
```

### 3.2 Integration Tests
- [ ] Test MCP server functionality
- [ ] Test service CRUD operations
- [ ] Test API execution flow
- [ ] Test cache invalidation on updates

### 3.3 Performance Tests
- [ ] Measure Redis call reduction
- [ ] Measure response time improvement
- [ ] Monitor memory usage of cache

## Phase 4: Rollout Strategy

### 4.1 Feature Flag Implementation
```javascript
// config/features.js
export const features = {
  useServiceHelpers: process.env.USE_SERVICE_HELPERS === 'true'
};

// In code
if (features.useServiceHelpers) {
  return await getServiceData(serviceId);
} else {
  return await redis.hGetAll(`service:${serviceId}`);
}
```

### 4.2 Gradual Rollout
1. Week 1: Deploy helpers, update chat API only
2. Week 2: Update MCP routes (high traffic)
3. Week 3: Update service management
4. Week 4: Update remaining endpoints
5. Week 5: Remove feature flags

### 4.3 Monitoring
- [ ] Add logging for cache hit/miss rates
- [ ] Monitor Redis connection pool
- [ ] Track error rates
- [ ] Set up alerts for anomalies

## Phase 5: Cleanup

### 5.1 Remove Redundant Code
- [ ] Remove duplicate Redis query code
- [ ] Remove unnecessary HTTP endpoints
- [ ] Clean up unused imports

### 5.2 Update Documentation
- [ ] Update API documentation
- [ ] Add JSDoc comments to helpers
- [ ] Create migration guide for other developers
- [ ] Update architecture diagrams

### 5.3 Deprecation Notices
```javascript
// In old endpoints
console.warn('[DEPRECATION] This endpoint will be removed in v2.0. Use /api/v2/services instead.');
```

## Success Metrics

### Quantitative
- [ ] Reduce Redis calls by 70%+ through caching
- [ ] Reduce code duplication from 25+ instances to 0
- [ ] Improve service data fetch response time by 50%
- [ ] 100% test coverage for service helpers

### Qualitative
- [ ] Consistent data format across entire app
- [ ] Single source of truth for service data access
- [ ] Easier to maintain and debug
- [ ] Clear separation of concerns

## Risk Mitigation

### Potential Issues
1. **Cache inconsistency**: Mitigate with proper invalidation
2. **Breaking changes**: Use feature flags and gradual rollout
3. **Performance regression**: Monitor closely, have rollback plan
4. **Missing edge cases**: Comprehensive testing required

### Rollback Plan
1. Feature flags allow instant rollback
2. Keep old code during transition
3. Version API endpoints
4. Database changes are backward compatible

## Timeline Estimate

- **Week 1**: Create comprehensive helpers + caching
- **Week 2**: Update MCP routes (highest impact)
- **Week 3**: Update service management endpoints
- **Week 4**: Update remaining endpoints
- **Week 5**: Testing, monitoring, and cleanup
- **Week 6**: Documentation and final cleanup

Total: 6 weeks for complete refactoring

## Notes

- Start with highest-impact areas (MCP routes)
- Maintain backward compatibility during transition
- Consider creating a new `/api/v2/` namespace
- Cache invalidation is critical for data consistency
- Monitor performance metrics throughout