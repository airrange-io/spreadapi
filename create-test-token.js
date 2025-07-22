const Redis = require('redis');
const crypto = require('crypto');

async function createTestToken() {
  const redis = Redis.createClient({
    password: process.env.REDIS_PASSWORD || "I6j6oL7lwqJAHejOb4CDzv8DdQ9a1Q9J",
    socket: {
      host: process.env.REDIS_HOST || "redis-10011.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
      port: process.env.REDIS_PORT || 10011
    }
  });
  
  await redis.connect();
  
  // Generate token
  const token = `spapi_live_${crypto.randomBytes(32).toString('hex')}`;
  
  // Store token
  await redis.hSet(`mcp:token:${token}`, {
    name: 'Test Token for Debugging',
    description: 'Created for MCP debugging',
    userId: 'temp-user-default',
    created: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    requests: '0',
    isActive: 'true'
  });
  
  console.log('Created token:', token);
  console.log('\nTest with:');
  console.log(`curl -X POST http://localhost:3000/api/mcp/v1 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | jq`);
  
  await redis.disconnect();
}

createTestToken().catch(console.error);