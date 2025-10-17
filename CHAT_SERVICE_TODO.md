# Chat Service Implementation TODO

## Current Status
The chat interface at `/chat` is functional with basic AI responses, but the MCP tool integration is not working properly. Users can select services, but the AI is not using the calculation tools to execute actual spreadsheet calculations.

## Phase 1: Finalize Chat Service Functionality ✅ PRIORITY: HIGH

### 1.1 Fix Tool Execution
- [ ] Debug why the AI is not invoking the calculation tools
  - [ ] Add verbose logging to tool registration
  - [ ] Test with explicit tool-use prompts
  - [ ] Verify tool schema matches AI SDK requirements
- [ ] Ensure tool responses are properly formatted
- [ ] Add tool execution visualization in the UI (loading states, results)

### 1.2 Test with Different Services
- [ ] Test with authenticated user's services
- [ ] Test with demo services (Compound Interest, Orders Lookup)
- [ ] Verify input parameter mapping works correctly
- [ ] Ensure output formatting matches service definitions

### 1.3 Error Handling
- [ ] Handle service not found errors gracefully
- [ ] Add fallback for services without inputs/outputs
- [ ] Improve error messages for failed calculations
- [ ] Handle API rate limits and timeouts

### 1.4 UI/UX Improvements
- [ ] Add clear indication when a service is selected
- [ ] Show service capabilities (inputs/outputs) in UI
- [ ] Add example prompts for each service
- [ ] Implement conversation history persistence
- [ ] Add ability to clear conversation

### 1.5 Performance Optimization
- [ ] Implement message pagination for long conversations
- [ ] Add response streaming progress indicator
- [ ] Optimize service switching (don't lose context)
- [ ] Cache service details in session storage

## Phase 2: Refactor Service Data Fetching 📁 PRIORITY: MEDIUM

### 2.1 Expand Centralized Helpers
- [ ] Create comprehensive service helper module
  ```javascript
  // /utils/serviceHelpers.js
  - getServiceDetails(serviceId, userId)
  - getPublishedServiceDetails(serviceId)
  - getServiceWithWorkbook(serviceId, userId)
  - batchGetServices(serviceIds, userId)
  - getServiceStatus(serviceId)
  ```
- [ ] Add caching layer to helpers
- [ ] Implement proper TypeScript types
- [ ] Add comprehensive error handling

### 2.2 Update High-Priority Components
- [ ] MCP Server Routes (5 files, ~10 instances)
  - [ ] `/api/mcp/v1/route.js`
  - [ ] `/api/mcp/v1/executeEnhancedCalc.js`
  - [ ] `/api/mcp/v1/areaExecutors.js`
  - [ ] `/api/mcp/v1/areaHandlers.js`
  - [ ] `/api/mcp/route.js`
- [ ] Service Management Endpoints
  - [ ] `/api/services/[id]/route.js`
  - [ ] `/api/services/[id]/full/route.js`
  - [ ] `/api/services/route.js`

### 2.3 Update Medium-Priority Components
- [ ] Workbook Management
  - [ ] `/api/workbook/[id]/route.js`
- [ ] Service Operations
  - [ ] `/api/services/[id]/metadata/route.js`
  - [ ] `/api/services/[id]/tokens/route.js`

Note: `/api/getresults/` has been migrated to `/api/v1/services/[id]/execute/` ✓

### 2.4 Update Low-Priority Components
- [ ] Admin/Diagnostic endpoints
- [ ] V1 API endpoints (if still in use)
- [ ] Test files and documentation

### 2.5 Deprecate Redundant Endpoints
- [ ] Identify which endpoints can be consolidated
- [ ] Create migration plan for frontend
- [ ] Update API documentation
- [ ] Add deprecation warnings

## Phase 3: Testing & Documentation 📝 PRIORITY: LOW

### 3.1 Testing
- [ ] Unit tests for service helpers
- [ ] Integration tests for chat functionality
- [ ] E2E tests for complete chat flow
- [ ] Performance benchmarks

### 3.2 Documentation
- [ ] Update API documentation
- [ ] Create chat feature user guide
- [ ] Document MCP tool integration
- [ ] Add inline code documentation

## Implementation Order

1. **Week 1**: Complete Phase 1.1-1.3 (Core functionality)
2. **Week 2**: Complete Phase 1.4-1.5 (Polish and optimize)
3. **Week 3**: Start Phase 2.1-2.2 (Critical refactoring)
4. **Week 4**: Continue Phase 2.3-2.5 (Complete refactoring)
5. **Week 5**: Phase 3 (Testing and documentation)

## Success Criteria

### For Chat Service
- [ ] AI successfully uses calculation tools
- [ ] All service types work correctly
- [ ] Error handling is robust
- [ ] UI is intuitive and responsive
- [ ] Performance is acceptable (<2s response time)

### For Refactoring
- [ ] All Redis access uses centralized helpers
- [ ] No code duplication for service fetching
- [ ] Consistent data structures across app
- [ ] Improved performance through caching
- [ ] Comprehensive test coverage

## Notes

- Priority is to get chat working first, then clean up technical debt
- Consider using feature flags for gradual rollout
- Monitor Redis performance during refactoring
- Keep backwards compatibility during migration
- Document any breaking changes

## Related Files
- Chat Implementation: `/app/chat/`, `/app/api/chat/`
- Service Helpers: `/utils/serviceHelpers.js`
- MCP Integration: `/app/api/mcp/`
- Audit Results: `/SERVICE_DATA_FETCHING_AUDIT.md`