# SpreadAPI MCP Bridge

This package provides a bridge between Claude Desktop and SpreadAPI, allowing AI assistants to access and execute spreadsheet calculations.

## Installation

```bash
npm install -g spreadapi-mcp
```

## Setup

1. **Get your service details**
   - Sign in to [SpreadAPI](https://spreadapi.io)
   - Navigate to your service
   - Go to the "API" tab → "MCP Integration" section
   - Copy your service ID and service token

2. **Configure Claude Desktop**

   Add this to your Claude Desktop configuration file:

   **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "my-service": {
         "command": "npx",
         "args": ["spreadapi-mcp"],
         "env": {
           "SPREADAPI_URL": "https://spreadapi.io/api/mcp/service/YOUR_SERVICE_ID",
           "SPREADAPI_TOKEN": "your_service_token_here"
         }
       }
     }
   }
   ```

   **Replace:**
   - `my-service` - Choose any name for your service
   - `YOUR_SERVICE_ID` - Your actual service ID from SpreadAPI
   - `your_service_token_here` - Your service token

3. **Restart Claude Desktop**

## Usage

Once configured, Claude will have direct access to your specific service. You can ask Claude to:

- Perform calculations with your service
- Explain what parameters are needed
- Run multiple scenarios
- Help with analysis

Example prompts:
- "What parameters does this calculation need?"
- "Calculate with X=10 and Y=5"
- "Compare 3 scenarios with different interest rates"

## Environment Variables

- `SPREADAPI_URL` - The service-specific MCP endpoint (required)
  - Format: `https://spreadapi.io/api/mcp/service/{serviceId}`
- `SPREADAPI_TOKEN` - Your service token (required)

## Service-Specific MCP

Each SpreadAPI service gets its own dedicated MCP endpoint. This provides:

- **Faster connection** - No service discovery needed
- **Clearer context** - AI knows exactly which service it's connected to
- **Better security** - Each connection is scoped to one service
- **Simpler setup** - Just copy the configuration from your service page

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