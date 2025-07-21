import { Redis } from '@upstash/redis';

// Singleton instance for Upstash Redis
let redis = null;

/**
 * Get or create Redis instance optimized for serverless
 */
export function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      // Automatic retries for transient failures
      retry: {
        retries: 3,
        backoff: (retryCount) => Math.exp(retryCount) * 50,
      },
    });
  }
  return redis;
}

/**
 * Execute Redis commands with automatic retry and error handling
 */
export async function executeWithRetry(operation, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
  }
  
  throw lastError;
}

/**
 * Batch operations for Upstash (using pipeline)
 */
export class UpstashBatch {
  constructor(redis) {
    this.redis = redis;
    this.pipeline = redis.pipeline();
  }
  
  hGetAll(key) {
    this.pipeline.hgetall(key);
    return this;
  }
  
  exists(key) {
    this.pipeline.exists(key);
    return this;
  }
  
  hMGet(key, ...fields) {
    this.pipeline.hmget(key, ...fields);
    return this;
  }
  
  hSet(key, values) {
    this.pipeline.hset(key, values);
    return this;
  }
  
  expire(key, seconds) {
    this.pipeline.expire(key, seconds);
    return this;
  }
  
  async exec() {
    const results = await this.pipeline.exec();
    return results.map(r => r.result);
  }
}

// Export singleton instance
export const redis = getRedisClient();

// Export utility functions
export { getServiceWithPublishedData, getHashFields, batchIncrementCounters } from './redis-optimized.js';