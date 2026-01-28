# spreadapi.run

Stripped-down, high-performance service execution API.

## URL Format

```
spreadapi.run/{id}?param1=value1&param2=value2
```

100% compatible with `spreadapi.io/api/v1/services/{id}/execute`

## Why?

- **Stability** - Isolated from main app deployments
- **Speed** - Optimized for execution only
- **Reliability** - Minimal code, fewer failure points

## Setup

```bash
cd projects/run
npm install
npm run dev  # http://localhost:3002
```

## Environment Variables

```bash
REDIS_HOST=your-redis.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password
NEXT_SPREADJS18_KEY=your-license-key
NEXT_VERCEL_BLOB_URL=https://your-blob.vercel-storage.com
```

## Deploy to Vercel

1. Create Vercel project
2. Set Root Directory: `projects/run`
3. Add environment variables
4. Connect `spreadapi.run` domain
5. Add `spreadapi.run` to SpreadJS license
