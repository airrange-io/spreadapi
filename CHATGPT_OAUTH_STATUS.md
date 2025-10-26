# ChatGPT OAuth Status - Current Implementation

**Date:** 2025-10-26
**Status:** Multi-Service MCP via OAuth (OLD approach)

---

## ✅ What Currently Works (Multi-Service)

### ChatGPT OAuth Flow (OLD Multi-Service Approach)

**1. OAuth Authorization Page** (`/oauth/authorize`)
- User pastes **MCP tokens** (multi-service: `spapi_live_...`)
- Can paste multiple tokens
- Validates tokens via `validateToken()` from `mcp-auth.js`

**2. OAuth Token Exchange** (`/api/oauth/token`)
- Exchanges authorization code for OAuth token
- Maps OAuth token → MCP tokens in Redis
- OAuth token: `oat_...` (12 hour TTL)

**3. ChatGPT Makes Requests** (`/api/mcp`)
- Uses OAuth token in Authorization header
- Connects to `/api/mcp` endpoint (Streamable HTTP)
- Endpoint uses MCP protocol
- Delegates to `bridge/route.js` (multi-service handler)

**Flow:**
```
ChatGPT → OAuth Authorize Page
       ↓
    User pastes MCP tokens (multi-service)
       ↓
    OAuth Token Exchange
       ↓
    ChatGPT gets OAuth token (oat_...)
       ↓
    ChatGPT calls /api/mcp with OAuth token
       ↓
    /api/mcp validates OAuth token
       ↓
    Delegates to /api/mcp/bridge (multi-service MCP)
       ↓
    Multi-service tools: spreadapi_calc, spreadapi_list_services, etc.
```

---

## ⚠️ What This Means for Single-Service

### Problem: Current ChatGPT Setup is Multi-Service Only

The current OAuth flow:
- ✅ Works for **multi-service** MCP (access to multiple services)
- ❌ **NOT designed** for single-service MCP
- ❌ Uses **MCP tokens** (not service tokens)
- ❌ Connects to generic `/api/mcp` (not `/api/mcp/services/{id}`)

### Why This Doesn't Fit Single-Service

**Single-Service Approach:**
- One service = one MCP endpoint
- Uses **service tokens** (not MCP tokens)
- No OAuth needed for most cases
- Direct API access

**Current ChatGPT OAuth:**
- Multiple services via one OAuth token
- Uses **MCP tokens** (different from service tokens)
- Generic MCP endpoint
- Discovery tools (list services, get details)

---

## 🤔 Options for ChatGPT + Single-Service

### Option 1: ChatGPT Uses REST API Directly (Recommended) ✅

**Approach:** Skip MCP for ChatGPT, use existing REST API

**Setup:**
```json
{
  "openapi": "3.0.0",
  "servers": [
    { "url": "https://spreadapi.io/api/v1" }
  ],
  "paths": {
    "/services/{serviceId}/execute": {
      "post": {
        "operationId": "calculate",
        "security": [{ "bearerAuth": [] }],
        "parameters": [...service inputs...],
        "responses": {...}
      }
    }
  }
}
```

**Pros:**
- ✅ No OAuth needed
- ✅ Uses existing `/api/v1/services/{id}/execute`
- ✅ Service tokens (already have them)
- ✅ OpenAPI spec (standard for ChatGPT)
- ✅ Simpler user experience

**Cons:**
- ❌ Not using MCP protocol
- ❌ Need OpenAPI spec generation

---

### Option 2: OAuth for Single-Service MCP (Complex)

**Approach:** Adapt OAuth to work with single-service MCP

**Changes Needed:**
1. OAuth authorize page: Accept **service tokens** (not MCP tokens)
2. OAuth token maps to **one service** (not multiple)
3. ChatGPT connects to `/api/mcp/services/{serviceId}`
4. Endpoint validates OAuth token → service token

**Pros:**
- ✅ Uses MCP protocol
- ✅ Consistent with Claude Desktop approach

**Cons:**
- ❌ Complex OAuth flow for single service
- ❌ Overhead (OAuth for one service?)
- ❌ User confusion (why OAuth for public service?)

---

### Option 3: Keep Multi-Service OAuth for ChatGPT

**Approach:** ChatGPT continues using multi-service MCP

**Setup:**
- ChatGPT → Multi-service MCP (current flow)
- Claude Desktop → Single-service MCP (new flow)
- Two different patterns for two different platforms

**Pros:**
- ✅ No changes needed for ChatGPT
- ✅ Works today
- ✅ Supports multiple services

**Cons:**
- ❌ Different patterns for different platforms
- ❌ Still using MCP tokens (deprecated in single-service world)
- ❌ Complex user experience

---

## 📊 Current Implementation Analysis

### Files Involved in ChatGPT OAuth

