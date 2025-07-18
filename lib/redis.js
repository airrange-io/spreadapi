import { createClient } from "redis";

console.time("createClient");
const redis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // tls: true,
  },
});

// Track Redis connection state
let redisConnected = false;

redis.connect().then(() => {
  redisConnected = true;
  console.log("Redis connected successfully");
}).catch((err) => {
  console.error("Redis connection failed:", err.message);
  console.log("Service will continue without Redis caching");
});

redis.on("error", (err) => {
  console.log("Redis Client Error", err);
  redisConnected = false;
});

redis.on("ready", () => {
  redisConnected = true;
});

// Export a wrapper that checks connection status
export const isRedisConnected = () => redisConnected;

console.timeEnd("createClient");

export default redis;
