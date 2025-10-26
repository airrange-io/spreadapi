#!/usr/bin/env node

/**
 * Single-Service MCP Stdio Bridge for Claude Desktop
 *
 * This bridge connects Claude Desktop (stdio) to the HTTP MCP endpoint.
 * Claude Desktop runs this via npx and communicates over stdin/stdout.
 *
 * Usage:
 *   node bin/mcp-service-bridge.js <serviceId> [baseUrl] [token]
 *
 * Example:
 *   node bin/mcp-service-bridge.js abc123 http://localhost:3000 mytoken
 */

const http = require('http');
const https = require('https');
const readline = require('readline');

// Parse command-line arguments
const serviceId = process.argv[2];
const baseUrl = process.argv[3] || 'http://localhost:3000';
const token = process.argv[4] || null;

if (!serviceId) {
  console.error('Error: Service ID is required');
  console.error('Usage: node bin/mcp-service-bridge.js <serviceId> [baseUrl] [token]');
  process.exit(1);
}

// Build endpoint URL
const endpointUrl = `${baseUrl}/api/mcp/services/${serviceId}${token ? `?token=${token}` : ''}`;

// Log to stderr (stdout is reserved for JSON-RPC)
function log(...args) {
  console.error('[MCP Bridge]', ...args);
}

log(`Starting single-service MCP bridge for service: ${serviceId}`);
log(`Endpoint: ${endpointUrl}`);

/**
 * Forward JSON-RPC request to HTTP endpoint
 */
async function forwardToHttp(jsonRpcRequest) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpointUrl);
    const client = url.protocol === 'https:' ? https : http;

    const postData = JSON.stringify(jsonRpcRequest);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          log('Failed to parse HTTP response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      log('HTTP request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Main stdio loop
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    try {
      // Parse JSON-RPC request from Claude Desktop
      const request = JSON.parse(line);
      log(`Received: ${request.method} (id: ${request.id})`);

      // Forward to HTTP endpoint
      const response = await forwardToHttp(request);
      log(`Response: ${response.result ? 'success' : 'error'} (id: ${response.id})`);

      // Send response back to Claude Desktop via stdout
      console.log(JSON.stringify(response));
    } catch (error) {
      log('Error processing request:', error);

      // Send error response
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Bridge error: ' + error.message
        }
      };
      console.log(JSON.stringify(errorResponse));
    }
  });

  rl.on('close', () => {
    log('Bridge closed');
    process.exit(0);
  });

  log('Bridge ready, waiting for JSON-RPC requests...');
}

// Handle process signals
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the bridge
main().catch((error) => {
  log('Fatal error:', error);
  process.exit(1);
});
