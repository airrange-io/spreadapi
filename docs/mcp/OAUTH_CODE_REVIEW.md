# OAuth Implementation Code Review
**Senior Developer Review - ChatGPT OAuth Flow**
**Date:** 2025-10-25
**Reviewer:** Claude Code (Senior OAuth Specialist)

---

## Executive Summary

The OAuth 2.1 implementation is **structurally sound** but has **3 critical security issues** and several areas of over-engineering. The core flow is correct, but needs fixes before production deployment.

### Risk Assessment
- **Critical Issues:** 3 (must fix before production)
- **High Priority:** 4 (should fix before launch)
- **Medium Priority:** 6 (fix during testing)
- **Over-engineering:** 2 areas to simplify

---

## 🔴 CRITICAL ISSUES (Must Fix)

### 1. Token Reuse Vulnerability - OAuth Metadata Storage
**File:** `/app/api/oauth/token/route.js:196`
**Severity:** 🔴 CRITICAL

**Problem:**
```javascript
// Line 196-202: Storing metadata keyed by Hanko JWT
await redis.hSet(`oauth:token_metadata:${hankoToken}`, {
  client_id: client_id,
  user_id: codeData.userId,
  scope: codeData.scope,
  service_ids: JSON.stringify(codeData.serviceIds),
  authorized_at: Date.now().toString(),
});
```

**Why this is critical:**
- The same Hanko JWT can be used across multiple OAuth authorizations
- If a user authorizes ChatGPT twice (e.g., different service selections), the second authorization **overwrites** the first
- If a user has multiple concurrent ChatGPT sessions, they share the same Hanko token initially
- This breaks service-level permission enforcement
- Metadata from authorization #1 is lost when authorization #2 happens

**Impact:**
- User authorizes services [A, B] → metadata stored
- User authorizes again with services [C] → metadata overwritten
- ChatGPT requests with first token now have wrong permissions (only service C instead of A, B)

**Solution:**
Store metadata keyed by a **unique identifier per OAuth authorization**:
```javascript
// Generate a unique OAuth session ID
const oauthSessionId = crypto.randomBytes(32).toString('hex');

// Store metadata with composite key
await redis.hSet(`oauth:session:${oauthSessionId}`, {
  hanko_token: hankoToken,
  client_id: client_id,
  user_id: codeData.userId,
  scope: codeData.scope,
  service_ids: JSON.stringify(codeData.serviceIds),
  authorized_at: Date.now().toString(),
});

// Return the session ID as part of the access token or as custom claim
return NextResponse.json({
  access_token: hankoToken,
  token_type: 'Bearer',
  expires_in: expiresIn,
  scope: codeData.scope,
  // Include session ID for validation
  session_id: oauthSessionId
});
```

Then update validation in `mcp-auth.js` to use the session ID.

---

### 2. Race Condition - Double JWT Verification
**File:** `/app/api/oauth/token/route.js:166, 212`
**Severity:** 🔴 CRITICAL

**Problem:**
```javascript
// Line 166: First verification
const tokenPayload = await verifyHankoJWT(hankoToken);
// ... validation logic ...

// Line 196-205: Store OAuth metadata
await redis.hSet(`oauth:token_metadata:${hankoToken}`, ...);

// Line 212: Second verification
const tokenPayload = await verifyHankoJWT(hankoToken);  // ← DUPLICATE!
```

**Why this is critical:**
- JWT is verified twice - inefficient
- OAuth metadata is stored (line 196) **before** second verification
- If second verification fails, metadata is already in Redis
- Creates inconsistent state where metadata exists for an invalid token

**Solution:**
```javascript
// Verify ONCE and reuse the payload
const tokenPayload = await verifyHankoJWT(hankoToken);

// Verify token belongs to the same user
if (tokenPayload.sub !== codeData.userId) {
  await deleteAuthorizationCode(code);
  return NextResponse.json({ error: 'invalid_grant', ... }, { status: 400 });
}

// Calculate expiry from existing payload
const expiresIn = tokenPayload.exp
  ? tokenPayload.exp - Math.floor(Date.now() / 1000)
  : 43200;

// Store metadata AFTER all validations pass
await redis.hSet(`oauth:token_metadata:${hankoToken}`, ...);
await redis.expire(`oauth:token_metadata:${hankoToken}`, expiresIn); // Use actual expiry!

// Delete code and temp storage
await deleteAuthorizationCode(code);
await redis.del(`oauth:hanko_token:${code}`);

// Return response
return NextResponse.json({ access_token: hankoToken, ... });
```

