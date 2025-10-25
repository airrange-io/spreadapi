# Hanko Usage Review & Optimization
**Date:** 2025-10-25
**Reviewer:** Claude Code (Senior OAuth Specialist)
**Status:** 4 Issues Found (2 Performance, 1 Security, 1 Maintenance)

---

## Executive Summary

You're using Hanko **correctly for basics**, but there are **4 optimization opportunities**:

1. 🟡 **Performance Issue:** JWKS fetched on every JWT verification (inefficient)
2. 🟡 **Performance Issue:** Storing full Hanko JWT unnecessarily (800 bytes)
3. 🟠 **Security Issue:** No session cleanup when Hanko session expires
4. 🟡 **Maintenance Issue:** Dead code in hanko-jwt.js

**Overall Grade:** B+ (Good, but can be better)

---

## Current Hanko Architecture

### How You're Using Hanko

```
User → Hanko Auth → Hanko JWT (cookie)
                        ↓
              Your App Reads JWT
                        ↓
              Verifies with JWKS
                        ↓
              Stores JWT in Redis (OAuth)
                        ↓
              Validates on every MCP request
```

### What's Good ✅

1. ✅ **Proper JWT Verification** - Using JWKS from Hanko
2. ✅ **Cookie-based Sessions** - Standard Hanko approach
3. ✅ **Frontend Integration** - Hanko Elements properly integrated
4. ✅ **Session Event Listeners** - onSessionCreated, onSessionExpired
5. ✅ **No Custom Auth** - Leveraging Hanko's infrastructure

---

## Issue #1: JWKS Performance 🟡 MEDIUM PRIORITY

### Problem
**File:** `/lib/hanko-jwt.js:19-26`

```javascript
export async function verifyHankoJWT(token) {
  const JWKS = createRemoteJWKSet(
    new URL(`${hankoApiUrl}/.well-known/jwks.json`)
  );
  const verifiedJWT = await jwtVerify(token, JWKS);
  return verifiedJWT.payload;
}
```

**Issue:**
- `createRemoteJWKSet()` is called **on every JWT verification**
- While `jose` library caches JWKS internally, we're recreating the JWKS object every time
- With OAuth, we verify JWT on every MCP request
- At 1000 req/min, that's 1000 JWKS object creations

**Impact:**
- Unnecessary object allocations
- Potential memory pressure
- Slight latency on every request (~1-5ms overhead)

### Solution: Cache JWKS Globally

```javascript
// lib/hanko-jwt.js

import { jwtVerify, createRemoteJWKSet } from 'jose';

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;

// Cache JWKS globally (created once, reused forever)
let cachedJWKS = null;

function getJWKS() {
  if (!cachedJWKS) {
    cachedJWKS = createRemoteJWKSet(
      new URL(`${hankoApiUrl}/.well-known/jwks.json`)
    );
  }
  return cachedJWKS;
}

/**
 * Verify a Hanko JWT token
 */
export async function verifyHankoJWT(token) {
  const JWKS = getJWKS(); // Reuse cached JWKS
  const verifiedJWT = await jwtVerify(token, JWKS);
  return verifiedJWT.payload;
}
```

**Benefits:**
- Single JWKS object for entire application lifecycle
- `jose` library handles cache freshness internally
- Reduces memory allocations
- ~1-2ms faster per verification

**Effort:** 5 minutes
**Impact:** Medium (improves at scale)

---

## Issue #2: Storing Full Hanko JWT 🟡 MEDIUM PRIORITY

### Problem
**File:** `/app/api/oauth/token/route.js:215`

```javascript
await redis.hSet(`oauth:token:${oauthAccessToken}`, {
  hanko_jwt: hankoToken,  // ← Storing full JWT (~800 bytes)
  client_id: client_id,
  user_id: codeData.userId,
  scope: codeData.scope,
  service_ids: JSON.stringify(codeData.serviceIds),
  authorized_at: Date.now().toString(),
});
```

**Issue:**
- Storing entire Hanko JWT (~800 bytes) for every OAuth token
- JWT contains redundant data (we already store user_id)
- With 10,000 OAuth tokens: 8 MB just for JWTs
- We only need JWT to verify session is still valid

**Why We Store It:**
To verify the underlying Hanko session is still valid on each MCP request:
```javascript
// lib/mcp-auth.js:186-197
try {
  await verifyHankoJWT(metadata.hanko_jwt);
} catch (jwtError) {
  // Session expired
  return { valid: false };
}
```

### Solution Option A: Store Only Session ID (Better)

Instead of storing full JWT, use Hanko's Session API:

