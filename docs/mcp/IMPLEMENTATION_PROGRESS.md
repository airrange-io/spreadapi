# URL-Based Single-Service MCP Implementation - Progress Report

**Date:** 2025-01-26
**Status:** Backend Complete, UI Pending, Testing Pending Deployment

## Summary

Implemented URL-based single-service MCP endpoints where each service gets its own MCP endpoint at `/api/mcp/service/{serviceId}`. This eliminates the discovery overhead and provides immediate access to service metadata.

## Completed Tasks

### 1. Service-Specific MCP Endpoint ✅
**File:** `/app/api/mcp/service/[serviceId]/route.js`

**Features:**
- Dynamic routing based on serviceId in URL
- Supports 3 authentication methods:
  - OAuth tokens (`oat_...`) with service-specific scopes
  - Service tokens (direct API tokens)
  - MCP tokens (`spapi_live_...`) with service access
- Session management for ChatGPT (`Mcp-Session-Id` headers)
- Loads service metadata once at startup
- Provides 6 tools for single service:
  - `spreadapi_calc` - Single calculation
  - `spreadapi_batch` - Batch calculations
  - `spreadapi_get_details` - Service details
  - `spreadapi_read_area` - Read editable areas (if available)
  - `spreadapi_save_state` - Save calculation state
  - `spreadapi_load_state` - Load calculation state

**Key Implementation Details:**
```javascript
// Authentication order:
1. Check Authorization header
2. Validate service exists and is published
3. If service doesn't need token → allow public access
4. If token provided:
   - oat_* → validateOAuthToken() with scope check
   - spapi_live_* → validateMCPToken() with service access check
   - other → validateServiceToken() against service's token list
```

### 2. OAuth Discovery Updated ✅
**File:** `/app/.well-known/oauth-authorization-server/mcp/route.js`

**Changes:**
- Added service-specific scope pattern to `scopes_supported`
- Now advertises: `['mcp:read', 'mcp:write', 'spapi:service:*:execute']`
- Per ChatGPT feedback: OAuth discovery stays at domain root
- Service differentiation via scopes (not per-service discovery endpoints)

### 3. OAuth Authorization Endpoint Updated ✅
**File:** `/app/api/oauth/authorize/route.js`

**New Features:**
- Accepts `service_id` parameter for service-specific flows
- Accepts `service_token` parameter (alternative to `mcp_tokens`)
- Validates service tokens against service configuration
- Generates service-specific scope: `spapi:service:{serviceId}:execute`
- Stores both MCP tokens and service tokens in authorization data

**Flow Options:**
```javascript
// OPTION A: Service token (new)
POST /api/oauth/authorize
{
  "client_id": "...",
  "redirect_uri": "...",
  "code_challenge": "...",
  "code_challenge_method": "S256",
  "service_id": "abd48d0e-...",
  "service_token": "service_abc123"
}
// → Generates scope: spapi:service:abd48d0e-...:execute

// OPTION B: MCP token with service_id
POST /api/oauth/authorize
{
  "client_id": "...",
  "mcp_tokens": ["spapi_live_..."],
  "service_id": "abd48d0e-..."
  ...
}
// → Validates MCP token has access to service
// → Generates scope: spapi:service:abd48d0e-...:execute

// OPTION C: MCP tokens (multi-service, legacy)
POST /api/oauth/authorize
{
  "client_id": "...",
  "mcp_tokens": ["spapi_live_..."]
  ...
}
// → Generates scope: mcp:read mcp:write
```

### 4. OAuth Token Endpoint Updated ✅
**File:** `/app/api/oauth/token/route.js`

**Changes:**
- Retrieves token data from new Redis key: `oauth:tokens:{code}`
- Handles both MCP tokens and service tokens
- Stores service token in OAuth token metadata if provided
- Maintains backward compatibility with old `oauth:mcp_tokens:{code}` key
- Returns OAuth token with service-specific scope

