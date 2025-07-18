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
redis.connect();
redis.on("error", (err) => console.log("Redis Client Error", err));
let isReady = redis.isReady;
console.timeEnd("createClient");

export default redis;
