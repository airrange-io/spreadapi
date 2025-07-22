// Fix service metadata for MCP
const Redis = require('redis');

async function fixService() {
  const redis = Redis.createClient();
  await redis.connect();
  
  const serviceId = 'test1234_mdctzfumgsds0';
  
  // Check if main service key exists
  const exists = await redis.exists(`service:${serviceId}`);
  
  if (!exists) {
    console.log('Creating main service key...');
    // Create the main service key that MCP expects
    await redis.hSet(`service:${serviceId}`, {
      name: 'Test Service',
      description: 'Test spreadsheet service',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    });
    console.log('✅ Created service metadata');
  } else {
    console.log('✅ Service key already exists');
  }
  
  // Verify published data exists
  const publishedExists = await redis.exists(`service:${serviceId}:published`);
  console.log('Published data exists:', publishedExists);
  
  if (publishedExists) {
    const data = await redis.hGetAll(`service:${serviceId}:published`);
    console.log('Published API exists:', !!data.api);
  }
  
  await redis.disconnect();
}

fixService().catch(console.error);