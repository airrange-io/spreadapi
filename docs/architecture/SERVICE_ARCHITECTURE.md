# Service Architecture Documentation

## Overview

This document describes the service architecture for SpreadAPI, including data structures, API endpoints, and operational procedures.

## Data Structure

### Redis Storage

Service data is stored in Redis using two separate hash structures:

1. **Service Definition**: `service:{serviceId}` - Contains the working copy
2. **Published Data**: `service:{serviceId}:published` - Contains data for calculation engine (only exists when published)

### Service Definition Hash

```
service:{serviceId} -> Hash
```

This hash contains the complete service definition and is independent of publishing status:

#### Core Fields
- `id`: Unique service identifier (e.g., "svc_abc123")
- `userId`: Owner's user ID
- `name`: Service name
- `description`: Service description
- `workbookUrl`: Path to SpreadJS workbook in blob storage
- `workbookSize`: Size of workbook in bytes
- `workbookModified`: Last modification timestamp of workbook
- `createdAt`: Service creation timestamp
- `updatedAt`: Last update timestamp

#### API Configuration (Stored as JSON strings)
- `inputs`: JSON array of input parameters
- `outputs`: JSON array of output parameters

#### Settings
- `cacheEnabled`: "true" or "false"
- `cacheDuration`: Cache duration in seconds
- `requireToken`: "true" or "false"
- `rateLimitRequests`: Max requests per window
- `rateLimitWindow`: Time window in seconds
- `tags`: Comma-separated list of tags

### Published Service Hash

```
service:{serviceId}:published -> Hash
```

This hash only exists when a service is published and contains only the data needed by the calculation engine:

- `apiId`: Service ID (same as main service ID)
- `tenantId`: Tenant ID from user record
- `urlData`: Path to published API JSON in blob storage
- `title`: Service title (copy of name)
- `useCaching`: "true" or "false" (from cacheEnabled)
- `needsToken`: "true" or "false" (from requireToken)
- `tokens`: Comma-separated API tokens (if required)
- `created`: Publication timestamp
- `modified`: Last modification timestamp
- `calls`: Total API calls (incremented by calculation engine)

### User Services Index

```
user:{userId}:services -> Hash
  {serviceId}: "draft" or "published"
```

### Blob Storage Structure

```
{tenantId}/
  workbooks/
    {serviceId}.sjs         // SpreadJS workbook (always current)
  apis/
    {serviceId}.json        // Published API definition (only when published)
```

## Service Lifecycle

### 1. Create Service

1. Generate unique service ID
2. Create service hash at `service:{serviceId}`
3. Add to user's services index as "draft"

### 2. Update Service

1. Verify user ownership
2. Update service hash fields
3. Update `updatedAt` timestamp
4. Note: Updates never affect `service:{serviceId}:published`

### 3. Save Workbook

1. Upload .sjs file to blob storage at `{tenantId}/workbooks/{serviceId}.sjs`
2. Update `workbookUrl`, `workbookSize`, `workbookModified` in service hash

### 4. Publish Service

1. Verify service has workbook and outputs
2. Get user's tenant ID from user record
3. Create combined API JSON containing:
   - `apiJson`: Input/output definitions
   - `fileJson`: SpreadJS workbook data
4. Upload to blob storage at `{tenantId}/apis/{serviceId}.json`
5. Create `service:{serviceId}:published` hash with calculation engine data
6. Update user's services index to "published"

### 5. Unpublish Service

1. Delete `service:{serviceId}:published` hash
2. Delete API JSON from blob storage
3. Update user's services index to "draft"
4. Service definition remains unchanged

### 6. Delete Service

1. Verify service is not published (check `EXISTS service:{serviceId}:published`)
2. Delete workbook from blob storage
3. Delete `service:{serviceId}` hash
4. Remove from user's services index

## Status Detection

```javascript
// Is service published?
const isPublished = await redis.exists(`service:${serviceId}:published`);

// Has unpublished changes?
if (isPublished) {
  const serviceUpdated = await redis.hGet(`service:${serviceId}`, 'updatedAt');
  const publishedModified = await redis.hGet(`service:${serviceId}:published`, 'modified');
  const hasUnpublishedChanges = serviceUpdated > publishedModified;
}
```

## API Endpoints

### Service Management
- `POST /api/services` - Create new service
- `GET /api/services` - List user's services
- `GET /api/services/{id}` - Get service details
- `PUT /api/services/{id}` - Update service
- `DELETE /api/services/{id}` - Delete service

### Workbook Management
- `PUT /api/workbook/{id}` - Upload/update workbook

### Publishing
- `POST /api/services/{id}/publish` - Publish service
- `POST /api/services/{id}/unpublish` - Unpublish service
- `GET /api/services/{id}/status` - Get publish status

### Calculation Engine (V1 API)
- `GET /api/v1/services/{id}/execute?param1=value1` - Execute published service (simple)
- `POST /api/v1/services/{id}/execute` - Execute published service (recommended)

## Emergency Procedures

### Recover from Redis Failure

1. Restore from Redis backup
2. If no backup, recreate user and service records from blob storage:
   - List all services in blob storage
   - Recreate service hashes from API JSON files
   - Rebuild user service indexes

### Fix Corrupted Service

```bash
# Via Redis CLI
HGETALL service:{serviceId}
# Check for missing or invalid fields
# Update specific field:
HSET service:{serviceId} fieldName "newValue"
```

### Force Unpublish Service

```bash
# Delete published hash
DEL service:{serviceId}:published
# Update user index
HSET user:{userId}:services {serviceId} "draft"
```

### Clean Up Orphaned Data

```bash
# Find services without users
KEYS service:*
# For each service, check if user exists
HGET service:{serviceId} userId
EXISTS user:{userId}:services

# Find blob files without Redis records
# List blob storage and compare with Redis services
```

## Data Migration

### Export Service
```javascript
// Get all service data
const service = await redis.hGetAll(`service:${serviceId}`);
// Save to JSON file with workbook
```

### Import Service
```javascript
// Create service hash
await redis.hSet(`service:${serviceId}`, serviceData);
// Upload workbook to blob storage
// Add to user's services
```

## Monitoring

### Key Metrics
- Total services by status
- API calls per service
- Error rates
- Storage usage

### Health Checks
1. Redis connectivity
2. Blob storage access
3. Service consistency (Redis matches blob storage)

## Security Considerations

1. Always verify user ownership before operations
2. Validate all inputs before storing
3. Sanitize service IDs to prevent injection
4. Rate limit API calls
5. Use secure tokens for protected services