**Token Metadata Structure:**
```javascript
// Redis: oauth:token:{oauthAccessToken}
{
  "client_id": "...",
  "user_id": "...",
  "scope": "spapi:service:{serviceId}:execute", // or "mcp:read mcp:write"
  "service_ids": "[\"serviceId1\", ...]",
  "authorized_at": "...",

  // ONE OF:
  "mcp_tokens": "[\"spapi_live_...\"]", // MCP tokens
  // OR:
  "service_token": "service_abc123",    // Service token
  "service_id": "abd48d0e-..."          // Service ID
}
```

### 5. OAuth Token Validation Updated ✅
**File:** `/lib/mcp-auth.js`

**Changes:**
- Updated `validateOAuthToken()` to handle service tokens
- If OAuth token has `service_token` + `service_id`, skip MCP token validation
- Service tokens already validated during authorization
- Returns scope for service-specific authorization checks

### 6. Service Endpoint Scope Validation ✅
**File:** `/app/api/mcp/service/[serviceId]/route.js` (line 106-122)

**Implementation:**
- OAuth tokens checked for scope: `spapi:service:{serviceId}:execute`
- Returns 401 with `WWW-Authenticate` header hinting required scope
- Example: `WWW-Authenticate: Bearer realm="...", scope="spapi:service:abd48d0e-...:execute"`
- ChatGPT uses this hint to request the correct scope during OAuth

### 7. Session Management ✅
**File:** `/app/api/mcp/service/[serviceId]/route.js` (lines 40-97)

**Features:**
- Creates session on first request: `mcp:session:{sessionId}`
- Stores userId and serviceId in session
- Returns `Mcp-Session-Id` header in responses
- Refreshes TTL on each request (10 minutes)
- Validates session belongs to authenticated user

## Architecture Decisions

### 1. URL-Based Service Identification
- **Decision:** Service ID in URL path: `/api/mcp/service/{serviceId}`
- **Rationale:**
  - Eliminates discovery calls
  - Service metadata loaded immediately
  - Clear separation between services
  - Aligns with REST principles

### 2. OAuth Discovery at Root Domain
- **Decision:** Single OAuth discovery at `/.well-known/oauth-authorization-server`
- **Rationale:**
  - ChatGPT strips path and only looks at domain root (per MCP spec)
  - Service differentiation via scopes, not per-service discovery
  - Simpler configuration for users
  - Follows RFC 8414 and MCP authorization spec

### 3. Service-Specific Scopes
- **Decision:** Scope pattern: `spapi:service:{serviceId}:execute`
- **Rationale:**
  - Per ChatGPT's recommendation for multi-service OAuth
  - Allows fine-grained access control
  - WWW-Authenticate header hints scope for each service
  - OAuth token scope validated on each request

### 4. Multiple Authentication Methods
- **Decision:** Support OAuth tokens, service tokens, AND MCP tokens
- **Rationale:**
  - OAuth tokens: For ChatGPT integration
  - Service tokens: Simplest for users (reuses existing API tokens)
  - MCP tokens: For Claude Desktop backward compatibility
  - Flexibility for different use cases

## Pending Tasks

### 1. UI Component: ServiceMCPSettings
**Location:** To be created

**Requirements:**
- Display service-specific MCP endpoint URL
- Show ChatGPT setup instructions with OAuth flow
- Show Claude Desktop configuration (NPM bridge)
- Provide copy-to-clipboard for URLs and config
- Display service token input for OAuth authorization

**Placement:** Service detail page, after "API Tokens" section

### 2. Testing After Deployment

**Test Service:** `abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6` (public, no token needed)

**Test Cases:**

#### A. Basic MCP Protocol
```bash
# 1. Initialize
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-... \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05"},"id":1}'

# Expected: serverInfo with service name, description, AI guidance

# 2. List Tools
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-... \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}'

# Expected: 6 tools (calc, batch, get_details, read_area, save_state, load_state)

# 3. Get Details
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-... \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"spreadapi_get_details","arguments":{}},"id":3}'

# Expected: Full service details with inputs, outputs, AI guidance
```

