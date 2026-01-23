# SpreadAPI Technology Paper

**Version:** 1.0
**Last Updated:** January 2026
**Classification:** Technical Documentation

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Licensed Components](#4-licensed-components)
5. [Infrastructure](#5-infrastructure)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Design](#7-api-design)
8. [Caching Architecture](#8-caching-architecture)
9. [Security Model](#9-security-model)
10. [Data Model](#10-data-model)
11. [Performance Considerations](#11-performance-considerations)
12. [Environment Configuration](#12-environment-configuration)
13. [Deployment](#13-deployment)

---

## 1. Introduction

### 1.1 Purpose

SpreadAPI is a platform that transforms Excel spreadsheets into production-ready RESTful APIs. Users upload Excel workbooks, define input parameters and output cells, and the system generates API endpoints that execute spreadsheet calculations server-side.

### 1.2 Key Capabilities

- **Excel-to-API Conversion**: Transform complex Excel models into callable APIs
- **Real-time Calculation**: Server-side spreadsheet execution using SpreadJS
- **AI Integration**: Native support for ChatGPT and Claude Desktop via MCP/OAuth
- **Multi-tier Caching**: Optimized response times through intelligent caching
- **Token-based Security**: Granular access control per service

### 1.3 Target Use Cases

- Financial modeling APIs
- Pricing calculators
- Risk assessment tools
- Engineering calculations
- Data transformation services

---

## 2. System Architecture

### 2.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│   Web App   │  REST API   │   ChatGPT   │   Claude    │  Custom     │
│  (React)    │  Clients    │   (OAuth)   │  (MCP)      │  Integrations│
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EDGE LAYER (Vercel)                          │
├─────────────────────────────────────────────────────────────────────┤
│  CDN Caching  │  DDoS Protection  │  TLS Termination  │  Routing    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Middleware  │  │  API Routes  │  │  React SSR   │               │
│  │  (proxy.ts)  │  │  /api/v1/*   │  │  /app/*      │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                 │                        │
│         ▼                 ▼                 ▼                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   CALCULATION ENGINE                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │    │
│  │  │  SpreadJS   │  │  Parameter  │  │   Result    │          │    │
│  │  │   Server    │  │  Validation │  │   Caching   │          │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│     Redis       │   Vercel Blob   │        Hanko                    │
│  (Metadata,     │   (Workbook     │     (User Auth,                 │
│   Caching,      │    Storage)     │      Sessions)                  │
│   Tokens)       │                 │                                 │
└─────────────────┴─────────────────┴─────────────────────────────────┘
```

### 2.2 Request Flow

1. **Client Request** → Vercel Edge (CDN, TLS)
2. **Middleware** → JWT verification, route protection
3. **API Route** → Rate limiting, token validation
4. **Cache Check** → L1 Result Cache (Redis Hash)
5. **Calculation** → SpreadJS engine execution
6. **Cache Store** → Result cached for future requests
7. **Response** → JSON with inputs, outputs, metadata

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI component library |
| Next.js | 16.x | Full-stack framework (App Router) |
| TypeScript | 5.8.x | Static type checking |
| Ant Design | 6.x | UI component system |
| MobX | 6.x | State management |
| Recharts | 3.x | Data visualization |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Next.js API Routes | 16.x | Serverless functions |
| SpreadJS | 18.x | Excel calculation engine |
| Redis | 5.x (client) | Data store and caching |
| jose | 6.x | JWT verification |
| zod | 4.x | Schema validation |

### 3.3 AI/ML Integration

| Technology | Purpose |
|------------|---------|
| Vercel AI SDK | Streaming AI responses |
| OpenAI Integration | GPT model access |
| MCP Protocol | AI assistant tool integration |

### 3.4 Build & Development

| Tool | Purpose |
|------|---------|
| pnpm | Package management |
| Turbopack | Development server |
| TypeScript | Type checking |
| Webpack | Production bundling |

---

## 4. Licensed Components

### 4.1 SpreadJS (MESCIUS/GrapeCity)

**License Type:** Commercial
**Environment Variable:** `NEXT_SPREADJS18_KEY`

SpreadJS is the core calculation engine that powers all spreadsheet computations. It provides Excel-compatible formula execution in a server-side JavaScript environment.

#### Modules Used

| Module | Purpose |
|--------|---------|
| `@mescius/spread-sheets` | Core spreadsheet engine and formula calculation |
| `@mescius/spread-sheets-tablesheet` | External data connections (TableSheet) |
| `@mescius/spread-sheets-charts` | Chart rendering and export |
| `@mescius/spread-sheets-designer` | Visual spreadsheet editor |
| `@mescius/spread-sheets-designer-react` | React integration for designer |
| `@mescius/spread-sheets-io` | Excel file import/export |
| `@mescius/spread-sheets-pdf` | PDF generation |
| `@mescius/spread-sheets-print` | Print layout |
| `@mescius/spread-sheets-barcode` | Barcode generation |

#### Server-Side Initialization

SpreadJS requires browser DOM APIs. The system uses `mock-browser` and `canvas` packages to provide these APIs in Node.js:

```javascript
// lib/spreadjs-server.js
const mockBrowser = require('mock-browser').mocks.MockBrowser;
const canvas = require('canvas');

const mockWindow = mockBrowser.createWindow();
global.window = mockWindow;
global.document = mockWindow.document;
// ... additional DOM polyfills

const SpreadJS = require('@mescius/spread-sheets');
SpreadJS.Spread.Sheets.LicenseKey = process.env.NEXT_SPREADJS18_KEY;
```

#### Licensing Requirements

- **Development:** Evaluation mode with watermark
- **Production:** Valid commercial license required
- **Pricing:** Per-developer licensing from MESCIUS
- **Compliance:** License key must not be exposed client-side

---

## 5. Infrastructure

### 5.1 Vercel Platform

SpreadAPI is designed for deployment on Vercel's serverless platform.

#### Serverless Functions

| Configuration | Value |
|---------------|-------|
| Max Duration | 30 seconds |
| Memory | Auto-scaled |
| Regions | Global edge network |
| Cold Start | ~500ms (optimized) |

#### Vercel Blob Storage

Used for storing workbook files (Excel data converted to JSON).

| Limit | Value |
|-------|-------|
| Max File Size | 30 MB |
| Storage | Unlimited |
| Access | Public URLs with path tokens |

**Environment Variables:**
```
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_VERCEL_BLOB_URL=https://xxxxxx.public.blob.vercel-storage.com
```

### 5.2 Redis

Redis serves as the primary data store for metadata, caching, and session management.

#### Recommended Providers

| Provider | Use Case |
|----------|----------|
| **Upstash** | Serverless Redis (recommended for Vercel) |
| **Redis Cloud** | Managed Redis clusters |
| **Self-hosted** | On-premise deployments |

#### Connection Configuration

**Standard Redis:**
```
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

**Upstash (Serverless):**
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxYYY...
```

#### Redis Client Configuration

```javascript
// lib/redis.js
const redis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    connectTimeout: 10000,
    keepAlive: 5000,
  },
  RESP: 2, // Use RESP2 for hGetAll compatibility
});
```

### 5.3 Hanko (Authentication Provider)

Hanko provides passwordless authentication using WebAuthn/passkeys and email magic links.

**Environment Variable:**
```
NEXT_PUBLIC_HANKO_API_URL=https://xxxxx.hanko.io
```

#### Features Used

- Passkey authentication
- Email magic links
- JWT-based sessions
- JWKS for token verification

---

## 6. Authentication & Authorization

### 6.1 Authentication Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LAYER 1: User Authentication (Hanko)                │   │
│  │  • Passkeys / Email Magic Links                      │   │
│  │  • JWT in 'hanko' cookie                             │   │
│  │  • Verified via JWKS                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LAYER 2: API Token Authentication                   │   │
│  │  • Service-specific tokens (svc_tk_...)              │   │
│  │  • SHA-256 hashed storage                            │   │
│  │  • Bearer header / body / query param                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LAYER 3: OAuth 2.1 (AI Integrations)                │   │
│  │  • PKCE flow for ChatGPT/Claude                      │   │
│  │  • Service token → OAuth token exchange              │   │
│  │  • Scoped access per service                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 User Authentication (Hanko JWT)

#### Middleware Implementation

```typescript
// proxy.ts
export async function proxy(req: NextRequest) {
  const hanko = req.cookies.get("hanko")?.value;

  if (!hanko) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const JWKS = createRemoteJWKSet(
    new URL(`${hankoApiUrl}/.well-known/jwks.json`)
  );

  const verifiedJWT = await jwtVerify(hanko, JWKS);
  const userId = verifiedJWT.payload.sub;

  // Pass user ID to API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', userId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

#### Protected Routes

| Route Pattern | Protection |
|---------------|------------|
| `/app/*` | Full authentication required |
| `/api/services/*` | User must own service |
| `/api/workbook/*` | User must own workbook |
| `/api/v1/services/*/execute` | Token-based (if service requires) |

### 6.3 API Token System

#### Token Structure

```
svc_tk_[64 hex characters]
Example: svc_tk_a1b2c3d4e5f6...
```

#### Token Storage (Redis)

```
token:{tokenId}           → Hash {serviceId, name, tokenHash, createdAt, expiresAt, usageCount}
token:hash:{sha256}       → String (tokenId) - for O(1) lookup
service:{id}:tokens       → Set of tokenIds
```

#### Token Validation Flow

```javascript
// utils/tokenAuth.js
export async function validateServiceToken(request, serviceId) {
  // 1. Extract token from request
  let token = parseAuthToken(request.headers.get('authorization'));
  if (!token) {
    token = new URL(request.url).searchParams.get('token');
  }

  // 2. Hash and lookup
  const tokenHash = hashToken(token); // SHA-256
  const tokenId = await redis.get(`token:hash:${tokenHash}`);

  // 3. Validate token data
  const tokenData = await redis.hGetAll(`token:${tokenId}`);
  if (tokenData.serviceId !== serviceId) {
    return { valid: false, error: 'Token does not belong to this service' };
  }

  // 4. Check expiration
  if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
    return { valid: false, error: 'Token expired' };
  }

  return { valid: true, tokenId, tokenData };
}
```

### 6.4 OAuth 2.1 Implementation

#### Supported Flows

- Authorization Code with PKCE (S256)
- Dynamic Client Registration

#### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/oauth/authorize` | POST | Generate authorization code |
| `/api/oauth/token` | POST | Exchange code for access token |
| `/.well-known/oauth-authorization-server` | GET | Server metadata |
| `/.well-known/oauth-protected-resource` | GET | Resource metadata |

#### Scope Model

```
spapi:service:{serviceId}:execute
```

---

## 7. API Design

### 7.1 Execute Endpoint

**URL:** `/api/v1/services/{serviceId}/execute`
**Methods:** `GET`, `POST`

#### Authentication

| Method | Location |
|--------|----------|
| Bearer Token | `Authorization: Bearer svc_tk_...` |
| Body Token | `{ "token": "svc_tk_..." }` |
| Query Parameter | `?token=svc_tk_...` |

#### Request Format (POST)

```json
{
  "inputs": {
    "revenue": 1000000,
    "growth_rate": 0.15,
    "discount_rate": 0.08
  },
  "token": "svc_tk_...",  // Optional if using header
  "nocache": false,       // Optional: bypass all caches
  "nocdn": false          // Optional: bypass edge cache only
}
```

#### Request Format (GET)

```
/api/v1/services/{id}/execute?revenue=1000000&growth_rate=0.15&token=svc_tk_...
```

#### Response Format

```json
{
  "apiId": "abc123-def456",
  "serviceName": "DCF Valuation Model",
  "serviceDescription": "Calculates company valuation using DCF method",
  "inputs": [
    { "name": "revenue", "title": "Annual Revenue", "value": 1000000 },
    { "name": "growth_rate", "title": "Growth Rate", "value": 0.15 }
  ],
  "outputs": [
    { "name": "enterprise_value", "title": "Enterprise Value", "value": 5234567.89 },
    { "name": "equity_value", "title": "Equity Value", "value": 4934567.89 }
  ],
  "metadata": {
    "executionTime": 45,
    "dataFetchTime": 12,
    "engineLoadTime": 8,
    "fromResultCache": false,
    "fromProcessCache": true,
    "cacheLayer": "L2a:Process",
    "timestamp": "2026-01-23T10:30:00.000Z"
  }
}
```

### 7.2 Service Discovery

**URL:** `/api/v1/services`
**Method:** `GET`

Returns list of published services (public endpoint).

### 7.3 Service Details

**URL:** `/api/v1/services/{serviceId}`
**Method:** `GET`

Returns service metadata including input/output definitions.

### 7.4 OpenAPI Specification

**URL:** `/api/v1/services/{serviceId}/openapi`
**Method:** `GET`

Returns auto-generated OpenAPI 3.0 specification for the service.

### 7.5 Rate Limiting

#### Implementation

Uses Redis sorted sets for sliding window rate limiting:

```typescript
// lib/rateLimit.ts
export async function checkRateLimit(identifier: string, config: RateLimitConfig) {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();

  const multi = redis.multi();
  multi.zRemRangeByScore(key, 0, now - config.windowMs); // Remove old
  multi.zCard(key);                                       // Count current
  multi.zAdd(key, { score: now, value: `${now}` });      // Add new
  multi.expire(key, Math.ceil(config.windowMs / 1000));

  const results = await multi.exec();
  const count = results[1] + 1;

  return {
    allowed: count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - count),
    reset: Math.floor((now + config.windowMs) / 1000)
  };
}
```

#### Rate Limit Tiers

| Tier | Requests | Window |
|------|----------|--------|
| FREE | 100 | 1 minute |
| PRO | 1,000 | 1 minute |
| ENTERPRISE | 10,000 | 1 minute |
| IP (fallback) | 60 | 1 minute |

#### Response Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1706012400
Retry-After: 60  // Only when rate limited
```

---

## 8. Caching Architecture

### 8.1 Multi-Layer Cache Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHE HIERARCHY                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  L1: RESULT CACHE (Redis Hash)                     │     │
│  │  • Key: service:{id}:cache:results                 │     │
│  │  • Field: SHA-256 hash of sorted inputs            │     │
│  │  • TTL: 15 minutes                                 │     │
│  │  • Hit Rate: ~80% for repeated calculations        │     │
│  │  • Latency: ~5ms                                   │     │
│  └────────────────────────────────────────────────────┘     │
│                           │ miss                             │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  L2a: PROCESS CACHE (In-Memory Map)                │     │
│  │  • Key: serviceId:cacheKey                         │     │
│  │  • Storage: SpreadJS Workbook objects              │     │
│  │  • TTL: 60 minutes                                 │     │
│  │  • Max Size: 1000 entries (~500MB)                 │     │
│  │  • Latency: ~0ms (same Lambda instance)            │     │
│  └────────────────────────────────────────────────────┘     │
│                           │ miss                             │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  L2b: WORKBOOK CACHE (Redis JSON)                  │     │
│  │  • Key: service:{id}:cache:workbook                │     │
│  │  • Storage: Serialized workbook JSON               │     │
│  │  • TTL: 10 minutes                                 │     │
│  │  • Latency: ~30ms                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                           │ miss                             │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  L3: BLOB STORAGE (Vercel Blob)                    │     │
│  │  • Path: {tenantId}/apis/{serviceId}.json          │     │
│  │  • Storage: Original workbook file                 │     │
│  │  • TTL: Permanent (until republished)              │     │
│  │  • Latency: ~300ms                                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Cache Key Generation

```typescript
// lib/cacheHelpers.ts
export function generateResultCacheHash(inputs: Record<string, any>): string {
  // Sort keys for consistent hashing
  const sortedKeys = Object.keys(inputs).sort();
  const sortedInputs = {};
  for (const key of sortedKeys) {
    sortedInputs[key] = inputs[key];
  }

  const inputString = JSON.stringify(sortedInputs);
  return crypto.createHash('sha256')
    .update(inputString)
    .digest('hex')
    .substring(0, 16);
}
```

### 8.3 Cache Invalidation

Caches are invalidated when a service is republished:

```typescript
export async function invalidateServiceCache(redis: any, serviceId: string) {
  const multi = redis.multi();
  multi.del(`service:${serviceId}:cache:api`);
  multi.del(`service:${serviceId}:cache:results`);
  multi.del(`service:${serviceId}:cache:workbook`);
  await multi.exec();
}
```

### 8.4 Cache Bypass Options

| Parameter | Effect |
|-----------|--------|
| `nocache=true` | Bypass ALL caches (fresh calculation) |
| `nocdn=true` | Bypass edge/CDN cache only |

---

## 9. Security Model

### 9.1 Data Protection

#### Data at Rest

| Data Type | Storage | Protection |
|-----------|---------|------------|
| Workbook Files | Vercel Blob | Vercel-managed encryption |
| Service Metadata | Redis | TLS in transit, access control |
| API Tokens | Redis | SHA-256 hashed, never stored plain |
| User Sessions | Hanko | External secure service |

#### Data in Transit

- All traffic encrypted via TLS 1.2+
- Redis connections support TLS
- Vercel Edge provides automatic HTTPS

### 9.2 Token Security

#### Token Generation

```javascript
// utils/tokenUtils.js
export function generateToken(prefix = 'svc_tk') {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

#### Security Properties

- **Entropy:** 256 bits of randomness
- **Storage:** Only SHA-256 hash stored
- **Lookup:** O(1) via `token:hash:{hash}` index
- **Comparison:** Timing-safe comparison
- **Expiration:** Optional TTL support

### 9.3 Access Control

#### Service Ownership

```javascript
// Every mutation verifies ownership
const service = await redis.hGetAll(`service:${id}`);
if (service.userId !== currentUserId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

#### Token Scoping

- Tokens are scoped to specific services
- Token validation checks `tokenData.serviceId === requestedServiceId`
- Cross-service token usage is prevented

### 9.4 Input Validation

```typescript
// lib/parameterValidation.js
export function validateParameters(inputs, apiInputs) {
  for (const param of apiInputs) {
    const value = inputs[param.name];

    // Required check
    if (param.mandatory && (value === undefined || value === null)) {
      return { valid: false, error: `Missing required parameter: ${param.name}` };
    }

    // Type validation
    if (param.type === 'number' && typeof value !== 'number') {
      return { valid: false, error: `Parameter ${param.name} must be a number` };
    }

    // Bounds checking
    if (param.min !== undefined && value < param.min) {
      return { valid: false, error: `Parameter ${param.name} below minimum` };
    }
  }
  return { valid: true };
}
```

---

## 10. Data Model

### 10.1 Redis Key Patterns

#### Service Data

```
service:{id}                    → Hash (draft service metadata)
  - userId: string
  - title: string
  - description: string
  - workbookUrl: string (Vercel Blob URL)
  - createdAt: ISO timestamp
  - updatedAt: ISO timestamp

service:{id}:published          → Hash (published service data)
  - apiId: string
  - tenantId: string
  - urlData: string (Vercel Blob path)
  - title: string
  - description: string
  - inputs: JSON string
  - outputs: JSON string
  - areas: JSON string
  - needsToken: "true" | "false"
  - useCaching: "true" | "false"
  - calls: number (usage counter)
  - created: ISO timestamp
  - modified: ISO timestamp
```

#### Token Data

```
token:{tokenId}                 → Hash
  - serviceId: string
  - name: string
  - tokenHash: string (SHA-256)
  - createdAt: ISO timestamp
  - expiresAt: ISO timestamp (optional)
  - usageCount: number
  - lastUsedAt: ISO timestamp

token:hash:{sha256}             → String (tokenId)

service:{id}:tokens             → Set of tokenIds
```

#### User Data

```
user:{userId}:services          → Hash (serviceId → status)
```

#### Cache Data

```
service:{id}:cache:api          → JSON (apiJson + fileJson)
service:{id}:cache:results      → Hash (inputHash → result JSON)
service:{id}:cache:workbook     → JSON (serialized workbook)
```

#### Rate Limiting

```
ratelimit:{tier}:{identifier}   → Sorted Set (timestamp → timestamp)
```

### 10.2 Vercel Blob Structure

```
{tenantId}/
  apis/
    {serviceId}.json            → Combined apiJson + fileJson
```

---

## 11. Performance Considerations

### 11.1 Cold Start Optimization

| Optimization | Impact |
|--------------|--------|
| Lazy SpreadJS loading | ~200ms saved on non-calculation routes |
| Conditional TableSheet module | ~100ms saved for simple workbooks |
| JWKS caching | ~50ms saved per request |
| Redis connection pooling | ~20ms saved per request |

### 11.2 Calculation Optimization

| Technique | Description |
|-----------|-------------|
| Result caching | Skip calculation for identical inputs |
| Process cache | Reuse workbook objects in same Lambda |
| Workbook JSON cache | Share workbooks across Lambda instances |
| `doNotRecalculateAfterLoad` | Skip initial recalc on workbook load |

### 11.3 Memory Management

```javascript
// lib/spreadjs-server.js
const CACHE_MAX_SIZE = 1000;                    // ~500MB for workbook cache
const CACHE_TTL_MS = 60 * 60 * 1000;           // 60 minute TTL
const MAX_PROCESS_CACHE_SIZE_BYTES = 10 * 1024 * 1024; // Skip cache for >10MB
```

### 11.4 Monitoring Metrics

Exposed in API response `metadata`:

- `executionTime`: Total request time
- `dataFetchTime`: Time to fetch service data
- `engineLoadTime`: SpreadJS initialization time
- `cacheLayer`: Which cache served the request
- `memoryUsed`: Current heap usage

---

## 12. Environment Configuration

### 12.1 Required Variables

```bash
# Redis Configuration (choose one)
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password

# OR Upstash (serverless)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxYYY...

# Vercel Blob Storage
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Authentication
NEXT_PUBLIC_HANKO_API_URL=https://xxxxx.hanko.io

# SpreadJS License (REQUIRED FOR PRODUCTION)
NEXT_SPREADJS18_KEY=your-spreadjs-license-key
```

### 12.2 Optional Variables

```bash
# Blob URL base (for path manipulation)
NEXT_VERCEL_BLOB_URL=https://xxxxx.public.blob.vercel-storage.com

# User registration webhooks
PIPEDREAM_NEW_USER_WEBHOOK_URL=https://xxx.m.pipedream.net
PIPEDREAM_NEW_USER_WEBHOOK_SECRET=your-webhook-secret

# Redis Pool Tuning
REDIS_POOL_MAX_PER_WORKER=10
REDIS_MIN_CONNECTIONS=2
REDIS_IDLE_TIMEOUT=30000
REDIS_CONNECTION_TIMEOUT=5000

# Environment
NODE_ENV=production
```

### 12.3 Development Setup

```bash
# Copy example environment file
cp .env.example .env.local

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Type checking
pnpm typecheck

# Production build test
pnpm build
```

---

## 13. Deployment

### 13.1 Vercel Deployment Checklist

1. **Environment Variables**
   - [ ] Configure all required variables in Vercel dashboard
   - [ ] Ensure SpreadJS license key is set
   - [ ] Configure Redis connection (Upstash recommended)
   - [ ] Set up Hanko project and API URL

2. **Build Verification**
   ```bash
   pnpm typecheck  # Must pass
   pnpm build      # Must succeed
   ```

3. **Function Configuration**
   - Verify `vercel.json` sets appropriate timeouts
   - Check memory allocation for calculation-heavy routes

4. **Domain & SSL**
   - Configure custom domain
   - SSL automatically provisioned by Vercel

### 13.2 Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "app/api/v1/services/[id]/execute/route.js": {
      "maxDuration": 30
    },
    "app/api/chat/route.js": {
      "maxDuration": 30
    }
  }
}
```

### 13.3 Post-Deployment Verification

1. Health check: `GET /api/health`
2. Test calculation: `POST /api/v1/services/{testId}/execute`
3. Verify caching: Check `fromResultCache` in response
4. Monitor: Vercel Analytics & Speed Insights

---

## Appendix A: File Reference

| File | Purpose |
|------|---------|
| `proxy.ts` | Next.js middleware for auth & routing |
| `lib/redis.js` | Redis client configuration |
| `lib/spreadjs-server.js` | SpreadJS initialization |
| `lib/publishService.js` | Service publishing logic |
| `lib/cacheHelpers.ts` | Cache key patterns & utilities |
| `lib/rateLimit.ts` | Rate limiting implementation |
| `lib/hanko-jwt.js` | Hanko JWT verification |
| `utils/tokenAuth.js` | API token validation |
| `utils/tokenUtils.js` | Token generation & hashing |
| `app/api/v1/services/[id]/execute/route.js` | Main API endpoint |
| `app/api/v1/services/[id]/execute/calculateDirect.js` | Calculation engine |

---

## Appendix B: API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request body |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Token doesn't match service |
| `NOT_FOUND` | 404 | Service not found or unpublished |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal calculation error |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Service** | A published spreadsheet API |
| **Workbook** | The Excel file (draft state) |
| **Token** | API authentication credential |
| **MCP** | Model Context Protocol (AI integration) |
| **TableSheet** | SpreadJS feature for external data |
| **PKCE** | Proof Key for Code Exchange (OAuth) |

---

*Document generated for SpreadAPI v1.0.5*
