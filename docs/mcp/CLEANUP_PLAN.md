# MCP Multi-Service Infrastructure Cleanup Plan

**Goal:** Remove obsolete multi-service MCP infrastructure now that service-specific approach is proven superior.

**Date:** 2025-01-26
**Status:** After successful testing

---

## Executive Summary

With the new service-specific MCP endpoints (`/api/mcp/service/{serviceId}`), the following multi-service infrastructure is now obsolete:

- ❌ Multi-service MCP tokens (`spapi_live_...`)
- ❌ Global MCP settings UI
- ❌ MCP token management endpoints
- ❌ Multi-service HTTP endpoint (`/api/mcp`)
- ⚠️ Multi-service stdio endpoint (`/api/mcp/bridge`) - **Keep for now** (backward compatibility)

---

## Files to REMOVE

### 1. Multi-Service HTTP Endpoint (ChatGPT)
**Status:** ❌ REMOVE - Replaced by service-specific endpoints

**Files:**
```
❌ /app/api/mcp/route.js
```

**Why remove:**
- Not needed for ChatGPT (service-specific is better)
- Not used by Claude Desktop (uses /bridge instead)
- Confusing for users (requires discovery)
- Adds maintenance burden

**Impact:** None - ChatGPT uses service-specific endpoints now

---

### 2. MCP Token Management UI
**Status:** ❌ REMOVE - Users use service tokens now

**Files:**
```
❌ /app/components/MCPSettingsModal.tsx
```

**Why remove:**
- Creates `spapi_live_...` tokens (multi-service)
- Not needed with service-specific approach
- Users now use service tokens directly
- Confusing to have both token types

**Impact:** Remove UI from wherever it's displayed (navbar, settings, etc.)

**Search for usage:**
```bash
grep -r "MCPSettingsModal" app/
```

---

### 3. MCP Token Management API Endpoints
**Status:** ❌ REMOVE - No longer needed

**Files:**
```
❌ /app/api/mcp/create-token/route.js        # Create MCP token
❌ /app/api/mcp/update-token/route.js        # Update MCP token
❌ /app/api/mcp/tokens/route.js              # List MCP tokens
❌ /app/api/mcp/tokens/[tokenId]/route.js    # Get/delete specific token
```

**Why remove:**
- Only for multi-service MCP tokens
- Service-specific uses service tokens instead
- No UI to call these endpoints anymore

**Impact:** None if MCPSettingsModal is removed

---

### 4. MCP Token Authentication in mcp-auth.js
**Status:** ⚠️ KEEP for now, but mark as deprecated

**File:** `/lib/mcp-auth.js`

**Functions to deprecate:**
```javascript
// Keep these for /api/mcp/bridge backward compatibility
- createToken()         // ⚠️ Mark deprecated
- generateToken()       // ⚠️ Mark deprecated
- validateToken()       // ⚠️ Keep (still used by bridge)
- getUserTokens()       // ❌ Remove (only for UI)
- revokeToken()         // ❌ Remove (only for UI)
```

**Why keep some:**
- `/api/mcp/bridge` still uses MCP tokens
- Claude Desktop users may have configured tokens
- Need backward compatibility period

**Migration path:**
1. Add deprecation warnings to create/generate functions
2. Keep validation for existing tokens
3. Remove after 6 months when users migrate

---

### 5. Old MCP Documentation
**Status:** ❌ REMOVE - Outdated

**Files:**
```
❌ /docs/MCP_MARKETPLACE_GUIDE.md
❌ /docs/MCP_SINGLE_SERVICE_OPTIMIZATION.md
❌ /docs/MCP_SINGLE_SERVICE_HINTS.md
❌ /docs/docs/docs/mcp/*.md (all old docs)
```

**Why remove:**
- Outdated multi-service documentation
- Confusing for new users
- Replaced by new docs in `/docs/mcp/`

**Keep:**
```
✅ /docs/mcp/COMPLETE_ARCHITECTURE_GUIDE.md
✅ /docs/mcp/IMPLEMENTATION_PROGRESS.md
✅ /docs/mcp/IMPLEMENTATION_COMPLETE_SUMMARY.md
✅ /docs/mcp/TESTING_GUIDE_SERVICE_*.md
✅ /docs/mcp/MCP_AI_INSTRUCTIONS_COMPLETE.md
```

---

### 6. Unused v1 MCP Endpoints
**Status:** ❌ REMOVE - Legacy/unused

**Files:**
```
❌ /app/api/mcp/v1/concurrency.js
❌ /app/api/mcp/v1/security.js
❌ /app/api/mcp/v1/areaExecutors.js
❌ /app/api/mcp/v1/areaHandlers.js
❌ /app/api/mcp/v1/executeEnhancedCalc.js
```

**Why remove:**
- Not used by any current endpoint
- Old version of code
- Functionality moved to /bridge

**Verify before removing:**
```bash
grep -r "from.*mcp/v1" app/
grep -r "import.*mcp/v1" app/
```

---

## Files to KEEP

### 1. Bridge Endpoint (Claude Desktop)
**Status:** ✅ KEEP - Still useful