```javascript
// Store minimal data
await redis.hSet(`oauth:token:${oauthAccessToken}`, {
  session_id: tokenPayload.session_id,  // ← Just the session ID (~36 bytes)
  user_id: codeData.userId,
  client_id: client_id,
  scope: codeData.scope,
  service_ids: JSON.stringify(codeData.serviceIds),
  authorized_at: Date.now().toString(),
});

// Validation uses Hanko API
async function validateOAuthToken(token) {
  const metadata = await redis.hGetAll(`oauth:token:${token}`);

  // Validate session with Hanko API
  try {
    const response = await fetch(
      `${hankoApiUrl}/sessions/${metadata.session_id}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      // Session expired or invalid
      await redis.del(`oauth:token:${token}`);
      return { valid: false, error: 'Session expired' };
    }
  } catch (error) {
    return { valid: false, error: 'Session validation failed' };
  }

  // Session is valid
  return { valid: true, userId: metadata.user_id, ... };
}
```

**Benefits:**
- Saves ~760 bytes per OAuth token (95% reduction)
- 10,000 tokens: 8 MB → 360 KB (22× smaller)
- Real-time session validation via Hanko API
- Cleaner architecture

**Drawbacks:**
- Additional HTTP request to Hanko per MCP request
- Dependency on Hanko API availability

### Solution Option B: Store JWT Hash (Compromise)

Store only a hash of the JWT for validation:

```javascript
await redis.hSet(`oauth:token:${oauthAccessToken}`, {
  jwt_hash: crypto.createHash('sha256').update(hankoToken).digest('hex'),  // 64 bytes
  user_id: codeData.userId,
  // ... other fields
});
```

Validate by comparing hashes (but this doesn't actually validate expiry, so it's not recommended).

### Solution Option C: Keep Current (Simplest)

If memory isn't a concern and you want to avoid external API calls, keep storing the full JWT.

**Recommendation:**
- **For MVP:** Keep current approach (Option C) - simpler, no external dependencies
- **For Production:** Use Session API (Option A) if you have >1000 concurrent OAuth users

**Effort:** 2-4 hours (for Option A)
**Impact:** Medium (saves memory, adds latency)

---

## Issue #3: No OAuth Token Cleanup on Session Expiry 🟠 HIGH PRIORITY

### Problem
**File:** `/app/components/auth/AuthContext.tsx:101-104`

```javascript
const unsubscribeExpired = hanko.onSessionExpired(() => {
  setUser(null);
  setLoading(false);
  // ← Missing: Clean up OAuth tokens!
});
```

**Issue:**
- When a user's Hanko session expires, we update the UI
- BUT we don't revoke their OAuth tokens
- OAuth tokens remain valid in Redis until TTL expires
- If session expires at 10 hours but OAuth token TTL is 12 hours, there's a 2-hour window where OAuth token works but user is logged out

**Security Risk:**
- User logs out (or session expires) → OAuth tokens still work for ChatGPT
- User expects logout to revoke all access
- ChatGPT can still use MCP services after logout

### Solution: Revoke OAuth Tokens on Session Expiry

```javascript
// app/components/auth/AuthContext.tsx

const unsubscribeExpired = hanko.onSessionExpired(async () => {
  setUser(null);
  setLoading(false);

  // Revoke all OAuth tokens for this user
  if (user?.id) {
    try {
      await fetch('/api/auth/revoke-oauth-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    } catch (error) {
      console.error('Failed to revoke OAuth tokens:', error);
    }
  }
});
```

**Create new endpoint:**
```javascript
// app/api/auth/revoke-oauth-tokens/route.js

import redis from '@/lib/redis';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    // Find all OAuth tokens for this user
    const keys = await redis.keys(`oauth:token:*`);

    let revokedCount = 0;
    for (const key of keys) {
      const metadata = await redis.hGetAll(key);
      if (metadata.user_id === userId) {
        await redis.del(key);
        revokedCount++;
      }
    }

    console.log(`[Auth] Revoked ${revokedCount} OAuth tokens for user ${userId}`);

    return NextResponse.json({ success: true, revokedCount });
  } catch (error) {
    console.error('[Auth] Error revoking tokens:', error);
    return NextResponse.json({ error: 'Failed to revoke tokens' }, { status: 500 });
  }
}
```

**Benefits:**
- Proper security: logout revokes all access
- User expectations met
- Prevents zombie OAuth tokens

**Effort:** 1-2 hours
**Impact:** High (security improvement)

**Note:** Using `redis.keys()` is not ideal for production. Better approach:

```javascript
// Better: Use Redis Set to track user's OAuth tokens
// When creating OAuth token:
await redis.sAdd(`user:${userId}:oauth_tokens`, oauthAccessToken);

