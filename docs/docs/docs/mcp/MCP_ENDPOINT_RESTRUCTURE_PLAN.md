# MCP Endpoint Restructure Plan

## Executive Summary

Restructure MCP endpoints to follow the 2025 MCP specification with Streamable HTTP transport while maintaining backward compatibility.

**Goal:**
- `/api/mcp` → Streamable HTTP (MCP 2025 standard for ChatGPT, OpenAI Agent Builder)
- `/api/mcp/bridge` → JSON-RPC bridge (for Claude Desktop stdio bridge)
- `/api/mcp/v1` → Deprecated (temporary backward compatibility)

## Motivation

1. **ChatGPT Developer Mode requires Streamable HTTP transport**
2. **OpenAI Agent Builder uses `MCPServerStreamableHttp`**
3. **MCP spec 2025-03-26 deprecated SSE, standardized on Streamable HTTP**
4. **Current `/api/mcp/v1` uses simple JSON-RPC, not compatible with ChatGPT**
5. **Clearer endpoint naming: `/api/mcp` for standard, `/api/mcp/bridge` for bridge**

---

## Phase 1: File Structure Changes

### 1.1 Create Bridge Endpoint (Copy from v1)

**Source:** `/app/api/mcp/v1/`

**Destination:** `/app/api/mcp/bridge/`

**Files to copy:**
```
app/api/mcp/v1/route.js              → app/api/mcp/bridge/route.js
app/api/mcp/v1/areaExecutors.js      → app/api/mcp/bridge/areaExecutors.js
app/api/mcp/v1/executeEnhancedCalc.js → app/api/mcp/bridge/executeEnhancedCalc.js
```

**Import path updates needed in bridge/route.js:**
```javascript
// OLD (v1):
import { calculateDirect } from '../../v1/services/[id]/execute/calculateDirect.js';
import { executeAreaRead } from './areaExecutors.js';
import { executeEnhancedCalc } from './executeEnhancedCalc.js';

// NEW (bridge):
import { calculateDirect } from '../../../v1/services/[id]/execute/calculateDirect.js';
import { executeAreaRead } from './areaExecutors.js';
import { executeEnhancedCalc } from './executeEnhancedCalc.js';
```

### 1.2 Create Streamable HTTP Endpoint (New)

**Location:** `/app/api/mcp/route.js`

**Purpose:** MCP 2025 Streamable HTTP transport for ChatGPT & OpenAI Agent Builder

**Key Features:**
- Single POST endpoint with streaming responses
- Session management via `Mcp-Session-Id` header
- CORS headers for ChatGPT origins
- Wraps existing JSON-RPC logic from bridge
- Protocol version: `2025-03-26`

### 1.3 Update v1 Endpoint (Deprecation Notice)

**Location:** `/app/api/mcp/v1/route.js`

**Changes:**
- Add deprecation comment at top of file
- Add deprecation warning in `initialize` response
- Log deprecation warning on each request
- Keep fully functional for backward compatibility

---

## Phase 2: Documentation Updates

### 2.1 MCP Documentation Files (23 files found)

**Files referencing `/api/mcp/v1`:**

#### High Priority (User-Facing):
1. `packages/spreadapi-mcp/README.md` - Bridge package documentation
2. `packages/spreadapi-mcp/index.js` - Bridge package code
3. `docs/mcp/MCP_QUICK_START.md` - Quick start guide
4. `docs/mcp/MCP_CLIENT_GUIDE.md` - Client integration guide
5. `docs/mcp/MCP_IMPLEMENTATION_GUIDE.md` - Implementation guide
6. `app/docs/docs-page-client.tsx` - Documentation UI
7. `app/(marketing)/excel-ai-integration/page.tsx` - Marketing page

#### Blog Articles (Multi-language):
8. `content/blog/en/claude-desktop-excel-integration-complete-guide.json`
9. `content/blog/de/claude-desktop-excel-integration-vollstaendige-anleitung.json`
10. `content/blog/es/claude-desktop-excel-integracion-guia-completa.json`
11. `content/blog/fr/claude-desktop-excel-integration-guide-complet.json`

#### Technical Documentation:
12. `docs/mcp/MCP_ROUTE_AREA_HANDLERS.md`
13. `docs/mcp/MCP_GENERIC_TOOLS_MIGRATION.md`
14. `docs/mcp/MCP_CRITICAL_IMPROVEMENTS.md`
15. `docs/mcp/MCP_IMPLEMENTATION_PLAN.md`
16. `docs/MCP_MARKETPLACE_GUIDE.md`
17. `docs/implementation/EDITABLE_AREAS_COMPLETE_IMPLEMENTATION.md`
18. `docs/implementation/CELL_AREA_IMPLEMENTATION.md`

