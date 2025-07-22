const Redis = require('redis');

async function debugMCP() {
  const redis = Redis.createClient({
    password: "I6j6oL7lwqJAHejOb4CDzv8DdQ9a1Q9J",
    socket: {
      host: "redis-10011.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
      port: 10011
    }
  });
  
  await redis.connect();
  
  console.log('Checking published services...\n');
  
  // Get published keys
  const publishedKeys = await redis.keys('service:*:published');
  console.log('Found published keys:', publishedKeys);
  
  for (const key of publishedKeys) {
    console.log(`\nChecking ${key}:`);
    const data = await redis.hGetAll(key);
    
    console.log('- Has api field:', !!data.api);
    console.log('- Has aiDescription:', !!data.aiDescription);
    console.log('- All fields:', Object.keys(data));
    
    if (data.urlData) {
      console.log('- urlData type:', typeof data.urlData);
      console.log('- urlData preview:', data.urlData.substring(0, 100) + '...');
    }
    
    if (data.api) {
      try {
        const api = JSON.parse(data.api);
        console.log('- Inputs:', api.inputs?.length || 0);
        console.log('- Outputs:', api.outputs?.length || 0);
      } catch (e) {
        console.log('- API parse error:', e.message);
      }
    }
  }
  
  await redis.disconnect();
}

debugMCP().catch(console.error);