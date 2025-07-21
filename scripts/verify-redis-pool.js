#!/usr/bin/env node

/**
 * Verification script for Redis connection pool configuration
 * Run with: node scripts/verify-redis-pool.js
 */

import { getConfigWithOverrides, logPoolConfiguration } from '../lib/redis-pool-config.js';
import { getPool, getPoolStats } from '../lib/redis-pool.js';

console.log('=== Redis Connection Pool Verification ===\n');

// Show environment variables
console.log('Environment Variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set (defaults to development)'}`);
console.log(`- REDIS_POOL_MAX_PER_WORKER: ${process.env.REDIS_POOL_MAX_PER_WORKER || 'not set'}`);
console.log(`- REDIS_POOL_ABSOLUTE_MAX: ${process.env.REDIS_POOL_ABSOLUTE_MAX || 'not set'}`);
console.log(`- WORKER_COUNT: ${process.env.WORKER_COUNT || 'not set (auto-detected)'}`);
console.log(`- REDIS_HOST: ${process.env.REDIS_HOST || 'not set'}`);
console.log(`- REDIS_PORT: ${process.env.REDIS_PORT || 'not set'}`);
console.log();

// Get and display configuration
const config = getConfigWithOverrides();
console.log('Calculated Configuration:');
console.log(`- Environment: ${config._meta.environment}`);
console.log(`- Worker Count: ${config._meta.workerCount}`);
console.log(`- Connections per Worker: ${config.minConnections}-${config.maxConnections}`);
console.log(`- Total Theoretical Max: ${config._meta.theoreticalTotal}`);
console.log(`- Absolute Limit: ${config._meta.absoluteMax}`);
console.log(`- Provider Limit: ${config._meta.providerLimit}`);
console.log(`- Reserved Connections: ${config._meta.reservedConnections}`);
console.log(`- Safety Headroom: ${config._meta.providerLimit - config._meta.theoreticalTotal}`);
console.log();

// Test pool initialization
console.log('Testing Pool Initialization...');
try {
  const pool = getPool();
  console.log('✓ Pool created successfully');
  
  // Wait a moment for initial connections
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get pool stats
  const stats = getPoolStats();
  console.log('\nPool Statistics:');
  console.log(`- Total Connections: ${stats.connections.total}`);
  console.log(`- Active Connections: ${stats.connections.active}`);
  console.log(`- Available Connections: ${stats.connections.available}`);
  console.log(`- Waiting Clients: ${stats.connections.waiting}`);
  console.log(`- Circuit Breaker: ${stats.circuit.isOpen ? 'OPEN' : 'CLOSED'}`);
  
  // Test a simple operation
  console.log('\nTesting Redis Operation...');
  const testResult = await pool.execute(async (client) => {
    await client.set('pool:test', 'success', { EX: 60 });
    return await client.get('pool:test');
  }, 'test-operation');
  
  console.log(`✓ Test operation result: ${testResult}`);
  
  // Show detailed configuration
  console.log('\n=== Detailed Pool Configuration ===');
  logPoolConfiguration();
  
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}

console.log('\n✓ All checks passed!');