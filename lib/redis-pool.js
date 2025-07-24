import { createClient } from 'redis';
import { redisMonitor } from './redis-monitor.js';
import { getConfigWithOverrides, logPoolConfiguration } from './redis-pool-config.js';

/**
 * Redis Connection Pool Manager for Redis.io
 * 
 * Manages a pool of Redis connections to maximize throughput and minimize latency.
 * Features:
 * - Connection pooling with configurable size
 * - Connection health monitoring
 * - Automatic reconnection handling
 * - Request queuing when pool is exhausted
 * - Circuit breaker pattern for fault tolerance
 * - Performance monitoring integration
 */
class RedisConnectionPool {
  constructor(config = {}) {
    this.config = {
      minConnections: config.minConnections || 10,
      maxConnections: config.maxConnections || 256,
      maxWaitingClients: config.maxWaitingClients || 1000,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
      acquireTimeoutMillis: config.acquireTimeoutMillis || 5000,
      healthCheckInterval: config.healthCheckInterval || 30000,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout || 60000,
      enableReadyCheck: config.enableReadyCheck !== false,
      enableOfflineQueue: config.enableOfflineQueue !== false,
      ...config
    };

    // Pool state
    this.connections = [];
    this.availableConnections = [];
    this.activeConnections = new Set();
    this.waitingClients = [];
    this.isShuttingDown = false;

    // Circuit breaker state
    this.failureCount = 0;
    this.circuitOpenTime = null;

    // Statistics
    this.stats = {
      created: 0,
      destroyed: 0,
      acquired: 0,
      released: 0,
      timeouts: 0,
      errors: 0,
      queueSize: 0,
      circuitOpens: 0
    };

    // Redis connection config
    this.redisConfig = {
      username: 'default',
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: this.config.connectionTimeoutMillis,
        keepAlive: 30000,
        noDelay: true
      },
      enableReadyCheck: this.config.enableReadyCheck,
      enableOfflineQueue: this.config.enableOfflineQueue,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          // Stop retrying after 3 attempts
          return null;
        }
        // Exponential backoff
        return Math.min(times * 100, 3000);
      }
    };

    // Initialize pool
    this.initialize();
  }

  async initialize() {
    console.log(`Initializing Redis connection pool with ${this.config.minConnections} connections`);
    
    // Create initial connections
    const promises = [];
    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }
    
    try {
      await Promise.all(promises);
      console.log(`Redis pool initialized with ${this.availableConnections.length} connections`);
      
      // Start health check
      this.startHealthCheck();
    } catch (error) {
      console.error('Failed to initialize Redis pool:', error);
      throw error;
    }
  }

  async createConnection() {
    if (this.connections.length >= this.config.maxConnections) {
      throw new Error('Maximum number of connections reached');
    }

    try {
      const client = createClient(this.redisConfig);
      
      // Set up event handlers
      client.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.handleConnectionError(client);
      });

      client.on('ready', () => {
        console.log('Redis connection ready');
      });

      client.on('reconnecting', () => {
        console.log('Redis connection reconnecting');
      });

      // Connect
      await client.connect();
      
      // Create connection wrapper
      const connection = {
        id: Date.now() + Math.random(),
        client,
        created: Date.now(),
        lastUsed: Date.now(),
        useCount: 0,
        errors: 0,
        isHealthy: true
      };

      this.connections.push(connection);
      this.availableConnections.push(connection);
      this.stats.created++;

      return connection;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  async acquire() {
    if (this.isShuttingDown) {
      throw new Error('Pool is shutting down');
    }

    // Check circuit breaker
    if (this.isCircuitOpen()) {
      this.stats.errors++;
      throw new Error('Circuit breaker is open - Redis service temporarily unavailable');
    }

    // Try to get an available connection
    let connection = this.availableConnections.shift();

    if (connection) {
      // Check if connection is still healthy
      if (!connection.isHealthy || !connection.client.isReady) {
        await this.destroyConnection(connection);
        return this.acquire(); // Recursive call to get another connection
      }

      this.activeConnections.add(connection);
      connection.lastUsed = Date.now();
      connection.useCount++;
      this.stats.acquired++;
      return connection;
    }

    // Try to create a new connection if under limit
    if (this.connections.length < this.config.maxConnections) {
      try {
        connection = await this.createConnection();
        this.availableConnections.shift(); // Remove from available
        this.activeConnections.add(connection);
        connection.useCount++;
        this.stats.acquired++;
        return connection;
      } catch (error) {
        console.error('Failed to create new connection:', error);
      }
    }

    // Queue the request
    if (this.waitingClients.length >= this.config.maxWaitingClients) {
      throw new Error('Connection pool exhausted and queue is full');
    }

    return this.waitForConnection();
  }

  async waitForConnection() {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.waitingClients.indexOf(client);
        if (index !== -1) {
          this.waitingClients.splice(index, 1);
        }
        this.stats.timeouts++;
        reject(new Error('Acquire timeout - no connection available'));
      }, this.config.acquireTimeoutMillis);

      const client = { resolve, reject, timer };
      this.waitingClients.push(client);
      this.stats.queueSize = this.waitingClients.length;
    });
  }

  release(connection) {
    if (!connection || !this.activeConnections.has(connection)) {
      console.warn('Attempted to release invalid connection');
      return;
    }

    this.activeConnections.delete(connection);
    this.stats.released++;

    // Check if there are waiting clients
    if (this.waitingClients.length > 0) {
      const client = this.waitingClients.shift();
      this.stats.queueSize = this.waitingClients.length;
      clearTimeout(client.timer);
      
      // Give connection to waiting client
      this.activeConnections.add(connection);
      connection.lastUsed = Date.now();
      connection.useCount++;
      this.stats.acquired++;
      client.resolve(connection);
      return;
    }

    // Check if connection should be destroyed
    if (!connection.isHealthy || this.connections.length > this.config.minConnections) {
      const idleTime = Date.now() - connection.lastUsed;
      if (!connection.isHealthy || idleTime > this.config.idleTimeoutMillis) {
        this.destroyConnection(connection);
        return;
      }
    }

    // Return to available pool
    this.availableConnections.push(connection);
  }

  async destroyConnection(connection) {
    const index = this.connections.indexOf(connection);
    if (index !== -1) {
      this.connections.splice(index, 1);
    }

    const availIndex = this.availableConnections.indexOf(connection);
    if (availIndex !== -1) {
      this.availableConnections.splice(availIndex, 1);
    }

    this.activeConnections.delete(connection);

    try {
      await connection.client.quit();
    } catch (error) {
      console.error('Error closing connection:', error);
    }

    this.stats.destroyed++;
  }

  async execute(operation, operationName = 'unknown') {
    let connection;
    
    try {
      connection = await this.acquire();
      
      // Monitor the operation
      const result = await redisMonitor.monitor(operationName, async () => {
        return await operation(connection.client);
      });
      
      // Reset failure count on success
      this.failureCount = 0;
      
      return result;
    } catch (error) {
      this.handleOperationError(error, connection);
      throw error;
    } finally {
      if (connection) {
        this.release(connection);
      }
    }
  }

  async transaction(operations) {
    let connection;
    
    try {
      connection = await this.acquire();
      const multi = connection.client.multi();
      
      // Execute all operations in transaction
      for (const op of operations) {
        op(multi);
      }
      
      // Execute transaction
      const results = await redisMonitor.monitor('transaction', async () => {
        return await multi.exec();
      });
      
      return results;
    } catch (error) {
      this.handleOperationError(error, connection);
      throw error;
    } finally {
      if (connection) {
        this.release(connection);
      }
    }
  }

  async pipeline(operations) {
    let connection;
    
    try {
      connection = await this.acquire();
      const multi = connection.client.multi();
      
      // Add all operations to multi
      for (const op of operations) {
        op(multi);
      }
      
      // Execute multi
      const results = await redisMonitor.monitor('pipeline', async () => {
        return await multi.exec();
      });
      
      return results;
    } catch (error) {
      this.handleOperationError(error, connection);
      throw error;
    } finally {
      if (connection) {
        this.release(connection);
      }
    }
  }

  handleConnectionError(connection) {
    connection.isHealthy = false;
    connection.errors++;
    this.stats.errors++;
  }

  handleOperationError(error, connection) {
    this.failureCount++;
    
    if (connection) {
      connection.errors++;
      
      // Mark unhealthy if too many errors
      if (connection.errors > 5) {
        connection.isHealthy = false;
      }
    }
    
    // Open circuit if threshold reached
    if (this.failureCount >= this.config.circuitBreakerThreshold) {
      this.openCircuit();
    }
  }

  openCircuit() {
    this.circuitOpenTime = Date.now();
    this.stats.circuitOpens++;
    console.warn('Circuit breaker opened due to repeated failures');
  }

  isCircuitOpen() {
    if (!this.circuitOpenTime) return false;
    
    // Check if circuit should be closed
    if (Date.now() - this.circuitOpenTime > this.config.circuitBreakerTimeout) {
      this.closeCircuit();
      return false;
    }
    
    return true;
  }

  closeCircuit() {
    this.circuitOpenTime = null;
    this.failureCount = 0;
    console.info('Circuit breaker closed');
  }

  async healthCheck() {
    const unhealthyConnections = [];
    
    for (const connection of this.availableConnections) {
      try {
        await connection.client.ping();
        connection.isHealthy = true;
        connection.errors = 0;
      } catch (error) {
        console.error(`Health check failed for connection ${connection.id}:`, error);
        connection.isHealthy = false;
        unhealthyConnections.push(connection);
      }
    }
    
    // Remove unhealthy connections
    for (const connection of unhealthyConnections) {
      await this.destroyConnection(connection);
    }
    
    // Ensure minimum connections
    while (this.connections.length < this.config.minConnections) {
      try {
        await this.createConnection();
      } catch (error) {
        console.error('Failed to create connection during health check:', error);
        break;
      }
    }
  }

  startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      this.healthCheck().catch(console.error);
    }, this.config.healthCheckInterval);
  }

  getStats() {
    return {
      ...this.stats,
      connections: {
        total: this.connections.length,
        active: this.activeConnections.size,
        available: this.availableConnections.length,
        waiting: this.waitingClients.length
      },
      circuit: {
        isOpen: this.isCircuitOpen(),
        failureCount: this.failureCount
      },
      connectionDetails: this.connections.map(conn => ({
        id: conn.id,
        created: new Date(conn.created),
        lastUsed: new Date(conn.lastUsed),
        useCount: conn.useCount,
        errors: conn.errors,
        isHealthy: conn.isHealthy,
        isActive: this.activeConnections.has(conn)
      }))
    };
  }

  async shutdown() {
    console.log('Shutting down Redis connection pool');
    this.isShuttingDown = true;
    
    // Clear health check
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Reject all waiting clients
    for (const client of this.waitingClients) {
      clearTimeout(client.timer);
      client.reject(new Error('Pool is shutting down'));
    }
    this.waitingClients = [];
    
    // Wait for active connections to be released
    const timeout = Date.now() + 5000;
    while (this.activeConnections.size > 0 && Date.now() < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Destroy all connections
    const promises = this.connections.map(conn => this.destroyConnection(conn));
    await Promise.all(promises);
    
    console.log('Redis connection pool shutdown complete');
  }
}

// Create singleton instance
let poolInstance = null;

export function getPool() {
  if (!poolInstance) {
    const config = getConfigWithOverrides();
    // Log detailed configuration on first initialization
    logPoolConfiguration();
    poolInstance = new RedisConnectionPool(config);
  }
  return poolInstance;
}

// Export convenience methods
export const execute = (operation, operationName) => getPool().execute(operation, operationName);
export const transaction = (operations) => getPool().transaction(operations);
export const pipeline = (operations) => getPool().pipeline(operations); // Note: uses multi() internally
export const getPoolStats = () => getPool().getStats();
export const shutdownPool = () => getPool().shutdown();