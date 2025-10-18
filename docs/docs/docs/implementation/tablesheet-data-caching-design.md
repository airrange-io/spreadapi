# TableSheet Data Caching Design

## Overview
Currently, TableSheet external data is fetched on every request, which causes performance issues. This design adds configurable caching for TableSheet data.

## Configuration

### 1. New Service Configuration Flag
Add to `apiConfig`:
```javascript
{
  // ... existing fields
  enableCaching: true,           // Existing: Cache calculation results
  cacheTableSheetData: true,     // NEW: Cache external TableSheet data
  tableSheetCacheTTL: 300,       // NEW: TTL in seconds (default: 5 minutes)
}
```

### 2. Default Behavior
- **Default**: `cacheTableSheetData: true` (cache external data)
- **TTL**: 5 minutes default, configurable per service
- **Size limit**: 10MB per TableSheet data source

## Implementation Changes

### A. Service Configuration UI
Update `SettingsSection.tsx` to add:
```jsx
<Space align="center">
  <Checkbox
    checked={cacheTableSheetData}
    onChange={(e) => onCacheTableSheetDataChange(e.target.checked)}
  >
    Cache TableSheet data
  </Checkbox>
  <Tooltip title="Cache external TableSheet data for better performance. Disable for real-time data.">
    <InfoCircleOutlined />
  </Tooltip>
</Space>

{cacheTableSheetData && (
  <Space align="center">
    <span>Cache duration:</span>
    <Select value={tableSheetCacheTTL} onChange={onTableSheetCacheTTLChange}>
      <Option value={60}>1 minute</Option>
      <Option value={300}>5 minutes</Option>
      <Option value={900}>15 minutes</Option>
      <Option value={3600}>1 hour</Option>
    </Select>
  </Space>
)}
```

### B. Process Cache Structure
Extend the existing workbook cache to include TableSheet data:
```javascript
// Current structure
workbookCache.set(key, {
  workbook: workbook,
  timestamp: Date.now()
});

// New structure
workbookCache.set(key, {
  workbook: workbook,
  tableSheetData: {
    'table1': {
      data: [...],
      timestamp: Date.now(),
      size: 1024000, // bytes
      url: 'https://api.example.com/data'
    }
  },
  timestamp: Date.now()
});
```

### C. Calculation Logic Updates

In `/app/api/v1/services/[id]/execute/route.js`:

```javascript
// When loading workbook with TableSheets
if (withTables) {
  const dataManager = workbook.dataManager();
  if (dataManager && dataManager.tables) {
    const serviceSettings = await redis.hGetAll(`service:${serviceId}:published`);
    const cacheTableSheetData = serviceSettings.cacheTableSheetData !== 'false';
    const tableSheetCacheTTL = parseInt(serviceSettings.tableSheetCacheTTL) || 300;
    
    for (const [rowKey, table] of Object.entries(dataManager.tables)) {
      let tableData = null;
      const tableUrl = table.getDataSourceUrl(); // Hypothetical method
      
      // Check cache if enabled
      if (cacheTableSheetData && cachedWorkbook.tableSheetData?.[rowKey]) {
        const cached = cachedWorkbook.tableSheetData[rowKey];
        const age = Date.now() - cached.timestamp;
        
        if (age < tableSheetCacheTTL * 1000 && cached.url === tableUrl) {
          // Use cached data
          tableData = cached.data;
          console.log(`Using cached TableSheet data for ${rowKey}`);
        }
      }
      
      // Fetch if not cached or cache disabled
      if (!tableData) {
        tableData = await table.fetch(true);
        
        // Cache if enabled and size is reasonable
        if (cacheTableSheetData && tableData) {
          const dataSize = JSON.stringify(tableData).length;
          if (dataSize < 10 * 1024 * 1024) { // 10MB limit
            if (!cachedWorkbook.tableSheetData) {
              cachedWorkbook.tableSheetData = {};
            }
            cachedWorkbook.tableSheetData[rowKey] = {
              data: tableData,
              timestamp: Date.now(),
              size: dataSize,
              url: tableUrl
            };
          }
        }
      }
      
      // Apply data to table
      table.setData(tableData);
    }
  }
}
```

### D. Redis Storage Updates
Store the new settings when publishing:
```javascript
// In publishService.js
const publishData = {
  // ... existing fields
  useCaching: apiConfig.enableCaching ? 'true' : 'false',
  cacheTableSheetData: apiConfig.cacheTableSheetData ? 'true' : 'false',
  tableSheetCacheTTL: apiConfig.tableSheetCacheTTL || 300
};
```

## Benefits

1. **Performance**: Dramatic improvement for services with stable external data
2. **Flexibility**: Service creators can choose caching behavior
3. **Control**: Configurable TTL per service
4. **Safety**: Size limits prevent memory issues
5. **Backward Compatible**: Defaults to current behavior if not specified

## Migration

For existing services:
- Add default `cacheTableSheetData: true` on first edit
- No breaking changes, just performance improvements

## Monitoring

Add metrics to track:
- TableSheet cache hits/misses
- Average data size cached
- Memory usage for TableSheet data
- External fetch times vs cache retrieval times