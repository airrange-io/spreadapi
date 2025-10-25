# ChatGPT User Connection Flow
**Complete Step-by-Step Guide**
**Date:** 2025-10-25

---

## Overview

This document explains the **complete user experience** when a ChatGPT user connects to SpreadAPI services using OAuth 2.1.

**Time to connect:** ~2-3 minutes
**User effort:** 5 clicks + sign-in
**Technical knowledge required:** None (it just works!)

---

## Phase 1: Discovery & Initial Setup

### Step 1: User Opens ChatGPT Settings
**User Action:** Opens ChatGPT → Settings → Developer

**What they see:**
```
┌─────────────────────────────────────┐
│ ChatGPT Settings                    │
├─────────────────────────────────────┤
│ General                             │
│ Data Controls                       │
│ ▶ Developer                         │ ← User clicks here
└─────────────────────────────────────┘
```

### Step 2: Add MCP Server
**User Action:** Clicks "Add MCP Server"

**What they see:**
```
┌─────────────────────────────────────┐
│ Add MCP Server                      │
├─────────────────────────────────────┤
│ Server URL:                         │
│ ┌─────────────────────────────────┐ │
│ │ https://spreadapi.io/api/mcp    │ │ ← User enters this
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]  [Add Server]              │
└─────────────────────────────────────┘
```

**User enters:** `https://spreadapi.io/api/mcp`

---

## Phase 2: OAuth Discovery (Automatic)

### Step 3: ChatGPT Discovers OAuth Support
**User sees:** "Connecting..." spinner

**What happens behind the scenes:**

**Request 1: Protected Resource Discovery**
```http
GET https://spreadapi.io/.well-known/oauth-protected-resource
```

**Response:**
```json
{
  "resource": "https://spreadapi.io/api/mcp",
  "authorization_servers": ["https://spreadapi.io"],
  "bearer_methods_supported": ["header"],
  "scopes_supported": ["mcp:read", "mcp:write"]
}
```

**Request 2: Authorization Server Discovery**
```http
GET https://spreadapi.io/.well-known/oauth-authorization-server
```

**Response:**
```json
{
  "issuer": "https://spreadapi.io",
  "authorization_endpoint": "https://spreadapi.io/oauth/authorize",
  "token_endpoint": "https://spreadapi.io/oauth/token",
  "jwks_uri": "https://cloud.hanko.io/.well-known/jwks.json",
  "grant_types_supported": ["authorization_code"],
  "response_types_supported": ["code"],
  "code_challenge_methods_supported": ["S256"],
  "scopes_supported": ["mcp:read", "mcp:write"]
}
```

**ChatGPT learns:**
- ✅ OAuth is required (not just API key)
- ✅ Authorization endpoint: `/oauth/authorize`
- ✅ Token endpoint: `/oauth/token`
- ✅ PKCE S256 is required

**User experience:** Still sees "Connecting..." (takes ~1 second)

---

## Phase 3: Authorization Flow

### Step 4: Generate PKCE Challenge (Client-Side)
**What ChatGPT does automatically:**

```javascript
// 1. Generate random code_verifier (43-128 chars)
const code_verifier = generateRandomString(128);
// Example: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

// 2. Create SHA-256 hash
const code_challenge = base64UrlEncode(
  sha256(code_verifier)
);
// Example: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

// 3. Store code_verifier for later
localStorage.setItem('pkce_verifier', code_verifier);
```

**User sees:** Nothing (happens instantly on client)

### Step 5: Redirect to Authorization Endpoint
**ChatGPT redirects user to:**

```
https://spreadapi.io/oauth/authorize?
  response_type=code&
  client_id=chatgpt_a1b2c3d4&
  redirect_uri=https://chatgpt.com/oauth/callback&
  scope=mcp:read+mcp:write&
  state=xyz789&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  code_challenge_method=S256
```

**User sees:** Browser opens SpreadAPI authorization page

---

## Phase 4: User Authorization (SpreadAPI Side)

### Step 6: Hanko Authentication
**User sees:** SpreadAPI authorization page

