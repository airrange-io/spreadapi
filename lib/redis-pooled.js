/**
 * Redis client with connection pooling
 * Drop-in replacement for the existing redis.js
 */
import { execute, pipeline, transaction, getPool, shutdownPool } from './redis-pool.js';

// Create a pooled Redis client that matches the existing interface
class PooledRedisClient {
  constructor() {
    this.connected = false;
    this.pool = getPool();
    
    // Initialize connection state
    this.pool.initialize().then(() => {
      this.connected = true;
      console.log('Redis pool connected successfully');
    }).catch((err) => {
      console.error('Redis pool connection failed:', err.message);
      console.log('Service will continue with limited Redis functionality');
    });
  }

  // Match the existing Redis client interface
  async hGetAll(key) {
    return execute(client => client.hGetAll(key), 'hGetAll');
  }

  async hGet(key, field) {
    return execute(client => client.hGet(key, field), 'hGet');
  }

  async hSet(key, field, value) {
    if (typeof field === 'object') {
      // Handle object format hSet(key, { field: value })
      return execute(client => client.hSet(key, field), 'hSet');
    }
    return execute(client => client.hSet(key, field, value), 'hSet');
  }

  async hMSet(key, values) {
    return execute(client => client.hMSet(key, values), 'hMSet');
  }

  async hMGet(key, ...fields) {
    return execute(client => client.hMGet(key, ...fields), 'hMGet');
  }

  async hIncrBy(key, field, increment) {
    return execute(client => client.hIncrBy(key, field, increment), 'hIncrBy');
  }

  async hDel(key, ...fields) {
    return execute(client => client.hDel(key, ...fields), 'hDel');
  }

  async hExists(key, field) {
    return execute(client => client.hExists(key, field), 'hExists');
  }

  async exists(...keys) {
    return execute(client => client.exists(...keys), 'exists');
  }

  async get(key) {
    return execute(client => client.get(key), 'get');
  }

  async set(key, value, options) {
    return execute(client => client.set(key, value, options), 'set');
  }

  async setEx(key, seconds, value) {
    return execute(client => client.setEx(key, seconds, value), 'setEx');
  }

  async del(...keys) {
    return execute(client => client.del(...keys), 'del');
  }

  async expire(key, seconds) {
    return execute(client => client.expire(key, seconds), 'expire');
  }

  async ttl(key) {
    return execute(client => client.ttl(key), 'ttl');
  }

  async incr(key) {
    return execute(client => client.incr(key), 'incr');
  }

  async incrBy(key, increment) {
    return execute(client => client.incrBy(key, increment), 'incrBy');
  }

  async sAdd(key, ...members) {
    return execute(client => client.sAdd(key, ...members), 'sAdd');
  }

  async sMembers(key) {
    return execute(client => client.sMembers(key), 'sMembers');
  }

  async sIsMember(key, member) {
    return execute(client => client.sIsMember(key, member), 'sIsMember');
  }

  async sRem(key, ...members) {
    return execute(client => client.sRem(key, ...members), 'sRem');
  }

  async sCard(key) {
    return execute(client => client.sCard(key), 'sCard');
  }

  async zAdd(key, ...membersAndScores) {
    return execute(client => client.zAdd(key, ...membersAndScores), 'zAdd');
  }

  async zRange(key, start, stop, options) {
    return execute(client => client.zRange(key, start, stop, options), 'zRange');
  }

  async zRevRange(key, start, stop, options) {
    return execute(client => client.zRevRange(key, start, stop, options), 'zRevRange');
  }

  async zRem(key, ...members) {
    return execute(client => client.zRem(key, ...members), 'zRem');
  }

  async keys(pattern) {
    return execute(client => client.keys(pattern), 'keys');
  }

  async scan(cursor, options) {
    return execute(client => client.scan(cursor, options), 'scan');
  }

  async ping() {
    return execute(client => client.ping(), 'ping');
  }

