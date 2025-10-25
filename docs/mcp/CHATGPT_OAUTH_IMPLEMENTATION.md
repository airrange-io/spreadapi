# ChatGPT OAuth Implementation - Architecture & Implementation Guide

**Status:** 🚧 In Progress
**Last Updated:** 2025-10-25
**Author:** Senior Developer - AI & OAuth Specialist

---

## Executive Summary

This document outlines the implementation of OAuth 2.1 Authorization Code flow with PKCE to enable ChatGPT Developer Mode to connect to SpreadAPI's MCP services. The implementation leverages Hanko.io for authentication and JWT management, minimizing custom code while maintaining security and ease of use.

**Key Principles:**
- ✅ Leverage Hanko.io for all authentication and JWT handling
- ✅ Keep it simple and maintainable
- ✅ Make the user experience seamless
- ✅ No over-engineering
- ✅ Remove old client credentials flow (not needed)

---

## Architecture Overview

### High-Level Flow

```
┌─────────────┐
│   ChatGPT   │
└──────┬──────┘
       │ 1. Discover OAuth server
       ├──────────────────────────────────────────────┐
       │                                              │
       │ GET /.well-known/oauth-protected-resource    │
       │ GET /.well-known/oauth-authorization-server  │
       │                                              │
       ├──────────────────────────────────────────────┘
       │
       │ 2. Authorization Code Flow (with PKCE)
       ├──────────────────────────────────────────────┐
       │                                              │
       │ GET /oauth/authorize                         │
       │   ?client_id=<uuid>                          │
       │   &redirect_uri=https://chatgpt.com/...      │
       │   &response_type=code                        │
       │   &scope=mcp:read mcp:write                  │
       │   &state=<csrf_token>                        │
       │   &code_challenge=<pkce_challenge>           │
       │   &code_challenge_method=S256                │
       │                                              │
       └──────────────┬───────────────────────────────┘
                      │
              ┌───────▼────────┐
              │  User Browser  │
              └───────┬────────┘
                      │
                      │ If not authenticated:
                      ├────────────────────────┐
                      │                        │
                ┌─────▼──────┐          ┌──────▼──────┐
                │   Hanko    │          │  SpreadAPI  │
                │   Login    │◄────────►│   UI Page   │
                └─────┬──────┘          └──────┬──────┘
                      │                        │
                      │ After Hanko auth:      │
                      └────────────────────────┘
                                 │
                          Show Consent Screen
                          (Select Services)
                                 │
                          User Approves
                                 │
                   ┌──────────────▼───────────────┐
                   │  Generate Authorization Code │
                   │  Store in Redis:             │
                   │   - user_id (from Hanko)     │
                   │   - client_id                │
                   │   - code_challenge (PKCE)    │
                   │   - selected service_ids     │
                   │   - scope                    │
                   │  Expiry: 10 minutes          │
                   └──────────────┬───────────────┘
                                  │
                      Redirect to ChatGPT with code
                                  │
       ┌──────────────────────────▼──────────┐
       │                                     │
       │ POST /oauth/token                   │
       │   grant_type=authorization_code     │
       │   code=<authorization_code>         │
       │   client_id=<uuid>                  │
       │   code_verifier=<pkce_verifier>     │
       │   redirect_uri=https://chatgpt.com  │
       │                                     │
       └──────────────┬──────────────────────┘
                      │
              Validate & Exchange
                      │
              ┌───────▼────────┐
              │  Return Token  │
              │  {             │
              │   access_token │
              │   token_type   │
              │   expires_in   │
              │   scope        │
              │  }             │
              └───────┬────────┘
                      │
       Use token for MCP requests
       Authorization: Bearer <token>
```

### Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                    SpreadAPI                        │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │         OAuth Discovery Layer              │   │
│  │  /.well-known/oauth-protected-resource     │   │
│  │  /.well-known/oauth-authorization-server   │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │      Authorization Endpoint (NEW)          │   │
│  │                                            │   │
│  │  /oauth/authorize                          │   │
│  │    ├─ Hanko Login (if not authenticated)  │   │
│  │    ├─ Consent Screen (service selection)  │   │
│  │    └─ Authorization Code Generation        │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │       Token Endpoint (ENHANCED)            │   │
│  │                                            │   │
│  │  /oauth/token                              │   │
│  │    ├─ PKCE Validation                      │   │
│  │    ├─ Code Exchange                        │   │
│  │    └─ Create Access Token                  │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │          MCP Bridge (EXISTING)             │   │
│  │                                            │   │
│  │  /api/mcp                                  │   │
│  │  /api/mcp/bridge                           │   │
│  │    └─ Updated: Validate OAuth tokens       │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              External Services                       │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │             Hanko.io                       │   │
│  │                                            │   │
│  │  ├─ User Authentication                    │   │
│  │  ├─ JWT Issuance (with custom claims)     │   │
│  │  ├─ JWKS Endpoint (.well-known/jwks.json) │   │
│  │  └─ Session Management                     │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │              Redis                         │   │
│  │                                            │   │
│  │  ├─ Authorization Codes (10 min TTL)      │   │
│  │  ├─ OAuth Client Metadata                  │   │
│  │  └─ Token Mappings (optional)              │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. OAuth Discovery Endpoints

**Purpose:** Tell ChatGPT where to find our OAuth server and what it supports.

**Endpoints:**
- `/.well-known/oauth-protected-resource` - Protected resource metadata (RFC 9728)
- `/.well-known/oauth-authorization-server` - Authorization server metadata (RFC 8414)

**Implementation:**
- Simple static JSON responses
- No authentication required
- Point to Hanko's JWKS endpoint

### 2. Authorization Flow

**Endpoint:** `/oauth/authorize`

**User Journey:**
1. ChatGPT redirects user to `/oauth/authorize?client_id=...&redirect_uri=...&...`
2. If user not logged in → Show Hanko login UI
3. After Hanko authentication → Show consent screen
4. User selects which MCP services to allow
5. User approves → Generate authorization code
6. Redirect back to ChatGPT with code

**Security:**
- PKCE required (S256 method)
- State parameter for CSRF protection
- Authorization codes expire in 10 minutes
- One-time use only

### 3. Token Exchange

**Endpoint:** `/oauth/token`

**Flow:**
1. ChatGPT sends authorization code + PKCE verifier
2. Validate code exists and hasn't expired
3. Verify PKCE challenge matches verifier
4. Verify client_id and redirect_uri match
5. Get user's Hanko session/JWT
6. Add custom claims (service permissions, client_id)
7. Return enhanced JWT as access_token

**Token Format:**
```json
{
  "access_token": "eyJhbGc...",  // Hanko JWT with custom claims
  "token_type": "Bearer",
  "expires_in": 43200,            // 12 hours (Hanko default)
  "scope": "mcp:read mcp:write"
}
```

**JWT Claims:**
```json
{
  // Standard Hanko claims
  "sub": "user_id_from_hanko",
  "iss": "https://hanko.io",
  "aud": "https://spreadapi.io",
  "exp": 1234567890,
  "iat": 1234567890,

  // Custom claims (added by SpreadAPI)
  "scope": "mcp:read mcp:write",
  "client_id": "chatgpt-uuid",
  "service_ids": ["service1", "service2"],  // User-selected services
  "oauth_authorized": true
}
```

### 4. MCP Request Validation

**Flow:**
1. ChatGPT calls MCP endpoint with `Authorization: Bearer <token>`
2. Middleware extracts JWT
3. Validate JWT signature via Hanko's JWKS
4. Check `oauth_authorized` claim exists
5. Extract `service_ids` from claims
6. Only show tools for authorized services

---

## Data Models

### Authorization Code (Redis)

**Key:** `oauth:code:{code}`
**TTL:** 600 seconds (10 minutes)

```javascript
{
  user_id: "hanko_user_id",
  client_id: "uuid-from-chatgpt",
  redirect_uri: "https://chatgpt.com/oauth/callback",
  scope: "mcp:read mcp:write",
  code_challenge: "base64url_encoded_challenge",
  code_challenge_method: "S256",
  service_ids: ["service1", "service2"],  // JSON array
  created_at: "timestamp"
}
```

### OAuth Client (Redis) - OPTIONAL