#### B. OAuth Flow with Service Token
```bash
# 1. Request authorization (user would do this via UI)
curl -X POST https://spreadapi.io/api/oauth/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test-client",
    "redirect_uri": "https://chatgpt.com/oauth/callback",
    "code_challenge": "...",
    "code_challenge_method": "S256",
    "service_id": "abd48d0e-...",
    "service_token": "service_token_here"
  }'

# Expected: {"code": "auth_code_..."}

# 2. Exchange code for token
curl -X POST https://spreadapi.io/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "auth_code_...",
    "client_id": "test-client",
    "redirect_uri": "https://chatgpt.com/oauth/callback",
    "code_verifier": "..."
  }'

# Expected: {"access_token": "oat_...", "scope": "spapi:service:abd48d0e-...:execute"}

# 3. Use OAuth token with service endpoint
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-... \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oat_..." \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

# Expected: Success with session ID in response headers
```

#### C. WWW-Authenticate Header (Service Requires Token)
```bash
# Test with a service that requires token, no auth provided
curl -X POST https://spreadapi.io/api/mcp/service/{service_with_token} \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

# Expected: 401 with header:
# WWW-Authenticate: Bearer realm="...", scope="spapi:service:{serviceId}:execute"
```

#### D. Session Management
```bash
# 1. First request (no session)
curl -v -X POST https://spreadapi.io/api/mcp/service/abd48d0e-... \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

# Check response headers for: Mcp-Session-Id: mcp-...

# 2. Subsequent request (with session)
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-... \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: mcp-..." \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}'

# Expected: Same session ID in response
```

#### E. ChatGPT Integration (Manual Test)
1. Create GPT in ChatGPT
2. Configure MCP server: `https://spreadapi.io/api/mcp/service/abd48d0e-...`
3. ChatGPT should initiate OAuth flow
4. User provides service token in authorization UI
5. ChatGPT receives OAuth token with service-specific scope
6. Test calculation via ChatGPT

### 3. Documentation Updates

**Files to Update:**
- `docs/mcp/COMPLETE_ARCHITECTURE_GUIDE.md` - Add service-specific endpoint section
- `docs/mcp/MCP_AI_INSTRUCTIONS_COMPLETE.md` - Document single-service instructions
- `docs/mcp/TESTING_GUIDE_SERVICE_abd48d0e.md` - Add OAuth flow tests

### 4. NPM Bridge Update (Optional)

The current bridge (`/packages/spreadapi-mcp/index.js`) works with service-specific endpoints, but could be enhanced to:
- Accept `SPREADAPI_SERVICE_ID` environment variable
- Construct service-specific URL automatically
- Simplify Claude Desktop configuration

**Current Configuration:**
```json
{
  "mcpServers": {
    "my-service": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/service/SERVICE_ID",
        "SPREADAPI_TOKEN": "service_token_here"
      }
    }
  }
}
```

## Redis Schema Changes

### New Keys

**OAuth Token Data (replaces `oauth:mcp_tokens:{code}`):**
```
Key: oauth:tokens:{code}
Type: String (JSON)
TTL: 600 seconds (10 minutes)
Value: {
  "mcp_tokens": ["spapi_live_..."],
  "service_token": "service_abc123",
  "service_id": "abd48d0e-..."
}
```

**OAuth Access Token (updated structure):**
```
Key: oauth:token:{oauthAccessToken}
Type: Hash
TTL: 43200 seconds (12 hours)
Fields:
  - client_id: "..."
  - user_id: "..."
  - scope: "spapi:service:{serviceId}:execute"
  - service_ids: "[\"serviceId\"]"
  - mcp_tokens: "[\"spapi_live_...\"]" (optional)
  - service_token: "service_abc123" (optional)
  - service_id: "abd48d0e-..." (optional)
  - authorized_at: "timestamp"
```

**Session (updated with serviceId):**
```
Key: mcp:session:{sessionId}
Type: Hash
TTL: 600 seconds (10 minutes)
Fields:
  - userId: "..."
  - serviceId: "abd48d0e-..." (new)
  - created: "timestamp"
  - lastActivity: "timestamp"
```

## Migration Strategy

### Backward Compatibility

**Multi-Service MCP Endpoint:** `/api/mcp` and `/api/mcp/bridge`
- ✅ Still functional
- ✅ Supports existing MCP tokens
- ✅ Discovery tools still available
- 📝 Recommend gradually migrating users to service-specific endpoints

