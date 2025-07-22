#!/usr/bin/env node

// Quick MCP check script

console.log('MCP Setup Checklist:\n');

console.log('1. First, create a published service:');
console.log('   - Go to http://localhost:3000');
console.log('   - Create a new spreadsheet with some calculations');
console.log('   - Click "Publish as API" button');
console.log('   - Add AI-friendly descriptions\n');

console.log('2. Create an MCP token:');
console.log('   - Go to http://localhost:3000/mcp-settings');
console.log('   - Enter a token name (e.g., "Claude Desktop")');
console.log('   - Click "Generate Token"');
console.log('   - Copy the full token (starts with spapi_live_)\n');

console.log('3. Configure Claude Desktop:');
console.log('   Edit your Claude Desktop config file and add:\n');

const config = {
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "http://localhost:3000/api/mcp/v1",
        "SPREADAPI_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
};

console.log(JSON.stringify(config, null, 2));

console.log('\n4. Restart Claude Desktop\n');

console.log('5. Check Claude Desktop logs for errors:');
console.log('   - Look for "spreadapi" entries');
console.log('   - Check for "Found X available services" message\n');

console.log('Common issues:');
console.log('- No tools: You need at least one published service');
console.log('- Auth error: Token is invalid or expired');
console.log('- Connection error: Server not running on port 3000');