---

### 3. Missing Rate Limiting
**File:** All OAuth endpoints
**Severity:** 🔴 CRITICAL

**Problem:**
- No rate limiting on `/oauth/authorize` (authorization code generation)
- No rate limiting on `/api/oauth/token` (token exchange)
- Attackers can:
  - Flood authorization endpoint → Redis exhaustion
  - Brute-force authorization codes (though 32-byte random makes this impractical)
  - DDoS the endpoints

**Solution:**
Add rate limiting middleware using Redis:
```javascript
// lib/rate-limiter.js
export async function rateLimitByIP(request, limit = 10, window = 60) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `rate_limit:oauth:${ip}`;

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }

  if (current > limit) {
    return { limited: true, retryAfter: await redis.ttl(key) };
  }

  return { limited: false };
}
```

Apply to both endpoints:
```javascript
// In token endpoint
const rateCheck = await rateLimitByIP(request, 10, 60); // 10 requests per minute
if (rateCheck.limited) {
  return NextResponse.json(
    { error: 'too_many_requests', error_description: 'Rate limit exceeded' },
    { status: 429, headers: { 'Retry-After': rateCheck.retryAfter.toString() } }
  );
}
```

---

## 🟠 HIGH PRIORITY (Should Fix)

### 4. Metadata Expiry Mismatch
**File:** `/app/api/oauth/token/route.js:205`
**Severity:** 🟠 HIGH

**Problem:**
```javascript
// Line 205: Hardcoded 12-hour expiry
await redis.expire(`oauth:token_metadata:${hankoToken}`, 43200);

// But the JWT might expire sooner!
```

**Impact:**
- If Hanko JWT expires at 11 hours, metadata lives for 12 hours
- 1-hour window where metadata exists for expired token
- Validation will fail JWT check but metadata lookup succeeds (wasted Redis operation)

**Solution:**
```javascript
// Use actual JWT expiry from payload
const expiresIn = tokenPayload.exp
  ? Math.max(0, tokenPayload.exp - Math.floor(Date.now() / 1000))
  : 43200;

await redis.expire(`oauth:token_metadata:${hankoToken}`, expiresIn);
```

---

### 5. Authorization Code Replay Attack Window
**File:** `/app/api/oauth/token/route.js:90-208`
**Severity:** 🟠 HIGH

**Problem:**
```javascript
// Line 90: Get authorization code
const codeData = await getAuthorizationCode(code);

// ... 118 lines of validation ...

// Line 208: Delete authorization code
await deleteAuthorizationCode(code);
```

**Risk:**
- 118 lines between retrieval and deletion
- Race condition: Two parallel requests with same code
- Both could pass line 90 before either reaches line 208
- Authorization code used twice → two access tokens for same authorization

**Solution:**
Use Redis atomic operation to get-and-delete:
```javascript
// In lib/oauth-codes.js, add:
export async function getAndDeleteAuthorizationCode(code) {
  if (!code || !code.startsWith('ac_')) return null;

  // Use Redis transaction to get and delete atomically
  const multi = redis.multi();
  multi.hGetAll(`oauth:code:${code}`);
  multi.del(`oauth:code:${code}`);

  const results = await multi.exec();
  const codeData = results[0];

  if (!codeData || Object.keys(codeData).length === 0) return null;

  // Parse and return
  return {
    userId: codeData.user_id,
    clientId: codeData.client_id,
    // ... rest of fields
  };
}
```

Then in token endpoint:
```javascript
// Line 90: Atomic get-and-delete
const codeData = await getAndDeleteAuthorizationCode(code);

// Now impossible to reuse the same code
```

---

