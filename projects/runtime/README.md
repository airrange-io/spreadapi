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

## Configuration

The runtime can be configured via environment variables. All settings have sensible defaults optimized for production performance.

### Engine Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `SPREADAPI_SHARED_WORKBOOK` | `true` | Reuse workbooks across requests. Set to `false` for stateless mode (slower but isolated). |
| `SPREADAPI_RESULT_CACHE` | `true` | Cache calculation results by inputs. Identical inputs return instant cached response. |

### Cache Tuning

| Variable | Default | Description |
|----------|---------|-------------|
| `SPREADAPI_WORKBOOK_CACHE_TTL` | `1800000` | Workbook cache lifetime in ms (default: 30 minutes) |
| `SPREADAPI_RESULT_CACHE_TTL` | `300000` | Result cache lifetime in ms (default: 5 minutes) |
| `SPREADAPI_RESULT_CACHE_MAX_ENTRIES` | `1000` | Maximum cached results before LRU eviction |

### Required Settings

| Variable | Description |
|----------|-------------|
| `SPREADJS_LICENSE_KEY` | Your SpreadJS license key (or `NEXT_SPREADJS18_KEY`) |

### Docker Compose Example

```yaml
services:
  spreadapi-runtime:
    image: spreadapi-runtime
    environment:
      - SPREADJS_LICENSE_KEY=your-license-key
      # Performance tuning (optional)
      - SPREADAPI_SHARED_WORKBOOK=true
      - SPREADAPI_RESULT_CACHE=true
      - SPREADAPI_WORKBOOK_CACHE_TTL=3600000  # 1 hour
      - SPREADAPI_RESULT_CACHE_TTL=600000     # 10 minutes
    ports:
      - "3000:3000"
    volumes:
      - ./services:/app/services
```

### Configuration Modes

**Default (Recommended for Production)**
```bash
# No env vars needed - optimal defaults applied
docker run spreadapi-runtime
```

**High-Traffic Mode**
```bash
# Longer cache times for high-volume APIs
docker run \
  -e SPREADAPI_WORKBOOK_CACHE_TTL=3600000 \
  -e SPREADAPI_RESULT_CACHE_TTL=900000 \
  -e SPREADAPI_RESULT_CACHE_MAX_ENTRIES=5000 \
  spreadapi-runtime
```

**Debug/Development Mode**
```bash
# Stateless - each request creates fresh workbook
docker run \
  -e SPREADAPI_SHARED_WORKBOOK=false \
  -e SPREADAPI_RESULT_CACHE=false \
  spreadapi-runtime
```

Configuration is logged on container startup - check logs to verify settings.

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
