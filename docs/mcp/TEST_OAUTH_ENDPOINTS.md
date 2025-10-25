# Test OAuth Endpoints Locally
**Verify ChatGPT Compatibility**

---

## Quick Test Commands

Run these locally to verify your OAuth endpoints return correct JSON:

### 1. Test Protected Resource Metadata

```bash
curl http://localhost:3000/.well-known/oauth-protected-resource | jq
```

**Expected Output:**
```json
{
  "resource": "http://localhost:3000/api/mcp",
  "authorization_servers": ["http://localhost:3000"],
  "bearer_methods_supported": ["header"],
  "scopes_supported": ["mcp:read", "mcp:write"]
}
```

**ChatGPT Requirements:**
- ✅ `resource` field matches MCP URL exactly
- ✅ `authorization_servers` array present
- ✅ `scopes_supported` listed

---

### 2. Test Authorization Server Metadata

```bash
curl http://localhost:3000/.well-known/oauth-authorization-server | jq
```

**Expected Output:**
```json
{
  "issuer": "http://localhost:3000",
  "authorization_endpoint": "http://localhost:3000/oauth/authorize",
  "token_endpoint": "http://localhost:3000/oauth/token",
  "registration_endpoint": "http://localhost:3000/oauth/register",
  "grant_types_supported": ["authorization_code"],
  "response_types_supported": ["code"],
  "code_challenge_methods_supported": ["S256"],
  "scopes_supported": ["mcp:read", "mcp:write"],
  "token_endpoint_auth_methods_supported": ["none"],
  "require_pushed_authorization_requests": false,
  "service_documentation": "http://localhost:3000/docs/oauth"
}
```

**ChatGPT Requirements:**
- ✅ `issuer` present
- ✅ `authorization_endpoint` present
- ✅ `token_endpoint` present
- ✅ `code_challenge_methods_supported` includes "S256"
- ✅ `registration_endpoint` present (recommended)

---

### 3. Test 401 WWW-Authenticate Challenge

```bash
curl -i http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

**Expected Output:**
```
HTTP/1.1 401 Unauthorized
Content-Type: application/json
WWW-Authenticate: Bearer realm="http://localhost:3000/api/mcp", scope="mcp:read mcp:write"

{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Authentication failed: No token provided"
  },
  "id": null
}
```

**ChatGPT Requirements:**
- ✅ Status code 401
- ✅ `WWW-Authenticate` header present
- ✅ Includes scope hint

---

### 4. Test Dynamic Client Registration

```bash
curl -X POST http://localhost:3000/oauth/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "ChatGPT Test",
    "redirect_uris": ["https://chatgpt.com/oauth/callback"]
  }' | jq
```

**Expected Output:**
```json
{
  "client_id": "dcr_abc123456789...",
  "client_name": "ChatGPT Test",
  "redirect_uris": ["https://chatgpt.com/oauth/callback"],
  "grant_types": ["authorization_code"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none",
  "scope": "mcp:read mcp:write",
  "client_id_issued_at": 1730000000,
  "registration_access_token": null,
  "registration_client_uri": null,
  "authorization_endpoint": "http://localhost:3000/oauth/authorize",
  "token_endpoint": "http://localhost:3000/oauth/token"
}
```

**ChatGPT Requirements:**
- ✅ Returns `client_id`
- ✅ Includes endpoint URLs
- ✅ Status 201 Created

---

## Production Testing (After Deploy)

Replace `http://localhost:3000` with `https://spreadapi.io`:

```bash
# 1. Protected Resource Metadata
curl https://spreadapi.io/.well-known/oauth-protected-resource | jq

# 2. Authorization Server Metadata
curl https://spreadapi.io/.well-known/oauth-authorization-server | jq

# 3. WWW-Authenticate Challenge
curl -i https://spreadapi.io/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# 4. Client Registration
curl -X POST https://spreadapi.io/oauth/register \
  -H "Content-Type: application/json" \
  -d '{"client_name":"Test","redirect_uris":["https://chatgpt.com/oauth/callback"]}' | jq
```

---

## Checklist Based on ChatGPT Feedback

### ✅ Protected Resource Metadata (/.well-known/oauth-protected-resource)
- [x] Returns JSON
- [x] Includes `authorization_servers` array
- [x] `resource` URL equals MCP base URL (`/api/mcp`)
- [x] No trailing slash issues

### ✅ Authorization Server Metadata (/.well-known/oauth-authorization-server)
- [x] `issuer` present (https://spreadapi.io)
- [x] `authorization_endpoint` present
- [x] `token_endpoint` present
- [x] PKCE: `code_challenge_methods_supported` includes "S256"
- [x] `registration_endpoint` for DCR (recommended)

### ✅ Runtime Challenge (POST /api/mcp unauthenticated)
- [x] Returns 401
- [x] Includes `WWW-Authenticate` header
- [x] Optionally includes scope hint

---

## Common Issues & Solutions

### Issue 1: CDN/Bot Filter Blocking Requests

**Symptom:** ChatGPT gets generic fetch error

**Solutions:**
1. Check Vercel deployment logs
2. Verify `.well-known` routes are accessible
3. Check if Vercel firewall is blocking bots
4. Test with `User-Agent: ChatGPT` header:
```bash
curl -H "User-Agent: ChatGPT" https://spreadapi.io/.well-known/oauth-protected-resource
```

### Issue 2: Resource URL Mismatch

**Symptom:** ChatGPT rejects metadata

**Check:**
```bash
# Resource field in protected-resource metadata
curl https://spreadapi.io/.well-known/oauth-protected-resource | jq .resource

# Should match exactly:
"https://spreadapi.io/api/mcp"
```

**Common mistakes:**
- Trailing slash: `"/api/mcp/"` ❌ vs `"/api/mcp"` ✅
- Wrong protocol: `"http://"` ❌ vs `"https://"` ✅
- Wrong base: `"/mcp"` ❌ vs `"/api/mcp"` ✅

### Issue 3: PKCE Not Advertised

**Check:**
```bash
curl https://spreadapi.io/.well-known/oauth-authorization-server | \
  jq .code_challenge_methods_supported

# Should output:
["S256"]
```

### Issue 4: Missing CORS Headers

**Check:**
```bash
curl -i -X OPTIONS https://spreadapi.io/.well-known/oauth-protected-resource

# Should include:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

---

## Share with ChatGPT

After running the production tests, copy-paste these 3 outputs to ChatGPT for validation:

**1. Protected Resource Metadata:**
```bash
curl https://spreadapi.io/.well-known/oauth-protected-resource
```

**2. Authorization Server Metadata:**
```bash
curl https://spreadapi.io/.well-known/oauth-authorization-server
```

**3. 401 Challenge Headers:**
```bash
curl -i https://spreadapi.io/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' | head -20
```

ChatGPT will validate:
- Resource/issuer URLs match
- All required fields present
- PKCE S256 advertised
- DCR endpoint available
- Scope hints correct

---

## Expected Results Summary

| Endpoint | Status | Content-Type | Key Fields |
|----------|--------|--------------|------------|
| `/.well-known/oauth-protected-resource` | 200 | application/json | resource, authorization_servers |
| `/.well-known/oauth-authorization-server` | 200 | application/json | issuer, authorization_endpoint, token_endpoint, code_challenge_methods_supported |
| `/api/mcp` (no auth) | 401 | application/json | WWW-Authenticate header |
| `/oauth/register` | 201 | application/json | client_id |

---

**Next Step:** Run these tests locally, then deploy to production and run again with `https://spreadapi.io`!
