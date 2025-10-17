# Service Data Fetching Audit

## Overview
This document audits all the different ways service details are fetched across the SpreadAPI codebase.

## Identified Patterns

### 1. Direct Redis Access (Server-side)
Used by backend APIs and server components to directly query Redis.

#### Pattern A: Basic Service Data
```javascript
const serviceData = await redis.hGetAll(`service:${serviceId}`);
```
**Used in:**
- `/api/workbook/[id]/route.js` (3 instances)
- `/api/services/[id]/route.js`
- `/api/services/[id]/tokens/[tokenId]/route.js`
- `/api/v1/services/[id]/execute/route.js` (formerly `/api/getresults/route.js` - migrated ✓)
- `/api/mcp/route.js` (multiple instances)
- `/api/services/[id]/metadata/route.js`
- `/api/v1/services/[id]/route.js`

#### Pattern B: Published Service Data
```javascript
const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
```
**Used in:**
- `/api/mcp/v1/route.js` (5 instances)
- `/api/mcp/v1/executeEnhancedCalc.js`
- `/api/mcp/v1/areaExecutors.js` (2 instances)
- `/api/mcp/v1/areaHandlers.js` (2 instances)
- `/api/mcp/route.js` (3 instances)
- `/api/workbook/[id]/route.js`

#### Pattern C: Combined Data (Multi-query)
```javascript
const multi = redis.multi();
multi.hGetAll(`service:${id}`);
multi.exists(`service:${id}:published`);
multi.hGetAll(`service:${id}:published`);
const [serviceData, isPublished, publishedData] = await multi.exec();
```
**Used in:**
- `/api/services/[id]/full/route.js`
- `/api/services/[id]/metadata/route.js`

### 2. HTTP API Endpoints (Client-side)
Used by frontend components to fetch service data via HTTP.

#### Pattern A: Full Service Endpoint
```javascript
fetch(`/api/services/${serviceId}/full`)
```
**Used in:**
- `/app/service/[id]/ServicePageClient.tsx`
- Originally attempted in `/api/chat/route.js` (now uses helper)

#### Pattern B: Basic Service Endpoint
```javascript
fetch(`/api/services/${serviceId}`)
```
**Used in:**
- `/app/service/[id]/ServicePageClient.tsx` (as fallback)
- Frontend components for basic operations

#### Pattern C: Service List
```javascript
fetch('/api/services')
```
**Used in:**
- `/app/components/ServiceList.tsx`
- `/app/chat/ChatWrapperBubbles.tsx`
- `/app/components/MCPSettingsModal.tsx`

### 3. Specialized Endpoints

#### Token Management
```javascript
fetch(`/api/services/${serviceId}/tokens`)
```
**Used in:**
- `/app/service/[id]/TokenManagement.tsx`

#### Service Operations
```javascript
fetch(`/api/services/${serviceId}/unpublish`)
fetch(`/api/services/${serviceId}/status`)
```
**Used in:**
- `/app/service/[id]/ServicePageClient.tsx`

### 4. Helper Functions

#### New Centralized Helper
```javascript
import { getServiceDetails } from '@/utils/serviceHelpers';
const serviceDetails = await getServiceDetails(serviceId, userId);
```
**Currently used in:**
- `/app/api/chat/route.js` (newly implemented)

#### Existing API Definition Helper
```javascript
import { getApiDefinition } from '@/utils/helperApi';
const apiDefinition = await getApiDefinition(apiId, apiToken);
```
**Used for:**
- Getting API execution definitions (different from service metadata)

## Summary Statistics

- **Direct Redis Access**: ~25+ instances
- **HTTP API Calls**: ~15+ instances
- **Different Patterns**: 7 distinct patterns
- **Files Affected**: 30+ files

## Redundancy Issues

1. **Multiple Redis queries for same data**: Many files fetch both basic and published data separately
2. **No caching**: Each request hits Redis directly
3. **Inconsistent data structures**: Different endpoints return data in different formats
4. **Code duplication**: Same Redis queries written in multiple places

## Recommendations

1. **Use centralized helpers** like `getServiceDetails()` for all internal service data fetching
2. **Standardize response formats** across all endpoints
3. **Implement caching** at the helper level to reduce Redis calls
4. **Consolidate endpoints** - consider deprecating redundant ones
5. **Update all direct Redis access** to use helpers for consistency

## Migration Priority

1. **High Priority**: MCP routes (heavily used, multiple instances)
2. **Medium Priority**: Service management endpoints
3. **Low Priority**: Admin/diagnostic endpoints