### 6. Overly Permissive CORS
**File:** `/app/api/oauth/token/route.js:258`
**Severity:** 🟠 HIGH

**Problem:**
```javascript
// Line 254-263
export async function OPTIONS(request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',  // ← Too permissive!
```

**Impact:**
- Any website can call your token endpoint from JavaScript
- Opens up to CSRF attacks if ChatGPT's state validation fails
- OAuth endpoints should be more restrictive

**Solution:**
```javascript
const allowedOrigins = [
  'https://chatgpt.com',
  'https://chat.openai.com',
  'https://spreadapi.io', // Your own domain
];

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

---

### 7. Token in Query String
**File:** `/lib/mcp-auth.js:240`
**Severity:** 🟠 HIGH

**Problem:**
```javascript
// Line 238-240: Fallback to query parameter
const url = new URL(request.url);
token = url.searchParams.get('token');
```

**Security Risk:**
- Tokens in query strings appear in:
  - Server logs
  - Proxy logs
  - Browser history
  - Referrer headers
  - Analytics tools
- OAuth 2.1 explicitly discourages this

**Solution:**
Remove query string support for OAuth tokens (keep only for MCP bridge if needed):
```javascript
export async function mcpAuthMiddleware(request) {
  const authHeader = request.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  // Remove query parameter fallback for security

  if (!token) {
    return { valid: false, error: 'No token provided', status: 401 };
  }
  // ... rest of validation
}
```

If you need query string for SSE compatibility, document it clearly and add warnings.

---

## 🟡 MEDIUM PRIORITY (Fix During Testing)

### 8. Performance Issue - redis.keys()
**File:** `/lib/oauth-codes.js:181`
**Severity:** 🟡 MEDIUM

**Problem:**
```javascript
// Line 181-198: Cleanup function uses redis.keys()
export async function cleanupExpiredCodes() {
  const keys = await redis.keys('oauth:code:*');  // ← O(N) blocking operation
```

**Impact:**
- `redis.keys()` blocks Redis for all operations
- In production with thousands of codes, this causes latency spikes
- Redis docs say: "Warning: consider KEYS as a command that should only be used in production environments with extreme care"

**Solution:**
Since Redis TTL already auto-deletes expired codes, remove this function entirely:
```javascript
// Delete this function - Redis TTL handles cleanup automatically
// Keep it only if you absolutely need manual cleanup, then use SCAN:

export async function cleanupExpiredCodes() {
  let cursor = '0';
  let cleaned = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      MATCH: 'oauth:code:*',
      COUNT: 100
    });

    cursor = nextCursor;

    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        await redis.del(key);
        cleaned++;
      }
    }
  } while (cursor !== '0');

  if (cleaned > 0) {
    console.log(`[OAuth] Cleaned up ${cleaned} codes without TTL`);
  }
}
```

---

### 9. Dead Code - hanko-jwt.js
**File:** `/lib/hanko-jwt.js:72-125`
**Severity:** 🟡 MEDIUM (Over-engineering)

**Problem:**
```javascript
// Lines 72-100: createAccessToken() - NEVER USED
export async function createAccessToken(hankoToken, oauthData) {
  // ... has TODO comments
  // ... not called anywhere
}

