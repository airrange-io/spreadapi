const Redis = require('redis');

async function checkService() {
  const redis = Redis.createClient();
  await redis.connect();
  
  const serviceId = 'test1234_mdctzfumgsds0';
  
  console.log('Checking service:', serviceId);
  
  // Check main key
  const mainExists = await redis.exists(`service:${serviceId}`);
  console.log(`\n1. Main key service:${serviceId} exists:`, mainExists === 1);
  
  if (mainExists) {
    const mainData = await redis.hGetAll(`service:${serviceId}`);
    console.log('   Main data:', mainData);
  }
  
  // Check published key  
  const pubExists = await redis.exists(`service:${serviceId}:published`);
  console.log(`\n2. Published key service:${serviceId}:published exists:`, pubExists === 1);
  
  if (pubExists) {
    const pubData = await redis.hGetAll(`service:${serviceId}:published`);
    console.log('   Has api field:', !!pubData.api);
    console.log('   Fields:', Object.keys(pubData));
  }
  
  await redis.disconnect();
}

checkService().catch(console.error);