# Migration Plan: /api/getresults → /api/v1/services/{id}/execute

## Executive Summary

**Goal:** Replace legacy `/api/getresults` endpoint with modern V1 API endpoint `/api/v1/services/{id}/execute`

**Timeline:** In development - no backwards compatibility needed

**Status:** 95% complete (10/11 tasks done)

---

## Background & Context

### Why This Migration?

1. **Modern RESTful Design:** V1 uses proper REST patterns with resource-based URLs
2. **Better Error Handling:** V1 returns structured error responses with proper HTTP status codes
3. **Improved Performance:** V1 uses direct function calls (`calculateDirect`) instead of HTTP fetch
4. **Cleaner Metadata:** V1 uses explicit units in field names (e.g., `executionTimeMs` vs `executionTime`)
5. **Consistent API Structure:** All V1 endpoints follow the same patterns

### No Backwards Compatibility Required

- **Application Status:** Still in development, not live
- **External Users:** None yet
- **Strategy:** Direct cutover, no deprecation period needed
- **Risk:** Low - internal changes only

---

## API Comparison

### Legacy API: /api/getresults

**URL Pattern:**
```
GET /api/getresults?api={serviceId}&param1=value1&param2=value2&token={token}
```

**Key Characteristics:**
- Query parameter `api` for service ID
- All parameters as query strings
- Mixes service identifier with service inputs
- Returns outputs with `type: "output"` field

**Response Format:**
```json
{
  "outputs": [
    {"type": "output", "name": "result", "alias": "result", "value": 123}
  ],
  "metadata": {
    "executionTime": 45,
    "dataFetchTime": 12,
    "spreadJSLoadTime": 8
  }
}
```

### Modern V1 API: /api/v1/services/{id}/execute

**URL Pattern:**
```
POST /api/v1/services/{serviceId}/execute
Body: {"inputs": {"param1": "value1"}, "token": "..."}

GET /api/v1/services/{serviceId}/execute?param1=value1&token=...
```

**Key Characteristics:**
- Service ID in URL path (RESTful)
- POST body for structured inputs
- GET support for simple calculations
- Clean separation of concerns

**Response Format:**
```json
{
  "serviceId": "abc123",
  "inputs": [...],
  "outputs": [
    {"name": "result", "alias": "result", "value": 123}
  ],
  "metadata": {
    "executionTimeMs": 45,
    "dataFetchTimeMs": 12,
    "engineLoadTimeMs": 8,
    "version": "v1"
  }
}
```

**Key Differences:**
1. ❌ Removed `type: "output"` field (redundant)
2. ✅ Added `Ms` suffix to time fields (explicit units)
3. ✅ `spreadJSLoadTime` → `engineLoadTimeMs` (clearer naming)
4. ✅ Added `version: "v1"` field
5. ✅ Service ID in response for verification

---

## Implementation Architecture

### Direct Function Call Pattern

**Old Pattern (HTTP overhead):**
```
Caller → HTTP fetch('/api/getresults') → Route handler → calculateDirect() → Response
```

**New Pattern (zero HTTP overhead):**
```
Caller → import calculateDirect() → Direct function call → Format response
```

**Benefits:**
- No HTTP serialization/deserialization
- No network latency
- No additional timeout configuration
- Shared SpreadJS cache between callers

### Key Function: calculateDirect()

**Location:** `/app/api/v1/services/[id]/execute/route.js:91`

**Signature:**
```javascript
export async function calculateDirect(
  serviceId: string,
  inputs: object,
  apiToken: string | null,
  options: { nocache?: boolean } = {}
): Promise<{
  apiId: string,
  inputs: Array,
  outputs: Array,
  metadata: object
} | { error: string }>
```

**Features:**
- Direct SpreadJS execution (no HTTP)
- Process-level workbook caching
- Redis result caching
- TableSheet data caching
- Token validation
- Analytics tracking

---

## Current Status

### ✅ Completed (10/11)

1. **Export calculateDirect from V1 API** ✓
   - Created separate module: `/app/api/v1/services/[id]/execute/calculateDirect.js`
   - Exported for use by other routes
   - Fixed Next.js route export restrictions

2. **Migrate MCP v1 route** ✓
   - File: `/app/api/mcp/v1/route.js`
   - Changed: HTTP fetch → direct `calculateDirect()` call
   - Adapter: `executeService()` formats V1 response to MCP protocol
   - Zero HTTP overhead