```
┌────────────────────────────────────────────┐
│  🔒 Sign in to SpreadAPI                  │
├────────────────────────────────────────────┤
│                                            │
│  ChatGPT wants to access your              │
│  spreadsheet calculation services          │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Sign in with:                       │ │
│  │                                      │ │
│  │  🔑 Passkey                          │ │ ← User can choose
│  │  📧 Email code                       │ │
│  │  🌐 Google / GitHub                 │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Secure passwordless authentication        │
│  powered by Hanko                          │
└────────────────────────────────────────────┘
```

**What happens:**

**If user is NOT logged in:**
1. User chooses authentication method (passkey/email/social)
2. User authenticates with Hanko
3. Hanko creates session → Sets cookie with JWT
4. Page continues to consent screen

**If user IS logged in:**
1. Hanko session already exists
2. Page immediately shows consent screen

---

### Step 7: Service Selection & Consent
**User sees:** Consent screen with service selection

```
┌────────────────────────────────────────────┐
│  🔓 Authorize ChatGPT                     │
├────────────────────────────────────────────┤
│                                            │
│  ChatGPT wants to access your MCP          │
│  services on SpreadAPI                     │
│                                            │
│  📋 Connection Details                     │
│  Client: ChatGPT (OpenAI)                  │
│  Permissions: mcp:read mcp:write           │
│                                            │
│  ─────────────────────────────────────────│
│                                            │
│  ✅ Select Services to Authorize           │
│                                            │
│  ☑ Mortgage Calculator                    │ ← User can select
│  ☑ Loan Payment Calculator                │
│  ☑ NPV Calculator                          │
│  ☐ Advanced Financial Models               │
│                                            │
│  Choose which services ChatGPT can access. │
│  You can change this later.                │
│                                            │
│  ─────────────────────────────────────────│
│                                            │
│  🔒 Security & Privacy                     │
│  • ChatGPT only accesses selected services │
│  • Your credentials are never shared       │
│  • Each authorization gets unique token    │
│  • Tokens expire with your session         │
│  • Revoke access anytime                   │
│                                            │
│  ─────────────────────────────────────────│
│                                            │
│  [Deny]              [Authorize] ✓         │ ← User clicks
└────────────────────────────────────────────┘
```

**User clicks:** "Authorize" button

---

### Step 8: Generate Authorization Code (Backend)
**What happens when user clicks "Authorize":**

**Frontend sends:**
```javascript
POST /api/oauth/authorize
Content-Type: application/json

{
  "user_id": "hanko_user_abc123",
  "client_id": "chatgpt_a1b2c3d4",
  "redirect_uri": "https://chatgpt.com/oauth/callback",
  "scope": "mcp:read mcp:write",
  "code_challenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  "code_challenge_method": "S256",
  "service_ids": ["mortgage_calc", "loan_calc", "npv_calc"]
}
```

**Backend processes:**
1. ✅ Validates user is authenticated (checks Hanko cookie)
2. ✅ Validates redirect_uri is from ChatGPT
3. ✅ Validates PKCE code_challenge format
4. ✅ Generates authorization code: `ac_[64-char-random]`
5. ✅ Stores in Redis:

```javascript
// Redis: oauth:code:ac_xyz789...
{
  user_id: "hanko_user_abc123",
  client_id: "chatgpt_a1b2c3d4",
  redirect_uri: "https://chatgpt.com/oauth/callback",
  scope: "mcp:read mcp:write",
  code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  code_challenge_method: "S256",
  service_ids: ["mortgage_calc", "loan_calc", "npv_calc"],
  created_at: 1729900000000
}
// TTL: 600 seconds (10 minutes)
```

6. ✅ Stores Hanko JWT temporarily:
```javascript
// Redis: oauth:hanko_token:ac_xyz789...
"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYW5rb191c2VyX2FiYzEyMyIsImV4cCI6MTcyOTk0MzIwMH0..."
// TTL: 600 seconds (10 minutes)
```

**Backend responds:**
```json
{
  "code": "ac_xyz789abc123def456..."
}
```

---

### Step 9: Redirect Back to ChatGPT
**What happens:**

**Frontend redirects user:**
```javascript
window.location.href =
  "https://chatgpt.com/oauth/callback?" +
  "code=ac_xyz789abc123def456..." +
  "&state=xyz789";
```

**User sees:**
- Brief redirect (< 1 second)
- Returns to ChatGPT
- Loading spinner

---

## Phase 5: Token Exchange (ChatGPT Side)

### Step 10: Exchange Authorization Code for Token
**What ChatGPT does automatically:**

