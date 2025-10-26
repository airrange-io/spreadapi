# SpreadAPI MCP Bridge

This package provides a bridge between Claude Desktop and SpreadAPI, allowing AI assistants to access and execute spreadsheet calculations.

## Installation

No installation needed! This package runs via `npx` and is automatically installed when Claude Desktop starts.

## Quick Start

### Option 1: Single Service (Recommended)

Connect Claude to one specific calculation service.

1. **Get your service details**
   - Sign in to [SpreadAPI](https://spreadapi.io)
   - Go to your service → API → MCP Integration
   - Copy the configuration

2. **Add to Claude Desktop config**

   **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "my-calculator": {
         "command": "npx",
         "args": ["spreadapi-mcp"],
         "env": {
           "SPREADAPI_SERVICE_ID": "your-service-id",
           "SPREADAPI_URL": "https://spreadapi.io",
           "SPREADAPI_TOKEN": "your-service-token"
         }
       }
     }
   }
   ```

   **For public services**, omit `SPREADAPI_TOKEN`:
   ```json
   {
     "mcpServers": {
       "public-calculator": {
         "command": "npx",
         "args": ["spreadapi-mcp"],
         "env": {
           "SPREADAPI_SERVICE_ID": "your-service-id",
           "SPREADAPI_URL": "https://spreadapi.io"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

### Option 2: Multiple Services (Legacy)

Connect Claude to all your services at once.

1. **Get an MCP token**
   - Sign in to [SpreadAPI](https://spreadapi.io)
   - Go to MCP Settings
   - Generate a new MCP token

2. **Add to Claude Desktop config**

   ```json
   {
     "mcpServers": {
       "spreadapi": {
         "command": "npx",
         "args": ["spreadapi-mcp"],
         "env": {
           "SPREADAPI_URL": "https://spreadapi.io/api/mcp/bridge",
           "SPREADAPI_TOKEN": "your_mcp_token_here"
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

### Single-Service Mode (Recommended)
- `SPREADAPI_SERVICE_ID` - **Required**: The ID of the service to connect to
- `SPREADAPI_URL` - **Optional**: Base URL (default: `https://spreadapi.io`)
- `SPREADAPI_TOKEN` - **Optional**: Service token (only required for private services)

### Multi-Service Mode (Legacy)
- `SPREADAPI_URL` - **Required**: Full endpoint URL (e.g., `https://spreadapi.io/api/mcp/bridge`)
- `SPREADAPI_TOKEN` - **Required**: MCP token with access to multiple services

## How It Works

This package uses the MCP SDK to act as a bridge:

```
Claude Desktop (stdio)
    ↓
spreadapi-mcp (this package)
    ↓ HTTP
SpreadAPI Service Endpoint
```

### Single-Service Mode
When `SPREADAPI_SERVICE_ID` is set, connects to:
```
https://spreadapi.io/api/mcp/services/{serviceId}
```

### Multi-Service Mode
When `SPREADAPI_SERVICE_ID` is NOT set, connects to:
```
https://spreadapi.io/api/mcp/bridge
```

## Development

### Test Single-Service Mode
```bash
SPREADAPI_SERVICE_ID=your-service-id \
SPREADAPI_URL=http://localhost:3000 \
SPREADAPI_TOKEN=your-token \
node index.js
```

### Test Multi-Service Mode (Legacy)
```bash
SPREADAPI_URL=https://spreadapi.io/api/mcp/bridge \
SPREADAPI_TOKEN=your-mcp-token \
node index.js
```

## Troubleshooting

### Claude can't see the service

1. **Check config file location**
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Validate JSON syntax**
   - Use a JSON validator
   - Check for missing commas or quotes

3. **Restart Claude Desktop**
   - Completely quit and relaunch
   - Config changes only apply on restart

4. **Check Claude Desktop logs**
   - Mac: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

### "Service not found" error

1. Verify `SPREADAPI_SERVICE_ID` is correct
2. Check service is published in SpreadAPI dashboard
3. Ensure `SPREADAPI_URL` is correct (use base URL, not full endpoint)

### "Invalid token" error

1. Verify token is correct (check for extra spaces)
2. For private services, ensure token belongs to that service
3. For public services, try removing `SPREADAPI_TOKEN` entirely

### Connection errors

1. Check internet connection
2. If using localhost, ensure dev server is running
3. Verify firewall isn't blocking connections

## License

MIT