3. **Delete unused `/api/mcp/route.js`** ✓
   - Legacy route was never called
   - All users connect to `/api/mcp/v1`
   - File removed

4. **Fix MCP token deletion bug** ✓
   - Added `id` field to token objects in `/lib/mcp-auth.js`
   - Created `/api/mcp/tokens/[tokenId]/route.js` with DELETE handler
   - Removed redundant `/api/mcp/revoke-token` route
   - Updated middleware.ts

5. **Migrate chat route** ✓
   - File: `/app/api/chat/route.js`
   - Updated both standard and batch calculation calls (lines ~747, ~825)
   - Replaced fetch with direct `calculateDirect()` calls
   - Zero HTTP overhead

6. **Migrate getschema route** ✓
   - File: `/app/api/getschema/route.js`
   - Updated all example URLs to V1 format
   - Updated OpenAPI schema paths
   - Updated example workflows

7. **Update IntegrationExamples.tsx** ✓
   - File: `/app/app/service/[id]/components/IntegrationExamples.tsx`
   - Already using V1 API in all examples
   - Removed deprecated `buildUrl()` function
   - Cleaned up legacy code

8. **Update helperApi.js error messages** ✓
   - File: `/utils/helperApi.js`
   - Updated example URL in error responses (line 234)
   - Now uses V1 format: `/api/v1/services/{id}/execute`

9. **Remove /api/getresults route entirely** ✓
   - Deleted: `/app/api/getresults/route.js`
   - Updated: `/vercel.json` (removed timeout config)
   - Legacy endpoint completely removed

### 🔄 In Progress (0/10)

None currently

### 🟢 Documentation Updates (NEW)

10. **Update all documentation files** ✓
    - Updated: `README.md` - Changed main API endpoint to V1
    - Updated: `docs/architecture/SERVICE_ARCHITECTURE.md` - V1 API reference
    - Updated: `MCP_CHAT_INTEGRATION_PLAN.md` - Direct calculateDirect() usage
    - Updated: `CHAT_SERVICE_TODO.md` - Marked getresults as migrated
    - Updated: `docs/CACHING.md` - V1 API endpoint reference
    - Updated: `docs/mcp/MCP_IMPLEMENTATION_PLAN.md` - calculateDirect() usage
    - Updated: `docs/architecture/OPTIMAL_CACHING_PLAN.md` - V1 route reference

### ⏳ Remaining (1/11)

11. **Test all integrations**
    - MCP: Test with Claude Desktop
    - Chat: Test OpenAI integration
    - Examples: Verify all code samples
    - Direct API: Test GET/POST methods
    - Verify old endpoint returns 404

---

## Detailed Migration Steps

### Step 5: Migrate Chat Route

**File:** `/app/api/chat/route.js`

**Changes Required:**

1. Add import at top:
```javascript
import { calculateDirect } from '../../v1/services/[id]/execute/route.js';
```

2. Find fetch calls (~line 762):
```javascript
// OLD
const response = await fetch(`${baseUrl}/api/getresults?${params.toString()}`);

// NEW
const result = await calculateDirect(serviceId, inputs, token, {});
if (result.error) {
  // Handle error
}
```

3. Update batch calculation loop (~line 854):
```javascript
// Replace all fetch('/api/getresults') calls with calculateDirect()
```

4. Update response parsing:
```javascript
// V1 returns outputs array directly, not nested in result
const outputs = result.outputs; // Not result.result
```

**Testing:**
- Test chat with service calculations
- Test batch calculations
- Verify error handling

---

### Step 6: Migrate GetSchema Route

**File:** `/app/api/getschema/route.js`

**Changes Required:**

Update example URLs in schema documentation:

```javascript
// OLD
example: `https://spreadapi.io/api/getresults?api=${serviceId}&param=value`

// NEW
example: `https://spreadapi.io/api/v1/services/${serviceId}/execute?param=value`
```

**Note:** This is documentation only, no execution changes needed.

**Testing:**
- View API documentation page
- Verify example URLs are correct
- Test copy-paste examples

---

### Step 7: Update IntegrationExamples.tsx

**File:** `/app/app/service/[id]/components/IntegrationExamples.tsx`

**Changes Required:**

Update all code examples across multiple languages:

1. **JavaScript/Fetch:**
```javascript
// OLD
fetch(`https://spreadapi.io/api/getresults?api=${serviceId}&param=value`)

