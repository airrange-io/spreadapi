# Service Status & List Update Fix Plan

## Phase 1: Fix Service List API (Immediate Fix)

### 1. Update GET /api/services/route.js

```javascript
// Current problematic code:
for (const [serviceId, indexData] of Object.entries(serviceIndex)) {
  const serviceInfo = typeof indexData === 'string' ? JSON.parse(indexData) : indexData;
  services.push(serviceInfo);
}

// Replace with:
for (const serviceId of Object.keys(serviceIndex)) {
  // Get actual service data from Redis
  const serviceData = await redis.hGetAll(`service:${serviceId}`);
  if (!serviceData || !serviceData.id) continue;
  
  // Check if published
  const isPublished = await redis.exists(`service:${serviceId}:published`) === 1;
  
  // Get call count from published hash if published
  let callCount = 0;
  if (isPublished) {
    callCount = parseInt(await redis.hGet(`service:${serviceId}:published`, 'calls')) || 0;
  }
  
  services.push({
    id: serviceData.id,
    name: serviceData.name,
    description: serviceData.description,
    status: isPublished ? 'published' : 'draft',
    calls: callCount,
    createdAt: serviceData.createdAt,
    updatedAt: serviceData.updatedAt
  });
}
```

## Phase 2: Fix Publish/Unpublish Flow

### 1. Update Publish Endpoint

Add after creating published hash:
```javascript
// Update user service index with just the status
await redis.hSet(`user:${userId}:services`, serviceId, 'published');
```

### 2. Update Unpublish Endpoint

Add after deleting published hash:
```javascript
// Update user service index status
await redis.hSet(`user:${userId}:services`, serviceId, 'draft');
```

## Phase 3: Fix Service Creation

### 1. Update Create Service Endpoint

When creating a new service:
```javascript
// Add to user index as draft (not full data)
await redis.hSet(`user:${userId}:services`, serviceId, 'draft');
```

## Phase 4: Migration Script (Optional)

Create a one-time migration to fix existing data:
```javascript
async function migrateServiceIndex() {
  const users = await redis.keys('user:*:services');
  
  for (const userKey of users) {
    const serviceIndex = await redis.hGetAll(userKey);
    const newIndex = {};
    
    for (const [serviceId, data] of Object.entries(serviceIndex)) {
      // Check if it's old JSON format
      if (data.startsWith('{')) {
        // Check actual published status
        const isPublished = await redis.exists(`service:${serviceId}:published`) === 1;
        newIndex[serviceId] = isPublished ? 'published' : 'draft';
      } else {
        // Already in correct format
        newIndex[serviceId] = data;
      }
    }
    
    // Update the entire index
    await redis.del(userKey);
    if (Object.keys(newIndex).length > 0) {
      await redis.hSet(userKey, newIndex);
    }
  }
}
```

## Phase 5: Real-time Updates (Enhancement)

### 1. Add WebSocket or Server-Sent Events for live updates
### 2. Or implement polling with proper cache headers

## Implementation Priority:

1. **Fix Service List API** (Phase 1) - This alone will solve the immediate problem
2. **Fix Publish/Unpublish** (Phase 2) - Ensures future consistency
3. **Fix Service Creation** (Phase 3) - Prevents new services from having the issue
4. **Migration Script** (Phase 4) - Cleans up existing data
5. **Real-time Updates** (Phase 5) - Nice to have enhancement

## Testing Plan:

1. Test service list shows correct status
2. Test publish updates status to "published"
3. Test API calls increment the call counter
4. Test unpublish reverts status to "draft"
5. Test new service creation starts as "draft"