If we want to track which ChatGPT instances connected:

**Key:** `oauth:client:{client_id}`
**TTL:** None (persistent)

```javascript
{
  client_id: "uuid",
  client_name: "ChatGPT",
  user_id: "hanko_user_id",
  first_authorized: "timestamp",
  last_used: "timestamp"
}
```

---

## Leveraging Hanko.io

### What Hanko Provides (Already Implemented)

✅ **User Authentication**
- Passwordless login (passkeys, email codes)
- OAuth social login (Google, GitHub, etc.)
- Session management
- User database

✅ **JWT Management**
- JWT issuance with standard claims
- RS256 signature algorithm
- Public key distribution via JWKS
- Custom claims support (via config)

✅ **Security**
- CSRF protection
- Session validation
- Token expiration

### What We Build (Minimal OAuth Wrapper)

🔨 **OAuth Discovery**
- Two static JSON endpoints
- Point to Hanko's JWKS

🔨 **Authorization Endpoint**
- UI page with Hanko web component
- Consent screen (service selection)
- Authorization code generation

🔨 **Token Enhancement**
- Get user's Hanko JWT
- Add custom claims (service_ids, scope)
- Return enhanced JWT

🔨 **MCP Auth Update**
- Read service_ids from JWT claims
- Filter tools based on permissions

---

## File Structure

```
/Users/stephanmethner/AR/repos/spreadapi/
│
├── app/
│   ├── api/
│   │   ├── .well-known/
│   │   │   ├── oauth-protected-resource/
│   │   │   │   └── route.js                    # NEW: Protected resource metadata
│   │   │   └── oauth-authorization-server/
│   │   │       └── route.js                    # NEW: Authorization server metadata
│   │   │
│   │   ├── oauth/
│   │   │   ├── authorize/
│   │   │   │   └── route.js                    # NEW: Backend for authorization endpoint
│   │   │   └── token/
│   │   │       └── route.js                    # NEW: Token exchange (replaces old one)
│   │   │
│   │   └── mcp/
│   │       ├── route.js                        # EXISTING: MCP streamable HTTP
│   │       ├── bridge/
│   │       │   └── route.js                    # UPDATE: Add OAuth token support
│   │       └── oauth/                          # DELETE: Old client credentials flow
│   │           └── token/
│   │               └── route.js                # TO BE REMOVED
│   │
│   ├── oauth/
│   │   └── authorize/
│   │       └── page.tsx                        # NEW: Authorization UI (Hanko + Consent)
│   │
│   └── components/
│       └── MCPSettingsModal.tsx                # UPDATE: New ChatGPT instructions
│
├── lib/
│   ├── oauth-codes.js                          # NEW: Authorization code management
│   ├── mcp-auth.js                             # UPDATE: Add OAuth JWT validation
│   └── hanko-jwt.js                            # NEW: Hanko JWT utilities
│
└── docs/
    └── mcp/
        ├── CHATGPT_OAUTH_IMPLEMENTATION.md     # THIS FILE
        ├── CHATGPT_SETUP_GUIDE.md              # UPDATE: Correct user instructions
        ├── CHATGPT_OAUTH_SUMMARY.md            # DELETE: Outdated
        └── OAUTH_IMPLEMENTATION.md             # DELETE: Outdated
```

---

## Implementation Steps

### Step 1: Remove Old OAuth Implementation ✅

**Files to Delete:**
- `/app/api/mcp/oauth/token/route.js` (client credentials flow)
- `/docs/mcp/CHATGPT_OAUTH_SUMMARY.md` (outdated)
- `/docs/mcp/OAUTH_IMPLEMENTATION.md` (outdated)

**Files to Update:**
- Remove ChatGPT instructions from `MCPSettingsModal.tsx` (temporarily)

### Step 2: Create OAuth Discovery Endpoints

**File:** `/.well-known/oauth-protected-resource/route.js`
**File:** `/.well-known/oauth-authorization-server/route.js`

**Testing:**
```bash
curl https://spreadapi.io/.well-known/oauth-protected-resource
curl https://spreadapi.io/.well-known/oauth-authorization-server
```

### Step 3: Build Authorization Endpoint

