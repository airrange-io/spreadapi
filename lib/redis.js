import { createClient } from "redis";

const redis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // tls: true,
    connectTimeout: 10000, // 10 seconds
    keepAlive: 5000, // 5 seconds
  },
  // Connection pool settings for the base Redis client
  // Note: This is different from redis-pool.js which manages a pool of clients
  commandsQueueMaxLength: 10000, // Increased from default
  disableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  // Redis v5 compatibility: Use RESP2 protocol for backward compatibility
  // This makes hGetAll return plain objects instead of Maps
  RESP: 2,
});

// Track Redis connection state
let redisConnected = false;

redis.connect().then(() => {
  redisConnected = true;
}).catch((err) => {
  // Redis connection failed
});

redis.on("error", (err) => {
  // Redis Client Error
  redisConnected = false;
});

redis.on("ready", () => {
  redisConnected = true;
});

// Export a wrapper that checks connection status
export const isRedisConnected = () => redisConnected;


export default redis;
