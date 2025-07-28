# Redis Connection Pool Implementation Guide

## Overview

This guide explains how to implement a production-ready Redis connection pool that handles high concurrency, connection limits, and graceful error recovery. The implementation supports both singleton and pooled connection strategies.

## Why Connection Pooling?

### Without Pooling (Problems)
- Each request creates a new connection (slow)
- Connection limit exhaustion (Redis typically allows 10,000)
- TCP handshake overhead on every operation
- No connection reuse

### With Pooling (Benefits)
- Reuse warm connections (faster)
- Control connection count
- Handle bursts of traffic
- Graceful degradation under load

## Implementation Strategy

### 1. Simple Singleton Client (Low Traffic)

For applications with low concurrency, a singleton pattern works well:

```typescript
// redis-client.ts
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let connectionPromise: Promise<RedisClientType> | null = null;

export async function createRedisClient(): Promise<RedisClientType> {
  // Return existing client if available and connected
  if (redisClient?.isOpen) {
    return redisClient;
  }

  // Prevent multiple connection attempts
  if (!connectionPromise) {
    connectionPromise = initializeRedisClient();
  }

  redisClient = await connectionPromise;
  return redisClient;
}

async function initializeRedisClient(): Promise<RedisClientType> {
  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          // Exponential backoff: 50ms, 100ms, 200ms... max 500ms
          return Math.min(retries * 50, 500);
        },
      },
      password: process.env.REDIS_PASSWORD,
    });

    // Reset state on errors
    client.on('error', () => {
      connectionPromise = null;
      redisClient = null;
    });

    await client.connect();
    return client;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
});
```

### 2. Connection Pool (High Traffic)

For high-concurrency applications, use a connection pool:

```typescript
// redis-pool.ts
import { createPool, Pool } from 'generic-pool';
import { createClient, RedisClientType } from 'redis';

// Configuration for hosting limits
const POOL_CONFIG = {
  maxPerWorker: 19,      // Per-process limit
  minPerWorker: 2,       // Keep warm connections
  absoluteMax: 245,      // Total across all workers
  acquireTimeout: 5000,  // Max wait time
  idleTimeout: 60000,    // Close idle connections
};

let poolInstance: Pool<RedisClientType> | null = null;

function createRedisPool(): Pool<RedisClientType> {
  return createPool({
    create: async (): Promise<RedisClientType> => {
      const client = createClient({
        socket: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
          connectTimeout: 5000,
          keepAlive: 30000,
          reconnectStrategy: (retries) => {
            const delay = Math.min(retries * 50, 3000);
            return delay;
          },
        },
        password: process.env.REDIS_PASSWORD,
        commandsQueueMaxLength: 200, // Buffer commands
      });

      client.on('error', (err) => {
        console.error('Redis Pool Error:', err);
      });

      await client.connect();
      return client;
    },

    destroy: async (client: RedisClientType) => {
      await client.quit();
    },

    validate: async (client: RedisClientType) => {
      try {
        await client.ping();
        return true;
      } catch {
        return false;
      }
    },

    // Pool limits
    max: POOL_CONFIG.maxPerWorker,
    min: POOL_CONFIG.minPerWorker,

    // Behavior
    testOnBorrow: true,    // Validate before use
    fifo: false,           // LIFO for warm connections

    // Timeouts
    acquireTimeoutMillis: POOL_CONFIG.acquireTimeout,
    idleTimeoutMillis: POOL_CONFIG.idleTimeout,
    evictionRunIntervalMillis: 15000,

    // Priority queue
    priorityRange: 2,
  });
}

// Get or create pool
export function getRedisPool(): Pool<RedisClientType> {
  if (!poolInstance) {
    poolInstance = createRedisPool();
  }
  return poolInstance;
}

// Use connection from pool
export async function withRedisClient<T>(
  fn: (client: RedisClientType) => Promise<T>,
  options?: { priority?: number }
): Promise<T> {
  const pool = getRedisPool();
  const client = await pool.acquire(options?.priority);
  
  try {
    return await fn(client);
  } finally {
    await pool.release(client);
  }
}
```

## Usage Patterns

### Basic Operations

```typescript
// Singleton pattern
const redis = await createRedisClient();
const value = await redis.get('key');

// Pool pattern
const value = await withRedisClient(async (redis) => {
  return await redis.get('key');
});

// With priority (1 = high, 0 = normal)
const value = await withRedisClient(async (redis) => {
  return await redis.get('important-key');
}, { priority: 1 });
```

### Batch Operations

```typescript
// Pool pattern for transactions
await withRedisClient(async (redis) => {
  const multi = redis.multi();
  multi.set('key1', 'value1');
  multi.set('key2', 'value2');
  multi.expire('key1', 3600);
  return await multi.exec();
});
```

## Monitoring & Health Checks

### Pool Statistics

```typescript
export function getPoolStats() {
  const pool = getRedisPool();
  return {
    size: pool.size,          // Total connections
    available: pool.available, // Ready to use
    borrowed: pool.borrowed,   // In use
    pending: pool.pending,     // Waiting for connection
    max: pool.max,
    min: pool.min,
  };
}

// Health check endpoint
export async function checkPoolHealth() {
  const stats = getPoolStats();
  const usage = stats.borrowed / stats.max;
  
  return {
    status: usage > 0.9 ? 'critical' : usage > 0.7 ? 'warning' : 'healthy',
    stats,
    recommendation: usage > 0.9 ? 'Increase pool size or optimize queries' : 'OK',
  };
}
```

