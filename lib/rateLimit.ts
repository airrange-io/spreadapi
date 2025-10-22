import redis from './redis';

interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix: string;   // Redis key prefix
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;      // Unix timestamp when window resets
  retryAfter?: number; // Seconds until next allowed request
}

export async function checkRateLimit(
  identifier: string, // service:token or ip:address
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Use Redis sorted set for sliding window
    const multi = redis.multi();

    // Remove old entries outside the window
    multi.zRemRangeByScore(key, 0, windowStart);

    // Count requests in current window
    multi.zCard(key);

    // Add current request
    multi.zAdd(key, { score: now, value: `${now}` });

    // Set expiry
    multi.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await multi.exec();
    // Count AFTER adding current request (results[2] is zAdd result)
    const countAfterAdd = ((results?.[1] as any) as number || 0) + 1;

    const allowed = countAfterAdd <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - countAfterAdd);
    const reset = now + config.windowMs;

    return {
      allowed,
      limit: config.maxRequests,
      remaining,
      reset: Math.floor(reset / 1000),
      retryAfter: allowed ? undefined : Math.ceil(config.windowMs / 1000)
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limiter fails
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Math.floor((now + config.windowMs) / 1000)
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString()
    })
  };
}

// Different rate limit tiers
export const RATE_LIMITS = {
  FREE: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,          // 100 requests/minute
    keyPrefix: 'ratelimit:free'
  },
  PRO: {
    windowMs: 60 * 1000,
    maxRequests: 1000,         // 1000 requests/minute
    keyPrefix: 'ratelimit:pro'
  },
  ENTERPRISE: {
    windowMs: 60 * 1000,
    maxRequests: 10000,        // 10000 requests/minute
    keyPrefix: 'ratelimit:enterprise'
  },
  // Per-IP rate limit (fallback for unauthenticated requests)
  IP_LIMIT: {
    windowMs: 60 * 1000,
    maxRequests: 60,           // 60 requests/minute per IP
    keyPrefix: 'ratelimit:ip'
  }
};
