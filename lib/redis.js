import { createClient } from "redis";

const redis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // tls: true,
    connectTimeout: 10000, // 10 seconds
    keepAlive: true,
    keepAliveInitialDelay: 5000, // 5 seconds
    reconnectStrategy: (retries) => {
      if (retries > 10) return false; // Stop after 10 retries
      return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
    },
  },
  commandsQueueMaxLength: 10000,
  disableOfflineQueue: false,
  // Redis v5: Use RESP2 protocol for backward compatibility
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