**Backend:** `/api/oauth/authorize/route.js`
- Accept OAuth parameters
- Validate parameters
- Generate authorization code
- Store in Redis

**Frontend:** `/oauth/authorize/page.tsx`
- Hanko login component
- Consent screen with service selection
- Approval/denial flow

**Testing:**
- Navigate to `/oauth/authorize?client_id=test&redirect_uri=http://localhost&...`
- Should show Hanko login → Consent screen → Redirect with code

### Step 4: Implement Token Exchange

**File:** `/api/oauth/token/route.js`
- Validate authorization code
- Verify PKCE
- Get Hanko user session
- Generate enhanced JWT
- Return access token

**Testing:**
```bash
curl -X POST https://spreadapi.io/oauth/token \
  -d "grant_type=authorization_code&code=...&client_id=...&code_verifier=..."
```

### Step 5: Update MCP Auth Middleware

**File:** `/lib/mcp-auth.js`
- Add OAuth JWT validation
- Extract service_ids from claims
- Use for permission checking

**File:** `/app/api/mcp/bridge/route.js`
- Check OAuth authorization
- Filter tools by service_ids

### Step 6: Update User Documentation

**File:** `/app/components/MCPSettingsModal.tsx`
- Update ChatGPT instructions
- Add screenshots/examples
- Simplify configuration steps

### Step 7: Testing

- Manual test with curl
- Test with ChatGPT Developer Mode
- Verify tool discovery
- Test tool execution
- Check error handling

---

## Security Considerations

### PKCE (Proof Key for Code Exchange)

**Why:** Prevents authorization code interception attacks

**Implementation:**
1. ChatGPT generates random `code_verifier`
2. ChatGPT creates `code_challenge` = base64url(sha256(code_verifier))
3. ChatGPT sends `code_challenge` in authorize request
4. We store `code_challenge` with authorization code
5. ChatGPT sends `code_verifier` in token request
6. We hash verifier and compare with stored challenge

### State Parameter

**Why:** CSRF protection

**Implementation:**
1. ChatGPT generates random `state`
2. ChatGPT includes in authorize request
3. We return same `state` in redirect
4. ChatGPT verifies state matches

### Authorization Code Expiry

**Why:** Limit attack window

**Implementation:**
- 10-minute TTL in Redis
- One-time use (deleted after exchange)

### Token Validation

**Why:** Ensure tokens are authentic

**Implementation:**
- JWT signature verification via Hanko JWKS
- Expiration check
- Audience claim validation

---

## User Experience Flow

### For End Users (ChatGPT Users)

1. Open ChatGPT → Settings → Connectors → Add Connector
2. Enter: `https://spreadapi.io/api/mcp`
3. Select "OAuth" authentication
4. Click "Connect"
5. → Redirected to SpreadAPI
6. → See Hanko login (if not logged in)
7. → Login with email/passkey
8. → See consent screen: "ChatGPT wants to access these services:"
9. → Select which MCP services to allow
10. → Click "Authorize"
11. → Redirected back to ChatGPT
12. ✅ Connection successful
13. Start using MCP tools in conversation

**Total clicks:** ~5
**Time:** ~30 seconds

---

## Maintenance Considerations

### Minimal Code Surface

- **3 new endpoints** (discovery × 2, authorize × 1)
- **1 enhanced endpoint** (token)
- **1 UI page** (authorize page)
- **2 utility files** (oauth-codes, hanko-jwt)

### Dependencies

**External:**
- Hanko.io (authentication, JWT, JWKS) ← Already in use
- Redis (authorization codes) ← Already in use

**No new dependencies added**

### Monitoring

**Key Metrics:**
- Authorization attempts
- Authorization success rate
- Token exchanges
- Failed PKCE validations
- Active OAuth clients

**Logging:**
```javascript
console.log('[OAuth] Authorization request:', { client_id, scope });
console.log('[OAuth] Code generated for user:', user_id);
console.log('[OAuth] Token exchanged for client:', client_id);
console.log('[OAuth] PKCE validation failed for code:', code);
```

---

## Testing Strategy

### Unit Tests

- PKCE validation logic
- Authorization code generation
- JWT claim manipulation

### Integration Tests