**Request:**
```http
POST /api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=ac_xyz789abc123def456...&
client_id=chatgpt_a1b2c3d4&
redirect_uri=https://chatgpt.com/oauth/callback&
code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

**Backend validates:**
1. ✅ Rate limiting (10 req/min per IP)
2. ✅ Authorization code exists and not expired
3. ✅ client_id matches
4. ✅ redirect_uri matches
5. ✅ PKCE verification:
   ```javascript
   // Verify: sha256(code_verifier) === code_challenge
   const hash = sha256(code_verifier).base64url();
   assert(hash === "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
   ```
6. ✅ Retrieves stored Hanko JWT
7. ✅ Verifies Hanko JWT is still valid
8. ✅ Verifies JWT belongs to same user
9. ✅ Generates unique OAuth access token: `oat_[64-char-random]`
10. ✅ Stores OAuth token metadata in Redis:

```javascript
// Redis: oauth:token:oat_abc123...
{
  hanko_jwt: "eyJhbGci...",
  client_id: "chatgpt_a1b2c3d4",
  user_id: "hanko_user_abc123",
  scope: "mcp:read mcp:write",
  service_ids: ["mortgage_calc", "loan_calc", "npv_calc"],
  authorized_at: 1729900000000
}
// TTL: Dynamic (matches Hanko JWT expiry, up to 12h)

// Redis: user:hanko_user_abc123:oauth_tokens
Set["oat_abc123..."]
// TTL: Same as OAuth token
```

11. ✅ Deletes authorization code (one-time use)
12. ✅ Deletes temp Hanko token storage

**Backend responds:**
```json
{
  "access_token": "oat_abc123def456...",
  "token_type": "Bearer",
  "expires_in": 43200,
  "scope": "mcp:read mcp:write"
}
```

**User sees:** Still loading spinner

---

## Phase 6: Service Discovery

### Step 11: ChatGPT Discovers Available Tools
**What ChatGPT does automatically:**

**Request:**
```http
POST /api/mcp
Authorization: Bearer oat_abc123def456...
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Backend validates token:**
```javascript
// lib/mcp-auth.js
const token = "oat_abc123def456...";

// 1. Detect token type (starts with 'oat_')
// 2. Load OAuth metadata from Redis
const metadata = await redis.hGetAll(`oauth:token:${token}`);

// 3. Verify underlying Hanko JWT still valid
await verifyHankoJWT(metadata.hanko_jwt);

// 4. Parse service permissions
const serviceIds = JSON.parse(metadata.service_ids);
// ["mortgage_calc", "loan_calc", "npv_calc"]

// 5. Filter tools based on authorized services
```

**Backend responds:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "calculate_mortgage",
        "description": "Calculate monthly mortgage payments",
        "inputSchema": {
          "type": "object",
          "properties": {
            "principal": { "type": "number" },
            "rate": { "type": "number" },
            "years": { "type": "number" }
          }
        }
      },
      {
        "name": "calculate_loan_payment",
        "description": "Calculate loan payment schedule",
        "inputSchema": { ... }
      },
      {
        "name": "calculate_npv",
        "description": "Calculate Net Present Value",
        "inputSchema": { ... }
      }
      // Note: "Advanced Financial Models" NOT included
      // because user didn't authorize it
    ]
  },
  "id": 1
}
```

**ChatGPT learns:** These 3 tools are available

**User sees:** Connection success message!

```
┌────────────────────────────────────────────┐
│ ✓ SpreadAPI Connected                     │
├────────────────────────────────────────────┤
│ Available tools:                           │
│ • Mortgage Calculator                      │
│ • Loan Payment Calculator                  │
│ • NPV Calculator                           │
└────────────────────────────────────────────┘
```

---

## Phase 7: Using the Service

### Step 12: User Makes First Request
**User types in ChatGPT:**
```
"Calculate the monthly payment for a $300,000 loan at 5%
interest over 30 years"
```

**ChatGPT decides:** Use `calculate_mortgage` tool

**Request:**
```http
POST /api/mcp
Authorization: Bearer oat_abc123def456...
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "calculate_mortgage",
    "arguments": {
      "principal": 300000,
      "rate": 5.0,
      "years": 30
    }
  },
  "id": 2
}
```

**Backend:**
1. ✅ Validates OAuth token (same process as Step 11)
2. ✅ Verifies "mortgage_calc" in authorized services
3. ✅ Executes calculation
4. ✅ Returns result

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Monthly Payment: $1,610.46\nTotal Interest: $279,767.35\nTotal Amount: $579,767.35"
    }]
  },
  "id": 2
}
```

