import redis from './redis';

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export async function checkRateLimit(identifier: string, config: any): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    const multi = redis.multi();
    multi.zRemRangeByScore(key, 0, windowStart);
    multi.zCard(key);
    multi.zAdd(key, { score: now, value: `${now}` });
    multi.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await multi.exec();
    const countAfterAdd = ((results?.[1] as any) as number || 0) + 1;
    const allowed = countAfterAdd <= config.maxRequests;

    return {
      allowed,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - countAfterAdd),
      reset: Math.floor((now + config.windowMs) / 1000),
      retryAfter: allowed ? undefined : Math.ceil(config.windowMs / 1000)
    };
  } catch {
    return { allowed: true, limit: config.maxRequests, remaining: config.maxRequests, reset: Math.floor((now + config.windowMs) / 1000) };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
  };
}

export const RATE_LIMITS = {
  PRO: { windowMs: 60 * 1000, maxRequests: 1000, keyPrefix: 'ratelimit:pro' }
};