- Full authorization flow
- Token exchange with real Hanko JWT
- MCP request with OAuth token

### Manual Testing

- ChatGPT Developer Mode connection
- Service permission filtering
- Token expiration handling
- Error cases (denied consent, expired code, etc.)

---

## Rollout Plan

### Phase 1: Development (This PR)

- Implement OAuth endpoints
- Update MCP auth
- Update documentation

### Phase 2: Internal Testing

- Test with curl
- Test with ChatGPT on staging
- Verify all error cases

### Phase 3: Production Deploy

- Deploy to Vercel
- Update user documentation
- Announce in release notes

### Phase 4: Monitor

- Watch for errors
- Collect user feedback
- Iterate on UX

---

## Future Enhancements (Not in Scope)

- ❌ Refresh tokens (Hanko sessions are long-lived)
- ❌ Token revocation endpoint (can manage via Hanko)
- ❌ Dynamic client registration (accept any client_id)
- ❌ Multiple scopes (start with mcp:read mcp:write)
- ❌ Consent management UI (one-time consent is sufficient)

---

## Open Questions

1. **Should we persist OAuth client information?**
   - Decision: No, keep it stateless. Only store authorization codes temporarily.

2. **How to handle Hanko JWT expiration?**
   - Decision: Use Hanko's default session duration (12 hours). ChatGPT will re-authorize when expired.

3. **Should users be able to revoke ChatGPT access?**
   - Decision: Phase 2 feature. For now, revoking Hanko session logs out everywhere.

4. **Do we need different scopes for read vs write?**
   - Decision: Start with single scope "mcp:read mcp:write". Refine later if needed.

---

## Implementation Progress

- [x] Documentation created
- [x] Old OAuth removed (client credentials flow deleted)
- [x] Discovery endpoints implemented
- [x] Authorization endpoint implemented
- [x] Token exchange implemented
- [x] MCP auth updated
- [x] UI instructions updated
- [ ] End-to-end testing completed

### Step 1 Completed ✅ (2025-10-25)

**Files Removed:**
- `/app/api/mcp/oauth/token/route.js` - Old client credentials endpoint
- `/docs/mcp/CHATGPT_OAUTH_SUMMARY.md` - Outdated documentation
- `/docs/mcp/OAUTH_IMPLEMENTATION.md` - Outdated documentation

**Files Updated:**
- `/app/components/MCPSettingsModal.tsx` - Replaced incorrect ChatGPT instructions with "Coming Soon" message

### Step 2 Completed ✅ (2025-10-25)

**Files Created:**
- `/app/api/.well-known/oauth-protected-resource/route.js` - Protected resource metadata (RFC 9728)
- `/app/api/.well-known/oauth-authorization-server/route.js` - Authorization server metadata (RFC 8414)
- `/lib/oauth-codes.js` - Authorization code management utilities
- `/lib/hanko-jwt.js` - Hanko JWT verification and OAuth token utilities

**Endpoints Available:**
- `GET /.well-known/oauth-protected-resource` - Returns MCP resource metadata
- `GET /.well-known/oauth-authorization-server` - Returns OAuth server configuration

**Testing:**
```bash
# Test discovery endpoints
curl https://spreadapi.io/.well-known/oauth-protected-resource
curl https://spreadapi.io/.well-known/oauth-authorization-server
```

### Step 3 Completed ✅ (2025-10-25)

**Files Created:**
- `/app/oauth/authorize/page.tsx` - Authorization UI with Hanko login + consent screen
- `/app/api/oauth/authorize/route.js` - Backend API for generating authorization codes

**Features Implemented:**
- Hanko passwordless authentication integration
- Service selection with checkboxes (pre-selects all by default)
- PKCE parameter validation
- Redirect URI whitelist (ChatGPT domains only)
- Authorization code generation with 10-minute expiry
- User consent flow with approve/deny options
- Privacy & security information display

**User Flow:**
1. ChatGPT redirects to `/oauth/authorize?client_id=...&redirect_uri=...&code_challenge=...`
2. User sees Hanko login (if not authenticated)
3. User authenticates via passkey/email/social
4. User sees consent screen with list of published services
5. User selects which services to authorize
6. User clicks "Authorize"
7. Backend generates authorization code
8. User is redirected to ChatGPT with code

