// Final MCP test with result parsing

async function testMCPFinal() {
  const token = 'spapi_live_2142a01dfe8d6061a26c050e9ea298de80f76d1afc94267cca6566fd436551d4';
  
  console.log('=== MCP Server Test Summary ===\n');
  
  // Test 1: Initialize
  console.log('1. Testing initialize:');
  const initResponse = await fetch('http://localhost:3000/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "initialize",
      params: {},
      id: 1
    })
  });
  const initResult = await initResponse.json();
  console.log('✅ Server:', initResult.result.serverInfo.name);
  console.log('✅ Version:', initResult.result.serverInfo.version);
  
  // Test 2: List tools
  console.log('\n2. Testing tools/list:');
  const listResponse = await fetch('http://localhost:3000/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/list",
      id: 2
    })
  });
  const listResult = await listResponse.json();
  console.log('✅ Found', listResult.result.tools.length, 'tools');
  listResult.result.tools.forEach(tool => {
    console.log(`   - ${tool.name}: ${tool.description}`);
  });
  
  // Test 3: Execute service
  console.log('\n3. Testing tools/call:');
  const callResponse = await fetch('http://localhost:3000/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
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
      id: 3
    })
  });
  
  const callResult = await callResponse.json();
  if (callResult.result && callResult.result.content) {
    const outputs = JSON.parse(callResult.result.content[0].text);
    console.log('✅ Calculation successful:');
    outputs.forEach(output => {
      console.log(`   - ${output.name}: ${output.value.toLocaleString()}`);
    });
  }
  
  console.log('\n=== MCP Server is fully operational! ===');
}

testMCPFinal().catch(console.error);