**Frontend:**
- `app/oauth/authorize/page.tsx` - OAuth UI (paste MCP tokens)

**Backend:**
- `app/api/oauth/authorize/route.js` - Authorization endpoint
- `app/api/oauth/token/route.js` - Token exchange
- `app/api/mcp/route.js` - MCP endpoint (Streamable HTTP)
- `app/api/mcp/bridge/route.js` - Multi-service handler
- `lib/oauth-codes.js` - Authorization code management
- `lib/mcp-auth.js` - MCP token validation

### What's Configured

**OAuth Endpoints:**
- Authorization: `/oauth/authorize`
- Token: `/api/oauth/token`
- Well-known: `/.well-known/oauth-authorization-server`

**MCP Endpoint:**
- `/api/mcp` - Streamable HTTP transport
- Delegates to `/api/mcp/bridge` (multi-service)

**Token Types:**
- **Input:** MCP tokens (`spapi_live_...`)
- **Output:** OAuth tokens (`oat_...`)
- **Mapping:** OAuth token → MCP tokens (Redis)

---

## ✅ What's Ready for Each Platform

### Claude Desktop: ✅ READY (Single-Service)

**Endpoint:** `/api/mcp/services/{serviceId}`
**Auth:** Service tokens
**Bridge:** `spreadapi-mcp` v2.0.0 (npx package)
**Protocol:** MCP via stdio
**Status:** Fully implemented, ready to test

**Config:**
```json
{
  "command": "npx",
  "args": ["spreadapi-mcp"],
  "env": {
    "SPREADAPI_SERVICE_ID": "service-id",
    "SPREADAPI_URL": "https://spreadapi.io",
    "SPREADAPI_TOKEN": "service-token"
  }
}
```

---

### ChatGPT: ⚠️ MULTI-SERVICE ONLY (OLD approach)

**Endpoint:** `/api/mcp` → `/api/mcp/bridge`
**Auth:** OAuth (wraps MCP tokens)
**Protocol:** MCP via Streamable HTTP
**Status:** Works, but uses multi-service approach

**Current Flow:**
1. User pastes MCP tokens
2. OAuth wraps them
3. ChatGPT uses generic MCP endpoint
4. Access to ALL services via discovery

**For Single-Service:** NOT implemented

---

## 🎯 Recommendation

### For ChatGPT: Use REST API (Option 1) ✅

**Why:**
1. **Simpler:** No OAuth complexity for single service
2. **Standard:** OpenAPI is ChatGPT's native format
3. **Existing:** REST API already works
4. **Flexible:** Works for public & private services

**What to Build:**
1. OpenAPI spec generator per service
2. Update UI to show OpenAPI spec URL
3. ChatGPT imports OpenAPI spec
4. Uses service token for auth

**User Experience:**
```
1. Go to Service → API → ChatGPT Integration
2. Copy OpenAPI spec URL
3. Paste in ChatGPT Actions
4. Add service token
5. Done!
```

**No OAuth needed for single services!**

---

## 📝 Summary

### Current Status

| Platform | Mode | Endpoint | Auth | Status |
|----------|------|----------|------|--------|
| **Claude Desktop** | Single-Service | `/api/mcp/services/{id}` | Service Token | ✅ Ready |
| **Claude Desktop** | Multi-Service | `/api/mcp/bridge` | MCP Token | ✅ Works (legacy) |
| **ChatGPT** | Multi-Service | `/api/mcp` + OAuth | MCP Token → OAuth | ✅ Works |
| **ChatGPT** | Single-Service | `/api/v1/services/{id}/execute` | Service Token | ⚠️ Use REST API |

### What Needs to Happen for ChatGPT Single-Service

**Option 1 (Recommended): REST API + OpenAPI**
- [ ] Generate OpenAPI spec per service
- [ ] Add ChatGPT section to UI
- [ ] Show OpenAPI URL
- [ ] Instructions for ChatGPT Actions

**Option 2 (Complex): Single-Service OAuth**
- [ ] Modify OAuth to accept service tokens
- [ ] Map OAuth token to single service
- [ ] ChatGPT connects to `/api/mcp/services/{id}`
- [ ] Complex for little benefit

**Option 3 (Keep Current): Multi-Service Only**
- [x] Already works
- [ ] Update documentation
- [ ] Keep two different patterns

---

## 🔑 Key Insight

**ChatGPT doesn't need MCP protocol for single services!**

The whole OAuth + MCP approach was designed for multi-service access. For single services, the existing REST API with OpenAPI is simpler and more appropriate.

**Recommendation:**
- **Claude Desktop** → MCP (single-service)
- **ChatGPT** → REST API + OpenAPI (single-service)

Two different platforms, two appropriate protocols!

---

**Status:** Analyzed ✅
**Next:** Decide on ChatGPT approach
**Recommended:** REST API + OpenAPI for ChatGPT
