/**
 * Redis Connection Pool Configuration
 * 
 * Accounts for Next.js running multiple worker processes.
 * Each worker gets its own connection pool with limits to ensure
 * the total doesn't exceed the Redis provider's connection limit.
 */

import os from 'os';

// Detect number of workers (CPU cores in production, limited in dev)
const cpuCount = os.cpus().length;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Estimate number of workers
// Next.js typically uses CPU count for workers in production
const estimatedWorkers = isProduction ? cpuCount : (isDevelopment ? 2 : 1);

// Redis provider limit (256 connections based on your plan)
const REDIS_PROVIDER_LIMIT = 256;
const RESERVED_CONNECTIONS = 11; // Reserve for monitoring, admin, one-off scripts
const USABLE_CONNECTIONS = REDIS_PROVIDER_LIMIT - RESERVED_CONNECTIONS; // 245

// Calculate per-worker limits
const calculatePerWorkerLimits = (totalWorkers) => {
  // Conservative calculation to ensure we never exceed provider limit
  const maxPerWorker = Math.floor(USABLE_CONNECTIONS / totalWorkers);
  const minPerWorker = Math.max(2, Math.floor(maxPerWorker / 10)); // 10% of max, minimum 2
  
  return {
    min: minPerWorker,
    max: maxPerWorker
  };
};

export const poolConfig = {
  // Development settings (conservative for local testing)
  development: {
    minConnections: 2,
    maxConnections: Math.min(20, Math.floor(USABLE_CONNECTIONS / 2)), // Max 20 for dev
    maxWaitingClients: 100,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    acquireTimeoutMillis: 5000,
    healthCheckInterval: 60000,
    circuitBreakerThreshold: 3,
    circuitBreakerTimeout: 30000
  },
  
  // Production settings (optimized for multi-worker environment)
  production: {
    minConnections: calculatePerWorkerLimits(estimatedWorkers).min,
    maxConnections: calculatePerWorkerLimits(estimatedWorkers).max,
    maxWaitingClients: 1000,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    acquireTimeoutMillis: 5000,
    healthCheckInterval: 30000,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000
  },
  
  // Test settings (minimal connections)
  test: {
    minConnections: 1,
    maxConnections: 5,
    maxWaitingClients: 50,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 3000,
    acquireTimeoutMillis: 3000,
    healthCheckInterval: 120000,
    circuitBreakerThreshold: 2,
    circuitBreakerTimeout: 10000
  }
};

// Get configuration based on environment
export function getPoolConfig() {
  if (isProduction) return poolConfig.production;
  if (isDevelopment) return poolConfig.development;
  if (process.env.NODE_ENV === 'test') return poolConfig.test;
  
  // Default to development settings
  return poolConfig.development;
}

// Allow override via environment variables with multi-worker awareness
export function getConfigWithOverrides() {
  const config = getPoolConfig();
  
  // Environment variable overrides
  const envMaxPerWorker = parseInt(process.env.REDIS_POOL_MAX_PER_WORKER);
  const envAbsoluteMax = parseInt(process.env.REDIS_POOL_ABSOLUTE_MAX) || USABLE_CONNECTIONS;
  const envWorkerCount = parseInt(process.env.WORKER_COUNT) || estimatedWorkers;
  
  // If per-worker max is specified, use it
  let maxConnections = config.maxConnections;
  if (envMaxPerWorker) {
    maxConnections = envMaxPerWorker;
  }
  
  // Ensure we don't exceed absolute maximum when multiplied by workers
  const totalPossibleConnections = maxConnections * envWorkerCount;
  if (totalPossibleConnections > envAbsoluteMax) {
    maxConnections = Math.floor(envAbsoluteMax / envWorkerCount);
    console.warn(`Adjusted max connections per worker from ${config.maxConnections} to ${maxConnections} to stay under absolute limit of ${envAbsoluteMax}`);
  }
  
  return {
    ...config,
    // Connection limits
    minConnections: parseInt(process.env.REDIS_MIN_CONNECTIONS) || config.minConnections,
    maxConnections: maxConnections,
    
    // Other overrides
    maxWaitingClients: parseInt(process.env.REDIS_MAX_WAITING_CLIENTS) || config.maxWaitingClients,
    idleTimeoutMillis: parseInt(process.env.REDIS_IDLE_TIMEOUT) || config.idleTimeoutMillis,
    connectionTimeoutMillis: parseInt(process.env.REDIS_CONNECTION_TIMEOUT) || config.connectionTimeoutMillis,
    acquireTimeoutMillis: parseInt(process.env.REDIS_ACQUIRE_TIMEOUT) || config.acquireTimeoutMillis,
    healthCheckInterval: parseInt(process.env.REDIS_HEALTH_CHECK_INTERVAL) || config.healthCheckInterval,
    
    // Metadata for monitoring
    _meta: {
      environment: process.env.NODE_ENV || 'development',
      workerCount: envWorkerCount,
      absoluteMax: envAbsoluteMax,
      providerLimit: REDIS_PROVIDER_LIMIT,
      reservedConnections: RESERVED_CONNECTIONS,
      theoreticalTotal: maxConnections * envWorkerCount
    }
  };
}

// Helper to log configuration details
export function logPoolConfiguration() {
  const config = getConfigWithOverrides();
  console.log('Redis Pool Configuration:', {
    environment: config._meta.environment,
    perWorker: {
      min: config.minConnections,
      max: config.maxConnections
    },
    estimated: {
      workers: config._meta.workerCount,
      totalConnections: config._meta.theoreticalTotal,
      absoluteLimit: config._meta.absoluteMax,
      providerLimit: config._meta.providerLimit
    },
    safety: {
      reserved: config._meta.reservedConnections,
      headroom: config._meta.providerLimit - config._meta.theoreticalTotal
    }
  });
}