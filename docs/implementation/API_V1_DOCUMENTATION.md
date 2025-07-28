# SpreadAPI v1 API Documentation

## Overview

SpreadAPI v1 provides a RESTful API for discovering and executing spreadsheet-based services. Services are created and configured through the web UI at spreadapi.io, while the API focuses on execution and basic metadata management.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Service Discovery](#service-discovery)
  - [Service Execution](#service-execution)
  - [Service Management](#service-management)
- [Integration Examples](#integration-examples)
  - [Excel](#excel-integration)
  - [Power Query](#power-query-integration)
  - [Google Sheets](#google-sheets-integration)
  - [JavaScript/TypeScript](#javascripttypescript)
  - [Python](#python)
  - [cURL](#curl-examples)

## Authentication

All API endpoints require authentication using your Hanko session cookie. For programmatic access, you'll need to:

1. Sign in to SpreadAPI to obtain your session cookie
2. Include the cookie in your API requests
3. Or use API tokens (coming in Phase 2)

```bash
# Example with cookie
curl -H "Cookie: hanko=your-session-cookie" \
  https://spreadapi.io/api/v1/services
```

## Base URL

```
https://spreadapi.io/api/v1
```

## Error Handling

All endpoints return standard HTTP status codes and JSON error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid authentication)
- `404` - Not Found
- `409` - Conflict (e.g., trying to delete published service)
- `500` - Internal Server Error

## Endpoints

### Service Discovery

#### List Services

Get all services for the authenticated user with filtering and pagination.

```http
GET /services?status={status}&sort={field}&order={order}&limit={limit}&offset={offset}
```

**Query Parameters:**
- `includeAll` - Include draft services: `true` or `false` (default: false - only shows published services)
- `sort` - Sort by field: `name`, `calls`, `updatedAt` (default: name)
- `order` - Sort order: `asc` or `desc` (default: asc)
- `limit` - Number of results per page (default: 50, max: 100)
- `offset` - Pagination offset (default: 0)

**Example Request:**
```bash
curl -H "Cookie: hanko=your-session-cookie" \
  "https://spreadapi.io/api/v1/services?sort=calls&order=desc&limit=10"
```

**Example Response:**
```json
{
  "services": [
    {
      "id": "mortgage_calc_abc123",
      "name": "Mortgage Calculator",
      "description": "Calculate monthly mortgage payments with amortization",
      "status": "published",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z",
      "calls": 1250,
      "needsToken": false,
      "useCaching": true,
      "tags": ["finance", "calculator", "mortgage"]
    },
    {
      "id": "budget_tracker_xyz789",
      "name": "Budget Tracker",
      "description": "Track monthly income and expenses",
      "status": "published",
      "createdAt": "2024-01-14T09:00:00Z",
      "updatedAt": "2024-01-15T11:20:00Z",
      "calls": 0,
      "needsToken": true,
      "useCaching": false,
      "tags": ["finance", "budgeting"]
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Service Details

Get detailed information about a specific service.

```http
GET /services/{serviceId}
```

**Example Request:**
```bash
curl -H "Cookie: hanko=your-session-cookie" \
  https://spreadapi.io/api/v1/services/mortgage_calc_abc123
```

**Example Response:**
```json
{
  "id": "mortgage_calc_abc123",
  "name": "Mortgage Calculator",
  "description": "Calculate monthly mortgage payments with amortization",
  "status": "published",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "tags": ["finance", "calculator", "mortgage"],
  "published": {
    "url": "https://spreadapi.io/s/mortgage_calc_abc123",
    "needsToken": false,
    "useCaching": true,
    "calls": 1250,
    "publishedAt": "2024-01-15T11:00:00Z",
    "apiDefinition": {
      "inputs": [
        {
          "name": "loanAmount",
          "type": "number",
          "description": "Total loan amount",
          "required": true,
          "min": 0,
          "max": 10000000
        },
        {
          "name": "interestRate",
          "type": "number",
          "description": "Annual interest rate (as decimal, e.g., 0.065 for 6.5%)",
          "required": true,
          "min": 0,
          "max": 0.30
        },
        {
          "name": "loanTerm",
          "type": "number",
          "description": "Loan term in years",
          "required": true,
          "min": 1,
          "max": 50
        }
      ],
      "outputs": [
        {
          "name": "monthlyPayment",
          "type": "number",
          "description": "Monthly payment amount"
        },
        {
          "name": "totalInterest",
          "type": "number",
          "description": "Total interest paid over loan term"
        },
        {
          "name": "totalPaid",
          "type": "number",
          "description": "Total amount paid (principal + interest)"
        }
      ]
    },
    "areas": [
      {
        "name": "amortizationSchedule",
        "address": "Sheet1!A10:F370",
        "mode": "readonly",
        "description": "Monthly breakdown of payments"
      }
    ]
  }
}
```


### Service Execution

#### Execute Service (POST)

Execute a service with JSON input. Best for complex calculations and programmatic access.

```http
POST /services/{serviceId}/execute
Content-Type: application/json
```

**Request Body:**
```json
{
  "inputs": {
    "loanAmount": 300000,
    "interestRate": 0.065,
    "loanTerm": 30
  }
}
```

**Example Response:**
```json
{
  "serviceId": "mortgage_calc_abc123",
  "inputs": {
    "loanAmount": 300000,
    "interestRate": 0.065,
    "loanTerm": 30
  },
  "outputs": {
    "monthlyPayment": 1896.20,
    "totalInterest": 382632.00,
    "totalPaid": 682632.00
  },
  "metadata": {
    "executionTime": 45,
    "timestamp": "2024-01-15T17:30:00Z",
    "version": "v1"
  }
}
```

#### Execute Service (GET)

Execute a service with query parameters. Ideal for Excel, browser testing, and simple integrations.

```http
GET /services/{serviceId}/execute?param1=value1&param2=value2&_format={format}
```

**Query Parameters:**
- Service input parameters (e.g., `loanAmount`, `interestRate`)
- `_format` - Response format: `json` (default), `plain`, `csv`
- `_pretty` - Pretty print JSON: `true` or `false`

**Example Requests:**

1. **JSON Response (default):**
```bash
curl "https://spreadapi.io/api/v1/services/mortgage_calc_abc123/execute?loanAmount=300000&interestRate=0.065&loanTerm=30"
```

2. **Plain Text Response (for Excel WEBSERVICE):**
```bash
curl "https://spreadapi.io/api/v1/services/mortgage_calc_abc123/execute?loanAmount=300000&interestRate=0.065&loanTerm=30&_format=plain"

# Response:
monthlyPayment: 1896.20
totalInterest: 382632.00
totalPaid: 682632.00
```

3. **CSV Response (for Excel IMPORTDATA):**
```bash
curl "https://spreadapi.io/api/v1/services/mortgage_calc_abc123/execute?loanAmount=300000&interestRate=0.065&loanTerm=30&_format=csv"

# Response:
monthlyPayment,totalInterest,totalPaid
1896.20,382632.00,682632.00
```

### Service Management

**Note:** Service creation and configuration must be done through the web UI at spreadapi.io. The API provides limited management capabilities for metadata updates only.

#### Update Service Metadata

Update service name, description, or tags. This does not affect the spreadsheet logic or configuration.

```http
PUT /services/{serviceId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Service Name",
  "description": "Updated description",
  "tags": ["tag1", "tag2"]
}
```

**Example Response:**
```json
{
  "id": "mortgage_calc_abc123",
  "name": "Updated Service Name",
  "description": "Updated description",
  "status": "published",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T17:00:00Z",
  "tags": ["tag1", "tag2"]
}
```

#### Delete Service

Delete an unpublished service. Published services must be unpublished first.

```http
DELETE /services/{serviceId}
```

**Success Response:**
```json
{
  "message": "Service deleted successfully"
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "Conflict",
  "message": "Cannot delete published service. Unpublish it first."
}
```

#### Unpublish Service

Remove a service from public access. The service configuration remains intact.

```http
DELETE /services/{serviceId}/publish
```

**Success Response:**
```json
{
  "message": "Service unpublished successfully",
  "id": "mortgage_calc_abc123"
}
```

**Note:** Publishing services via API is not supported. Use the web UI at spreadapi.io to configure and publish services.

## Integration Examples

### Excel Integration

#### Using WEBSERVICE Function

The `WEBSERVICE` function fetches data from a URL. Use the `_format=plain` parameter for easy parsing.

```excel
# Simple calculation
=WEBSERVICE("https://spreadapi.io/api/v1/services/mortgage_calc/execute?loanAmount=300000&interestRate=0.065&loanTerm=30&_format=plain")

# Extract specific value using text functions
=VALUE(MID(WEBSERVICE("https://spreadapi.io/api/v1/services/mortgage_calc/execute?loanAmount="&A2&"&interestRate="&B2&"&loanTerm="&C2&"&_format=plain"), FIND("monthlyPayment: ", WEBSERVICE(...)) + 16, 10))
```

#### Using FILTERXML with JSON

For more complex parsing, use FILTERXML with the JSON response:

```excel
# Get the JSON response
=WEBSERVICE("https://spreadapi.io/api/v1/services/mortgage_calc/execute?loanAmount=300000&interestRate=0.065&loanTerm=30")

# Parse specific value (requires XML transformation)
=FILTERXML(WEBSERVICE(...), "//monthlyPayment")
```

#### Dynamic Parameters from Cells

```excel
# A1: Loan Amount (300000)
# A2: Interest Rate (0.065)
# A3: Loan Term (30)

=WEBSERVICE("https://spreadapi.io/api/v1/services/mortgage_calc/execute?loanAmount="&A1&"&interestRate="&A2&"&loanTerm="&A3&"&_format=plain")
```

### Power Query Integration

Power Query provides robust data transformation capabilities for Excel and Power BI.

#### Basic GET Request

```powerquery
let
    // Define the service and parameters
    ServiceId = "mortgage_calc_abc123",
    LoanAmount = 300000,
    InterestRate = 0.065,
    LoanTerm = 30,
    
    // Build the URL
    BaseUrl = "https://spreadapi.io/api/v1/services/",
    Url = BaseUrl & ServiceId & "/execute?loanAmount=" & Number.ToText(LoanAmount) 
          & "&interestRate=" & Number.ToText(InterestRate) 
          & "&loanTerm=" & Number.ToText(LoanTerm),
    
    // Make the request
    Response = Web.Contents(Url),
    JsonResponse = Json.Document(Response),
    
    // Extract outputs
    Outputs = JsonResponse[outputs],
    
    // Convert to table
    OutputsTable = Record.ToTable(Outputs)
in
    OutputsTable
```

#### POST Request with Dynamic Parameters

```powerquery
let
    // Service configuration
    ServiceId = "mortgage_calc_abc123",
    
    // Get parameters from Excel table
    Parameters = Excel.CurrentWorkbook(){[Name="InputParameters"]}[Content],
    LoanAmount = Parameters{0}[LoanAmount],
    InterestRate = Parameters{0}[InterestRate],
    LoanTerm = Parameters{0}[LoanTerm],
    
    // Prepare request body
    RequestBody = Json.FromValue([
        inputs = [
            loanAmount = LoanAmount,
            interestRate = InterestRate,
            loanTerm = LoanTerm
        ]
    ]),
    
    // Make POST request
    Response = Web.Contents(
        "https://spreadapi.io/api/v1/services/" & ServiceId & "/execute",
        [
            Headers = [
                #"Content-Type" = "application/json",
                #"Cookie" = "hanko=your-session-cookie"
            ],
            Content = RequestBody
        ]
    ),
    
    // Parse response
    JsonResponse = Json.Document(Response),
    Outputs = JsonResponse[outputs],
    
    // Create output table
    OutputTable = Table.FromRecords({Outputs})
in
    OutputTable
```

#### Batch Processing Multiple Calculations

```powerquery
let
    // Define scenarios table (from Excel range)
    Scenarios = Excel.CurrentWorkbook(){[Name="LoanScenarios"]}[Content],
    
    // Function to call API for each scenario
    CalculateLoan = (loanAmount as number, rate as number, term as number) =>
        let
            Url = "https://spreadapi.io/api/v1/services/mortgage_calc/execute"
                  & "?loanAmount=" & Number.ToText(loanAmount)
                  & "&interestRate=" & Number.ToText(rate)
                  & "&loanTerm=" & Number.ToText(term),
            Response = Web.Contents(Url),
            Json = Json.Document(Response),
            Outputs = Json[outputs]
        in
            Outputs,
    
    // Add calculated columns
    Results = Table.AddColumn(Scenarios, "MonthlyPayment", 
        each CalculateLoan([LoanAmount], [InterestRate], [LoanTerm])[monthlyPayment]),
    
    ResultsWithTotal = Table.AddColumn(Results, "TotalPaid",
        each CalculateLoan([LoanAmount], [InterestRate], [LoanTerm])[totalPaid])
in
    ResultsWithTotal
```

#### Handling Authentication in Power Query

```powerquery
let
    // Get authentication cookie (you need to obtain this from browser)
    AuthCookie = "hanko=your-session-cookie-value",
    
    // Make authenticated request
    Source = Web.Contents(
        "https://spreadapi.io/api/v1/services",
        [
            Headers = [
                #"Cookie" = AuthCookie
            ]
        ]
    ),
    
    // Parse JSON response
    Services = Json.Document(Source)[services],
    
    // Convert to table
    ServicesTable = Table.FromList(
        Services, 
        Splitter.SplitByNothing(), 
        null, 
        null, 
        ExtraValues.Error
    ),
    
    // Expand records
    ExpandedTable = Table.ExpandRecordColumn(
        ServicesTable, 
        "Column1", 
        {"id", "name", "description", "status", "calls"},
        {"ID", "Name", "Description", "Status", "Calls"}
    )
in
    ExpandedTable
```

### Google Sheets Integration

#### Custom Function using Apps Script

Create a custom function in Google Sheets:

```javascript
/**
 * Call SpreadAPI service
 * @param {string} serviceId The service ID
 * @param {...} args Alternating parameter names and values
 * @return The calculation results
 * @customfunction
 */
function SPREADAPI(serviceId, ...args) {
  // Build parameters object
  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    if (i + 1 < args.length) {
      params[args[i]] = args[i + 1];
    }
  }
  
  // Build URL
  const baseUrl = 'https://spreadapi.io/api/v1/services/';
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  const url = `${baseUrl}${serviceId}/execute?${queryString}`;
  
  try {
    // Make request
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    // Return outputs as array for spreading across cells
    return Object.entries(data.outputs || {})
      .map(([key, value]) => [key, value]);
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Get only a specific output value
 * @customfunction
 */
function SPREADAPI_VALUE(serviceId, outputName, ...args) {
  const result = SPREADAPI(serviceId, ...args);
  if (typeof result === 'string') return result; // Error message
  
  const output = result.find(([key]) => key === outputName);
  return output ? output[1] : '#N/A';
}
```

Usage in Google Sheets:
```
=SPREADAPI("mortgage_calc", "loanAmount", 300000, "interestRate", 0.065, "loanTerm", 30)
=SPREADAPI_VALUE("mortgage_calc", "monthlyPayment", "loanAmount", A2, "interestRate", B2, "loanTerm", C2)
```

### JavaScript/TypeScript

#### Basic Fetch Example

```javascript
// Simple GET request
async function calculateMortgage(loanAmount, interestRate, loanTerm) {
  const serviceId = 'mortgage_calc_abc123';
  const url = `https://spreadapi.io/api/v1/services/${serviceId}/execute?` +
    `loanAmount=${loanAmount}&interestRate=${interestRate}&loanTerm=${loanTerm}`;
  
  const response = await fetch(url, {
    credentials: 'include' // Include cookies
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.outputs;
}

// Usage
const results = await calculateMortgage(300000, 0.065, 30);
console.log(`Monthly payment: $${results.monthlyPayment.toFixed(2)}`);
```

#### TypeScript with Type Safety

```typescript
// API Types
interface ServiceInput {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
}

interface ServiceOutput {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
}

interface ExecuteResponse {
  serviceId: string;
  inputs: ServiceInput;
  outputs: ServiceOutput;
  metadata: {
    executionTime: number;
    timestamp: string;
    version: string;
  };
}

// API Client
class SpreadAPIClient {
  private baseUrl = 'https://spreadapi.io/api/v1';
  private authCookie: string;
  
  constructor(authCookie: string) {
    this.authCookie = authCookie;
  }
  
  async executeService(
    serviceId: string, 
    inputs: Record<string, any>
  ): Promise<ExecuteResponse> {
    const response = await fetch(
      `${this.baseUrl}/services/${serviceId}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.authCookie
        },
        body: JSON.stringify({ inputs })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  }
  
  async listServices(options?: {
    status?: 'draft' | 'published' | 'all';
    sort?: 'name' | 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams(options as any);
    const response = await fetch(
      `${this.baseUrl}/services?${params}`,
      {
        headers: {
          'Cookie': this.authCookie
        }
      }
    );
    
    return response.json();
  }
}

// Usage
const client = new SpreadAPIClient('hanko=your-session-cookie');

const result = await client.executeService('mortgage_calc_abc123', {
  loanAmount: 300000,
  interestRate: 0.065,
  loanTerm: 30
});

console.log(`Monthly payment: $${result.outputs.monthlyPayment.toFixed(2)}`);
```

### Python

#### Using requests library

```python
import requests
from typing import Dict, Any

class SpreadAPIClient:
    def __init__(self, auth_cookie: str):
        self.base_url = "https://spreadapi.io/api/v1"
        self.session = requests.Session()
        self.session.cookies.set("hanko", auth_cookie)
    
    def execute_service(self, service_id: str, inputs: Dict[str, Any]) -> Dict:
        """Execute a SpreadAPI service with given inputs"""
        url = f"{self.base_url}/services/{service_id}/execute"
        response = self.session.post(url, json={"inputs": inputs})
        response.raise_for_status()
        return response.json()
    
    def execute_service_get(self, service_id: str, **kwargs) -> Dict:
        """Execute a service using GET method with query parameters"""
        url = f"{self.base_url}/services/{service_id}/execute"
        response = self.session.get(url, params=kwargs)
        response.raise_for_status()
        return response.json()
    
    def list_services(self, status=None, sort="updatedAt", order="desc", limit=50):
        """List all services"""
        params = {
            "sort": sort,
            "order": order,
            "limit": limit
        }
        if status:
            params["status"] = status
            
        response = self.session.get(f"{self.base_url}/services", params=params)
        response.raise_for_status()
        return response.json()

# Usage example
client = SpreadAPIClient("your-session-cookie-value")

# Execute mortgage calculation
result = client.execute_service("mortgage_calc_abc123", {
    "loanAmount": 300000,
    "interestRate": 0.065,
    "loanTerm": 30
})

print(f"Monthly payment: ${result['outputs']['monthlyPayment']:.2f}")
print(f"Total interest: ${result['outputs']['totalInterest']:.2f}")

# Using GET method
result_get = client.execute_service_get(
    "mortgage_calc_abc123",
    loanAmount=300000,
    interestRate=0.065,
    loanTerm=30
)
```

#### Pandas Integration

```python
import pandas as pd
import requests

def calculate_scenarios(scenarios_df: pd.DataFrame, service_id: str) -> pd.DataFrame:
    """Calculate results for multiple scenarios using SpreadAPI"""
    
    results = []
    base_url = f"https://spreadapi.io/api/v1/services/{service_id}/execute"
    
    for _, row in scenarios_df.iterrows():
        # Build query parameters from row
        params = row.to_dict()
        
        # Make API call
        response = requests.get(base_url, params=params)
        
        if response.ok:
            data = response.json()
            # Combine inputs and outputs
            result = {**params, **data['outputs']}
            results.append(result)
        else:
            print(f"Error for scenario: {params}")
            results.append({**params, 'error': response.text})
    
    return pd.DataFrame(results)

# Example usage
scenarios = pd.DataFrame({
    'loanAmount': [200000, 300000, 400000, 500000],
    'interestRate': [0.05, 0.055, 0.06, 0.065],
    'loanTerm': [15, 20, 25, 30]
})

results = calculate_scenarios(scenarios, 'mortgage_calc_abc123')
print(results[['loanAmount', 'interestRate', 'loanTerm', 'monthlyPayment', 'totalPaid']])
```

### cURL Examples

#### List all published services
```bash
curl -H "Cookie: hanko=your-session-cookie" \
  "https://spreadapi.io/api/v1/services?status=published&sort=calls&order=desc"
```

#### Create a new service
```bash
curl -X POST \
  -H "Cookie: hanko=your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Tax Calculator",
    "description": "Calculate sales tax for different states",
    "tags": ["finance", "tax", "calculator"]
  }' \
  https://spreadapi.io/api/v1/services
```

#### Execute a calculation
```bash
# Using POST with JSON
curl -X POST \
  -H "Cookie: hanko=your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "loanAmount": 300000,
      "interestRate": 0.065,
      "loanTerm": 30
    }
  }' \
  https://spreadapi.io/api/v1/services/mortgage_calc_abc123/execute

# Using GET with query parameters
curl "https://spreadapi.io/api/v1/services/mortgage_calc_abc123/execute?loanAmount=300000&interestRate=0.065&loanTerm=30"

# Get plain text output
curl "https://spreadapi.io/api/v1/services/mortgage_calc_abc123/execute?loanAmount=300000&interestRate=0.065&loanTerm=30&_format=plain"
```

#### Update service metadata
```bash
curl -X PUT \
  -H "Cookie: hanko=your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Mortgage Calculator v2",
    "tags": ["finance", "mortgage", "calculator", "real-estate", "investment"]
  }' \
  https://spreadapi.io/api/v1/services/mortgage_calc_abc123
```

#### Delete a service
```bash
curl -X DELETE \
  -H "Cookie: hanko=your-session-cookie" \
  https://spreadapi.io/api/v1/services/test_service_123
```

## Rate Limiting

Currently, there are no hard rate limits, but please be respectful of the service:
- Batch operations when possible
- Cache results when appropriate
- Use webhook notifications instead of polling (coming in Phase 2)

## Best Practices

### API Design
1. **Use POST for complex calculations** - When you have many parameters or structured data
2. **Use GET for simple calculations** - When integrating with Excel or browser-based tools
3. **Choose appropriate output formats** - Use `_format=plain` for Excel, JSON for applications
4. **Handle errors gracefully** - Always check status codes and parse error responses

### Service Design
1. **Create focused services** - Each service should solve one specific problem
2. **Use clear parameter names** - Make inputs self-documenting
3. **Version through new services** - Don't break existing integrations
4. **Enable caching** - For expensive calculations that don't change frequently
5. **Document your services** - Use descriptions to help API consumers

### Performance
1. **Batch when possible** - Group related calculations
2. **Cache responses** - Store results when inputs don't change frequently
3. **Use appropriate timeouts** - Set reasonable timeouts for your HTTP clients
4. **Monitor usage** - Track API calls to identify optimization opportunities

## Coming Soon

### Phase 2: Enhanced Authentication
- **API Tokens** - Dedicated tokens for programmatic access without cookies
- **Token Management** - Create, rotate, and revoke API tokens
- **Rate Limiting** - Per-token rate limits and quotas

### Phase 3: Advanced Features
- **Webhooks** - Get notified when calculations complete
- **Batch Operations** - Execute multiple calculations in one request
- **Async Execution** - Queue long-running calculations
- **Usage Analytics** - Detailed analytics API for monitoring usage

### Phase 4: Data Access
- **Area Data Access** - Read specific spreadsheet areas
- **Data Updates** - Update editable areas for interactive services
- **Caching Control** - Manage calculation caching via API

## Support

For questions or issues:
- GitHub Issues: [github.com/spreadapi/issues](https://github.com/spreadapi/issues)
- Email: support@spreadapi.io
- Documentation: [docs.spreadapi.io](https://docs.spreadapi.io)