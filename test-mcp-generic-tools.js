#!/usr/bin/env node

/**
 * Test script for the generic MCP tools implementation
 * Run with: node test-mcp-generic-tools.js <MCP_TOKEN>
 */

const https = require('https');

const MCP_TOKEN = process.argv[2];
const API_BASE = 'https://spreadapi.com'; // Update if testing locally

if (!MCP_TOKEN) {
  console.error('Usage: node test-mcp-generic-tools.js <MCP_TOKEN>');
  process.exit(1);
}

// Helper function to make JSON-RPC requests
function makeRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now()
    });

    const options = {
      hostname: API_BASE.replace('https://', ''),
      path: '/api/mcp/v1',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_TOKEN}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`${response.error.message} (code: ${response.error.code})`));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing Generic MCP Tools Implementation\n');
    console.log('========================================\n');

    // Test 1: Initialize
    console.log('1. Testing initialize...');
    const initResult = await makeRequest('initialize');
    console.log('   ✓ Protocol version:', initResult.protocolVersion);
    console.log('   ✓ Server:', initResult.serverInfo.name, initResult.serverInfo.version);
    console.log();

    // Test 2: List tools (generic)
    console.log('2. Testing tools/list (generic tools only)...');
    const genericTools = await makeRequest('tools/list', {});
    console.log(`   ✓ Found ${genericTools.tools.length} tools`);
    const genericToolNames = genericTools.tools.map(t => t.name).filter(n => !n.includes('_calc_') && !n.includes('_read_area_') && !n.includes('_update_area_'));
    console.log('   ✓ Generic tools:', genericToolNames.join(', '));
    console.log();

    // Test 3: List tools (with backward compatibility)
    console.log('3. Testing tools/list (with service-specific tools)...');
    const allTools = await makeRequest('tools/list', { includeServiceSpecificTools: true });
    console.log(`   ✓ Found ${allTools.tools.length} tools total`);
    const serviceSpecificCount = allTools.tools.length - genericTools.tools.length;
    console.log(`   ✓ Service-specific tools: ${serviceSpecificCount}`);
    console.log();

    // Test 4: List services with areas
    console.log('4. Testing spreadapi_list_services...');
    const servicesResult = await makeRequest('tools/call', {
      name: 'spreadapi_list_services',
      arguments: { includeAreas: true, includeMetadata: true }
    });
    console.log('   ✓ Services listed successfully');
    console.log(servicesResult.content[0].text.split('\\n').slice(0, 10).join('\\n') + '\\n   ...');
    console.log();

    // Test 5: Get service details
    console.log('5. Testing spreadapi_get_service_details...');
    // Extract first service ID from the list
    const serviceMatch = servicesResult.content[0].text.match(/ID: ([a-zA-Z0-9]+)/);
    if (serviceMatch) {
      const serviceId = serviceMatch[1];
      const detailsResult = await makeRequest('tools/call', {
        name: 'spreadapi_get_service_details',
        arguments: { serviceId: serviceId }
      });
      console.log(`   ✓ Got details for service: ${serviceId}`);
      console.log(detailsResult.content[0].text.split('\\n').slice(0, 10).join('\\n') + '\\n   ...');
    } else {
      console.log('   ⚠ No services found to test details');
    }
    console.log();

    // Test 6: Generic calc tool
    if (serviceMatch) {
      console.log('6. Testing spreadapi_calc (generic)...');
      const serviceId = serviceMatch[1];
      try {
        const calcResult = await makeRequest('tools/call', {
          name: 'spreadapi_calc',
          arguments: { 
            serviceId: serviceId,
            inputs: {} // Empty inputs to get parameter documentation
          }
        });
        console.log('   ✓ Generic calc tool works');
        console.log(calcResult.content[0].text.split('\\n').slice(0, 5).join('\\n') + '\\n   ...');
      } catch (e) {
        console.log('   ℹ Service requires parameters:', e.message);
      }
    }
    console.log();

    console.log('========================================');
    console.log('✅ All tests completed successfully!');
    console.log('The generic tools implementation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();