// When revoking:
const tokens = await redis.sMembers(`user:${userId}:oauth_tokens`);
for (const token of tokens) {
  await redis.del(`oauth:token:${token}`);
}
await redis.del(`user:${userId}:oauth_tokens`);
```

---

## Issue #4: Dead Code in hanko-jwt.js 🟡 LOW PRIORITY

### Problem
**File:** `/lib/hanko-jwt.js:73-125`

Two functions that are **never used anywhere**:

1. `createAccessToken()` (lines 73-100)
   - Has TODO comments
   - Never called in codebase

2. `validateOAuthToken()` (lines 109-125)
   - Has TODO comments
   - Duplicate of function in mcp-auth.js (but different implementation)
   - Never called

**Issue:**
- Confusing for developers
- Makes codebase look unfinished
- Potential for bugs if someone uses wrong function

### Solution: Delete Dead Code

```javascript
// Remove lines 59-125 from hanko-jwt.js
// Keep only:
// - verifyHankoJWT()
// - getHankoToken()
// - getUserIdFromToken()
```

**Benefits:**
- Cleaner codebase
- Less confusion
- Easier maintenance

**Effort:** 5 minutes
**Impact:** Low (just cleanup)

---

## What You're NOT Missing (i.e., You're Doing Right) ✅

### 1. Hanko Admin API
**Not needed.** You're using JWT verification which is faster and doesn't require API calls.

### 2. Hanko Webhooks
**Not needed for your use case.** You're already listening to session events on the client side.

### 3. Custom JWT Claims
**Not needed.** You're storing OAuth metadata separately in Redis, which is cleaner.

### 4. Refresh Token Flow
**Not needed yet.** Hanko handles session refresh automatically. OAuth tokens expire with sessions.

### 5. Passkey Management
**Already handled by Hanko Elements.** No action needed.

---

## Recommended Implementation Priority

### High Priority (Fix Before Production)
1. ✅ **Issue #3: OAuth Token Cleanup on Session Expiry**
   - **Why:** Security issue - tokens remain valid after logout
   - **Effort:** 1-2 hours
   - **Impact:** High

### Medium Priority (Fix Before Scale)
2. ✅ **Issue #1: Cache JWKS Globally**
   - **Why:** Performance improvement at scale
   - **Effort:** 5 minutes
   - **Impact:** Medium

### Low Priority (Nice to Have)
3. **Issue #4: Remove Dead Code**
   - **Why:** Code cleanliness
   - **Effort:** 5 minutes
   - **Impact:** Low

4. **Issue #2: JWT Storage Optimization**
   - **Why:** Memory savings (only matters at 1000+ concurrent users)
   - **Effort:** 2-4 hours
   - **Impact:** Medium (but only at scale)

---

## Comparison with Hanko Best Practices

| Best Practice | Your Implementation | Status |
|---------------|---------------------|--------|
| JWT Verification with JWKS | ✅ Using jose + JWKS | ✅ GOOD |
| Cookie-based sessions | ✅ Using Hanko cookie | ✅ GOOD |
| Frontend integration | ✅ Hanko Elements | ✅ GOOD |
| Session event listeners | ✅ onSessionCreated/Expired | ✅ GOOD |
| JWKS caching | ❌ Creating on every call | 🟡 CAN IMPROVE |
| Token cleanup on logout | ❌ Not implemented | 🟠 MISSING |
| Minimal JWT storage | ❌ Storing full JWT | 🟡 CAN IMPROVE |
| Error handling | ✅ Proper try/catch | ✅ GOOD |

---

## Alternative Hanko Patterns (Not Recommended for You)

### Pattern A: Server-Side Session Management
**What:** Use Hanko Admin API to manage sessions server-side
**Why not:** More complex, requires API calls, your JWT approach is simpler

### Pattern B: Custom JWT with Hanko's Private Key
**What:** Generate your own JWTs signed with Hanko's key
**Why not:** Hanko doesn't expose private keys, would need workaround

### Pattern C: Dual Authentication (Hanko + Custom)
**What:** Use Hanko for initial auth, then issue your own tokens
**Why not:** Over-engineered, Hanko JWT is sufficient

**Your current approach (JWT-based with Redis metadata) is the RIGHT pattern.**

---

## Code Examples: Recommended Fixes

### Fix #1: Cache JWKS (5 minutes)

```javascript
// lib/hanko-jwt.js

import { jwtVerify, createRemoteJWKSet } from 'jose';

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;

// Global JWKS cache
let cachedJWKS = null;