**ChatGPT shows user:**
```
Based on your loan parameters:
- Principal: $300,000
- Interest Rate: 5% per year
- Term: 30 years

Your monthly payment would be $1,610.46.

Over the life of the loan, you'll pay $279,767.35 in
interest, for a total of $579,767.35.
```

**User:** 🎉 Success!

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ ChatGPT User                                                    │
└───────┬─────────────────────────────────────────────────────────┘
        │
        │ 1. Opens ChatGPT Settings
        │ 2. Adds MCP Server URL
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ ChatGPT (Automatic)                                             │
├─────────────────────────────────────────────────────────────────┤
│ 3. GET /.well-known/oauth-protected-resource                   │
│ 4. GET /.well-known/oauth-authorization-server                 │
│ 5. Generates PKCE challenge                                     │
│ 6. Redirects to /oauth/authorize?code_challenge=...            │
└───────┬─────────────────────────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ SpreadAPI Authorization Page                                    │
├─────────────────────────────────────────────────────────────────┤
│ 7. User signs in with Hanko (passkey/email/social)            │
│ 8. User selects which services to authorize                    │
│ 9. User clicks "Authorize"                                     │
│                                                                 │
│ Backend:                                                        │
│ 10. POST /api/oauth/authorize                                  │
│     → Generates authorization code                             │
│     → Stores in Redis (10 min TTL)                            │
│ 11. Redirects to ChatGPT with code                            │
└───────┬─────────────────────────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ ChatGPT (Automatic)                                             │
├─────────────────────────────────────────────────────────────────┤
│ 12. POST /api/oauth/token                                      │
│     → code + code_verifier (PKCE)                             │
│                                                                 │
│ Backend:                                                        │
│ 13. Validates authorization code                               │
│ 14. Verifies PKCE                                              │
│ 15. Generates OAuth access token (oat_...)                    │
│ 16. Stores token metadata in Redis                            │
│ 17. Returns access_token                                       │
│                                                                 │
│ 18. POST /api/mcp (tools/list)                                │
│     Authorization: Bearer oat_...                              │
│                                                                 │
│ Backend:                                                        │
│ 19. Validates OAuth token                                      │
│ 20. Filters tools by authorized services                      │
│ 21. Returns available tools                                    │
└───────┬─────────────────────────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Connected! User can now use services                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Features (User Perspective)

### What Users See & Understand

**1. Passwordless Authentication**
```
✓ No passwords to remember
✓ Use passkeys (Face ID / Touch ID)
✓ Or email magic links
✓ Or social login (Google / GitHub)
```

**2. Granular Permissions**
```
✓ Choose exactly which calculators to share
✓ Not all-or-nothing
✓ Can authorize different services for different purposes
```

**3. Transparency**
```
✓ Clear consent screen
✓ See exactly what ChatGPT can access
✓ Know when authorization expires
✓ Can revoke anytime
```

**4. Security Guarantees**
```
✓ Credentials never shared with ChatGPT
✓ Each connection gets unique token
✓ Tokens expire automatically
✓ Logout revokes all access
```

---

## Error Scenarios (User Perspective)

### Scenario 1: User Denies Authorization
**User clicks:** "Deny" button

**What happens:**
1. Redirect to ChatGPT with error
2. ChatGPT shows: "Authorization declined"
3. MCP server not added
4. User can try again later

### Scenario 2: No Published Services
**User tries to authorize but has no services**

**What they see:**
```
┌────────────────────────────────────────────┐
│ ⚠ No Published Services                   │
├────────────────────────────────────────────┤
│ You need to publish at least one service   │
│ before authorizing ChatGPT.                │
│                                            │
│ [Go to Services] [Cancel]                  │
└────────────────────────────────────────────┘
```

### Scenario 3: Session Expired
**User takes >10 minutes to authorize**

**What happens:**
1. User clicks "Authorize"
2. Backend finds authorization code expired
3. Shows error: "Session expired, please try again"
4. User restarts from step 1

