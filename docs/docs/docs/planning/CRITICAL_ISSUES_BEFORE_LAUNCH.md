# Critical Issues to Fix Before Launch

## 🚨 MUST FIX - High Priority Security & Stability Issues

### 1. Race Conditions in Publishing Workflow
**Location**: ServicePageClient.tsx lines 552-637
**Issue**: Multiple users can trigger concurrent publish operations
**Fix Required**:
```typescript
const isPublishingRef = useRef(false);

const handlePublish = async () => {
  if (isPublishingRef.current) {
    message.warning('Publishing already in progress');
    return;
  }
  isPublishingRef.current = true;
  try {
    // ... existing publish logic
  } finally {
    isPublishingRef.current = false;
  }
};
```

### 2. Memory Leak - Token Refresh Interval
**Location**: ServicePageClient.tsx lines 86-90
**Issue**: Interval continues after component unmount
**Fix Required**: Already have cleanup but need to ensure it works correctly

### 3. Missing File Validation
**Location**: ServicePageClient.tsx lines 450-468, ImportExcel handling
**Issue**: No validation for file type, size, or content
**Fix Required**:
```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

if (file.size > MAX_FILE_SIZE) {
  message.error('File size exceeds 50MB limit');
  return;
}
if (!ALLOWED_TYPES.includes(file.type)) {
  message.error('Only Excel files are supported');
  return;
}
```

### 4. Concurrent Save Operations
**Location**: ServicePageClient.tsx lines 700-917
**Issue**: Multiple save operations can run simultaneously
**Fix Required**: Similar to publishing, add operation lock

### 5. Local Storage Security
**Location**: Multiple locations storing workbook data
**Issue**: Sensitive data stored in localStorage without encryption
**Fix Required**:
- Add expiration timestamps
- Clear old cached data
- Consider IndexedDB for larger data

### 6. Error Boundaries Missing
**Issue**: No error boundaries to catch React errors
**Fix Required**: Add ErrorBoundary component wrapping main views

## 🔧 API Routes to Remove Before Launch

### Definitely Remove:
1. `/api/test-cache` - Testing only
2. `/api/test-public` - Testing only

### Review Usage:
1. `/api/diagnose-cache` - Make admin-only if keeping
2. `/api/cache-stats` - Make admin-only if keeping
3. `/api/redis-pool-stats` - Make admin-only if keeping

## ⚡ Performance Critical Issues

### 1. Blocking UI During Save
**Location**: Workbook save operations
**Issue**: Large workbooks block the UI thread
**Fix Required**: Move to Web Worker or show progress

### 2. Console Logs in Production
**Issue**: 132+ console.log statements
**Fix Required**: Remove or wrap in development check:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(...);
}
```

### 3. Missing Debounce on Expensive Operations
**Location**: Config comparison, parameter updates
**Fix Required**: Add debounce to prevent excessive calculations

## 🔒 Security Checklist

- [ ] Add CSRF protection for API calls
- [ ] Validate all user inputs (especially service IDs)
- [ ] Add rate limiting for API endpoints
- [ ] Sanitize file names and content
- [ ] Add Content Security Policy headers
- [ ] Review authentication on all endpoints
- [ ] Encrypt sensitive localStorage data

## 📱 Mobile Critical Issues

### 1. Touch Interactions
**Issue**: Spreadsheet controls not optimized for touch
**Fix Required**: Add touch event handlers for zoom, pan

### 2. Drawer Performance
**Issue**: Re-renders on every state change
**Fix Required**: Memoize drawer content

## Testing Requirements Before Launch

1. **Load Testing**: Test with large workbooks (10MB+)
2. **Concurrent Users**: Test multiple users editing same service
3. **Error Scenarios**: Test network failures, API errors
4. **Mobile Testing**: Test on actual devices, not just browser
5. **Security Scan**: Run OWASP ZAP or similar

## Deployment Checklist

- [ ] Remove all test API routes
- [ ] Enable production error tracking (Sentry)
- [ ] Set up monitoring for memory usage
- [ ] Configure rate limiting
- [ ] Enable CORS properly
- [ ] Set security headers
- [ ] Remove development dependencies
- [ ] Minify and optimize bundles