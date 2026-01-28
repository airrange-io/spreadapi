import { createClient } from "redis";

const redis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // tls: true,
    connectTimeout: 10000,
    keepAlive: 5000,
  },
  commandsQueueMaxLength: 10000,
  disableOfflineQueue: false,
  // Redis v5: Use RESP2 protocol for backward compatibility
  // This makes hGetAll return plain objects instead of Maps
  RESP: 2,
});

redis.connect().catch((err) => {
  console.error('[Redis] Connection failed:', err.message);
});

redis.on("error", (err) => {
  console.error('[Redis] Error:', err.message);
});

export default redis;