  // Transaction support
  multi() {
    const operations = [];
    const multiProxy = {
      hGetAll: (key) => { operations.push(m => m.hGetAll(key)); return multiProxy; },
      hGet: (key, field) => { operations.push(m => m.hGet(key, field)); return multiProxy; },
      hSet: (key, field, value) => { 
        if (typeof field === 'object') {
          operations.push(m => m.hSet(key, field)); 
        } else {
          operations.push(m => m.hSet(key, field, value)); 
        }
        return multiProxy; 
      },
      hIncrBy: (key, field, increment) => { operations.push(m => m.hIncrBy(key, field, increment)); return multiProxy; },
      hDel: (key, ...fields) => { operations.push(m => m.hDel(key, ...fields)); return multiProxy; },
      set: (key, value, options) => { operations.push(m => m.set(key, value, options)); return multiProxy; },
      setEx: (key, seconds, value) => { operations.push(m => m.setEx(key, seconds, value)); return multiProxy; },
      del: (...keys) => { operations.push(m => m.del(...keys)); return multiProxy; },
      expire: (key, seconds) => { operations.push(m => m.expire(key, seconds)); return multiProxy; },
      incr: (key) => { operations.push(m => m.incr(key)); return multiProxy; },
      incrBy: (key, increment) => { operations.push(m => m.incrBy(key, increment)); return multiProxy; },
      sAdd: (key, ...members) => { operations.push(m => m.sAdd(key, ...members)); return multiProxy; },
      sRem: (key, ...members) => { operations.push(m => m.sRem(key, ...members)); return multiProxy; },
      exec: () => transaction(operations)
    };
    return multiProxy;
  }

  // Pipeline support
  pipeline() {
    const operations = [];
    const pipelineProxy = {
      hGetAll: (key) => { operations.push(p => p.hGetAll(key)); return pipelineProxy; },
      hGet: (key, field) => { operations.push(p => p.hGet(key, field)); return pipelineProxy; },
      hSet: (key, field, value) => { 
        if (typeof field === 'object') {
          operations.push(p => p.hSet(key, field)); 
        } else {
          operations.push(p => p.hSet(key, field, value)); 
        }
        return pipelineProxy; 
      },
      hMGet: (key, ...fields) => { operations.push(p => p.hMGet(key, ...fields)); return pipelineProxy; },
      hIncrBy: (key, field, increment) => { operations.push(p => p.hIncrBy(key, field, increment)); return pipelineProxy; },
      exists: (...keys) => { operations.push(p => p.exists(...keys)); return pipelineProxy; },
      get: (key) => { operations.push(p => p.get(key)); return pipelineProxy; },
      set: (key, value, options) => { operations.push(p => p.set(key, value, options)); return pipelineProxy; },
      del: (...keys) => { operations.push(p => p.del(...keys)); return pipelineProxy; },
      expire: (key, seconds) => { operations.push(p => p.expire(key, seconds)); return pipelineProxy; },
      incr: (key) => { operations.push(p => p.incr(key)); return pipelineProxy; },
      incrBy: (key, increment) => { operations.push(p => p.incrBy(key, increment)); return pipelineProxy; },
      exec: () => pipeline(operations)
    };
    return pipelineProxy;
  }

  // Connection state helpers
  get isReady() {
    return this.connected && !this.pool.isCircuitOpen();
  }

  async quit() {
    await shutdownPool();
  }

  async disconnect() {
    await shutdownPool();
  }

  // Event emulation (for compatibility)
  on(event, callback) {
    // Pool handles events internally
    if (event === 'ready' && this.connected) {
      callback();
    }
  }
}

// Create singleton instance
const redis = new PooledRedisClient();

// Track connection state
let redisConnected = false;

redis.pool.initialize().then(() => {
  redisConnected = true;
}).catch(() => {
  redisConnected = false;
});

// Export connection state checker
export const isRedisConnected = () => redisConnected && redis.isReady;

export default redis;