**OAuth Token Endpoint:**
- ✅ Fallback to old key `oauth:mcp_tokens:{code}` if new key not found
- ✅ Old tokens still validated
- ✅ New tokens support both formats

**Token Validation:**
- ✅ MCP tokens still work via `mcpAuthMiddleware`
- ✅ OAuth tokens support both MCP tokens and service tokens
- ✅ Service tokens validated directly against service configuration

### Recommended Rollout

**Phase 1: Deploy Backend** ✅
- All backend code complete
- No breaking changes to existing flows
- Service-specific endpoints available but not advertised

**Phase 2: Create UI Component**
- Add ServiceMCPSettings to service detail pages
- Show both old (multi-service) and new (service-specific) options
- Highlight benefits of service-specific approach

**Phase 3: Testing**
- Test with public service (abd48d0e-...)
- Test with token-required service
- Test OAuth flow end-to-end
- Test ChatGPT integration

**Phase 4: Documentation & Announcement**
- Update user documentation
- Create migration guide
- Announce new service-specific endpoints
- Provide examples for both ChatGPT and Claude Desktop

**Phase 5: Gradual Migration**
- Encourage new users to use service-specific endpoints
- Keep multi-service endpoints for backward compatibility
- Monitor usage and gather feedback

## Files Modified

### New Files
1. `/app/api/mcp/service/[serviceId]/route.js` - Service-specific MCP endpoint (690 lines)
2. `/docs/mcp/IMPLEMENTATION_PROGRESS.md` - This file

### Modified Files
1. `/app/.well-known/oauth-authorization-server/mcp/route.js` - Added service-specific scope
2. `/app/api/oauth/authorize/route.js` - Added service_id and service_token support
3. `/app/api/oauth/token/route.js` - Updated token storage and retrieval
4. `/lib/mcp-auth.js` - Updated OAuth token validation for service tokens

## Next Steps

1. **Create ServiceMCPSettings UI component**
   - Location: `/components/ServiceMCPSettings.tsx` (or similar)
   - Integration point: Service detail page

2. **Deploy to production**
   - Run build and deploy
   - Verify service endpoint is accessible

3. **Run test suite**
   - Execute tests from TESTING_GUIDE_SERVICE_abd48d0e.md
   - Verify all flows work correctly

4. **ChatGPT integration test**
   - Create test GPT
   - Configure with service-specific endpoint
   - Complete OAuth flow
   - Test calculations

5. **Documentation updates**
   - Update architecture guide
   - Create user migration guide
   - Add examples to docs

## Questions & Considerations

### 1. Should we deprecate multi-service MCP tokens?
**Recommendation:** No, keep for backward compatibility. Many users may have configured Claude Desktop with multi-service tokens.

### 2. Should we auto-migrate existing MCP tokens to service-specific?
**Recommendation:** No, let users migrate when ready. Provide clear migration path.

### 3. Should we allow MCP tokens with multiple serviceIds on service-specific endpoint?
**Current:** Yes, validated that token includes the requested serviceId
**Recommendation:** Keep this for flexibility

### 4. Rate limiting for service-specific endpoints?
**Current:** No specific rate limiting on service endpoint
**Recommendation:** Consider adding per-service rate limits based on service configuration

### 5. Analytics for service-specific vs multi-service usage?
**Recommendation:** Track endpoint usage to understand adoption and inform future decisions

## Summary

The URL-based single-service MCP implementation is **functionally complete** on the backend. The architecture supports:

✅ Service-specific endpoints with immediate metadata access
✅ Three authentication methods (OAuth, service tokens, MCP tokens)
✅ Service-specific OAuth scopes following ChatGPT's recommendations
✅ Session management for stateful ChatGPT connections
✅ Backward compatibility with existing multi-service flows
✅ Clear separation of concerns and security boundaries

**Remaining work:**
1. UI component for service detail page
2. Deployment and testing
3. Documentation updates

The implementation follows OAuth 2.1 best practices, MCP specification requirements, and ChatGPT's specific recommendations for service differentiation via scopes.

---

**Implementation Lead:** Claude (AI Assistant)
**Last Updated:** 2025-01-26
**Status:** Ready for UI development and deployment
