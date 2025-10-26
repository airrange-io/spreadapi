#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

/**
 * SpreadAPI MCP Bridge
 * Translates between Claude Desktop (stdio) and SpreadAPI HTTP server
 *
 * Updated for service-specific MCP endpoints.
 * Each service has its own endpoint: /api/mcp/service/{serviceId}
 */

// Configuration from environment
const SPREADAPI_URL = process.env.SPREADAPI_URL;
const SPREADAPI_TOKEN = process.env.SPREADAPI_TOKEN;

if (!SPREADAPI_URL) {
  console.error('Error: SPREADAPI_URL environment variable is required');
  console.error('');
  console.error('Please set it in your Claude Desktop configuration:');
  console.error('  SPREADAPI_URL: https://spreadapi.io/api/mcp/service/YOUR_SERVICE_ID');
  console.error('');
  console.error('Replace YOUR_SERVICE_ID with your actual service ID');
  process.exit(1);
}

if (!SPREADAPI_TOKEN) {
  console.error('Error: SPREADAPI_TOKEN environment variable is required');
  console.error('Please set it in your Claude Desktop configuration');
  process.exit(1);
}

/**
 * Make JSON-RPC request to SpreadAPI server
 */
async function callSpreadAPI(method, params = {}) {
  try {
    const response = await fetch(SPREADAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SPREADAPI_TOKEN}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Unknown error');
    }

    return data.result;
  } catch (error) {
    console.error(`Error calling SpreadAPI: ${error.message}`);
    throw error;
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'spreadapi-mcp',
    version: '1.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: { subscribe: false }
    },
  }
);

// Handle listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('Fetching available tools from SpreadAPI...');
  
  try {
    const result = await callSpreadAPI('tools/list');
    console.error(`Found ${result.tools?.length || 0} available services`);
    return result;
  } catch (error) {
    console.error('Failed to fetch tools:', error.message);
    return { tools: [] };
  }
});

// Handle calling tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`Calling tool: ${name}`);
  
  try {
    const result = await callSpreadAPI('tools/call', {
      name,
      arguments: args
    });
    return result;
  } catch (error) {
    console.error(`Tool call failed: ${error.message}`);
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Handle listing resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const result = await callSpreadAPI('resources/list');
    return result;
  } catch (error) {
    return { resources: [] };
  }
});

// Handle reading resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    const result = await callSpreadAPI('resources/read', request.params);
    return result;
  } catch (error) {
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: 'text/plain',
        text: `Error: ${error.message}`
      }]
    };
  }
});

// Start the server
async function main() {
  console.error('SpreadAPI MCP Bridge starting...');
  console.error(`Server URL: ${SPREADAPI_URL}`);
  console.error(`Token: ${SPREADAPI_TOKEN.substring(0, 20)}...`);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Bridge is running, waiting for requests...');
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run the bridge
main().catch((error) => {
  console.error('Failed to start bridge:', error);
  process.exit(1);
});