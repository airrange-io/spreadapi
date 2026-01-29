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

## Production Deployment Guide

### Recommended Setup

The runtime is designed for enterprise on-premises deployment. Start with the default settings - they are optimized for most workloads.

```yaml
# docker-compose.yml (production)
services:
  spreadapi-runtime:
    image: spreadapi-runtime
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SPREADJS_LICENSE_KEY=${SPREADJS_LICENSE_KEY}
    volumes:
      - ./services:/app/services
      - ./logs:/app/logs
    deploy:
      resources:
        limits:
          memory: 2G
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Performance Characteristics

| Mode | Response Time | Memory Usage | Use Case |
|------|---------------|--------------|----------|
| **Shared workbook** (default) | ~50ms | Higher, stable | Standard deployments |
| **Stateless** | ~200-500ms | Lower per request | High isolation needs |
| **With result cache** | <5ms (cache hit) | +~50MB | Repeated identical calls |

### Deployment Scenarios

**Standard Deployment (< 100 calls/hour)**
```bash
# Use defaults - no configuration needed
docker compose up -d
```

**High-Volume Deployment (> 1000 calls/hour)**
```bash
# Use stateless mode with multiple containers behind load balancer
docker compose up -d --scale runtime=4
```

With stateless configuration:
```yaml
environment:
  - SPREADAPI_SHARED_WORKBOOK=false
  - SPREADAPI_RESULT_CACHE=true
```

**Maximum Isolation (Financial/Audit Requirements)**
```yaml
environment:
  - SPREADAPI_SHARED_WORKBOOK=false
  - SPREADAPI_RESULT_CACHE=false
```

### Monitoring

Check the health endpoint for runtime status:

```bash
curl http://localhost:3000/api/health
```

Response includes:
- Service count and list
- Cache statistics
- Memory usage
- Request analytics

### Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Memory usage > 1.5GB | Normal cache growth | Container will self-manage; or restart weekly via cron |
| Occasional unexpected results | Rare race condition | Set `SPREADAPI_SHARED_WORKBOOK=false` |
| Slow response times | Cold start or stateless mode | Enable result cache; use shared workbook mode |
| Container restarts | Memory limit reached | Normal behavior - health check triggers restart |

**Quick fixes:**

```bash
# Restart container (clears all caches)
docker restart spreadapi-runtime

# Switch to guaranteed-safe mode
docker compose down
# Add SPREADAPI_SHARED_WORKBOOK=false to environment
docker compose up -d

# Check logs for errors
docker compose logs -f --tail=100
```

### Maintenance

The runtime is designed to be low-maintenance ("wartungsarm"):

- **Auto-restart**: Container restarts automatically on crash
- **Health checks**: Docker detects unresponsive container and restarts it
- **Cache limits**: Caches auto-evict old entries, no manual cleanup needed
- **Log rotation**: Logs are stored by date in `/app/logs/`

**Optional scheduled restart** (for long-running deployments):

```bash
# Add to crontab for weekly restart (Sunday 3 AM)
0 3 * * 0 docker restart spreadapi-runtime
```

### Security Considerations

- Run in private network only - no built-in authentication
- Use reverse proxy (nginx, traefik) for TLS termination
- Mount services directory read-only if services won't change:
  ```yaml
  volumes:
    - ./services:/app/services:ro
  ```

### Scaling

**Vertical scaling**: Increase memory limit for more cached workbooks
```yaml
deploy:
  resources:
    limits:
      memory: 4G
```

**Horizontal scaling**: Run multiple containers (use stateless mode)
```yaml
services:
  runtime:
    # ... config ...
    environment:
      - SPREADAPI_SHARED_WORKBOOK=false
    deploy:
      replicas: 4
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
