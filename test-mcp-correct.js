// Test MCP with correct parameters

async function testMCP() {
  const token = 'spapi_live_2142a01dfe8d6061a26c050e9ea298de80f76d1afc94267cca6566fd436551d4';
  
  console.log('Testing MCP server with correct parameters...\n');
  
  // Test tools/call with correct parameters
  const callPayload = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "spreadapi_1b191115-96b5-4a2a-9706-7fa1fcc70229_mdhuncttljvo2",
      arguments: {
        interestrate: 5,
        monthlydeposit: 1000,
        monthsofpayment: 12,
        startingamount: 10000
      }
    },
    id: 2
  };
  
  console.log('Request:', JSON.stringify(callPayload, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(callPayload)
    });
    
    const result = await response.json();
    console.log('\nResponse:', JSON.stringify(result, null, 2));
    
    // If successful, show the calculation results
    if (result.result && result.result.outputs) {
      console.log('\nCalculation Results:');
      result.result.outputs.forEach(output => {
        console.log(`  ${output.name}: ${output.value}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testMCP();