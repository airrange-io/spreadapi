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
  maxRetriesPerRequest: 3,
  RESP: 2,
});

redis.connect().catch(() => {});
redis.on("error", () => {});

export default redis;
