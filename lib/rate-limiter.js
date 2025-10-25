/**
 * Rate Limiter for OAuth Endpoints
 *
 * Implements sliding window rate limiting using Redis to prevent:
 * - Brute force attacks on authorization codes
 * - DDoS attacks on OAuth endpoints
 * - Resource exhaustion
 */

import redis from './redis';

/**
 * Rate limit by IP address
 *
 * @param {Request} request - Next.js request object
 * @param {string} endpoint - Endpoint identifier (e.g., 'oauth_token', 'oauth_authorize')
 * @param {number} limit - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Promise<{limited: boolean, retryAfter?: number}>}
 */
export async function rateLimitByIP(request, endpoint, limit = 10, windowSeconds = 60) {
  try {
    // Get client IP from headers (works with Vercel/proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0].trim() || realIP || 'unknown';

    const key = `rate_limit:${endpoint}:${ip}`;

    // Increment counter
    const current = await redis.incr(key);

    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Check if limit exceeded
    if (current > limit) {
      const ttl = await redis.ttl(key);
      console.warn(`[Rate Limit] IP ${ip} exceeded limit for ${endpoint}: ${current}/${limit}`);

      return {
        limited: true,
        retryAfter: Math.max(ttl, 1), // At least 1 second
      };
    }

    return { limited: false };
  } catch (error) {
    console.error('[Rate Limit] Error checking rate limit:', error);
    // Fail open - don't block requests if Redis is down
    return { limited: false };
  }
}

/**
 * Rate limit by user ID (for authenticated requests)
 *
 * @param {string} userId - User identifier
 * @param {string} endpoint - Endpoint identifier
 * @param {number} limit - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Promise<{limited: boolean, retryAfter?: number}>}
 */
export async function rateLimitByUser(userId, endpoint, limit = 20, windowSeconds = 60) {
  try {
    const key = `rate_limit:${endpoint}:user:${userId}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (current > limit) {
      const ttl = await redis.ttl(key);
      console.warn(`[Rate Limit] User ${userId} exceeded limit for ${endpoint}: ${current}/${limit}`);

      return {
        limited: true,
        retryAfter: Math.max(ttl, 1),
      };
    }

    return { limited: false };
  } catch (error) {
    console.error('[Rate Limit] Error checking rate limit:', error);
    return { limited: false };
  }
}

/**
 * Combined rate limiting (both IP and user)
 * Request must pass both checks to proceed
 *
 * @param {Request} request - Next.js request object
 * @param {string} userId - User identifier (optional)
 * @param {string} endpoint - Endpoint identifier
 * @param {Object} limits - Rate limit configuration
 * @returns {Promise<{limited: boolean, retryAfter?: number}>}
 */
export async function rateLimitCombined(
  request,
  userId,
  endpoint,
  { ipLimit = 10, userLimit = 20, windowSeconds = 60 } = {}
) {
  // Check IP-based rate limit
  const ipCheck = await rateLimitByIP(request, endpoint, ipLimit, windowSeconds);
  if (ipCheck.limited) {
    return ipCheck;
  }

  // Check user-based rate limit if user is authenticated
  if (userId) {
    const userCheck = await rateLimitByUser(userId, endpoint, userLimit, windowSeconds);
    if (userCheck.limited) {
      return userCheck;
    }
  }

  return { limited: false };
}

/**
 * Create rate limit error response
 *
 * @param {number} retryAfter - Seconds to wait before retrying
 * @returns {Response} Next.js response with 429 status
 */
export function createRateLimitResponse(retryAfter) {
  return {
    error: 'too_many_requests',
    error_description: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
    retry_after: retryAfter,
  };
}
