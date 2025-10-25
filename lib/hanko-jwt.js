/**
 * Hanko JWT Utilities
 *
 * Utilities for working with Hanko-issued JWTs for OAuth authorization.
 */

import { jwtVerify, createRemoteJWKSet } from 'jose';

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;

// Global JWKS cache - created once, reused for all verifications
// The jose library handles cache freshness and key rotation internally
let cachedJWKS = null;

/**
 * Get cached JWKS or create if not exists
 * @returns {RemoteJWKSet} Cached JWKS for JWT verification
 */
function getJWKS() {
  if (!cachedJWKS) {
    cachedJWKS = createRemoteJWKSet(
      new URL(`${hankoApiUrl}/.well-known/jwks.json`)
    );
    console.log('[Hanko] JWKS cached globally for improved performance');
  }
  return cachedJWKS;
}

/**
 * Verify a Hanko JWT token
 *
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object>} Verified JWT payload
 * @throws {Error} If token is invalid or expired
 */
export async function verifyHankoJWT(token) {
  const JWKS = getJWKS(); // Reuse cached JWKS
  const verifiedJWT = await jwtVerify(token, JWKS);
  return verifiedJWT.payload;
}

/**
 * Get the current user's Hanko session token from cookie
 *
 * @param {Request} request - Next.js request object
 * @returns {string|null} Hanko JWT token or null if not found
 */
export function getHankoToken(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  return cookies['hanko'] || null;
}

/**
 * Extract user ID from Hanko JWT
 *
 * @param {string} token - Hanko JWT token
 * @returns {Promise<string>} User ID (sub claim)
 * @throws {Error} If token is invalid
 */
export async function getUserIdFromToken(token) {
  const payload = await verifyHankoJWT(token);
  return payload.sub;
}
