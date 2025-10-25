/**
 * OAuth Authorization Code Management
 *
 * Handles creation, storage, validation, and exchange of OAuth authorization codes
 * for the ChatGPT OAuth flow.
 */

import redis from './redis';
import crypto from 'crypto';

const CODE_TTL = 600; // 10 minutes (authorization codes are short-lived)

/**
 * Generate a secure random authorization code
 */
function generateAuthorizationCode() {
  return `ac_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Create and store an authorization code
 *
 * @param {Object} params
 * @param {string} params.userId - Hanko user ID
 * @param {string} params.clientId - OAuth client ID (ChatGPT's UUID)
 * @param {string} params.redirectUri - Redirect URI to return code to
 * @param {string} params.scope - Requested OAuth scopes
 * @param {string} params.codeChallenge - PKCE code challenge (base64url)
 * @param {string} params.codeChallengeMethod - PKCE method (should be 'S256')
 * @param {string[]} params.serviceIds - Array of allowed service IDs
 * @returns {Promise<string>} The generated authorization code
 */
export async function createAuthorizationCode({
  userId,
  clientId,
  redirectUri,
  scope,
  codeChallenge,
  codeChallengeMethod,
  serviceIds = [],
}) {
  const code = generateAuthorizationCode();

  // Store authorization code data in Redis
  await redis.hSet(`oauth:code:${code}`, {
    user_id: userId,
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    service_ids: JSON.stringify(serviceIds),
    created_at: Date.now().toString(),
  });

  // Set TTL for automatic cleanup
  await redis.expire(`oauth:code:${code}`, CODE_TTL);

  console.log('[OAuth] Authorization code created:', {
    code: code.substring(0, 16) + '...',
    user_id: userId,
    client_id: clientId,
    service_count: serviceIds.length,
    ttl: CODE_TTL,
  });

  return code;
}

/**
 * Validate and retrieve authorization code data
 *
 * @param {string} code - The authorization code to validate
 * @returns {Promise<Object|null>} Code data if valid, null if not found or expired
 */
export async function getAuthorizationCode(code) {
  if (!code || !code.startsWith('ac_')) {
    console.error('[OAuth] Invalid authorization code format:', code?.substring(0, 16));
    return null;
  }

  try {
    const codeData = await redis.hGetAll(`oauth:code:${code}`);

    // Check if code exists
    if (!codeData || Object.keys(codeData).length === 0) {
      console.error('[OAuth] Authorization code not found or expired:', code.substring(0, 16));
      return null;
    }

    // Parse service_ids from JSON
    let serviceIds = [];
    try {
      if (codeData.service_ids) {
        serviceIds = JSON.parse(codeData.service_ids);
      }
    } catch (e) {
      console.error('[OAuth] Error parsing service_ids:', e);
    }

    return {
      userId: codeData.user_id,
      clientId: codeData.client_id,
      redirectUri: codeData.redirect_uri,
      scope: codeData.scope,
      codeChallenge: codeData.code_challenge,
      codeChallengeMethod: codeData.code_challenge_method,
      serviceIds: serviceIds,
      createdAt: parseInt(codeData.created_at),
    };
  } catch (error) {
    console.error('[OAuth] Error retrieving authorization code:', error);
    return null;
  }
}

/**
 * Delete an authorization code (should be called after successful exchange)
 * Authorization codes are one-time use only.
 *
 * @param {string} code - The authorization code to delete
 */
export async function deleteAuthorizationCode(code) {
  try {
    await redis.del(`oauth:code:${code}`);
    console.log('[OAuth] Authorization code deleted:', code.substring(0, 16) + '...');
  } catch (error) {
    console.error('[OAuth] Error deleting authorization code:', error);
  }
}

/**
 * Verify PKCE code challenge
 *
 * @param {string} codeVerifier - The code verifier sent in token request
 * @param {string} codeChallenge - The code challenge stored with authorization code
 * @param {string} method - The PKCE method (should be 'S256')
 * @returns {boolean} True if verification succeeds
 */
export function verifyPKCE(codeVerifier, codeChallenge, method = 'S256') {
  if (!codeVerifier || !codeChallenge) {
    console.error('[OAuth] Missing PKCE parameters');
    return false;
  }

  if (method !== 'S256') {
    console.error('[OAuth] Unsupported PKCE method:', method);
    return false;
  }

  try {
    // SHA-256 hash the verifier and base64url encode it
    const hash = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const isValid = hash === codeChallenge;

    if (!isValid) {
      console.error('[OAuth] PKCE verification failed:', {
        expected: codeChallenge.substring(0, 16) + '...',
        received: hash.substring(0, 16) + '...',
      });
    }

    return isValid;
  } catch (error) {
    console.error('[OAuth] Error verifying PKCE:', error);
    return false;
  }
}

/**
 * Clean up expired authorization codes (can be called periodically)
 * Note: Redis TTL already handles this automatically, but this can be used
 * for manual cleanup if needed.
 */
export async function cleanupExpiredCodes() {
  try {
    const keys = await redis.keys('oauth:code:*');
    let cleaned = 0;

    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // No expiry set (shouldn't happen, but clean up anyway)
        await redis.del(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[OAuth] Cleaned up ${cleaned} authorization codes without TTL`);
    }
  } catch (error) {
    console.error('[OAuth] Error cleaning up authorization codes:', error);
  }
}