// NEW
fetch(`https://spreadapi.io/api/v1/services/${serviceId}/execute?param=value`)
// Or POST version
fetch(`https://spreadapi.io/api/v1/services/${serviceId}/execute`, {
  method: 'POST',
  body: JSON.stringify({ inputs: { param: 'value' } })
})
```

2. **cURL:**
```bash
# OLD
curl "https://spreadapi.io/api/getresults?api=ID&param=value"

# NEW
curl "https://spreadapi.io/api/v1/services/ID/execute?param=value"
# Or POST
curl -X POST "https://spreadapi.io/api/v1/services/ID/execute" \
  -H "Content-Type: application/json" \
  -d '{"inputs":{"param":"value"}}'
```

3. **Python:**
```python
# OLD
response = requests.get(f"https://spreadapi.io/api/getresults?api={id}&param=value")

# NEW
response = requests.get(f"https://spreadapi.io/api/v1/services/{id}/execute?param=value")
# Or POST
response = requests.post(
    f"https://spreadapi.io/api/v1/services/{id}/execute",
    json={"inputs": {"param": "value"}}
)
```

4. **Excel VBA:**
```vba
' OLD
url = "https://spreadapi.io/api/getresults?api=" & serviceId & "&param=" & value

' NEW
url = "https://spreadapi.io/api/v1/services/" & serviceId & "/execute?param=" & value
```

**Testing:**
- Copy each example
- Run in respective environment
- Verify responses parse correctly

---

### Step 8: Update helperApi.js Error Messages

**File:** `/utils/helperApi.js`

**Changes Required:**

Update example URLs in error responses (around line 234):

```javascript
// OLD
example: {
  url: `https://spreadapi.io/api/getresults?service=${apiId}&${paramString}`,
  description: "Replace {value} with your actual parameter values"
}

// NEW
example: {
  url: `https://spreadapi.io/api/v1/services/${apiId}/execute?${paramString}`,
  description: "Replace {value} with your actual parameter values"
}
```

**Testing:**
- Trigger 404 error (missing blob data)
- Verify error response shows V1 URL
- Test parameter documentation display

---

### Step 9: Remove /api/getresults Route

**Files to Update:**

1. **Delete route file:**
   - Remove: `/app/api/getresults/route.js`

2. **Update vercel.json:**
```json
// REMOVE this block:
"app/api/getresults/route.js": {
  "maxDuration": 30,
  "memory": 1024
}
```

**Important Notes:**
- Only delete after ALL other migrations are complete and tested
- Verify no references in codebase first:
  ```bash
  grep -r "/api/getresults" --exclude-dir=node_modules --exclude-dir=.next
  ```
- Check for any external documentation referencing old API

**Testing:**
- Verify 404 on old endpoint
- All features still work via V1

---

### Step 10: Testing Plan

#### Unit Testing
- [ ] V1 API endpoint responds correctly
- [ ] calculateDirect() returns proper format
- [ ] Error handling works (404, auth errors, etc.)
- [ ] Token validation functions

#### Integration Testing
- [ ] **MCP Integration**
  - Configure Claude Desktop with MCP token
  - Test service discovery
  - Test calculation execution
  - Test batch calculations
  - Verify response formatting

- [ ] **Chat Integration**
  - Send message requiring calculation
  - Test multiple services in one conversation
  - Verify error messages display correctly

- [ ] **Direct API Calls**
  - Test GET method with query params
  - Test POST method with JSON body
  - Test with required authentication
  - Test without authentication (public services)
  - Test response formats (_format=csv, _format=plain)

- [ ] **Frontend Examples**
  - Copy JavaScript example → test in browser
  - Copy cURL example → test in terminal
  - Copy Python example → test in Python
  - Copy Excel VBA → test in Excel

#### Performance Testing
- [ ] Compare execution times (should be faster without HTTP)
- [ ] Verify caching still works
- [ ] Check memory usage
- [ ] Monitor error rates

#### Edge Cases
- [ ] Service not found
- [ ] Service not published
- [ ] Missing required parameters
- [ ] Invalid token
- [ ] Timeout scenarios
- [ ] Large responses
- [ ] Concurrent requests

---

## Rollback Plan

**If issues arise during migration:**

1. **Revert specific route:**
   ```bash
   git checkout HEAD -- app/api/[route]/route.js
   ```

2. **Keep V1 API running** (never delete it)

3. **Monitor error logs** for issues

4. **User communication:** Not needed (internal only)

---

## Success Criteria

✅ **Complete when:**

1. All internal routes use V1 API
2. No references to `/api/getresults` in code
3. All tests pass
4. MCP integration works end-to-end
5. Chat integration works end-to-end
6. Examples are verified working
7. Legacy route deleted
8. Vercel config updated
9. Documentation updated

---

## Technical Debt Cleanup

**After migration, also clean up:**

1. **Unused imports in MCP v1:**
   - Remove `getError` (line 4)
   - Remove `generateParameterExamples` (line 221)
   - Remove unused parameters

2. **Update documentation:**
   - Blog posts
   - README files
   - API documentation
   - Integration guides

3. **Update tests:**
   - Unit tests for V1 endpoint
   - Integration tests
   - E2E tests

---

## Notes & Gotchas

### Vercel Configuration
- `/api/getresults` has 30s timeout in vercel.json
- V1 endpoint now relies on wildcard (10s timeout)
- Current execution times: 40-80ms (well under 10s)
- **Action:** No change needed, but monitor if times increase

### Metadata Field Names
The field name changes are important:
- `executionTime` → `executionTimeMs` (explicit units)
- `spreadJSLoadTime` → `engineLoadTimeMs` (clearer naming)
- Any code parsing metadata must be updated

### Response Structure
The `type: "output"` field has been removed from outputs array:
```javascript
// OLD
outputs: [{ type: "output", name: "x", value: 1 }]