#### Planning/Historical Docs:
19. `GETRESULTS_TO_V1_MIGRATION_PLAN.md`
20. `SERVICE_DATA_FETCHING_AUDIT.md`
21. `CHAT_SERVICE_TODO.md`
22. `MCP_CHAT_INTEGRATION_PLAN.md`
23. `REFACTOR_SERVICE_FETCHING_TODO.md`

### 2.2 Update Strategy

**For each file, replace:**
- `/api/mcp/v1` → `/api/mcp/bridge` (for Claude Desktop bridge)
- Add new section documenting `/api/mcp` (for ChatGPT/OpenAI)

**Add new documentation:**
- ChatGPT Developer Mode connection guide
- OpenAI Agent Builder integration guide
- Transport comparison (Streamable HTTP vs stdio bridge)

---

## Phase 3: Bridge Package Updates

### 3.1 Update `packages/spreadapi-mcp/`

**Files to update:**
- `packages/spreadapi-mcp/README.md` - Update endpoint URL
- `packages/spreadapi-mcp/index.js` - Update default endpoint
- `packages/spreadapi-mcp/package.json` - Bump version

**Changes:**
```javascript
// OLD:
const DEFAULT_ENDPOINT = 'https://spreadapi.io/api/mcp/v1';

// NEW:
const DEFAULT_ENDPOINT = 'https://spreadapi.io/api/mcp/bridge';
```

---

## Phase 4: Claude Desktop Configuration

### 4.1 User Configuration Update

**Location:** User's home directory (not in repo)
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Update needed:**
```json
{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["-y", "@spreadapi/mcp-bridge"],
      "env": {
        "SPREADAPI_API_TOKEN": "your_token_here",
        "SPREADAPI_BASE_URL": "https://spreadapi.io/api/mcp/bridge"
      }
    }
  }
}
```

**Note:** This is not in the repo - users need to update manually or via documentation.

---

## Phase 5: Testing Strategy

### 5.1 Bridge Endpoint Testing (`/api/mcp/bridge`)

**Test with Claude Desktop:**
1. Update bridge package to point to new endpoint
2. Restart Claude Desktop
3. Test `spreadapi_list_services` tool
4. Test `spreadapi_calc` with sample service
5. Test `spreadapi_read_area` with editable areas
6. Test `spreadapi_batch` calculations
7. Verify all responses match v1 behavior

### 5.2 Streamable HTTP Testing (`/api/mcp`)

**Test with ChatGPT Developer Mode:**
1. Navigate to Settings → Apps & Connectors → Advanced → Developer Mode
2. Create new connector:
   - Name: "SpreadAPI"
   - URL: `https://spreadapi.io/api/mcp`
   - Description: "Excel calculation services"
   - Auth: Bearer token
3. Test tool discovery
4. Test service execution
5. Verify streaming responses
6. Test error handling

**Test with OpenAI Agent Builder:**
1. Create agent with MCP server
2. Configure `MCPServerStreamableHttp` with URL
3. Test tool calls
4. Verify session management

### 5.3 Backward Compatibility Testing (`/api/mcp/v1`)

**Verify v1 still works:**
1. Test with existing Claude Desktop config (pre-migration)
2. Verify deprecation warnings appear in logs
3. Ensure all functionality unchanged
4. Confirm warning message in `initialize` response

### 5.4 Load Testing

**Concurrent requests:**
- Test bridge and streamable endpoints simultaneously
- Verify no interference between endpoints
- Check Redis caching works for both
- Monitor process cache behavior

---

## Phase 6: Deployment Strategy

### 6.1 Pre-Deployment

- [ ] Run all TypeScript checks
- [ ] Run all tests
- [ ] Review all documentation changes
- [ ] Prepare rollback plan

### 6.2 Deployment Order

1. **Deploy all three endpoints simultaneously:**
   - `/api/mcp` (new - Streamable HTTP)
   - `/api/mcp/bridge` (new - JSON-RPC bridge)
   - `/api/mcp/v1` (existing - deprecated)

2. **Update documentation:**
   - Deploy updated docs
   - Update blog articles
   - Update marketing pages

3. **Publish bridge package:**
   - Bump version to indicate endpoint change
   - Publish to npm
   - Update installation docs

### 6.3 Post-Deployment

- [ ] Monitor error logs for all three endpoints
- [ ] Test ChatGPT connection
- [ ] Test Claude Desktop bridge
- [ ] Verify v1 deprecation warnings appear
- [ ] Monitor user feedback

---

## Phase 7: Migration Timeline

### Immediate (Week 1)
- Deploy all three endpoints
- Update all documentation
- Publish updated bridge package
- Announce new ChatGPT support

