# PDF Generation Implementation Plan

## Overview
Implement a simplified PDF generation system where:
1. User explicitly requests a PDF from the AI
2. AI prepares the complete calculated spreadsheet and stores it temporarily
3. User clicks a link to download the PDF
4. Client-side component generates the PDF using SpreadJS

## Current State Analysis

### What We Built (To Remove)
- `/lib/print/redis.ts` - Complex print job management
- `/lib/print/types.ts` - Elaborate TypeScript interfaces
- `/lib/pdf/generator.ts` - Server-side PDF attempt (doesn't work)
- `/app/api/print/[id]/data/route.ts` - Print job data endpoint
- `/app/api/print/[id]/pdf/route.ts` - PDF generation endpoint (not working)
- `/app/api/print/jobs/[id]/route.ts` - Job management endpoint
- `/app/api/print/jobs/[id]/status/route.ts` - Status tracking endpoint
- `/app/api/print/jobs/route.ts` - Jobs listing endpoint
- `/app/print/[id]/report/` - Unnecessary report page
- `/app/print/[id]/pdf-viewer.tsx` - Complex viewer component
- Complex MCP integration in `/app/api/mcp/v1/route.js`

### What We Need (To Build)

#### 1. Chat Tool: `prepare_pdf`
**Location:** `/app/api/chat/route.js`
```javascript
// Tool that:
// - Receives serviceId and inputs from AI
// - Calculates full spreadsheet server-side
// - Stores complete workbook.toJSON() in Redis
// - Returns a simple print link
```

#### 2. API Endpoint: Generate Full SpreadJS JSON
**Location:** `/app/api/pdf/prepare/route.js`
```javascript
// Endpoint that:
// - Loads service template
// - Applies input values
// - Runs calculation
// - Returns workbook.toJSON() with all calculated values
```

#### 3. Client Component: PDF Generator
**Location:** `/app/pdf/[id]/page.tsx`
```javascript
// Simple client component that:
// - Fetches stored SpreadJS JSON from Redis
// - Loads it into hidden SpreadJS instance
// - Calls savePDF() to generate PDF
// - Auto-downloads the PDF
// - Shows success/error state
```

## Detailed Implementation Steps

### Phase 1: Remove Old Infrastructure
1. Delete all files in `/lib/print/`
2. Delete all files in `/lib/pdf/`
3. Delete all routes in `/app/api/print/`
4. Delete entire `/app/print/` directory
5. Remove print-related imports from `/app/api/chat/route.js`
6. Remove print tools from `/app/api/mcp/v1/route.js`
7. Clean up unused documentation files

### Phase 2: Build New PDF System

#### Step 1: Create PDF Preparation Endpoint
```javascript
// /app/api/pdf/prepare/route.js
export async function POST(request) {
  const { serviceId, inputs } = await request.json()
  
  // Use existing spreadjs-server to calculate
  const workbook = createWorkbook()
  const template = await getServiceTemplate(serviceId)
  workbook.fromJSON(template)
  
  // Apply inputs
  applyInputValues(workbook, inputs)
  
  // Calculate
  workbook.calculate()
  
  // Store in Redis with simple key
  const pdfId = generateId()
  await redis.setEx(
    `pdf:${pdfId}`,
    600, // 10 minutes
    JSON.stringify(workbook.toJSON())
  )
  
  return { pdfId }
}
```

#### Step 2: Add Chat Tool
```javascript
// In /app/api/chat/route.js
tools.prepare_pdf = tool({
  description: 'Generate a PDF report when user explicitly requests it',
  parameters: z.object({
    includeCurrentCalculation: z.boolean()
  }),
  execute: async ({ includeCurrentCalculation }) => {
    if (!lastCalculation) {
      return 'Please perform a calculation first'
    }
    
    // Call our new endpoint
    const response = await fetch('/api/pdf/prepare', {
      method: 'POST',
      body: JSON.stringify({
        serviceId: lastCalculation.serviceId,
        inputs: lastCalculation.inputs
      })
    })
    
    const { pdfId } = await response.json()
    const pdfUrl = `/pdf/${pdfId}`
    
    return `📄 Your PDF is ready: [Download Report](${pdfUrl})`
  }
})
```

#### Step 3: Create Client PDF Component
```javascript
// /app/pdf/[id]/page.tsx
'use client'

export default function PDFGenerator({ params }) {
  useEffect(() => {
    async function generatePDF() {
      // Fetch stored JSON
      const res = await fetch(`/api/pdf/${params.id}/data`)
      const spreadJSON = await res.json()
      
      // Create hidden SpreadJS
      const container = document.createElement('div')
      container.style.display = 'none'
      document.body.appendChild(container)
      
      const workbook = new GC.Spread.Sheets.Workbook(container)
      workbook.fromJSON(spreadJSON)
      
      // Generate PDF
      workbook.savePDF(
        (blob) => {
          saveAs(blob, 'report.pdf')
          setStatus('success')
        },
        (error) => setStatus('error')
      )
    }
    
    generatePDF()
  }, [])
  
  return <LoadingOrSuccessUI />
}
```

### Phase 3: Testing & Cleanup

1. Test complete flow:
   - User asks for PDF
   - AI prepares and provides link
   - Link generates actual PDF

2. Remove all test files and documentation for old approach

3. Update CLAUDE.md with new PDF approach

## Benefits of New Approach

✅ **Simpler** - 3 files instead of 15+  
✅ **User-controlled** - Only creates PDFs when explicitly requested  
✅ **Efficient** - Reuses existing calculation infrastructure  
✅ **Clean** - No complex state management or job tracking  
✅ **Works** - Uses client-side SpreadJS for real PDF generation  

## Technical Decisions

1. **10-minute TTL** - Enough time for user to download, not wasteful
2. **No status tracking** - Either it works or it doesn't
3. **No metadata storage** - Keep it simple
4. **Direct SpreadJS JSON** - No transformation needed
5. **Client-side generation** - Only way that actually works

## Migration Checklist

- [ ] Create new `/app/api/pdf/prepare/route.js`
- [ ] Create new `/app/pdf/[id]/page.tsx` component
- [ ] Add `prepare_pdf` tool to chat interface
- [ ] Test end-to-end flow
- [ ] Delete all old print infrastructure
- [ ] Update documentation
- [ ] Clean up unused imports
- [ ] Test in production mode

## Notes

- We're keeping the same user experience but with 90% less code
- The AI will only offer PDFs when users ask for them
- No automatic PDF generation after calculations
- Simple Redis keys: `pdf:{id}` instead of complex job management
- Leverages existing SpreadJS infrastructure efficiently