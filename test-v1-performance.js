// Test script to measure v1 API performance

async function testPerformance() {
  // Test with a demo service calculation
  const testData = {
    inputs: {
      income: 50000,
      expenses: 30000
    }
  };

  console.log('Testing v1 API performance...\n');

  // First, let's test the old getresults endpoint
  const oldStart = Date.now();
  const oldResponse = await fetch('http://localhost:3000/api/getresults?api=demo&income=50000&expenses=30000');
  const oldData = await oldResponse.json();
  const oldTime = Date.now() - oldStart;
  
  console.log('Old API (/api/getresults):');
  console.log(`  Status: ${oldResponse.status}`);
  console.log(`  Total time: ${oldTime}ms`);
  if (oldData.info) {
    console.log(`  Calculation time: ${oldData.info.timeCalculation}ms`);
    console.log(`  From cache: ${oldData.info.fromProcessCache}`);
  }
  if (oldData.requestTimings) {
    console.log('  Timing breakdown:', oldData.requestTimings.steps);
  }
  
  console.log('\n---\n');

  // Now test the v1 endpoint (if we can find a service)
  // First get available services
  const servicesResponse = await fetch('http://localhost:3000/api/v1/services');
  const servicesData = await servicesResponse.json();
  
  if (servicesData.services && servicesData.services.length > 0) {
    const serviceId = servicesData.services[0].id;
    console.log(`Testing with service: ${serviceId}`);
    
    const v1Start = Date.now();
    const v1Response = await fetch(`http://localhost:3000/api/v1/services/${serviceId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const v1Data = await v1Response.json();
    const v1Time = Date.now() - v1Start;
    
    console.log('New v1 API:');
    console.log(`  Status: ${v1Response.status}`);
    console.log(`  Total time: ${v1Time}ms`);
    if (v1Data.metadata) {
      console.log(`  Execution time: ${v1Data.metadata.executionTime}ms`);
      console.log(`  Cached: ${v1Data.metadata.cached || false}`);
    }
  } else {
    console.log('No published services found for v1 testing');
  }
  
  // Test direct calculation time without HTTP overhead
  console.log('\n---\n');
  console.log('Testing SpreadJS initialization...');
  const initStart = Date.now();
  try {
    const { initializeSpreadJS, createWorkbook } = require('./lib/spreadjs-server');
    initializeSpreadJS();
    const workbook = createWorkbook();
    const initTime = Date.now() - initStart;
    console.log(`SpreadJS initialization time: ${initTime}ms`);
  } catch (e) {
    console.log('SpreadJS initialization error:', e.message);
  }
}

testPerformance().catch(console.error);