function getJWKS() {
  if (!cachedJWKS) {
    cachedJWKS = createRemoteJWKSet(
      new URL(`${hankoApiUrl}/.well-known/jwks.json`)
    );
    console.log('[Hanko] JWKS cached');
  }
  return cachedJWKS;
}

export async function verifyHankoJWT(token) {
  const JWKS = getJWKS();
  const verifiedJWT = await jwtVerify(token, JWKS);
  return verifiedJWT.payload;
}

export async function getUserIdFromToken(token) {
  const payload = await verifyHankoJWT(token);
  return payload.sub;
}

// Remove createAccessToken() and validateOAuthToken() - DEAD CODE
```

### Fix #3: Revoke OAuth Tokens on Logout (1-2 hours)

**Step 1: Track user's OAuth tokens**
```javascript
// When creating OAuth token (app/api/oauth/token/route.js)

const oauthAccessToken = generateOAuthAccessToken();

// Store token metadata
await redis.hSet(`oauth:token:${oauthAccessToken}`, { ... });
await redis.expire(`oauth:token:${oauthAccessToken}`, expiresIn);

// Track this token under user
await redis.sAdd(`user:${codeData.userId}:oauth_tokens`, oauthAccessToken);
await redis.expire(`user:${codeData.userId}:oauth_tokens`, expiresIn);
```

**Step 2: Create revocation endpoint**
```javascript
// app/api/auth/revoke-oauth-tokens/route.js

import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get all OAuth tokens for this user
    const tokens = await redis.sMembers(`user:${userId}:oauth_tokens`);

    // Delete each token
    const multi = redis.multi();
    for (const token of tokens) {
      multi.del(`oauth:token:${token}`);
    }
    multi.del(`user:${userId}:oauth_tokens`);
    await multi.exec();

    console.log(`[Auth] Revoked ${tokens.length} OAuth tokens for user ${userId}`);

    return NextResponse.json({
      success: true,
      revokedCount: tokens.length
    });
  } catch (error) {
    console.error('[Auth] Error revoking tokens:', error);
    return NextResponse.json(
      { error: 'Failed to revoke tokens' },
      { status: 500 }
    );
  }
}
```

**Step 3: Call on session expiry**
```javascript
// app/components/auth/AuthContext.tsx

const unsubscribeExpired = hanko.onSessionExpired(async () => {
  setUser(null);
  setLoading(false);

  // Revoke OAuth tokens
  if (user?.id) {
    try {
      await fetch('/api/auth/revoke-oauth-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      console.log('[Auth] OAuth tokens revoked on session expiry');
    } catch (error) {
      console.error('[Auth] Failed to revoke OAuth tokens:', error);
    }
  }
});
```

**Step 4: Also revoke on manual logout**
```javascript
const logout = async () => {
  try {
    if (hanko && user) {
      // Revoke OAuth tokens before logout
      await fetch('/api/auth/revoke-oauth-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      await (hanko as any).user.logout();
      setUser(null);
      router.push('/');
    }
  } catch (err) {
    console.error('Logout failed:', err);
    setError('Failed to logout');
  }
};
```

---

## Testing Recommendations

After implementing fixes:

1. **Test JWKS Caching:**
   - Enable detailed logging
   - Verify "JWKS cached" appears once on startup
   - Verify subsequent verifications are faster

2. **Test Session Expiry:**
   - Authorize ChatGPT
   - Manually expire Hanko session (or wait for timeout)
   - Verify OAuth token is revoked
   - Try MCP request → should fail with 401

3. **Test Manual Logout:**
   - Authorize ChatGPT
   - Click logout button
   - Verify OAuth tokens are revoked
   - Try MCP request → should fail

---

## Summary & Verdict

**Overall Assessment:** ⭐⭐⭐⭐ (4/5 stars)

**Strengths:**
- ✅ Proper JWT verification
- ✅ Correct Hanko integration
- ✅ Good architecture decisions
- ✅ No over-engineering

**Weaknesses:**
- 🟠 Missing token cleanup on logout (security)
- 🟡 JWKS not cached (performance)
- 🟡 Full JWT stored unnecessarily (memory)
- 🟡 Dead code present (maintenance)

**Recommendation:**
You're using Hanko **correctly**, but there are **easy improvements** that will make it **excellent**:

1. **Fix session expiry cleanup** (2 hours, high impact)
2. **Cache JWKS** (5 minutes, medium impact)
3. **Remove dead code** (5 minutes, low impact)
4. **Optimize JWT storage** (optional, only needed at scale)

**Time to Excellence:** ~3 hours of work

---

**Reviewed by:** Claude Code
**Date:** 2025-10-25
**Next Review:** After implementing high-priority fixes