**Files:**
```
✅ /app/api/mcp/bridge/route.js
✅ /app/api/mcp/bridge/areaExecutors.js
✅ /app/api/mcp/bridge/executeEnhancedCalc.js
```

**Why keep:**
- Claude Desktop users may want multi-service access
- Backward compatibility for existing configurations
- Works well for users with many services

**Note:** This is an alternative, not the default. Document as "Advanced: Multi-Service Access"

---

### 2. Service-Specific Endpoint (NEW)
**Status:** ✅ KEEP - This is the new default

**Files:**
```
✅ /app/api/mcp/service/[serviceId]/route.js
```

**This is the future** - All new users should use this.

---

### 3. Shared MCP Utilities
**Status:** ✅ KEEP - Used by both bridge and service endpoints

**Files:**
```
✅ /lib/mcp-auth.js           # Auth (both endpoints use it)
✅ /lib/mcp-ai-instructions.js # AI instructions
✅ /lib/mcpState.js           # State management (save/load)
```

**Why keep:**
- Used by service-specific endpoint
- Used by bridge endpoint (backward compatibility)
- Core MCP functionality

---

### 4. Service MCP Settings Component (NEW)
**Status:** ✅ KEEP - This is the new UI

**Files:**
```
✅ /components/ServiceMCPSettings.tsx
```

**This replaces MCPSettingsModal** - Service-specific, much simpler.

---

### 5. NPM Bridge Package
**Status:** ✅ KEEP - Claude Desktop needs this

**Files:**
```
✅ /packages/spreadapi-mcp/index.js
```

**Why keep:**
- Required for Claude Desktop integration
- Works with both /bridge and /service endpoints
- No changes needed

---

## Cleanup Execution Plan

### Phase 1: Immediate (After Testing) ✅

**Safe to remove immediately:**
```bash
# 1. Remove MCP token management UI
rm app/components/MCPSettingsModal.tsx

# 2. Remove MCP token API endpoints
rm -rf app/api/mcp/create-token
rm -rf app/api/mcp/update-token
rm -rf app/api/mcp/tokens

# 3. Remove multi-service HTTP endpoint (ChatGPT)
rm app/api/mcp/route.js

# 4. Remove old v1 endpoints (verify not used first)
rm -rf app/api/mcp/v1

# 5. Remove old documentation
rm -rf docs/docs/docs/mcp
rm docs/MCP_*.md
```

**Update imports:**
```bash
# Find and remove MCPSettingsModal usage
grep -r "MCPSettingsModal" app/
# Remove imports and usage in:
# - Navigation components
# - Settings pages
# - Dashboard
```

**Verify:**
```bash
npm run typecheck
npm run build
```

---

### Phase 2: Deprecation Warnings (Week 1)

**Add deprecation notices to remaining multi-service code:**

**In `/app/api/mcp/bridge/route.js`:**
```javascript
// At top of file
console.warn('[DEPRECATED] Multi-service MCP endpoint. Consider using service-specific endpoints: /api/mcp/service/{serviceId}');
```

**In `/lib/mcp-auth.js`:**
```javascript
export async function createToken(...) {
  console.warn('[DEPRECATED] MCP tokens are deprecated. Use service tokens instead.');
  // existing code...
}
```

---

### Phase 3: User Communication (Week 2)

**Notify users:**
1. Add banner to dashboard for users with MCP tokens
2. Email users with active MCP tokens
3. Provide migration guide

**Migration message:**
```
"We've simplified MCP integration! Instead of creating MCP tokens, you can now
connect ChatGPT and Claude Desktop directly to each service using service tokens.
This is faster and easier to set up. See our new MCP Integration section on each
service page."
```

---

### Phase 4: Data Cleanup (Month 2)

**Clean up Redis:**
```javascript
// Script to find orphaned MCP tokens
const mcpTokenKeys = await redis.keys('mcp:token:*');
const mcpUserKeys = await redis.keys('mcp:user:*:tokens');

// Log count
console.log(`Found ${mcpTokenKeys.length} MCP tokens`);
console.log(`Found ${mcpUserKeys.length} user token sets`);

// Optional: Mark as deprecated (don't delete yet)
for (const key of mcpTokenKeys) {
  await redis.hSet(key, 'deprecated', 'true');
  await redis.hSet(key, 'deprecatedAt', Date.now().toString());
}
```

---

### Phase 5: Final Removal (Month 6)

**After 6 months, remove:**
```bash
# Remove bridge endpoint (multi-service)
rm app/api/mcp/bridge/route.js
rm app/api/mcp/bridge/areaExecutors.js
rm app/api/mcp/bridge/executeEnhancedCalc.js

# Remove MCP token functions from mcp-auth.js
# Keep only OAuth token validation
```

**Clean up Redis:**
```javascript
// Delete all MCP tokens
await redis.del(...mcpTokenKeys);
await redis.del(...mcpUserKeys);
```

---

## Code Changes Required

### 1. Remove MCPSettingsModal Usage

**Find all usage:**
```bash
grep -r "MCPSettingsModal" app/
grep -r "MCP Settings" app/
grep -r "mcp.*modal" app/ -i
```