### Monitoring Endpoint

```typescript
// /api/redis-pool-stats/route.ts
export async function GET() {
  const health = await checkPoolHealth();
  return NextResponse.json(health);
}
```

## Configuration Best Practices

### Environment Variables

```env
# Basic Configuration
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-password
REDIS_PORT=6379

# Pool Configuration
REDIS_POOL_ENABLED=true
REDIS_POOL_MAX_PER_WORKER=19
REDIS_POOL_ABSOLUTE_MAX=245

# Timeouts
REDIS_CONNECT_TIMEOUT=5000
REDIS_COMMAND_TIMEOUT=5000
```

### Calculating Pool Size

```typescript
// Formula for max connections
const calculatePoolSize = (options: {
  maxRedisConnections: number;  // Provider limit (e.g., 250)
  workerCount: number;           // Process count
  reserveConnections: number;    // For monitoring (e.g., 5)
}) => {
  const { maxRedisConnections, workerCount, reserveConnections } = options;
  
  const availableConnections = maxRedisConnections - reserveConnections;
  const maxPerWorker = Math.floor(availableConnections / workerCount);
  
  return {
    maxPerWorker,
    absoluteMax: availableConnections,
    minPerWorker: Math.max(2, Math.floor(maxPerWorker * 0.1)),
  };
};

// Example: 250 connections, 13 workers
// Result: 19 per worker, 245 total, 2 min
```

## Error Handling Strategies

### 1. Connection Errors

```typescript
client.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('Redis server is down');
    // Implement fallback strategy
  } else if (err.code === 'NOAUTH') {
    console.error('Redis authentication failed');
    // Check credentials
  } else {
    console.error('Redis error:', err);
  }
});
```

### 2. Pool Exhaustion

```typescript
export async function withRedisClientSafe<T>(
  fn: (client: RedisClientType) => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await withRedisClient(fn);
  } catch (error: any) {
    if (error.message.includes('ResourceRequest timed out')) {
      console.error('Redis pool exhausted');
      if (fallback !== undefined) return fallback;
    }
    throw error;
  }
}
```

### 3. Circuit Breaker Pattern

```typescript
class RedisCircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           Date.now() - this.lastFailure < this.timeout;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }
}
```

## Performance Optimization

### 1. Pipeline Commands

```typescript
// Instead of multiple await calls
await redis.set('key1', 'value1');
await redis.set('key2', 'value2');
await redis.set('key3', 'value3');

// Use pipeline
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.set('key3', 'value3');
await pipeline.exec();
```

### 2. Connection Warm-up

```typescript
// Pre-create minimum connections on startup
export async function warmUpPool(): Promise<void> {
  const pool = getRedisPool();
  const promises: Promise<any>[] = [];
  
  // Create minimum connections
  for (let i = 0; i < POOL_CONFIG.minPerWorker; i++) {
    promises.push(
      withRedisClient(async (client) => {
        await client.ping();
      })
    );
  }
  
  await Promise.all(promises);
}
```

## Testing Strategies

### 1. Mock Pool for Tests

```typescript
// test-utils/redis-mock.ts
export function createMockRedisPool() {
  const mockClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    // ... other methods
  };

  return {
    acquire: jest.fn().mockResolvedValue(mockClient),
    release: jest.fn().mockResolvedValue(undefined),
    drain: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };
}
```

### 2. Load Testing

```typescript
// Load test the pool
async function loadTestPool(concurrency: number, operations: number) {
  const results = {
    success: 0,
    failed: 0,
    avgTime: 0,
  };

  const times: number[] = [];
  const promises: Promise<void>[] = [];

  for (let i = 0; i < concurrency; i++) {
    promises.push(
      (async () => {
        for (let j = 0; j < operations; j++) {
          const start = Date.now();
          try {
            await withRedisClient(async (client) => {
              await client.ping();
            });
            results.success++;
            times.push(Date.now() - start);
          } catch {
            results.failed++;
          }
        }
      })()
    );
  }

  await Promise.all(promises);
  results.avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  
  return results;
}
```

## Common Pitfalls & Solutions

### 1. Connection Leaks

**Problem**: Not releasing connections back to pool
**Solution**: Always use try/finally or the withRedisClient wrapper

### 2. Pool Starvation

**Problem**: Long-running operations block pool
**Solution**: Set command timeouts and monitor pool stats

### 3. Thundering Herd

**Problem**: All connections try to reconnect simultaneously
**Solution**: Use exponential backoff with jitter

### 4. Memory Leaks

**Problem**: Event listeners not cleaned up
**Solution**: Remove listeners on connection destroy

## Production Checklist

- [ ] Set appropriate pool size based on Redis limits
- [ ] Configure connection and command timeouts
- [ ] Implement health check endpoint
- [ ] Add monitoring for pool statistics
- [ ] Set up alerts for pool exhaustion
- [ ] Test connection recovery
- [ ] Implement graceful shutdown
- [ ] Add circuit breaker for resilience
- [ ] Document pool configuration
- [ ] Load test with expected traffic

## Debugging Commands

```bash
# Check Redis connection count
redis-cli CLIENT LIST | wc -l

# Monitor Redis commands
redis-cli MONITOR

# Check Redis info
redis-cli INFO clients

# Test connection
redis-cli PING
```

This implementation provides a robust, production-ready Redis connection pool that handles real-world challenges like connection limits, high concurrency, and graceful error recovery.