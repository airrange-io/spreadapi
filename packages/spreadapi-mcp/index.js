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
 * Supports two modes:
 * 1. Single-Service Mode: Set SPREADAPI_SERVICE_ID to connect to one service
 * 2. Multi-Service Mode: Use SPREADAPI_URL for multiple services (legacy)
 */

// Configuration from environment
const SPREADAPI_SERVICE_ID = process.env.SPREADAPI_SERVICE_ID;
const SPREADAPI_BASE_URL = process.env.SPREADAPI_URL || 'https://spreadapi.io';
const SPREADAPI_TOKEN = process.env.SPREADAPI_TOKEN;

// Build endpoint URL based on mode
let SPREADAPI_URL;
let isSingleService = false;

if (SPREADAPI_SERVICE_ID) {
  // Single-service mode (new approach)
  isSingleService = true;
  // Remove /api/mcp/bridge suffix if present in base URL
  const baseUrl = SPREADAPI_BASE_URL.replace(/\/api\/mcp\/bridge$/, '');
  SPREADAPI_URL = `${baseUrl}/api/mcp/services/${SPREADAPI_SERVICE_ID}`;
  console.error('Mode: Single-Service');
  console.error(`Service ID: ${SPREADAPI_SERVICE_ID}`);
} else {
  // Multi-service mode (legacy - backward compatibility)
  isSingleService = false;
  SPREADAPI_URL = SPREADAPI_BASE_URL.includes('/api/mcp')
    ? SPREADAPI_BASE_URL
    : `${SPREADAPI_BASE_URL}/api/mcp/bridge`;
  console.error('Mode: Multi-Service (legacy)');

  if (!SPREADAPI_TOKEN) {
    console.error('Error: SPREADAPI_TOKEN is required for multi-service mode');
    console.error('Please set it in your Claude Desktop configuration');
    process.exit(1);
  }
}

// Token is optional for public services in single-service mode
if (!SPREADAPI_TOKEN && isSingleService) {
  console.error('Token: Not set (public service mode)');
}

/**
 * Make JSON-RPC request to SpreadAPI server
 */
async function callSpreadAPI(method, params = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add authorization header if token is present
    if (SPREADAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${SPREADAPI_TOKEN}`;
    }

    const response = await fetch(SPREADAPI_URL, {
      method: 'POST',
      headers,
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

  if (SPREADAPI_TOKEN) {
    console.error(`Token: ${SPREADAPI_TOKEN.substring(0, 20)}...`);
  }

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