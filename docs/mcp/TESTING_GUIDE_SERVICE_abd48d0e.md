# Testing Guide: Service abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6

**Service ID:** `abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6`
**Type:** Public (no token required)
**Status:** Published
**Purpose:** Test implementation of URL-based single-service MCP

---

## URLs for This Service

### MCP Endpoint
```
https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
```

### OAuth Discovery
```
https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6/.well-known/oauth-authorization-server
```

### OAuth Authorization
```
https://spreadapi.io/oauth/authorize/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
```

---

## Pre-Implementation Testing (What Works NOW)

### Test 1: Verify Service Exists

```bash
# Check service metadata
curl https://spreadapi.io/api/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6

# Expected: Service data (title, description, inputs, outputs)
```

### Test 2: Check if Service is Published

```bash
# Try to execute via regular API
curl -X POST https://spreadapi.io/api/v1/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6/execute \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {}
  }'

# Expected: Should work (service is published)
```

### Test 3: Verify No Token Required

```bash
# Get service metadata from Redis
redis-cli HGET "service:abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6:published" needsToken

# Expected: "false" (no token required)
```

---

## Post-Implementation Testing (After Fixes Applied)

### Phase 1: OAuth Discovery

#### Test 1.1: OAuth Authorization Server Discovery

```bash
curl https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6/.well-known/oauth-authorization-server
```

**Expected Response:**
```json
{
  "issuer": "https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6",
  "authorization_endpoint": "https://spreadapi.io/oauth/authorize/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6",
  "token_endpoint": "https://spreadapi.io/api/oauth/token",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code"],
  "code_challenge_methods_supported": ["S256"],
  "token_endpoint_auth_methods_supported": ["none"],
  "scopes_supported": ["mcp:read", "mcp:write"]
}
```

**If this fails:** OAuth discovery endpoint not implemented yet

#### Test 1.2: Protected Resource Discovery

```bash
curl https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6/.well-known/oauth-protected-resource
```

**Expected Response:**
```json
{
  "resource": "https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6",
  "authorization_servers": [
    "https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6"
  ],
  "bearer_methods_supported": ["header"]
}
```

---

### Phase 2: MCP Endpoint Tests

#### Test 2.1: Initialize Request

```bash
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": { "listChanged": false }
    },
    "serverInfo": {
      "name": "Service Title Here",
      "version": "1.0.0",
      "description": "Service description...",
      "instructions": "🎯 SERVICE TITLE\n\nPURPOSE:\n..."
    }
  },
  "id": 1
}
```

**Check for:**
- ✅ Service title in `serverInfo.name`
- ✅ Service description
- ✅ Complete AI instructions in `serverInfo.instructions`
- ✅ Session ID in headers (`Mcp-Session-Id`)

#### Test 2.2: Tools List

```bash
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "calculate",
        "description": "Calculate...",
        "inputSchema": {
          "type": "object",
          "properties": {
            // Service-specific inputs here
          },
          "required": [...]
        }
      },
      {
        "name": "batch_calculate",
        "description": "Compare multiple scenarios...",
        "inputSchema": {...}
      },
      {
        "name": "save_calculation",
        "description": "Save calculation...",
        "inputSchema": {...}
      },
      {
        "name": "load_calculation",
        "description": "Load saved calculation...",
        "inputSchema": {...}
      },
      {
        "name": "list_calculations",
        "description": "List saved calculations...",
        "inputSchema": {...}
      }
    ]
  },
  "id": 2
}
```