// Lines 109-125: validateOAuthToken() - NEVER USED (different from mcp-auth.js)
export async function validateOAuthToken(token) {
  // ... has TODO comments
  // ... not called anywhere
}
```

**Impact:**
- Confusing dead code
- Future developers might use wrong function
- Increases maintenance burden
- Makes codebase look unfinished (TODO comments)

**Solution:**
Delete these unused functions entirely:
```javascript
// Remove lines 60-125 from hanko-jwt.js
// Keep only:
// - verifyHankoJWT()
// - getHankoToken()
// - getUserIdFromToken()
```

---

### 10. Inconsistent Error Status Codes
**File:** `/app/api/oauth/authorize/route.js:94`
**Severity:** 🟡 MEDIUM

**Problem:**
```javascript
// Line 88-95: Returns 500 for missing session
if (!hankoToken) {
  return NextResponse.json(
    { error: 'server_error', error_description: 'User session not found' },
    { status: 500 }  // ← Wrong! This is a client error
  );
}
```

**Impact:**
- "User session not found" is a 401 Unauthorized error, not 500 Internal Server Error
- Misleading for monitoring and debugging
- OAuth spec says use appropriate HTTP status codes

**Solution:**
```javascript
if (!hankoToken) {
  return NextResponse.json(
    { error: 'unauthorized', error_description: 'User session not found or expired' },
    { status: 401 }  // ← Correct status code
  );
}
```

---

### 11. Missing Refresh Token Flow
**File:** N/A (architectural)
**Severity:** 🟡 MEDIUM

**Problem:**
- When Hanko JWT expires (12 hours), user must re-authorize
- Poor UX for long-running ChatGPT sessions
- No refresh token mechanism

**Impact:**
- User has to re-authorize every 12 hours
- Interrupts ChatGPT workflows
- Standard OAuth provides refresh tokens for this reason

**Solution (for future):**
Implement refresh token flow:
1. Issue refresh token alongside access token
2. Store refresh token in Redis with longer TTL (30 days)
3. Add `/api/oauth/token` refresh_token grant type
4. ChatGPT can silently refresh without user interaction

Not critical for MVP, but consider for production.

---

### 12. No Audit Logging
**File:** All OAuth endpoints
**Severity:** 🟡 MEDIUM

**Problem:**
- No structured audit logs for OAuth events
- Can't trace who authorized what and when
- Difficult to debug issues or investigate security incidents

**Solution:**
Add audit logging:
```javascript
// lib/audit-log.js
export async function logOAuthEvent(eventType, data) {
  await redis.lPush('oauth:audit_log', JSON.stringify({
    timestamp: Date.now(),
    event: eventType,
    ...data
  }));

  // Trim to last 10,000 events
  await redis.lTrim('oauth:audit_log', 0, 9999);
}

// In token endpoint:
await logOAuthEvent('token_issued', {
  user_id: codeData.userId,
  client_id: client_id,
  scope: codeData.scope,
  service_count: codeData.serviceIds.length
});
```

---

### 13. State Parameter Not Validated
**File:** `/app/oauth/authorize/page.tsx`
**Severity:** 🟡 MEDIUM

**Problem:**
- OAuth `state` parameter is passed through but never validated server-side
- Relies entirely on ChatGPT to validate it
- Opens up to CSRF if ChatGPT's validation fails

**Solution:**
Store and validate state parameter:
```javascript
// In authorize endpoint (POST)
await redis.set(`oauth:state:${state}`, JSON.stringify({
  client_id: client_id,
  user_id: user_id,
  created_at: Date.now()
}), { EX: 600 });

