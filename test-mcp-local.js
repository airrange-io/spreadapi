// Test MCP server functionality locally

async function testMCP() {
  console.log('Testing MCP server on localhost:3000...\n');
  
  // First, let's test without auth
  console.log('1. Testing without authentication:');
  try {
    const noAuthResponse = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1
      })
    });
    const noAuthData = await noAuthResponse.json();
    console.log('Response:', noAuthData);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test with demo service (no auth required)
  console.log('\n2. Testing demo service execution:');
  try {
    const demoResponse = await fetch('http://localhost:3000/api/v1/services/demo/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: {
          income: 50000,
          expenses: 30000
        }
      })
    });
    const demoData = await demoResponse.json();
    console.log('Demo service response:', demoData);
    
    // Show timing info if available
    if (demoData.info) {
      console.log('\nTiming info:');
      console.log(`  Total time: ${demoData.info.timeAll}ms`);
      console.log(`  API data: ${demoData.info.timeApiData}ms`);
      console.log(`  Calculation: ${demoData.info.timeCalculation}ms`);
      console.log(`  From process cache: ${demoData.info.fromProcessCache}`);
      console.log(`  From Redis cache: ${demoData.info.fromRedisCache}`);
      console.log(`  Memory used: ${demoData.info.memoryUsed}`);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test service listing
  console.log('\n3. Testing v1 service listing:');
  try {
    const listResponse = await fetch('http://localhost:3000/api/v1/services');
    const listData = await listResponse.json();
    console.log('Services found:', listData.services?.length || 0);
    if (listData.services && listData.services.length > 0) {
      console.log('First service:', listData.services[0]);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testMCP().catch(console.error);