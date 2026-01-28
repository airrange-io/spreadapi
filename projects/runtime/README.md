# SpreadAPI Runtime

A lightweight, self-hosted calculation engine for SpreadAPI services.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local and set SPREADJS_LICENSE_KEY
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the admin dashboard.

## Usage

### Upload a Service

1. Export your service JSON from SpreadAPI.io
2. Open the dashboard at `http://localhost:3000`
3. Upload the JSON file using the upload form

Or via API:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@my-service.json"
```

### Execute Calculations

**POST request:**

```bash
curl -X POST http://localhost:3000/api/execute/my-service \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"price": 100, "quantity": 5}}'
```

**GET request:**

```bash
curl "http://localhost:3000/api/execute/my-service?price=100&quantity=5"
```

### Response Format

```json
{
  "serviceId": "my-service",
  "serviceName": "My Service",
  "inputs": [
    { "name": "price", "title": "Price", "value": 100 },
    { "name": "quantity", "title": "Quantity", "value": 5 }
  ],
  "outputs": [
    { "name": "total", "title": "Total", "value": 500 }
  ],
  "metadata": {
    "executionTime": 15,
    "cached": false,
    "timestamp": "2026-01-23T10:30:00.000Z"
  }
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/execute/[serviceId]` | GET/POST | Execute calculation |
| `/api/services` | GET | List all services |
| `/api/services/[serviceId]` | GET | Get service info |
| `/api/upload` | POST | Upload service JSON |
| `/api/health` | GET | Health check |
| `/api/logs` | GET | Get recent request logs |

## Docker Deployment

```bash
# Build and run
docker compose up -d

# View logs
docker compose logs -f
```

## Service JSON Format

The uploaded JSON should have this structure:

```json
{
  "serviceId": "optional-custom-id",
  "apiJson": {
    "name": "service-name",
    "title": "Service Title",
    "description": "Description",
    "inputs": [
      {
        "name": "price",
        "title": "Price",
        "type": "number",
        "row": 1,
        "col": 1,
        "address": "Sheet1!B2",
        "mandatory": true
      }
    ],
    "outputs": [
      {
        "name": "total",
        "title": "Total",
        "type": "number",
        "row": 5,
        "col": 1,
        "address": "Sheet1!B6"
      }
    ]
  },
  "fileJson": {
    // SpreadJS workbook JSON
  }
}
```

## Files

- `/services/` - Stored service JSON files
- `/logs/` - Request log files (daily rotation)

## License

Proprietary - SpreadAPI