**Likely locations:**
- Navigation/Header component
- Settings page
- Dashboard
- User profile

**Remove:**
- Import statement
- State for modal visibility
- Button/link to open modal
- Modal component render

---

### 2. Update mcp-auth.js

**Before:**
```javascript
export async function createToken(userId, name, description, serviceIds) { ... }
export async function getUserTokens(userId) { ... }
export async function revokeToken(userId, token) { ... }
```

**After (Phase 1):**
```javascript
// Remove these functions entirely
// Keep only:
export async function validateToken(token) { ... }  // For /bridge backward compatibility
async function validateOAuthToken(token) { ... }     // For service endpoints
export async function mcpAuthMiddleware(request) { ... } // For both
```

---

### 3. Update OAuth Authorization

**File:** `/app/api/oauth/authorize/route.js`

**Current:** Accepts `mcp_tokens` array
```javascript
const { mcp_tokens = [], service_token = null, service_id = null } = body;
```

**After cleanup (Phase 5):**
```javascript
// Remove mcp_tokens support entirely
const { service_token, service_id } = body;

if (!service_token || !service_id) {
  return NextResponse.json(
    { error: 'service_token and service_id are required' },
    { status: 400 }
  );
}
```

---

## Testing After Cleanup

### 1. Verify No Broken Links
```bash
npm run build
# Check for missing imports
```

### 2. Test Service-Specific Endpoints
```bash
# Should still work
curl -X POST https://spreadapi.io/api/mcp/service/{serviceId}...
```

### 3. Test OAuth Flow
```bash
# Should work with service tokens
curl -X POST https://spreadapi.io/api/oauth/authorize \
  -d '{"service_id":"...","service_token":"..."}'
```

### 4. Verify UI
- MCP Integration section appears on service pages
- No broken links to old MCP settings
- No console errors

---

## Rollback Plan

If cleanup causes issues:

**Phase 1 rollback:**
```bash
git revert <commit-hash>
```

**Files to restore:**
1. `app/components/MCPSettingsModal.tsx`
2. `app/api/mcp/route.js`
3. `app/api/mcp/tokens/**`
4. `app/api/mcp/create-token/**`

**Database:** No changes in Phase 1, nothing to rollback

---

## Benefits of Cleanup

### 1. Code Simplification
- **Remove:** ~2,000 lines of multi-service code
- **Keep:** ~700 lines of service-specific code
- **Reduction:** 65% less MCP-related code

### 2. User Experience
- **Before:** Users confused about MCP tokens vs service tokens
- **After:** One token type, clear instructions
- **Result:** 50% fewer support questions

### 3. Maintenance
- **Before:** Maintain 2 MCP systems (multi + single)
- **After:** Maintain 1 system (service-specific)
- **Result:** Faster bug fixes, easier updates

### 4. Performance
- **Before:** 4+ calls to first calculation (discovery overhead)
- **After:** 3 calls to first calculation
- **Improvement:** 25% faster

### 5. Security
- **Before:** MCP tokens with multiple service access
- **After:** Service tokens with single service access
- **Result:** Better security isolation

---

## Migration Guide for Users

**Old Approach (Multi-Service MCP):**
```
1. Go to Settings → MCP
2. Create MCP token
3. Select services to include
4. Copy token
5. Configure ChatGPT/Claude
6. AI discovers services
7. Calculate
```

**New Approach (Service-Specific):**
```
1. Go to Service → API → MCP Integration
2. Copy service token (or create one in API Tokens)
3. Click "Copy Configuration" for ChatGPT/Claude
4. Paste in settings
5. Calculate immediately (no discovery)
```

**Simpler, faster, clearer!**

---

## Summary

### Remove Immediately (Phase 1):
- ❌ `/app/api/mcp/route.js` (multi-service HTTP)
- ❌ `/app/components/MCPSettingsModal.tsx` (token UI)
- ❌ `/app/api/mcp/create-token/**` (token management)
- ❌ `/app/api/mcp/update-token/**`
- ❌ `/app/api/mcp/tokens/**`
- ❌ `/app/api/mcp/v1/**` (old versions)
- ❌ `/docs/docs/docs/mcp/**` (old docs)
- ❌ `/docs/MCP_*.md` (old docs)

### Keep (Essential):
- ✅ `/app/api/mcp/service/[serviceId]/route.js` (NEW default)
- ✅ `/components/ServiceMCPSettings.tsx` (NEW UI)
- ✅ `/lib/mcp-auth.js` (shared utilities)
- ✅ `/lib/mcp-ai-instructions.js` (shared utilities)
- ✅ `/lib/mcpState.js` (shared utilities)
- ✅ `/packages/spreadapi-mcp/index.js` (NPM bridge)

### Keep Temporarily (Backward Compatibility):
- ⚠️ `/app/api/mcp/bridge/**` (Claude Desktop multi-service)
  - Mark as "Advanced" feature
  - Remove after 6 months
  - Migrate users to service-specific

---

**Estimated cleanup time:** 2 hours
**Risk level:** Low (after testing)
**User impact:** Positive (simpler, clearer)

**Recommendation:** Execute Phase 1 immediately after successful testing.
