# PDF Implementation TODO

## Phase 1: Remove Old Infrastructure (15 min)

### 1.1 Delete Files
- [ ] Delete `/lib/print/redis.ts`
- [ ] Delete `/lib/print/types.ts` 
- [ ] Delete `/lib/pdf/generator.ts`
- [ ] Delete `/app/api/print/` (entire directory)
- [ ] Delete `/app/print/` (entire directory)
- [ ] Delete `PDF_PRINTING_IMPLEMENTATION.md` (old plan)
- [ ] Delete `MCP_PRINT_TOOL_DOCS.md` (old docs)

### 1.2 Clean Up Code
- [ ] Remove `createPrintJob` import from `/app/api/chat/route.js`
- [ ] Remove current `create_pdf` tool from `/app/api/chat/route.js`
- [ ] Remove print tools from `/app/api/mcp/v1/route.js`
- [ ] Remove any print-related imports

## Phase 2: Build Core PDF System (30 min)

### 2.1 Create PDF Preparation API
- [ ] Create `/app/api/pdf/prepare/route.js`
  - [ ] Import spreadjs-server utilities
  - [ ] Accept serviceId and inputs
  - [ ] Load service template
  - [ ] Apply inputs to cells
  - [ ] Calculate workbook
  - [ ] Store full workbook.toJSON() in Redis
  - [ ] Return pdfId

### 2.2 Create Data Retrieval API
- [ ] Create `/app/api/pdf/[id]/data/route.js`
  - [ ] Fetch from Redis using `pdf:{id}` key
  - [ ] Return SpreadJS JSON or 404

### 2.3 Create Client PDF Component
- [ ] Create `/app/pdf/[id]/page.tsx`
  - [ ] Make it a client component (`use client`)
  - [ ] Create hidden div for SpreadJS
  - [ ] Fetch SpreadJS JSON from API
  - [ ] Initialize SpreadJS with PDF module
  - [ ] Load workbook.fromJSON()
  - [ ] Call savePDF()
  - [ ] Handle download with FileSaver
  - [ ] Show loading/success/error states

### 2.4 Add Required Dependencies
- [ ] Ensure `file-saver` is installed for saveAs
- [ ] Verify SpreadJS PDF module is imported correctly

## Phase 3: Integrate with Chat (20 min)

### 3.1 Update Chat Route
- [ ] Add new `prepare_pdf` tool to `/app/api/chat/route.js`
  - [ ] Tool description: "Generate a PDF report when the user explicitly requests one. Only use this when the user asks for a PDF, report, or printable version."
  - [ ] Check if lastCalculation exists
  - [ ] Call `/api/pdf/prepare` with calculation data
  - [ ] Return formatted link with emoji
  - [ ] Handle errors gracefully

### 3.2 Update Tool Execution Context
- [ ] Ensure lastCalculation is properly set after calculations
- [ ] Verify serviceId and inputs are captured correctly

## Phase 4: Testing (15 min)

### 4.1 Test Chat Flow
- [ ] Ask AI to calculate something
- [ ] Ask AI for a PDF
- [ ] Verify link is generated
- [ ] Click link and verify PDF downloads

### 4.2 Test Edge Cases
- [ ] Test with no prior calculation
- [ ] Test with expired Redis key
- [ ] Test with complex spreadsheets
- [ ] Test with multiple inputs
- [ ] Test PDF generation errors

### 4.3 Test Different Services
- [ ] Test with area calculation service
- [ ] Test with more complex services
- [ ] Verify formatting is preserved

## Phase 5: Final Cleanup (10 min)

### 5.1 Code Review
- [ामू ] Remove all console.logs
- [ ] Remove unused imports
- [ ] Add proper error handling
- [ ] Add loading states

### 5.2 Documentation
- [ ] Update CLAUDE.md with new PDF approach
- [ ] Document the simplified flow
- [ ] Add troubleshooting notes

### 5.3 Git Cleanup
- [ ] Review changes
- [ ] Ensure no sensitive data in code
- [ ] Ready for deployment

## Implementation Order

**Start Here:**
1. First, implement Phase 2.1-2.3 (Core system)
2. Test manually with hardcoded data
3. Then integrate with chat (Phase 3)
4. Finally remove old code (Phase 1)

This order ensures we have working code before removing the old system.

## Code Snippets for Quick Implementation

### Redis Key Pattern
```javascript
const pdfId = crypto.randomBytes(8).toString('hex')
const redisKey = `pdf:${pdfId}`
const ttl = 600 // 10 minutes
```

### SpreadJS Client Setup
```javascript
// Dynamic imports for PDF modules
const GC = window.GC || {}
if (!GC.Spread?.Sheets?.PDF) {
  await import('@mescius/spread-sheets-pdf')
}
```

### Error Handling Pattern
```javascript
try {
  // PDF generation
} catch (error) {
  console.error('PDF generation failed:', error)
  return { error: 'Failed to generate PDF' }
}
```

## Success Criteria

✅ User can request PDF from AI  
✅ AI generates working download link  
✅ PDF contains correct calculated values  
✅ PDF downloads automatically  
✅ Old complex code is removed  
✅ New implementation is under 500 lines total  

## Time Estimate

Total: ~90 minutes
- Removal: 15 min
- Core Build: 30 min
- Integration: 20 min
- Testing: 15 min
- Cleanup: 10 min

## Notes

- Do NOT start with removal - build new system first
- Test each component individually before integration
- Use browser DevTools to debug SpreadJS issues
- Keep Redis keys simple and predictable
- Don't over-engineer - this should be SIMPLE