### Short-term (Month 1)
- Monitor adoption of new endpoints
- Collect user feedback
- Fix any issues discovered
- Create migration guides for users

### Long-term (Month 3+)
- Plan v1 endpoint deprecation
- Create migration deadline
- Send user notifications
- Eventually remove v1 endpoint

---

## Rollback Plan

If issues arise:

1. **Quick fix:** Revert `/api/mcp` to return helpful error
2. **Partial rollback:** Keep bridge working, fix Streamable HTTP later
3. **Full rollback:** Restore v1 as primary, deprecate new endpoints

**Key:** All three endpoints are independent - can fix/rollback individually.

---

## Success Criteria

- [ ] `/api/mcp` works with ChatGPT Developer Mode
- [ ] `/api/mcp` works with OpenAI Agent Builder
- [ ] `/api/mcp/bridge` works with Claude Desktop (existing users)
- [ ] `/api/mcp/v1` still works (backward compatibility)
- [ ] All documentation updated
- [ ] Bridge package published
- [ ] Zero breaking changes for existing users
- [ ] All tests passing
- [ ] TypeScript checks passing

---

## Risk Assessment

### Low Risk
- **Bridge endpoint:** Direct copy of v1, minimal changes
- **Documentation:** Non-breaking changes
- **Backward compatibility:** v1 remains fully functional

### Medium Risk
- **Streamable HTTP implementation:** New code, new protocol
- **Session management:** Complex state handling
- **CORS configuration:** Must allow ChatGPT origins

### High Risk
- **User migration:** Need clear communication
- **Multi-protocol support:** Three endpoints to maintain
- **Package update:** Users must update config manually

### Mitigation
- Comprehensive testing before deployment
- Keep v1 active for extended period
- Clear migration documentation
- Monitoring and quick response to issues

---

## Open Questions

1. **Streamable HTTP implementation details:**
   - Exact session lifecycle management?
   - How to handle long-running streams?
   - Error recovery mechanisms?

2. **ChatGPT specifics:**
   - Required response headers?
   - Authentication header format?
   - Rate limiting needs?

3. **Timeline:**
   - When to deprecate v1?
   - How long to maintain three endpoints?
   - Migration deadline for users?

---

## Implementation Checklist

### Code Changes
- [ ] Create `/app/api/mcp/bridge/route.js` (copy from v1)
- [ ] Create `/app/api/mcp/bridge/areaExecutors.js` (copy from v1)
- [ ] Create `/app/api/mcp/bridge/executeEnhancedCalc.js` (copy from v1)
- [ ] Update import paths in bridge route
- [ ] Create `/app/api/mcp/route.js` (new Streamable HTTP)
- [ ] Add deprecation notice to `/app/api/mcp/v1/route.js`
- [ ] Update `packages/spreadapi-mcp/index.js`
- [ ] Update `packages/spreadapi-mcp/README.md`

### Documentation Changes
- [ ] Update MCP_QUICK_START.md
- [ ] Update MCP_CLIENT_GUIDE.md
- [ ] Update MCP_IMPLEMENTATION_GUIDE.md
- [ ] Update MCP_MARKETPLACE_GUIDE.md
- [ ] Update all 4 blog articles (en/de/es/fr)
- [ ] Update docs-page-client.tsx
- [ ] Update excel-ai-integration page
- [ ] Create ChatGPT integration guide
- [ ] Create OpenAI Agent Builder guide
- [ ] Update package README

### Testing
- [ ] Test bridge endpoint with Claude Desktop
- [ ] Test Streamable HTTP with manual POST
- [ ] Test v1 backward compatibility
- [ ] Test CORS headers
- [ ] Test authentication
- [ ] Run TypeScript checks
- [ ] Run build
- [ ] Test all MCP tools
- [ ] Test concurrent requests

### Deployment
- [ ] Deploy to Vercel
- [ ] Verify all endpoints live
- [ ] Test ChatGPT connection
- [ ] Test Claude Desktop
- [ ] Monitor logs
- [ ] Update npm package

---

## Notes

- **No breaking changes:** Existing users (v1) continue working
- **Clear migration path:** Bridge endpoint is straightforward replacement
- **Future-proof:** Streamable HTTP is the 2025 standard
- **Multiple clients:** Support Claude Desktop, ChatGPT, OpenAI Agent Builder
- **Gradual migration:** Three endpoints allow smooth transition

---

## Conclusion

This restructure positions SpreadAPI MCP support for:
1. **Current users:** Smooth migration from v1 to bridge
2. **ChatGPT users:** Native Developer Mode integration
3. **OpenAI Agent Builder:** Standard Streamable HTTP transport
4. **Future MCP clients:** Following 2025 spec

The three-endpoint strategy ensures zero disruption while enabling new capabilities.
