const Redis = require('redis');

async function createPublished() {
  const redis = Redis.createClient();
  await redis.connect();
  
  const serviceId = 'test1234_mdctzfumgsds0';
  
  // Create published data
  const apiDefinition = {
    inputs: [
      { name: 'input1', type: 'number', description: 'First input', mandatory: true },
      { name: 'input2', type: 'number', description: 'Second input', mandatory: true }
    ],
    outputs: [
      { name: 'result', type: 'number', description: 'Calculation result' }
    ]
  };
  
  await redis.hSet(`service:${serviceId}:published`, {
    api: JSON.stringify(apiDefinition),
    logic: 'return { result: input1 + input2 };',
    published: new Date().toISOString(),
    aiDescription: 'A simple calculator that adds two numbers',
    aiUsageExamples: JSON.stringify(['Add 5 and 3', 'Calculate 10 plus 20']),
    aiTags: JSON.stringify(['math', 'addition', 'calculator']),
    category: 'utility'
  });
  
  console.log('✅ Created published data for service:', serviceId);
  
  // Verify it exists
  const exists = await redis.exists(`service:${serviceId}:published`);
  console.log('Published key now exists:', exists === 1);
  
  await redis.disconnect();
}

createPublished().catch(console.error);