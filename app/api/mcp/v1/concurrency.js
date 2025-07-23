// Concurrency control for MCP operations

/**
 * Simple mutex implementation for preventing race conditions
 */
class AsyncMutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }
  
  async acquire() {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }
    
    return new Promise(resolve => {
      this.queue.push(() => {
        this.locked = true;
        resolve(() => this.release());
      });
    });
  }
  
  release() {
    this.locked = false;
    const next = this.queue.shift();
    if (next) next();
  }
}

// Mutex registry for different resources
const mutexes = new Map();

/**
 * Get or create a mutex for a specific resource
 */
export function getMutex(resourceId) {
  if (!mutexes.has(resourceId)) {
    mutexes.set(resourceId, new AsyncMutex());
  }
  return mutexes.get(resourceId);
}

/**
 * Execute a function with exclusive access to a resource
 */
export async function withLock(resourceId, fn) {
  const mutex = getMutex(resourceId);
  const release = await mutex.acquire();
  
  try {
    return await fn();
  } finally {
    release();
  }
}

/**
 * Optimistic locking for area updates
 */
const versionMap = new Map();

export function getAreaVersion(serviceId, areaName) {
  const key = `${serviceId}:${areaName}`;
  return versionMap.get(key) || 0;
}

export function incrementAreaVersion(serviceId, areaName) {
  const key = `${serviceId}:${areaName}`;
  const currentVersion = getAreaVersion(serviceId, areaName);
  versionMap.set(key, currentVersion + 1);
  return currentVersion + 1;
}

export function checkAreaVersion(serviceId, areaName, expectedVersion) {
  const currentVersion = getAreaVersion(serviceId, areaName);
  if (expectedVersion !== undefined && expectedVersion !== currentVersion) {
    throw new Error(
      `Optimistic lock failed. Area has been modified. Expected version: ${expectedVersion}, Current version: ${currentVersion}`
    );
  }
  return currentVersion;
}

/**
 * Distributed lock using Redis (for multi-instance deployments)
 */
export class RedisLock {
  constructor(redis) {
    this.redis = redis;
  }
  
  async acquire(key, ttl = 30000) {
    const lockKey = `lock:${key}`;
    const lockId = Math.random().toString(36).substring(2);
    const deadline = Date.now() + ttl;
    
    while (Date.now() < deadline) {
      // Try to set lock with NX (only if not exists)
      const result = await this.redis.set(
        lockKey,
        lockId,
        'PX', ttl,
        'NX'
      );
      
      if (result === 'OK') {
        return {
          lockId,
          release: async () => {
            // Only delete if we own the lock
            const script = `
              if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
              else
                return 0
              end
            `;
            await this.redis.eval(script, 1, lockKey, lockId);
          }
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    throw new Error(`Failed to acquire lock for ${key} within ${ttl}ms`);
  }
}

/**
 * Connection pool for managing workbook instances
 */
export class WorkbookPool {
  constructor(maxSize = 10) {
    this.pool = new Map();
    this.maxSize = maxSize;
    this.accessTimes = new Map();
  }
  
  async get(key, createFn) {
    // Update access time
    this.accessTimes.set(key, Date.now());
    
    if (this.pool.has(key)) {
      return this.pool.get(key);
    }
    
    // Evict LRU if at capacity
    if (this.pool.size >= this.maxSize) {
      const lruKey = this.findLRU();
      if (lruKey) {
        this.pool.delete(lruKey);
        this.accessTimes.delete(lruKey);
      }
    }
    
    // Create new instance with lock
    return withLock(`workbook:${key}`, async () => {
      // Double check after acquiring lock
      if (this.pool.has(key)) {
        return this.pool.get(key);
      }
      
      const workbook = await createFn();
      this.pool.set(key, workbook);
      return workbook;
    });
  }
  
  findLRU() {
    let lruKey = null;
    let lruTime = Infinity;
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < lruTime) {
        lruTime = time;
        lruKey = key;
      }
    }
    
    return lruKey;
  }
  
  clear() {
    this.pool.clear();
    this.accessTimes.clear();
  }
}