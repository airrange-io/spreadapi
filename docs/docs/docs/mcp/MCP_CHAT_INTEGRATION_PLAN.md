# MCP Tools Integration for AI Chat - Implementation Plan

## Overview
This document outlines the plan to integrate SpreadAPI's MCP (Model Context Protocol) tools into the AI chat interface, enabling the AI to execute real spreadsheet calculations and interact with services dynamically.

## Current State
- ✅ Working AI chat with Bubbles UI (Ant Design X)
- ✅ Service selector dropdown above chat
- ✅ MCP server implementation at `/api/mcp/bridge/`
- ✅ Demo services available for testing

## Implementation Plan

### Phase 1: Service Schema Loading (CURRENT)

#### 1.1 Fetch Service Details
- When user selects a service in dropdown, fetch full schema
- Use existing endpoint: `/api/services/[id]/full`
- Store service schema in component state
- Pass serviceId to chat API in request body

#### 1.2 Update Chat API
- Modify `/api/chat/route.js` to accept serviceId
- When serviceId is present, fetch service details
- Update system prompt with service context

### Phase 2: Dynamic Tool Definition

#### 2.1 Tool Structure
Create tools dynamically based on service schema:
```javascript
{
  calculate: {
    description: `Execute ${service.name} calculation`,
    parameters: z.object({
      // Dynamically built from service.inputs
    })
  }
}
```

#### 2.2 Tool Execution
- Use direct `calculateDirect()` function call (zero HTTP overhead)
- Import from: `/app/api/v1/services/[id]/execute/calculateDirect`
- Format results for chat display
- Handle errors gracefully

### Phase 3: UI Enhancements

#### 3.1 Tool Call Visualization
- Special bubble style for calculations
- Loading state during execution
- Clear result formatting

#### 3.2 Result Display
- Table format for outputs
- Highlight key values
- Show calculation details

## Technical Details

### API Endpoints Used
- `/api/services/[id]/full` - Get service schema
- `/api/v1/services/[id]/execute` - V1 API endpoint (public)
- `calculateDirect()` - Direct function call (internal, used by chat)
- `/api/chat` - Main chat endpoint

### Service Schema Structure
```typescript
interface Service {
  id: string;
  name: string;
  inputs: Array<{
    name: string;
    alias: string;
    type: string;
    format?: string;
    mandatory?: boolean;
  }>;
  outputs: Array<{
    name: string;
    alias: string;
    type: string;
    format?: string;
  }>;
}
```

### Demo Services for Testing
- `demo-compound-interest-calculator`
- `demo-orders-lookup`

## Implementation Guidelines

### Do's
- ✅ Keep everything dynamic based on service definitions
- ✅ Use existing endpoints and infrastructure
- ✅ Test with demo services first
- ✅ Handle both authenticated and public users
- ✅ Maintain backward compatibility

### Don'ts
- ❌ Don't modify existing MCP server code
- ❌ Don't hardcode service-specific logic
- ❌ Don't assume service structure
- ❌ Don't break existing chat functionality

## Testing Strategy

1. Start with demo services (always available)
2. Test with simple calculations first
3. Verify tool calls in browser console
4. Check error handling
5. Test service switching

## Future Enhancements

- Area reading/writing capabilities
- Multi-step calculations
- Result caching
- Export functionality
- Tool call history

## Current Progress

- [x] Plan documented
- [ ] Service schema loading
- [ ] Tool integration in chat API
- [ ] Dynamic tool generation
- [ ] Tool execution handler
- [ ] UI updates for tool results
- [ ] Testing with demo services

## Notes for Next Developer

1. The MCP server at `/api/mcp/bridge/` is already working - don't modify it
2. Use `calculateDirect()` for internal calculations (chat uses this, MCP uses this)
3. Public V1 API is at `/api/v1/services/{id}/execute`
4. Demo services don't require authentication
5. Service schemas vary - always validate inputs
6. The chat already passes serviceId when selected