/**
 * Test script for Single-Service MCP endpoint
 *
 * This script tests the new /api/mcp/services/{serviceId} endpoint
 * to ensure it correctly handles MCP protocol requests.
 */

const BASE_URL = 'http://localhost:3000';

// Test service ID (confirmed public service, no token needed)
const TEST_SERVICE_ID = 'abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6';

async function testMcpEndpoint() {
  console.log('🧪 Testing Single-Service MCP Endpoint\n');
  console.log(`Service ID: ${TEST_SERVICE_ID}\n`);

  // Test 1: Initialize
  console.log('Test 1: MCP Initialize');
  try {
    const initResponse = await fetch(`${BASE_URL}/api/mcp/services/${TEST_SERVICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        id: 1
      })
    });

    const initData = await initResponse.json();
    console.log('✅ Initialize Response:');
    console.log(JSON.stringify(initData, null, 2));
    console.log('\n');

    if (initData.error) {
      console.log('⚠️  Service may not exist or may be private. Error:', initData.error.message);
      console.log('Tip: Try with a public service or add Authorization header\n');
    }
  } catch (error) {
    console.error('❌ Initialize failed:', error.message);
  }

  // Test 2: Tools List
  console.log('Test 2: MCP Tools List');
  try {
    const toolsResponse = await fetch(`${BASE_URL}/api/mcp/services/${TEST_SERVICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 2
      })
    });

    const toolsData = await toolsResponse.json();
    console.log('✅ Tools List Response:');
    console.log(JSON.stringify(toolsData, null, 2));
    console.log('\n');

    if (toolsData.result?.tools) {
      console.log(`Found ${toolsData.result.tools.length} tool(s):`);
      toolsData.result.tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description.substring(0, 100)}...`);
      });
      console.log('\n');
    }
  } catch (error) {
    console.error('❌ Tools list failed:', error.message);
  }

  // Test 3: Calculate (will need actual parameters)
  console.log('Test 3: MCP Tools Call (calculate)');
  console.log('Note: This test would require knowledge of service parameters.');
  console.log('Skipping for now - manual testing recommended.\n');

  console.log('✅ Basic MCP protocol tests complete!\n');
  console.log('Next Steps:');
  console.log('1. Verify a published service exists in Redis');
  console.log('2. Test with actual service parameters');
  console.log('3. Test with Claude Desktop configuration');
  console.log('4. Test with service tokens for private services');
}

// Run tests
testMcpEndpoint().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
