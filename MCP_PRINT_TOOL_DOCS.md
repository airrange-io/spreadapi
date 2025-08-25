# MCP Print Tool Documentation

## Overview
The SpreadAPI MCP Print Tool allows Claude Desktop and other MCP clients to generate shareable PDF links from calculation results. Users can click these links to download professionally formatted PDF reports.

## Tool: `create_print_link`

### Description
Generates a shareable PDF print link for SpreadAPI calculation results. The link remains valid for 24 hours and automatically generates a PDF when accessed.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | string | Yes | The SpreadAPI service ID to execute (e.g., "spapi_live_abc123") |
| `inputs` | object | Yes | Key-value pairs of input parameters for the calculation |
| `title` | string | No | Title for the PDF document (default: "SpreadAPI Report") |
| `orientation` | string | No | Page orientation: "portrait" or "landscape" (default: "portrait") |
| `fitToPage` | boolean | No | Whether to fit content to one page (default: true) |
| `description` | string | No | Description or context for the report |

### Return Value

```json
{
  "jobId": "pj_1737823456_abc123",
  "printUrl": "https://spreadapi.io/print/pj_1737823456_abc123",
  "expiresAt": "2025-01-26T10:00:00Z",
  "message": "Print link created successfully"
}
```

### Example Usage

#### Basic Example
```json
{
  "tool": "create_print_link",
  "parameters": {
    "serviceId": "spapi_live_compound_interest",
    "inputs": {
      "A1": 10000,
      "A2": 5.5,
      "A3": 10
    }
  }
}
```

#### Advanced Example with Settings
```json
{
  "tool": "create_print_link",
  "parameters": {
    "serviceId": "spapi_live_loan_calculator",
    "inputs": {
      "LoanAmount": 250000,
      "InterestRate": 4.5,
      "Years": 30
    },
    "title": "Mortgage Calculation Report",
    "orientation": "portrait",
    "fitToPage": true,
    "description": "30-year fixed mortgage calculation for property purchase"
  }
}
```

### Response in Chat
When using this tool in a conversation, present the link to the user like this:

```markdown
I've calculated your loan details and created a PDF report for you:

**Loan Summary:**
- Loan Amount: $250,000
- Interest Rate: 4.5%
- Term: 30 years
- Monthly Payment: $1,266.71

📄 **[Download PDF Report](https://spreadapi.io/print/pj_1737823456_abc123)**

*This link expires in 24 hours. The PDF will include a detailed amortization schedule and payment breakdown.*
```

## Tool: `get_print_status`

### Description
Check the status of a print job and retrieve the PDF URL if already generated.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | string | Yes | The print job ID returned from create_print_link |

### Return Value

```json
{
  "jobId": "pj_1737823456_abc123",
  "status": "completed",
  "pdfUrl": "https://cdn.spreadapi.io/pdfs/abc123.pdf",
  "expiresAt": "2025-01-26T10:00:00Z"
}
```

### Status Values
- `pending` - Job created but PDF not yet generated
- `processing` - PDF generation in progress
- `completed` - PDF successfully generated
- `failed` - Generation failed (check error message)
- `expired` - Job expired (after 24 hours)

## Error Handling

### Common Errors

#### Invalid Service ID
```json
{
  "error": "Service not found",
  "code": "SERVICE_NOT_FOUND",
  "message": "The specified service ID does not exist or you don't have access"
}
```

#### Invalid Inputs
```json
{
  "error": "Invalid inputs",
  "code": "INVALID_INPUTS",
  "message": "The provided inputs do not match the service requirements"
}
```

#### Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "message": "Too many PDF generation requests. Please wait before trying again.",
  "retryAfter": 60
}
```

## Best Practices

### 1. Validate Inputs Before Creating Links
Always ensure the calculation succeeds before generating a print link:

```python
# First, test the calculation
result = calculate(serviceId, inputs)
if result.success:
    # Then create the print link
    print_link = create_print_link(serviceId, inputs)
```

### 2. Provide Context in Conversation
When generating a print link, explain what the PDF will contain:

```markdown
"I've created a PDF report that includes:
- Your input parameters
- Calculation results
- Detailed breakdown tables
- Any charts defined in the spreadsheet

[Download PDF Report](link)"
```

### 3. Handle Expiration Gracefully
If a user mentions an expired link, offer to generate a new one:

```markdown
"It looks like that print link has expired (they last 24 hours). 
Let me generate a fresh one for you with the same parameters:

[Download PDF Report](new-link)"
```

### 4. Use Appropriate Orientation
- Use `portrait` for reports with vertical tables
- Use `landscape` for wide data tables or charts
- Let the spreadsheet's print area settings guide the choice

## Integration Examples

### Example 1: Loan Calculator Conversation
```
User: "Calculate a loan for $300,000 at 5% for 30 years"