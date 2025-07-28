// Test Redis published services

const redis = require('./lib/redis').default;

async function testRedis() {
  try {
    console.log('Checking Redis for published services...\n');
    
    // Find all published service keys
    const publishedKeys = await redis.keys('service:*:published');
    console.log(`Found ${publishedKeys.length} published service keys:`, publishedKeys);
    
    // Check each published service
    for (const key of publishedKeys) {
      const serviceId = key.replace('service:', '').replace(':published', '');
      console.log(`\nService ID: ${serviceId}`);
      
      // Get published data
      const publishedData = await redis.hGetAll(key);
      console.log('Published data keys:', Object.keys(publishedData));
      
      // Get metadata
      const metadataKey = `service:${serviceId}:metadata`;
      const metadataExists = await redis.exists(metadataKey);
      console.log(`Metadata exists: ${metadataExists}`);
      
      if (metadataExists) {
        const metadata = await redis.hGetAll(metadataKey);
        console.log('Metadata:', {
          id: metadata.id,
          name: metadata.name,
          title: metadata.title
        });
      }
      
      // Check basic service key
      const serviceKey = `service:${serviceId}`;
      const serviceExists = await redis.exists(serviceKey);
      console.log(`Basic service key exists: ${serviceExists}`);
      
      if (serviceExists) {
        const serviceData = await redis.hGetAll(serviceKey);
        console.log('Service data keys:', Object.keys(serviceData));
      }
    }
    
    // Also check for any service metadata keys
    console.log('\n--- Checking all metadata keys ---');
    const metadataKeys = await redis.keys('service:*:metadata');
    console.log(`Found ${metadataKeys.length} metadata keys:`, metadataKeys);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await redis.quit();
  }
}

testRedis();