# SpreadAPI MCP Bridge

This package provides a bridge between Claude Desktop and SpreadAPI, allowing AI assistants to access and execute spreadsheet calculations.

## Installation

```bash
npm install -g spreadapi-mcp
```

## Setup

1. **Get a SpreadAPI token**
   - Sign in to [SpreadAPI](https://spreadapi.io)
   - Go to MCP Settings
   - Generate a new API token

2. **Configure Claude Desktop**
   
   Add this to your Claude Desktop configuration file:
   
   **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "spreadapi": {
         "command": "npx",
         "args": ["spreadapi-mcp"],
         "env": {
           "SPREADAPI_URL": "https://spreadapi.io/api/mcp/bridge",
           "SPREADAPI_TOKEN": "your_token_here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## Usage

Once configured, Claude will have access to all your published SpreadAPI services. You can ask Claude to:

- List available calculations
- Perform specific calculations
- Help with financial, mathematical, or business computations

Example prompts:
- "What spreadsheet calculations are available?"
- "Calculate the monthly payment for a $300,000 mortgage at 7% for 30 years"
- "Help me analyze loan options with different interest rates"

## Environment Variables

- `SPREADAPI_URL` - The SpreadAPI MCP endpoint (default: https://spreadapi.io/api/mcp/bridge)
- `SPREADAPI_TOKEN` - Your SpreadAPI token (required)

## MCP Endpoints

SpreadAPI provides two MCP endpoints:

- **`/api/mcp/bridge`** - JSON-RPC stdio bridge for Claude Desktop (this package)
- **`/api/mcp`** - Streamable HTTP transport for ChatGPT Developer Mode and OpenAI Agent Builder

> **Note**: The old `/api/mcp/v1` endpoint is deprecated. Please update to `/api/mcp/bridge`.

## Development

To run locally for testing:

```bash
SPREADAPI_TOKEN=your_token node index.js
```

## Troubleshooting

If Claude can't connect to SpreadAPI:

1. Check that your token is valid
2. Ensure the bridge is installed: `npm list -g spreadapi-mcp`
3. Verify your Claude Desktop config file is valid JSON
4. Check Claude Desktop logs for error messages

## License

MIT