**Check for:**
- ✅ `calculate` tool with service-specific input schema
- ✅ Batch, save, load, list tools
- ✅ No `serviceId` parameter in calculate tool (it's implicit from URL)
- ✅ Complete input schema with types, descriptions, constraints

#### Test 2.3: Execute Calculation

First, check what inputs the service needs:

```bash
# Get service details to see inputs
curl https://spreadapi.io/api/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
```

Then call the calculate tool with appropriate inputs:

```bash
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "calculate",
      "arguments": {
        // Add actual inputs based on service schema
      }
    },
    "id": 3
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Service Title - Calculation Complete\n\n📊 Results:\n  • Output 1: Value\n  • Output 2: Value\n\n⚡ Completed in 45ms"
      }
    ]
  },
  "id": 3
}
```

---

### Phase 3: OAuth Flow Tests

#### Test 3.1: Authorization Code Request (Manual)

**Generate PKCE challenge:**

```bash
# Generate code_verifier (random 43-128 char string)
CODE_VERIFIER=$(openssl rand -base64 32 | tr -d '=' | tr '+/' '-_')
echo "Code Verifier: $CODE_VERIFIER"

# Generate code_challenge (SHA256 hash, base64url encoded)
CODE_CHALLENGE=$(echo -n "$CODE_VERIFIER" | openssl dgst -sha256 -binary | openssl base64 | tr -d '=' | tr '+/' '-_')
echo "Code Challenge: $CODE_CHALLENGE"
```

**Request authorization code:**

```bash
curl -X POST https://spreadapi.io/api/oauth/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6",
    "serviceToken": null,
    "client_id": "test-client",
    "redirect_uri": "https://chatgpt.com/oauth/callback",
    "code_challenge": "'"$CODE_CHALLENGE"'",
    "code_challenge_method": "S256",
    "state": "random-state-123"
  }'
```

**Expected Response:**
```json
{
  "code": "oac_randomcode123...",
  "state": "random-state-123"
}
```

**Save the code for next test!**

#### Test 3.2: Token Exchange

```bash
# Use the code from previous step
AUTH_CODE="oac_randomcode123..."

curl -X POST https://spreadapi.io/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$AUTH_CODE&client_id=test-client&redirect_uri=https://chatgpt.com/oauth/callback&code_verifier=$CODE_VERIFIER"
```

**Expected Response:**
```json
{
  "access_token": "oat_randomhash123...",
  "token_type": "Bearer",
  "expires_in": 43200,
  "scope": "mcp:read mcp:write"
}
```

**Save the access token for next test!**

#### Test 3.3: Use OAuth Token with MCP Endpoint

```bash
OAUTH_TOKEN="oat_randomhash123..."

# Test initialize with OAuth token
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OAUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }'
```

**Expected:** Should work exactly like without token (public service)

**Test calculate with OAuth token:**

```bash
curl -X POST https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OAUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "calculate",
      "arguments": {
        // Add inputs
      }
    },
    "id": 3
  }'
```

**Expected:** Calculation should work

---

### Phase 4: ChatGPT Integration Test

#### Test 4.1: Add MCP Server in ChatGPT

1. Open ChatGPT (must have MCP beta access)
2. Settings → Add MCP Server
3. Enter URL:
   ```
   https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
   ```
4. Click "Connect"

**Expected Flow:**
```
ChatGPT discovers OAuth endpoints
  ↓
Redirects to authorization page
  ↓
Shows service info (title, description)
  ↓
No token input shown (public service)
  ↓
Click "Authorize"
  ↓
Redirect back to ChatGPT
  ↓
"Connected ✓"
```

#### Test 4.2: Use Service in ChatGPT

**Test prompt:**
```
"What can you do?"
```

**Expected:** ChatGPT explains what this specific calculator does (from AI instructions)

**Test calculation:**
```
"Calculate [based on service's purpose]"
```

**Expected:** ChatGPT calls the calculate tool and shows results

#### Test 4.3: Test Advanced Features

**Batch calculation:**
```
"Compare 3 scenarios: [scenario 1], [scenario 2], [scenario 3]"
```

**Expected:** ChatGPT uses `batch_calculate` tool

**Save state:**
```
"Save this calculation as 'baseline scenario'"
```

**Expected:** ChatGPT uses `save_calculation` tool

**Load state:**
```
"Load the baseline scenario"
```

**Expected:** ChatGPT uses `load_calculation` tool

---

### Phase 5: Claude Desktop Test

#### Test 5.1: NPM Package Installation

```bash
npm install -g spreadapi-mcp
```

#### Test 5.2: Configuration

Create/edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "test-service": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6"
      }
    }
  }
}
```

**No token needed** (public service)

#### Test 5.3: Restart Claude Desktop

Close and reopen Claude Desktop app

#### Test 5.4: Test in Claude

**Check connection:**
```
"What tools do you have access to?"
```

**Expected:** Claude mentions this specific service/calculator

**Test calculation:**
```
"Calculate [based on service]"
```

**Expected:** Claude uses the calculate tool

---

## Troubleshooting

### Issue: 404 on MCP Endpoint

**Symptom:**
```bash
curl https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
# 404 Not Found
```

**Cause:** Route `/api/mcp/service/[serviceId]/route.js` not created yet

**Fix:** Implement the service-specific MCP endpoint

---

### Issue: 404 on OAuth Discovery

**Symptom:**
```bash
curl https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6/.well-known/oauth-authorization-server
# 404 Not Found
```

**Cause:** `.well-known` routes at service level not created

**Fix:** Create discovery routes at service endpoint level

---

### Issue: Service Not Found

**Symptom:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Service not found or not published"
  }
}
```

**Possible Causes:**
1. Service was unpublished
2. Service ID typo
3. Redis connection issue

**Debug:**
```bash
# Check if service exists in Redis
redis-cli EXISTS "service:abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6:published"

# Should return: 1 (exists)
```

---

### Issue: OAuth Token Not Validated

**Symptom:**
```json
{
  "error": "Authentication required"
}
```

**Cause:** Service endpoint doesn't recognize OAuth token

**Fix:** Implement OAuth token validation in service endpoint (Critical Issue #3)

---

## Success Criteria

### ✅ Minimal Viable Implementation

- [ ] OAuth discovery returns correct metadata
- [ ] MCP endpoint responds to initialize
- [ ] MCP endpoint returns tools list
- [ ] Calculate tool works (at least with manual curl)

### ✅ Full Implementation

- [ ] Complete OAuth flow works (authorize → token → use)
- [ ] ChatGPT can connect and use service
- [ ] Claude Desktop can connect and use service
- [ ] All tools work (calculate, batch, save, load, list)
- [ ] Session management works
- [ ] Error messages are clear

### ✅ Production Ready

- [ ] Rate limiting works
- [ ] Analytics tracked
- [ ] Error handling comprehensive
- [ ] Documentation complete
- [ ] UI component integrated
- [ ] Multiple services can coexist

---

## Quick Reference

**Service ID:**
```
abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
```

**MCP URL:**
```
https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
```

**Test in ChatGPT:**
```
Settings → Add MCP Server → Paste URL above
```

**Test in Claude Desktop:**
```json
{
  "mcpServers": {
    "test": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/service/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6"
      }
    }
  }
}
```

---

**Testing Status:** Ready to begin after implementation
**Service Type:** Public (no token)
**Next Step:** Implement critical fixes, then run Phase 1 tests
