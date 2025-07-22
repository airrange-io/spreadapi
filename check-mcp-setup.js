#!/usr/bin/env node

// Script to check MCP setup and create a test service if needed

const redis = require('./lib/redis');

async function checkMCPSetup() {
  console.log('Checking MCP Setup...\n');
  
  // 1. Check for any published services
  console.log('1. Checking for published services:');
  const serviceKeys = await redis.keys('service:*:published');
  
  if (serviceKeys.length === 0) {
    console.log('   ❌ No published services found');
    console.log('   → You need to create and publish a service first\n');
    
    // Create a sample service
    console.log('2. Creating a sample service:');
    const serviceId = 'sample-calculator';
    
    // Create basic service
    await redis.hSet(`service:${serviceId}`, {
      name: 'Sample Calculator',
      description: 'A simple calculator for testing MCP',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    });
    
    // Create simple API definition
    const apiDefinition = {
      inputs: [
        { name: 'a', type: 'number', description: 'First number', mandatory: true },
        { name: 'b', type: 'number', description: 'Second number', mandatory: true },
        { name: 'operation', type: 'string', description: 'Operation: add, subtract, multiply, divide', mandatory: true }
      ],
      outputs: [
        { name: 'result', type: 'number', description: 'Calculation result' }
      ],
      aiDescription: 'Performs basic arithmetic operations on two numbers',
      aiUsageExamples: ['Calculate 5 + 3', 'What is 10 divided by 2?', 'Multiply 7 by 8'],
      aiTags: ['math', 'calculator', 'arithmetic']
    };
    
    // Simple calculation logic
    const calculationLogic = `
// Simple calculator logic
let result;
switch(operation) {
  case 'add':
    result = a + b;
    break;
  case 'subtract':
    result = a - b;
    break;
  case 'multiply':
    result = a * b;
    break;
  case 'divide':
    result = b !== 0 ? a / b : 'Error: Division by zero';
    break;
  default:
    result = 'Error: Unknown operation';
}
return { result };
`;
    
    // Publish the service
    await redis.hSet(`service:${serviceId}:published`, {
      api: JSON.stringify(apiDefinition),
      logic: calculationLogic,
      published: new Date().toISOString(),
      aiDescription: apiDefinition.aiDescription,
      aiUsageExamples: JSON.stringify(apiDefinition.aiUsageExamples),
      aiTags: JSON.stringify(apiDefinition.aiTags),
      category: 'utility'
    });
    
    console.log('   ✅ Created and published sample calculator service\n');
  } else {
    console.log(`   ✅ Found ${serviceKeys.length} published services:`);
    for (const key of serviceKeys) {
      const serviceId = key.replace('service:', '').replace(':published', '');
      const service = await redis.hGetAll(`service:${serviceId}`);
      console.log(`      - ${service.name || serviceId}`);
    }
    console.log();
  }
  
  // 2. Check for MCP tokens
  console.log('3. Checking for MCP tokens:');
  const tokenKeys = await redis.keys('mcp:token:*');
  const activeTokens = [];
  
  for (const key of tokenKeys) {
    const tokenData = await redis.hGetAll(key);
    if (tokenData.isActive === 'true') {
      activeTokens.push({
        token: key.replace('mcp:token:', ''),
        name: tokenData.name,
        created: tokenData.created,
        lastUsed: tokenData.lastUsed,
        requests: tokenData.requests
      });
    }
  }
  
  if (activeTokens.length === 0) {
    console.log('   ❌ No active MCP tokens found');
    console.log('   → Create a token at http://localhost:3000/mcp-settings\n');
  } else {
    console.log(`   ✅ Found ${activeTokens.length} active tokens:`);
    activeTokens.forEach(t => {
      console.log(`      - ${t.name}: ${t.token.substring(0, 20)}... (${t.requests || 0} requests)`);
    });
    console.log();
  }
  
  // 3. Test the MCP API
  if (activeTokens.length > 0) {
    console.log('4. Testing MCP API with first token:');
    const testToken = activeTokens[0].token;
    
    try {
      const response = await fetch('http://localhost:3000/api/mcp/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 1
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.log('   ❌ MCP API error:', data.error.message);
      } else if (data.result && data.result.tools) {
        console.log(`   ✅ MCP API working! Found ${data.result.tools.length} tools`);
        if (data.result.tools.length > 0) {
          console.log('   First tool:', data.result.tools[0].name);
        }
      }
    } catch (error) {
      console.log('   ❌ Failed to connect to MCP API:', error.message);
    }
  }
  
  console.log('\nSetup Summary:');
  console.log('1. Make sure you have at least one published service');
  console.log('2. Create an MCP token at http://localhost:3000/mcp-settings');
  console.log('3. Use the token in your Claude Desktop config');
  console.log('4. Restart Claude Desktop after updating the config');
  
  process.exit(0);
}

checkMCPSetup().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});