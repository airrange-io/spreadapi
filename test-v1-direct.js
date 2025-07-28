// Test v1 performance with direct function calls

async function testDirect() {
  // Set up environment
  process.env.NEXT_VERCEL_BLOB_URL = process.env.NEXT_VERCEL_BLOB_URL || 'https://test.blob.vercel-storage.com';
  
  console.log('Testing direct v1 calculation performance...\n');
  
  // Import the calculation function
  const { calculateDirect } = await import('./app/api/v1/services/[id]/execute/route.js');
  
  // Test parameters
  const serviceId = 'demo';
  const inputs = {
    income: 50000,
    expenses: 30000
  };
  
  // Warm-up run
  console.log('Warm-up run...');
  const warmupStart = Date.now();
  const warmupResult = await calculateDirect(serviceId, inputs, null, {});
  console.log(`Warm-up time: ${Date.now() - warmupStart}ms`);
  console.log(`Result:`, warmupResult.error || 'Success');
  
  // Test runs
  console.log('\nTest runs:');
  const times = [];
  
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    const result = await calculateDirect(serviceId, inputs, null, {});
    const time = Date.now() - start;
    times.push(time);
    
    console.log(`Run ${i + 1}: ${time}ms (fromProcessCache: ${result.info?.fromProcessCache}, fromRedisCache: ${result.info?.fromRedisCache})`);
  }
  
  // Different parameters to test workbook cache
  console.log('\nTest with different parameters:');
  const inputs2 = {
    income: 60000,
    expenses: 25000
  };
  
  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    const result = await calculateDirect(serviceId, inputs2, null, {});
    const time = Date.now() - start;
    
    console.log(`Run ${i + 1}: ${time}ms (fromProcessCache: ${result.info?.fromProcessCache}, fromRedisCache: ${result.info?.fromRedisCache})`);
  }
  
  // Stats
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`\nAverage time (same params): ${avg.toFixed(1)}ms`);
  console.log(`Min: ${Math.min(...times)}ms`);
  console.log(`Max: ${Math.max(...times)}ms`);
}

testDirect().catch(console.error);