### Scenario 4: Rate Limited
**User tries to authorize >10 times in 1 minute**

**What they see:**
```
┌────────────────────────────────────────────┐
│ ⚠ Too Many Requests                       │
├────────────────────────────────────────────┤
│ Please wait 60 seconds before trying again.│
│                                            │
│ Retry in: 45 seconds                       │
└────────────────────────────────────────────┘
```

### Scenario 5: Token Expired
**User's session expires (12 hours later)**

**What happens:**
1. ChatGPT tries to call MCP endpoint
2. Backend validates OAuth token → Hanko JWT expired
3. Returns 401 Unauthorized
4. ChatGPT shows: "Authorization expired. Please reconnect."
5. User goes through authorization flow again

---

## Revocation Flow (User Initiated)

### User Wants to Disconnect ChatGPT

**Option 1: From ChatGPT**
```
ChatGPT Settings → Developer → MCP Servers
  → SpreadAPI [Connected]
    → [Remove Server]
```

**What happens:**
- ChatGPT deletes OAuth token locally
- Stops calling MCP endpoints
- Token still valid in Redis until expiry

**Option 2: From SpreadAPI (Future Feature)**
```
SpreadAPI → Profile → Connected Apps
  → ChatGPT [Connected]
    → [Revoke Access]
```

**What happens:**
- Frontend calls revocation endpoint
- Backend deletes OAuth token from Redis
- ChatGPT's requests immediately fail with 401

**Option 3: Logout from SpreadAPI**
```
SpreadAPI → [Logout]
```

**What happens (automatic):**
1. Frontend calls logout
2. Backend revokes ALL OAuth tokens for user
3. ChatGPT's requests immediately fail with 401
4. User must reauthorize if they log back in

---

## Performance Metrics (User Experience)

| Step | Duration | User Waits? |
|------|----------|-------------|
| Add MCP Server | 1s | Yes (typing) |
| OAuth Discovery | 1s | Yes (spinner) |
| Redirect to Auth | <1s | Yes (redirect) |
| Hanko Sign-in | 5-30s | Yes (authentication) |
| Select Services | 10-30s | Yes (choosing) |
| Generate Code | <1s | No (automatic) |
| Redirect to ChatGPT | <1s | Yes (redirect) |
| Token Exchange | <1s | No (automatic) |
| Tool Discovery | <1s | No (automatic) |
| **Total** | **20-65s** | **~30s active** |

**User perception:** "Takes about a minute to set up"

---

## Comparison: Before vs After OAuth

### Before (If using API keys manually)
```
1. User signs up to SpreadAPI
2. User navigates to API settings
3. User generates API key
4. User copies API key
5. User opens ChatGPT
6. User configures custom action
7. User pastes API key in ChatGPT
8. User tests connection
9. User configures each endpoint manually

Total time: 10-15 minutes
Technical knowledge: Medium-High
Error prone: Yes (copy-paste, config errors)
```

### After (With OAuth)
```
1. User opens ChatGPT settings
2. User adds MCP server URL
3. User authorizes via Hanko
4. User selects services
5. Done!

Total time: 2-3 minutes
Technical knowledge: None
Error prone: No (automated)
```

**OAuth is 5× faster and requires ZERO technical knowledge!**

---

## Summary: User Perspective

### What Users Love ✓
- ✅ **Easy:** Just add URL, sign in, authorize
- ✅ **Fast:** Connected in 2-3 minutes
- ✅ **Secure:** Passwordless + granular permissions
- ✅ **Transparent:** Clear what ChatGPT can access
- ✅ **Flexible:** Choose which services to share
- ✅ **Automatic:** No API keys to manage

### What Users Don't See (But Benefits Them)
- ✅ PKCE prevents authorization code interception
- ✅ Rate limiting prevents abuse
- ✅ Token expiry enforces security
- ✅ Automatic revocation on logout
- ✅ Unique tokens per authorization
- ✅ Service-level permission enforcement

### Bottom Line
**User experience:** "It just works!" ✨

**Time to value:** < 3 minutes from "Add MCP Server" to first calculation

**Support burden:** Minimal (OAuth handles complexity)

---

**Documentation:** Complete user flow documented
**Date:** 2025-10-25
**Next:** Test with real ChatGPT Developer Mode
