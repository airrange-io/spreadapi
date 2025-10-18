# SpreadAPI v1 - Revised API Approach

## Key Insight

Creating and configuring spreadsheet services is a complex visual task that requires:
- Spreadsheet editing capabilities
- Visual area selection
- Formula configuration
- Input/output mapping

**These tasks are best done through the web UI, not API calls.**

## Recommended API Scope

### Phase 1: Core Operations (What we should actually build)

```
# Service Discovery & Execution
GET    /api/v1/services                    # List published services
GET    /api/v1/services/{id}               # Get service details
GET    /api/v1/services/{id}/execute       # Execute (simple/Excel)
POST   /api/v1/services/{id}/execute       # Execute (complex)

# Service Management (limited)
PUT    /api/v1/services/{id}/metadata      # Update name, description, tags only
DELETE /api/v1/services/{id}               # Delete service (if unpublished)

# Publishing Control
POST   /api/v1/services/{id}/publish       # Publish a configured service
DELETE /api/v1/services/{id}/publish       # Unpublish a service
```

### What Should NOT Be in the API

1. **Service Creation** - Too complex, requires spreadsheet upload and visual configuration
2. **Workbook Editing** - Requires SpreadJS editor
3. **Area Definition** - Requires visual selection
4. **Formula Configuration** - Requires spreadsheet context

### Typical Workflow

1. **Create & Configure Service** - Use web UI at spreadapi.io
   - Upload spreadsheet
   - Define inputs/outputs
   - Select editable areas
   - Test calculations

2. **Publish Service** - Via web UI or API
   - Makes service available for API execution
   - Generates service documentation

3. **Execute Service** - Via API
   - Primary use case for API consumers
   - Both GET and POST methods supported

4. **Monitor & Manage** - Via API
   - View usage statistics
   - Update metadata
   - Manage access tokens

## Simplified Phase 1 Implementation

### 1. Service Discovery

```http
GET /api/v1/services

Response:
{
  "services": [
    {
      "id": "mortgage_calc",
      "name": "Mortgage Calculator",
      "description": "Calculate monthly payments",
      "endpoint": "https://spreadapi.io/api/v1/services/mortgage_calc/execute",
      "documentation": "https://spreadapi.io/docs/mortgage_calc",
      "inputs": ["loanAmount", "interestRate", "loanTerm"],
      "outputs": ["monthlyPayment", "totalInterest", "totalPaid"]
    }
  ]
}
```

### 2. Service Execution (Primary Use Case)

```http
# For Excel/Browser
GET /api/v1/services/mortgage_calc/execute?loanAmount=300000&interestRate=0.065&loanTerm=30

# For Applications
POST /api/v1/services/mortgage_calc/execute
{
  "inputs": {
    "loanAmount": 300000,
    "interestRate": 0.065,
    "loanTerm": 30
  }
}
```

### 3. Service Info

```http
GET /api/v1/services/mortgage_calc

Response:
{
  "id": "mortgage_calc",
  "name": "Mortgage Calculator",
  "description": "Calculate monthly mortgage payments with amortization schedule",
  "inputs": [
    {
      "name": "loanAmount",
      "type": "number",
      "description": "Total loan amount",
      "required": true,
      "validation": {
        "min": 0,
        "max": 10000000
      }
    }
  ],
  "outputs": [
    {
      "name": "monthlyPayment",
      "type": "number",
      "description": "Monthly payment amount"
    }
  ],
  "examples": {
    "basic": {
      "inputs": {
        "loanAmount": 300000,
        "interestRate": 0.065,
        "loanTerm": 30
      }
    }
  }
}
```

## Benefits of This Approach

1. **Clear Separation of Concerns**
   - Web UI: Service creation and configuration
   - API: Service execution and discovery

2. **Simpler API Surface**
   - Fewer endpoints to maintain
   - Clearer purpose for each endpoint

3. **Better Developer Experience**
   - API users just want to execute calculations
   - They don't need to understand spreadsheet internals

4. **Maintains SpreadAPI's Core Value**
   - Visual spreadsheet configuration
   - Simple API execution

## What This Means for Implementation

### Remove from Phase 1:
- `POST /api/v1/services` (create service)
- `PUT /api/v1/services/{id}` (full update)
- Workbook management endpoints
- Area configuration endpoints

### Keep in Phase 1:
- Service discovery (list, get details)
- Service execution (GET and POST)
- Basic metadata updates
- Publishing control

### Future Phases Could Include:
- **Phase 2**: Token management, usage analytics
- **Phase 3**: Area data access (read/write for interactive services)
- **Phase 4**: Batch operations, webhooks
- **Phase 5**: Service cloning/templating via API