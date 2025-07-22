const Redis = require('redis');

async function testMulti() {
  const redis = Redis.createClient({
    password: "I6j6oL7lwqJAHejOb4CDzv8DdQ9a1Q9J",
    socket: {
      host: "redis-10011.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
      port: 10011
    }
  });
  
  await redis.connect();
  
  const serviceId = 'test1234_mdctzfumgsds0';
  
  // Test single EXISTS
  const singleExists = await redis.exists(`service:${serviceId}:published`);
  console.log('Single EXISTS result:', singleExists, 'type:', typeof singleExists);
  
  // Test multi EXISTS
  const multi = redis.multi();
  multi.hGetAll(`service:${serviceId}`);
  multi.exists(`service:${serviceId}:published`);
  multi.hGetAll(`service:${serviceId}:published`);
  
  const results = await multi.exec();
  
  console.log('\nMulti results:');
  console.log('results[0] (service data):', !!results[0]);
  console.log('results[1] (exists):', results[1], 'type:', typeof results[1]);
  console.log('results[2] (published data):', results[2]);
  
  console.log('\nTruthiness tests:');
  console.log('results[1] ? "truthy" : "falsy":', results[1] ? "truthy" : "falsy");
  console.log('results[1] === 1:', results[1] === 1);
  console.log('results[1] == 1:', results[1] == 1);
  
  await redis.disconnect();
}

testMulti().catch(console.error);