### Step 4 Completed ✅ (2025-10-25)

**Files Created:**
- `/app/api/oauth/token/route.js` - Token exchange endpoint with PKCE validation

**Files Updated:**
- `/app/api/oauth/authorize/route.js` - Now stores Hanko token with authorization code

**Features Implemented:**
- Authorization code validation and one-time use enforcement
- PKCE code_verifier verification (SHA-256)
- client_id and redirect_uri matching
- Hanko JWT token retrieval and validation
- OAuth metadata storage in Redis (service permissions)
- Token expiry calculation
- Standard OAuth error responses

**Token Exchange Flow:**
1. ChatGPT sends: `POST /oauth/token` with authorization code + PKCE verifier
2. Backend validates code exists and hasn't expired
3. Backend verifies PKCE challenge matches verifier
4. Backend retrieves user's Hanko JWT
5. Backend stores OAuth metadata (service_ids, client_id, scope)
6. Backend deletes authorization code (one-time use)
7. Backend returns Hanko JWT as access_token

**OAuth Metadata Storage:**
```javascript
// Stored in Redis for each OAuth token
{
  client_id: "chatgpt-uuid",
  user_id: "hanko_user_id",
  scope: "mcp:read mcp:write",
  service_ids: ["service1", "service2"],
  authorized_at: "timestamp"
}
```

### Step 5 Completed ✅ (2025-10-25)

**Files Updated:**
- `/lib/mcp-auth.js` - Added OAuth token validation support

**Features Implemented:**
- OAuth token validation function (`validateOAuthToken`)
- Hanko JWT verification with JWKS
- OAuth metadata retrieval from Redis
- Service permission enforcement
- Token type detection (MCP vs OAuth)
- Dual authentication support in middleware

**MCP Auth Middleware Update:**
```javascript
export async function mcpAuthMiddleware(request) {
  const token = authHeader?.substring(7);

  let validation;
  if (token.startsWith('spapi_live_')) {
    // MCP token (Claude Desktop)
    validation = await validateToken(token);
  } else if (token.startsWith('eyJ')) {
    // JWT (OAuth token from ChatGPT)
    validation = await validateOAuthToken(token);
  }

  return {
    valid: validation.valid,
    userId: validation.userId,
    serviceIds: validation.serviceIds,
    isOAuth: validation.isOAuth || false
  };
}
```

**Key Benefits:**
- Single middleware supports both Claude Desktop and ChatGPT
- Automatic token type detection
- Service-level permission filtering
- No breaking changes to existing MCP token functionality

### Step 6 Completed ✅ (2025-10-25)

**Files Updated:**
- `/app/components/MCPSettingsModal.tsx` - Replaced "Coming Soon" with comprehensive ChatGPT OAuth instructions

**User Instructions Added:**
1. **Step 1: Open ChatGPT Developer Mode** - Navigate to Settings → Developer → Add MCP Server
2. **Step 2: Enter Configuration** - Add SpreadAPI MCP server URL with copyable input
3. **Step 3: Sign In and Authorize** - Hanko login → review permissions → select services → authorize
4. **Step 4: Start Using** - Example prompts for Excel API access

**Additional UI Elements:**
- Success alert explaining OAuth 2.1 + Hanko authentication
- Security & privacy notice with key points
- Troubleshooting section with common issues
- Copyable MCP server URL
- Clear explanation of authorization flow

**User Experience:**
- Clear step-by-step instructions matching actual OAuth flow
- No technical jargon - accessible to non-developers
- Security reassurance built into UI
- Troubleshooting tips for common issues

---

## References

- [OAuth 2.1 Draft](https://oauth.net/2.1/)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [RFC 8414 - Authorization Server Metadata](https://datatracker.ietf.org/doc/html/rfc8414)
- [RFC 9728 - Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728)
- [Hanko Documentation](https://docs.hanko.io)
- [MCP Authorization Spec](https://modelcontextprotocol.info/specification/draft/basic/authorization/)

---

**Next Steps:** Begin implementation with Step 1 - Remove old OAuth implementation.
