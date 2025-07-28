import { Agent } from 'undici';

// Create a connection pool for internal API calls
const agent = new Agent({
  connections: 10, // Keep 10 connections open
  pipelining: 10,  // Allow 10 requests per connection
  keepAliveTimeout: 10 * 1000, // 10 seconds
  keepAliveMaxTimeout: 30 * 1000, // 30 seconds
});

/**
 * Optimized fetch for internal API calls
 * Uses connection pooling to reduce latency
 */
export async function internalFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    dispatcher: agent,
    // Disable fetch cache to use our own caching
    cache: 'no-store',
  });
}

// Cleanup on exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    agent.close();
  });
}