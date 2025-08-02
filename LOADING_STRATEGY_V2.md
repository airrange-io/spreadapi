# Optimized View-Based Loading Strategy

## Problem Statement
Currently, we load both service metadata AND workbook data on every page load, even when:
- Users want to use API Test (common for published services)
- Users want to check Settings
- The workbook might be very large (100MB+)

This wastes bandwidth and increases initial load time unnecessarily.

## New Strategy: View-Based Lazy Loading

### 1. Initial Load - Metadata Only
```javascript
// Load only service configuration and status
GET /api/services/[id]/metadata
Response: {
  config: { name, inputs, outputs, settings... },
  status: { published, calls, version... },
  timestamps: { created, updated }
}
```
- Small payload (~1-5KB)
- Fast response time
- Includes everything needed for API Test and Settings

### 2. Intelligent Default View Selection
```javascript
const getInitialView = (isPublished, serviceId) => {
  // Check saved preference
  const saved = localStorage.getItem(`service-view-${serviceId}`);
  if (saved) return saved;
  
  // Smart defaults
  return isPublished ? 'API Test' : 'Workbook';
};
```
- Published services → API Test (users likely testing APIs)
- Draft services → Workbook (users likely editing)
- Remember user preference per service

### 3. Lazy Load Workbook Only When Needed
```javascript
// Only load when switching to Workbook view
if (activeView === 'Workbook' && !workbookLoaded) {
  loadWorkbookData();
}
```
- No workbook load for API Test users
- No workbook load for Settings users
- Load on-demand when switching views

### 4. Background Preloading for Draft Services
```javascript
// For draft services, preload after 1 second
if (!serviceStatus?.published) {
  setTimeout(() => loadWorkbookData(), 1000);
}
```
- Draft services likely need workbook soon
- Preload in background after UI is ready
- Doesn't block initial render

## Benefits

### Performance Improvements

**Current Approach (Always Load Everything):**
- Initial load: Service (5KB) + Workbook (1-100MB) = 1.005-100MB
- Time to interactive: 500ms - 10s (depends on workbook size)
- Wasted bandwidth: 100% when user only needs API Test

**New Approach (View-Based Loading):**
- Initial load: Service metadata only = 5KB
- Time to interactive: 50-100ms
- Workbook loaded only when needed
- Bandwidth saved: 95-99% for API Test users

### User Experience Improvements

1. **Faster Initial Load**
   - Page interactive in <100ms
   - No waiting for large workbooks
   - Smooth transitions between views

2. **Smart Defaults**
   - Published services open in API Test
   - Draft services open in Workbook
   - Remembers user preference

3. **Progressive Enhancement**
   - Core functionality available immediately
   - Workbook loads in background for drafts
   - Loading indicators only when switching to Workbook

## Implementation Checklist

- [ ] Create `/api/services/[id]/metadata` endpoint
- [ ] Update ServicePageClient to use view-based loading
- [ ] Add view preference persistence
- [ ] Implement background preloading for drafts
- [ ] Add loading states for view switching
- [ ] Update caching strategy for metadata vs workbook
- [ ] Test with various workbook sizes

## Edge Cases Handled

1. **New Services**: Show empty state immediately, no workbook to load
2. **Large Workbooks**: Only loaded when user explicitly needs them
3. **Slow Networks**: UI remains responsive, workbook loads in background
4. **View Switching**: Smooth transitions with loading indicators
5. **Cache Management**: Separate ETags for metadata and workbook

## Migration Path

1. Deploy new metadata endpoint
2. Update client to use view-based loading
3. Monitor performance metrics
4. Gradually roll out to all users
5. Remove old combined endpoint once stable