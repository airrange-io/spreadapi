# Redis Connection Pool Configuration

## Overview

The Redis connection pool is designed to work efficiently with Next.js's multi-worker architecture while staying within the Redis provider's connection limit of 256 connections.

## Connection Limits

### Production Configuration
- **Total Redis Limit**: 256 connections
- **Reserved Connections**: 11 (for monitoring, admin tasks, scripts)
- **Usable Connections**: 245
- **Estimated Workers**: ~13 (based on CPU cores)
- **Per Worker Maximum**: 19 connections
- **Per Worker Minimum**: 2 connections

### Calculation Example
With 13 workers × 19 connections = 247 total possible connections
This stays under our 245 limit with a small safety buffer.

## Environment Variables

Configure the pool behavior with these environment variables:

```bash
# Maximum connections per worker process
REDIS_POOL_MAX_PER_WORKER=19

# Absolute maximum across all workers
REDIS_POOL_ABSOLUTE_MAX=245

# Override detected worker count (if needed)
WORKER_COUNT=13

# Standard Redis connection settings
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
```

## Environment-Specific Behavior

### Production
- Uses full capacity with 19 connections per worker
- Longer idle timeouts (30 seconds)
- Health checks every 30 seconds
- Circuit breaker activates after 5 failures

### Development
- Limited to 20 connections per worker (40 total with 2 workers)
- Shorter idle timeouts (10 seconds)
- Less frequent health checks
- More aggressive connection cleanup

### Test
- Minimal connections (5 per worker)
- Very short timeouts
- Suitable for unit testing

## Monitoring

### Check Pool Status
```bash
curl http://localhost:3000/api/redis-pool-stats
```

This returns:
- Current connection count
- Active vs idle connections
- Queue length
- Circuit breaker status
- Performance metrics

### Verify Configuration
```bash
node scripts/verify-redis-pool.js
```

## Migration from Single Connection

To migrate from the single Redis connection to the pool:

1. Replace imports:
   ```javascript
   // Old
   import redis from './lib/redis.js';
   
   // New
   import redis from './lib/redis-pooled.js';
   ```

2. The API remains the same - all existing code continues to work.

## Best Practices

1. **Don't Hold Connections**: The pool automatically manages connections
2. **Use Multi/Transactions**: For multiple operations, use `redis.multi()`
3. **Monitor Stats**: Check `/api/redis-pool-stats` regularly in production
4. **Set Alerts**: Monitor for circuit breaker opens or high queue lengths

## Troubleshooting

### "Connection pool exhausted"
- Check if you have long-running operations holding connections
- Increase `REDIS_POOL_MAX_PER_WORKER` (carefully)
- Check for connection leaks in your code

### "Circuit breaker open"
- Redis might be down or unreachable
- Check Redis server status
- Look for network issues
- Circuit auto-closes after 60 seconds

### High Queue Length
- Too many concurrent requests
- Consider increasing worker count
- Optimize slow Redis operations
- Use caching to reduce Redis load