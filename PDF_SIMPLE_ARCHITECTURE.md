# Simplified PDF Architecture

## User Flow
```
1. User: "Can you create a PDF of these results?"
2. AI: Calls prepare_pdf tool → "📄 Here's your PDF: [Download Report]"
3. User: Clicks link → PDF downloads automatically
```

## Technical Flow
```
prepare_pdf tool → /api/pdf/prepare → Redis (10min) → /pdf/[id] → PDF Download
```

## File Structure (Just 4 Files!)

```
/app/api/
  pdf/
    prepare/
      route.js         # Prepares and stores SpreadJS JSON
    [id]/
      data/
        route.js       # Retrieves SpreadJS JSON from Redis

/app/pdf/
  [id]/
    page.tsx           # Client component that generates PDF

/app/api/chat/
  route.js             # Add prepare_pdf tool here
```

## The Entire Implementation

### 1. Prepare Endpoint (`/app/api/pdf/prepare/route.js`)
```javascript
import { createWorkbook } from '@/lib/spreadjs-server'
import redis from '@/lib/redis'
import crypto from 'crypto'

export async function POST(req) {
  const { serviceId, inputs } = await req.json()
  
  // Calculate spreadsheet with inputs
  const workbook = createWorkbook()
  const template = await getServiceTemplate(serviceId)
  workbook.fromJSON(template)
  
  // Apply inputs
  for (const [key, value] of Object.entries(inputs)) {
    // Apply to appropriate cells
  }
  
  // Store complete workbook
  const pdfId = crypto.randomBytes(8).toString('hex')
  await redis.setEx(`pdf:${pdfId}`, 600, JSON.stringify({
    spreadJSON: workbook.toJSON(),
    timestamp: Date.now()
  }))
  
  return Response.json({ pdfId })
}
```

### 2. Data Endpoint (`/app/api/pdf/[id]/data/route.js`)
```javascript
export async function GET(req, { params }) {
  const { id } = await params
  const data = await redis.get(`pdf:${id}`)
  
  if (!data) {
    return Response.json({ error: 'PDF expired' }, { status: 404 })
  }
  
  return Response.json(JSON.parse(data))
}
```

### 3. PDF Generator (`/app/pdf/[id]/page.tsx`)
```javascript
'use client'
import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'

export default function PDFGenerator({ params }) {
  const [status, setStatus] = useState('generating')
  
  useEffect(() => {
    generatePDF()
  }, [])
  
  async function generatePDF() {
    // Get spreadsheet data
    const res = await fetch(`/api/pdf/${params.id}/data`)
    const { spreadJSON } = await res.json()
    
    // Load SpreadJS
    await import('@mescius/spread-sheets-pdf')
    
    // Create hidden workbook
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
      (error) => {
        console.error(error)
        setStatus('error')
      }
    )
  }
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      {status === 'generating' && <p>Generating your PDF...</p>}
      {status === 'success' && <p>✅ PDF downloaded successfully!</p>}
      {status === 'error' && <p>❌ Failed to generate PDF</p>}
    </div>
  )
}
```

### 4. Chat Tool (`/app/api/chat/route.js` - add this tool)
```javascript
tools.prepare_pdf = tool({
  description: 'Generate a PDF when user explicitly asks for one',
  parameters: z.object({
    title: z.string().optional()
  }),
  execute: async ({ title }) => {
    if (!lastCalculation) {
      return 'Please perform a calculation first.'
    }
    
    const res = await fetch('/api/pdf/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: lastCalculation.serviceId,
        inputs: lastCalculation.inputs
      })
    })
    
    const { pdfId } = await res.json()
    return `📄 [Download your PDF Report](/pdf/${pdfId})`
  }
})
```

## That's It!

**4 files, ~200 lines of code total**

Compare to what we had:
- 15+ files
- 1000+ lines of code
- Complex Redis job management
- Status tracking
- Multiple API endpoints
- TypeScript interfaces
- Error states
- Metadata storage

## Why This Works

1. **SpreadJS does the heavy lifting** - We just pass JSON around
2. **Redis for temporary storage** - Simple key-value, no complexity
3. **Client-side PDF generation** - The only way that actually works
4. **User-triggered** - No automatic PDFs, only when requested

## What We DON'T Need

❌ Job status tracking - It either works or doesn't  
❌ Complex metadata - Just store the spreadsheet  
❌ Print settings management - SpreadJS has defaults  
❌ User authentication - Links expire in 10 minutes  
❌ Progress tracking - PDF generation is fast  
❌ Error recovery - User can just regenerate  

## Next Steps

1. Implement these 4 files
2. Test the flow
3. Delete everything else
4. Ship it! 🚀