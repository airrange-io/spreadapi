# Current Loading Behavior Analysis

## What's Happening Now

When you open a service (even in "API Test" view):

1. **Initial Load Effect** (line ~217):
   ```javascript
   const [fullDataResponse, workbookResponse] = await Promise.all([
     fetch(`/api/services/${serviceId}/full`),
     fetch(`/api/workbook/${serviceId}`)  // <-- Always loads!
   ]);
   ```

2. **Workbook is ALWAYS fetched**, regardless of active view
3. **Workbook data is processed and stored** in `spreadsheetData` state
4. **Result**: When you switch to "Workbook" view, it's already loaded

## Why It Appears Instant

The workbook appears instantly when switching views because:
- ✅ Data is already in `spreadsheetData` state
- ✅ WorkbookViewer component just needs to render
- ❌ But we wasted bandwidth if user never switches to Workbook

## Current Resource Usage

For a user who only uses "API Test":
- **Wasted**: Full workbook download (could be 1-100MB)
- **Wasted**: Processing time for workbook data
- **Wasted**: Memory holding workbook in state

## What Should Happen (Lazy Loading)

1. **Initial Load**: Only service metadata
2. **API Test View**: No workbook loading
3. **Switch to Workbook**: 
   - Show loading spinner
   - Fetch workbook data
   - Render when ready

## Implementation Needed

To implement true lazy loading, we need to:

1. **Remove workbook fetch from initial load**
2. **Add workbook loading to view change handler**
3. **Show loading state while fetching**
4. **Optional**: Add background preloading for better UX

## Background Preloading Strategy

For better UX without wasting resources:

```javascript
// After initial load, if service is draft
if (!serviceStatus.published && activeView !== 'Workbook') {
  // Preload after 2 seconds of idle time
  const timer = setTimeout(() => {
    if (!workbookLoaded) {
      loadWorkbookInBackground();
    }
  }, 2000);
}
```

This would:
- Give immediate response for view switching
- Only preload for drafts (likely to need workbook)
- Wait for idle time to avoid slowing initial load
- Still save bandwidth for published services