// In token endpoint
const stateData = await redis.get(`oauth:state:${state}`);
if (!stateData) {
  return NextResponse.json(
    { error: 'invalid_request', error_description: 'Invalid or expired state' },
    { status: 400 }
  );
}
await redis.del(`oauth:state:${state}`); // One-time use
```

---

## ✅ GOOD PRACTICES

**What the implementation does well:**

1. ✅ **PKCE Implementation** - Correct SHA-256 hashing and base64url encoding
2. ✅ **Authorization Code Deletion** - One-time use enforced
3. ✅ **Client ID & Redirect URI Validation** - Proper OAuth flow
4. ✅ **Standard OAuth Error Codes** - RFC-compliant error responses
5. ✅ **JWT Signature Verification** - Uses JWKS properly
6. ✅ **Hanko Integration** - Smart reuse of existing auth infrastructure
7. ✅ **Service-Level Permissions** - Granular access control
8. ✅ **Dual Token Support** - Backwards compatible with MCP tokens
9. ✅ **Proper HTTP Methods** - POST for token exchange, OPTIONS for CORS
10. ✅ **10-Minute Authorization Code TTL** - Follows OAuth 2.1 recommendation

---

## 📊 OVER-ENGINEERING ANALYSIS

### Where the Code is Over-Engineered:

1. **Dead Functions in hanko-jwt.js**
   - `createAccessToken()` and `validateOAuthToken()` are never used
   - Have TODO comments suggesting they're incomplete
   - Should be deleted entirely

2. **Cleanup Function That's Never Called**
   - `cleanupExpiredCodes()` in oauth-codes.js is never invoked
   - Redis TTL already handles cleanup automatically
   - Uses dangerous `redis.keys()` operation
   - Either delete it or schedule it to run (but fix the SCAN issue first)

### Where the Code is NOT Over-Engineered (Good):

- ✅ Separate functions for PKCE verification (testable)
- ✅ Separate middleware for auth validation (reusable)
- ✅ Discovery endpoints (required by OAuth spec)
- ✅ Structured error responses (maintainable)

---

## 🎯 IMPLEMENTATION RECOMMENDATIONS

### Before Production:

**Must Fix (Critical):**
1. Fix token metadata storage key (issue #1)
2. Remove double JWT verification (issue #2)
3. Add rate limiting (issue #3)

**Should Fix (High Priority):**
4. Fix metadata expiry mismatch (issue #4)
5. Implement atomic code deletion (issue #5)
6. Restrict CORS origins (issue #6)
7. Remove token from query string (issue #7)

**During Testing:**
8. Remove dead code from hanko-jwt.js (issue #9)
9. Fix error status codes (issue #10)
10. Add audit logging (issue #12)

### Architecture Simplifications:

**Remove:**
- `createAccessToken()` from hanko-jwt.js (unused)
- `validateOAuthToken()` from hanko-jwt.js (unused, different from mcp-auth.js version)
- `cleanupExpiredCodes()` from oauth-codes.js (never called, uses dangerous redis.keys())

**Keep:**
- Everything else is necessary and well-structured
- No over-engineering in the core OAuth flow
- Separation of concerns is appropriate

---

## 🔒 SECURITY CHECKLIST

- [ ] Token metadata keyed by unique session ID, not Hanko JWT
- [ ] Single JWT verification in token endpoint
- [ ] Rate limiting on all OAuth endpoints (10 req/min per IP)
- [ ] Metadata expiry matches JWT expiry
- [ ] Atomic authorization code retrieval and deletion
- [ ] CORS restricted to specific origins
- [ ] No tokens in query strings for OAuth flow
- [ ] Audit logging for all OAuth events
- [ ] State parameter validation server-side
- [ ] Error messages don't leak sensitive info
- [ ] All Redis operations have proper error handling

---

## 📈 TESTING RECOMMENDATIONS

1. **Security Testing:**
   - Test authorization code replay attack (should fail after first use)
   - Test PKCE with wrong verifier (should fail)
   - Test expired authorization code (should fail)
   - Test mismatched client_id (should fail)
   - Test concurrent token exchanges with same code (only one should succeed)

2. **Rate Limiting Testing:**
   - Send 11 requests in 60 seconds (11th should get 429)
   - Verify Retry-After header is present
   - Verify counter resets after TTL

3. **Token Lifecycle Testing:**
   - Issue token → use in MCP request → verify success
   - Wait for JWT expiry → use in MCP request → verify failure
   - Issue two tokens with different service IDs → verify isolation

4. **Error Handling:**
   - Test with malformed JWT
   - Test with expired JWT
   - Test with invalid authorization code format
   - Test with missing PKCE parameters

---

## 📝 FINAL VERDICT

**Overall Assessment:** ⚠️ **Not Production Ready**

**Strengths:**
- OAuth 2.1 flow structure is correct
- PKCE implementation is solid
- Good separation of concerns
- Smart reuse of Hanko infrastructure

**Weaknesses:**
- 3 critical security issues that MUST be fixed
- Some over-engineering (dead code) that should be cleaned up
- Missing operational features (rate limiting, audit logs)

**Time to Fix:**
- Critical issues: 4-6 hours
- High priority: 6-8 hours
- Medium priority: 4-6 hours
- **Total:** ~2 days of focused development

**Recommendation:**
Fix critical issues #1, #2, #3 before any testing with real ChatGPT integration. The other issues can be addressed during the testing phase.

---

**Reviewed by:** Claude Code
**Review Date:** 2025-10-25
**Next Review:** After critical fixes are implemented
