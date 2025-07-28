// Test MCP tool call

async function testMCPCall() {
  const token = 'spapi_live_2142a01dfe8d6061a26c050e9ea298de80f76d1afc94267cca6566fd436551d4';
  
  const payload = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "spreadapi_1b191115-96b5-4a2a-9706-7fa1fcc70229_mdhuncttljvo2",
      arguments: {
        income: 50000  // Using the correct parameter name from v1 API
      }
    },
    id: 2
  };
  
  console.log('Sending request:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('\nResponse:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testMCPCall();