// NEW
outputs: [{ name: "x", value: 1 }]
```

### MCP Bridge Package
The NPM package `spreadapi-mcp` connects to `/api/mcp/v1` which is already migrated. No changes needed to published package.

### Authentication
Both endpoints support the same authentication:
- Query parameter: `?token=xxx`
- Header: `Authorization: Bearer xxx`
- POST body: `{"token": "xxx"}`

---

## Timeline Estimate

| Task | Estimated Time | Complexity |
|------|---------------|-----------|
| Chat route migration | 30 min | Medium |
| Schema route migration | 15 min | Low |
| IntegrationExamples.tsx | 45 min | Medium |
| helperApi.js updates | 15 min | Low |
| Delete getresults route | 5 min | Low |
| Testing (comprehensive) | 2 hours | High |
| **Total** | **~4 hours** | - |

---

## Questions & Decisions Log

**Q: Why not keep getresults for backwards compatibility?**
A: Not live yet, no external users, cleaner to cut over directly.

**Q: What about external documentation?**
A: Update after deletion, no risk of breaking users.

**Q: Should we version the V1 API?**
A: Already versioned (/api/v1/), future changes can go to /api/v2/.

**Q: What if execution times exceed 10s?**
A: Add V1 endpoint to vercel.json with 30s timeout. Currently unnecessary (40-80ms).

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-17 | Initial plan created | Claude |
| 2025-10-17 | Completed MCP v1 migration | Claude |
| 2025-10-17 | Fixed MCP token deletion | Claude |
| 2025-10-17 | Removed legacy MCP route | Claude |
| 2025-10-17 | Migrated chat route to V1 API | Claude |
| 2025-10-17 | Migrated getschema route | Claude |
| 2025-10-17 | Updated IntegrationExamples.tsx | Claude |
| 2025-10-17 | Updated helperApi.js error messages | Claude |
| 2025-10-17 | Removed legacy /api/getresults route | Claude |
| 2025-10-17 | Created calculateDirect.js module | Claude |
| 2025-10-17 | Migration 90% complete - ready for testing | Claude |
| 2025-10-17 | Updated all documentation files with V1 API | Claude |
| 2025-10-17 | Migration 95% complete - documentation updated | Claude |
| 2025-10-17 | Updated code comments to remove getresults references | Claude |
| 2025-10-17 | Deleted unused optimized.js (dead code cleanup) | Claude |
| 2025-10-17 | Fixed process cache regression - restored pre-migration behavior | Claude |

---

## References

- V1 API Route: `/app/api/v1/services/[id]/execute/route.js`
- Legacy Route: `/app/api/getresults/route.js` (to be deleted)
- MCP v1: `/app/api/mcp/v1/route.js` (migrated)
- Chat: `/app/api/chat/route.js` (pending)
- Schema: `/app/api/getschema/route.js` (pending)
- Examples: `/app/app/service/[id]/components/IntegrationExamples.tsx` (pending)

---

**Last Updated:** 2025-10-17
**Status:** 95% Complete (10/11 tasks done)
**Next Action:** Final testing and verification (Step 11)
