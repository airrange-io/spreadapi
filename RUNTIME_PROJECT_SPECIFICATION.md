# SpreadAPI Runtime Service - Technical Specification

**Version:** 1.0
**Date:** January 2026
**Purpose:** Complete blueprint for creating the SpreadAPI Runtime Service project

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [Data Structures](#3-data-structures)
4. [Service Delivery Methods](#4-service-delivery-methods)
5. [API Endpoints](#5-api-endpoints)
6. [Core Calculation Engine](#6-core-calculation-engine)
7. [Logging & Protocol System](#7-logging--protocol-system)
8. [Configuration](#8-configuration)
9. [Docker Deployment](#9-docker-deployment)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Overview

### 1.1 Purpose

The SpreadAPI Runtime Service is a lightweight Next.js application that executes SpreadJS calculations. It is designed to:

1. **Receive services from SpreadAPI.io** - Services created in the SaaS platform can be pushed to the runtime
2. **Import services manually** - For air-gapped/on-premises environments
3. **Execute calculations** - Process API requests and return calculated results
4. **Protocol requests and errors** - Local logging for monitoring and debugging

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SpreadAPI.io (SaaS)                              │
│                                                                          │
│   User creates service → Configures I/O → Publishes                     │
│                                                                          │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    │ Push (HTTPS) or Export (JSON file)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SpreadAPI Runtime Service                             │
│                                                                          │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                   │
│   │ /api/push   │   │ /api/import │   │ /api/execute│                   │
│   │  Receive    │   │  Upload     │   │  Calculate  │                   │
│   │  from SaaS  │   │  JSON file  │   │  & return   │                   │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                   │
│          │                 │                 │                           │
│          └────────┬────────┘                 │                           │
│                   ▼                          │                           │
│          ┌─────────────────┐                 │                           │
│          │ /services/*.json│◄────────────────┘                           │
│          │ (File Storage)  │                                             │
│          └─────────────────┘                                             │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Protocol/Logging System                       │   │
│   │  /logs/requests.log  /logs/errors.log  /logs/analytics.json     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Same as SpreadAPI.io, easy code sharing |
| Storage | File system (JSON files) | No database required, simple backup |
| Caching | In-memory + optional Redis | Fast, optional external cache |
| Logging | File-based + in-memory ring buffer | No external dependencies |
| Auth | Simple token comparison | No complex token system needed |

---

## 2. Project Structure

```
spreadapi-runtime/
│
├── app/
│   ├── api/
│   │   ├── execute/
│   │   │   └── [serviceId]/
│   │   │       └── route.ts              # Main calculation endpoint
│   │   │
│   │   ├── push/
│   │   │   └── route.ts                  # Receive services from SpreadAPI.io
│   │   │
│   │   ├── import/
│   │   │   └── route.ts                  # Manual service import
│   │   │
│   │   ├── services/
│   │   │   └── route.ts                  # List installed services
│   │   │
│   │   ├── health/
│   │   │   └── route.ts                  # Health check endpoint
│   │   │
│   │   └── logs/
│   │       └── route.ts                  # Retrieve logs/analytics
│   │
│   ├── page.tsx                          # Dashboard UI (service list, health, logs)
│   ├── layout.tsx                        # Root layout
│   └── globals.css                       # Minimal styles
│
├── lib/
│   ├── spreadjs/
│   │   ├── server.ts                     # SpreadJS initialization (from current project)
│   │   └── calculate.ts                  # Core calculation logic
│   │
│   ├── storage/
│   │   ├── services.ts                   # Service CRUD operations
│   │   └── index.ts                      # Storage interface
│   │
│   ├── validation/
│   │   └── parameters.ts                 # Input validation (from current project)
│   │
│   ├── auth/
│   │   └── token.ts                      # Simple token authentication
│   │
│   ├── logging/
│   │   ├── logger.ts                     # Core logging functionality
│   │   ├── protocol.ts                   # Request/response protocol
│   │   └── analytics.ts                  # Usage analytics (local)
│   │
│   ├── cache/
│   │   └── memory.ts                     # In-memory result cache
│   │
│   └── utils/
│       ├── helper.ts                     # Utility functions (from current project)
│       └── errors.ts                     # Error handling
│
├── services/                             # Service data storage (volume mount)
│   └── .gitkeep
│
├── logs/                                 # Log files (volume mount)
│   └── .gitkeep
│
├── public/
│   └── favicon.ico
│
├── types/
│   └── index.ts                          # TypeScript type definitions
│
├── Dockerfile                            # Multi-stage Docker build
├── docker-compose.yml                    # Production deployment
├── docker-compose.dev.yml                # Development setup
├── .env.example                          # Environment template
├── .env.local                            # Local development
├── next.config.js                        # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Data Structures

### 3.1 Service JSON Structure

Each service is stored as a single JSON file in `/services/{serviceId}.json`:

```typescript
// types/index.ts

interface ServiceDefinition {
  // Metadata
  serviceId: string;
  name: string;
  title: string;
  description: string;
  version: string;

  // Timestamps
  createdAt: string;        // ISO date from SpreadAPI.io
  pushedAt: string;         // When pushed/imported to runtime

  // Source tracking
  source: 'push' | 'import';
  sourceUrl?: string;       // SpreadAPI.io URL if pushed

  // Security
  requireToken: boolean;
  token?: string;           // Hashed token for validation

  // Calculation data
  apiJson: ApiJson;         // Input/output definitions
  fileJson: object;         // SpreadJS workbook data

  // Flags
  useCaching: boolean;
}

interface ApiJson {
  name: string;
  title: string;
  description: string;

  inputs: InputDefinition[];
  outputs: OutputDefinition[];

  flags?: {
    useCaching?: boolean;
    needsToken?: boolean;
  };
}

interface InputDefinition {
  name: string;
  title?: string;
  address: string;          // Cell address (e.g., "Sheet1!B2")
  row: number;
  col: number;

  type: 'string' | 'number' | 'boolean';
  mandatory: boolean;
  defaultValue?: any;

  // Validation
  min?: number;
  max?: number;
  allowedValues?: string[];

  // Display
  description?: string;
  formatString?: string;
}

interface OutputDefinition {
  name: string;
  title?: string;
  address: string;
  row: number;
  col: number;
  rowCount?: number;        // For range outputs
  colCount?: number;

  type?: string;
  description?: string;
  formatString?: string;
}
```

### 3.2 Request/Response Types

```typescript
// Execute Request
interface ExecuteRequest {
  inputs: Record<string, any>;
  options?: {
    noCache?: boolean;
  };
}

// Execute Response (Success)
interface ExecuteResponse {
  serviceId: string;
  serviceName: string;
  inputs: Array<{
    name: string;
    title: string;
    value: any;
  }>;
  outputs: Array<{
    name: string;
    title: string;
    value: any;
    formatString?: string;
  }>;
  metadata: {
    executionTime: number;
    cached: boolean;
    version: string;
    timestamp: string;
  };
}

// Execute Response (Error)
interface ExecuteErrorResponse {
  error: string;
  message: string;
  details?: any;
  serviceId?: string;
}

// Push Request (from SpreadAPI.io)
interface PushRequest {
  serviceId: string;
  apiJson: ApiJson;
  fileJson: object;
  metadata: {
    name: string;
    title: string;
    description: string;
    version: string;
    createdAt: string;
  };
  security: {
    requireToken: boolean;
    tokenHash?: string;     // Pre-hashed token
  };
  flags: {
    useCaching: boolean;
  };
}

// Push Response
interface PushResponse {
  success: boolean;
  serviceId: string;
  message: string;
  endpoints: {
    execute: string;
    info: string;
  };
}
```

### 3.3 Log Entry Types

```typescript
// Request Log Entry
interface RequestLogEntry {
  id: string;               // UUID
  timestamp: string;        // ISO date
  serviceId: string;

  // Request info
  method: 'GET' | 'POST';
  path: string;
  ip: string;
  userAgent?: string;

  // Input/Output
  inputs: Record<string, any>;
  outputCount: number;

  // Performance
  executionTime: number;
  cached: boolean;

  // Status
  status: 'success' | 'error';
  errorCode?: string;
  errorMessage?: string;
}

// Analytics Summary
interface AnalyticsSummary {
  serviceId: string;
  period: 'hour' | 'day' | 'total';

  requests: {
    total: number;
    success: number;
    errors: number;
    cached: number;
  };

  performance: {
    avgExecutionTime: number;
    minExecutionTime: number;
    maxExecutionTime: number;
  };

  lastRequest: string;      // ISO date
}
```

---

## 4. Service Delivery Methods

### 4.1 Method 1: Push from SpreadAPI.io

SpreadAPI.io pushes service data directly to the runtime via HTTPS.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SpreadAPI.io                                     │
│                                                                          │
│   Service Editor                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ┌─────────────────────────────────────────────────────────┐    │   │
│   │  │  Connected Runtimes                                      │    │   │
│   │  │                                                          │    │   │
│   │  │  ◉ Production (runtime.customer.com)       [Deploy]     │    │   │
│   │  │  ○ Staging (staging.customer.com)          [Deploy]     │    │   │
│   │  │  ○ Development (localhost:3000)            [Deploy]     │    │   │
│   │  │                                                          │    │   │
│   │  │  [+ Register New Runtime]                                │    │   │
│   │  └─────────────────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    │ POST /api/push
                                    │ Authorization: Bearer {runtime-secret}
                                    │ Body: PushRequest
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SpreadAPI Runtime                                │
│                                                                          │
│   POST /api/push                                                         │
│   1. Validate runtime secret                                             │
│   2. Parse PushRequest                                                   │
│   3. Save to /services/{serviceId}.json                                  │
│   4. Clear cached workbook for this service                              │
│   5. Return success with endpoints                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Runtime Registration Process:**

1. User deploys runtime and sets `RUNTIME_SECRET` environment variable
2. User adds runtime URL in SpreadAPI.io dashboard
3. SpreadAPI.io sends test request to verify connectivity
4. Runtime appears in "Connected Runtimes" list

**Push Endpoint Implementation:**

```typescript
// app/api/push/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { saveService } from '@/lib/storage/services';
import { clearServiceCache } from '@/lib/cache/memory';
import { logEvent } from '@/lib/logging/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. Validate runtime secret
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.RUNTIME_SECRET;

    if (!authHeader || !expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing authorization' },
        { status: 401 }
      );
    }

    const providedSecret = authHeader.replace('Bearer ', '');
    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid runtime secret' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: PushRequest = await request.json();

    if (!body.serviceId || !body.apiJson || !body.fileJson) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Build service definition
    const service: ServiceDefinition = {
      serviceId: body.serviceId,
      name: body.metadata.name,
      title: body.metadata.title,
      description: body.metadata.description,
      version: body.metadata.version,
      createdAt: body.metadata.createdAt,
      pushedAt: new Date().toISOString(),
      source: 'push',
      sourceUrl: request.headers.get('origin') || undefined,
      requireToken: body.security.requireToken,
      token: body.security.tokenHash,
      apiJson: body.apiJson,
      fileJson: body.fileJson,
      useCaching: body.flags.useCaching,
    };

    // 4. Save to file system
    await saveService(service);

    // 5. Clear any cached workbook
    clearServiceCache(body.serviceId);

    // 6. Log the event
    logEvent('service_pushed', {
      serviceId: body.serviceId,
      name: body.metadata.name,
      version: body.metadata.version,
    });

    // 7. Return success
    const baseUrl = process.env.RUNTIME_BASE_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      serviceId: body.serviceId,
      message: `Service "${body.metadata.title}" deployed successfully`,
      endpoints: {
        execute: `${baseUrl}/api/execute/${body.serviceId}`,
        info: `${baseUrl}/api/services/${body.serviceId}`,
      },
    });

  } catch (error) {
    console.error('Push error:', error);
    return NextResponse.json(
      { error: 'Internal error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
```

### 4.2 Method 2: Manual Import

For air-gapped environments, users can manually import service JSON files.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SpreadAPI.io                                     │
│                                                                          │
│   Service Editor → [Export for Self-Hosting] → Downloads JSON file      │
│                                                                          │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    │ User transfers file manually
                                    │ (USB, secure file transfer, etc.)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SpreadAPI Runtime                                │
│                                                                          │
│   Dashboard UI                                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │  Import Service                                                  │   │
│   │  ─────────────────────────────────────────────────────────────  │   │
│   │                                                                  │   │
│   │  ┌─────────────────────────────────────────────────────────┐    │   │
│   │  │                                                          │    │   │
│   │  │              Drag & drop JSON file here                  │    │   │
│   │  │                                                          │    │   │
│   │  │                    or click to browse                    │    │   │
│   │  │                                                          │    │   │
│   │  └─────────────────────────────────────────────────────────┘    │   │
│   │                                                                  │   │
│   │  API Token (optional): [________________________]                │   │
│   │                                                                  │   │
│   │                                           [Import Service]       │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   OR via API:                                                            │
│   POST /api/import                                                       │
│   Content-Type: multipart/form-data                                      │
│   Body: file + optional token                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Import Endpoint Implementation:**

```typescript
// app/api/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { saveService } from '@/lib/storage/services';
import { hashToken } from '@/lib/auth/token';
import { logEvent } from '@/lib/logging/logger';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const token = formData.get('token') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse the JSON file
    const content = await file.text();
    let data: any;

    try {
      data = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON file' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.serviceId || !data.apiJson || !data.fileJson) {
      return NextResponse.json(
        { error: 'Invalid service file', message: 'Missing serviceId, apiJson, or fileJson' },
        { status: 400 }
      );
    }

    // Build service definition
    const service: ServiceDefinition = {
      serviceId: data.serviceId,
      name: data.name || data.apiJson.name || 'Unnamed Service',
      title: data.title || data.apiJson.title || 'Untitled',
      description: data.description || data.apiJson.description || '',
      version: data.version || '1.0.0',
      createdAt: data.createdAt || new Date().toISOString(),
      pushedAt: new Date().toISOString(),
      source: 'import',
      requireToken: !!token,
      token: token ? hashToken(token) : undefined,
      apiJson: data.apiJson,
      fileJson: data.fileJson,
      useCaching: data.useCaching !== false,
    };

    // Save to file system
    await saveService(service);

    // Log the event
    logEvent('service_imported', {
      serviceId: service.serviceId,
      name: service.name,
      fileName: file.name,
    });

    return NextResponse.json({
      success: true,
      serviceId: service.serviceId,
      message: `Service "${service.title}" imported successfully`,
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
```

---

## 5. API Endpoints

### 5.1 Endpoint Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/execute/[serviceId]` | GET/POST | Optional* | Execute calculation |
| `/api/push` | POST | Runtime Secret | Receive service from SpreadAPI.io |
| `/api/import` | POST | None | Import service from file |
| `/api/services` | GET | None | List all services |
| `/api/services/[serviceId]` | GET | None | Get service info |
| `/api/services/[serviceId]` | DELETE | Runtime Secret | Delete a service |
| `/api/health` | GET | None | Health check |
| `/api/logs` | GET | None | Get recent logs |
| `/api/logs/analytics` | GET | None | Get analytics summary |

*Auth required if service has `requireToken: true`

### 5.2 Execute Endpoint

**GET /api/execute/[serviceId]**

Query parameters become inputs:
```
GET /api/execute/abc123?price=100&quantity=5&token=svc_tk_xxx
```

**POST /api/execute/[serviceId]**

```http
POST /api/execute/abc123 HTTP/1.1
Content-Type: application/json
Authorization: Bearer svc_tk_xxx

{
  "inputs": {
    "price": 100,
    "quantity": 5
  },
  "options": {
    "noCache": false
  }
}
```

**Response (200 OK):**
```json
{
  "serviceId": "abc123",
  "serviceName": "Pricing Calculator",
  "inputs": [
    { "name": "price", "title": "Unit Price", "value": 100 },
    { "name": "quantity", "title": "Quantity", "value": 5 }
  ],
  "outputs": [
    { "name": "total", "title": "Total", "value": 500 },
    { "name": "tax", "title": "Tax (10%)", "value": 50, "formatString": "$#,##0.00" }
  ],
  "metadata": {
    "executionTime": 15,
    "cached": false,
    "version": "1.0.3",
    "timestamp": "2026-01-23T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Validation Error
{
  "error": "VALIDATION_ERROR",
  "message": "Missing required parameter: price",
  "details": {
    "parameter": "price",
    "type": "required"
  }
}

// 401 - Authentication Error
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing token"
}

// 404 - Service Not Found
{
  "error": "NOT_FOUND",
  "message": "Service 'xyz' not found"
}

// 500 - Calculation Error
{
  "error": "CALCULATION_ERROR",
  "message": "Spreadsheet calculation failed",
  "details": {
    "cell": "Sheet1!C5",
    "error": "#REF!"
  }
}
```

### 5.3 Health Endpoint

**GET /api/health**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "total": 5,
    "list": ["pricing-calc", "tax-calc", "loan-calc", "roi-calc", "quote-gen"]
  },
  "cache": {
    "enabled": true,
    "entries": 42,
    "hitRate": 0.73
  },
  "system": {
    "memoryUsed": "128MB",
    "memoryTotal": "512MB"
  }
}
```

### 5.4 Services Endpoint

**GET /api/services**

```json
{
  "services": [
    {
      "serviceId": "abc123",
      "name": "pricing-calculator",
      "title": "Pricing Calculator",
      "description": "Calculate pricing with discounts",
      "version": "1.0.3",
      "source": "push",
      "pushedAt": "2026-01-23T10:00:00.000Z",
      "requireToken": true,
      "inputCount": 3,
      "outputCount": 4,
      "endpoints": {
        "execute": "/api/execute/abc123",
        "info": "/api/services/abc123"
      }
    }
  ],
  "total": 1
}
```

**GET /api/services/[serviceId]**

```json
{
  "serviceId": "abc123",
  "name": "pricing-calculator",
  "title": "Pricing Calculator",
  "description": "Calculate pricing with discounts and tax",
  "version": "1.0.3",
  "source": "push",
  "pushedAt": "2026-01-23T10:00:00.000Z",
  "requireToken": true,
  "inputs": [
    {
      "name": "price",
      "title": "Unit Price",
      "type": "number",
      "required": true,
      "description": "Price per unit"
    },
    {
      "name": "quantity",
      "title": "Quantity",
      "type": "number",
      "required": true,
      "min": 1,
      "max": 1000
    },
    {
      "name": "discount",
      "title": "Discount %",
      "type": "number",
      "required": false,
      "default": 0,
      "min": 0,
      "max": 100
    }
  ],
  "outputs": [
    {
      "name": "subtotal",
      "title": "Subtotal",
      "type": "number"
    },
    {
      "name": "total",
      "title": "Total",
      "type": "number",
      "formatString": "$#,##0.00"
    }
  ]
}
```

### 5.5 Logs Endpoint

**GET /api/logs?limit=100&serviceId=abc123&status=error**

```json
{
  "logs": [
    {
      "id": "log_123",
      "timestamp": "2026-01-23T10:30:00.000Z",
      "serviceId": "abc123",
      "method": "POST",
      "path": "/api/execute/abc123",
      "ip": "192.168.1.1",
      "inputs": { "price": 100, "quantity": 5 },
      "outputCount": 4,
      "executionTime": 15,
      "cached": false,
      "status": "success"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

**GET /api/logs/analytics?serviceId=abc123&period=day**

```json
{
  "serviceId": "abc123",
  "period": "day",
  "date": "2026-01-23",
  "requests": {
    "total": 1250,
    "success": 1200,
    "errors": 50,
    "cached": 900
  },
  "performance": {
    "avgExecutionTime": 18,
    "minExecutionTime": 5,
    "maxExecutionTime": 150,
    "p95ExecutionTime": 45
  },
  "hourlyBreakdown": [
    { "hour": 0, "requests": 45 },
    { "hour": 1, "requests": 23 }
  ]
}
```

---

## 6. Core Calculation Engine

### 6.1 Code to Extract from Current Project

The following files from the current SpreadAPI project should be adapted:

| Current File | Runtime File | Changes Needed |
|--------------|--------------|----------------|
| `lib/spreadjs-server.js` | `lib/spreadjs/server.ts` | Convert to TypeScript, remove canvas |
| `lib/parameterValidation.js` | `lib/validation/parameters.ts` | Convert to TypeScript |
| `utils/helper.js` | `lib/utils/helper.ts` | Keep only needed functions |
| `utils/tokenUtils.js` | `lib/auth/token.ts` | Simplify, convert to TypeScript |

### 6.2 Calculation Flow

```typescript
// lib/spreadjs/calculate.ts

import { getSpreadJS, createWorkbook, getCachedWorkbook } from './server';
import { validateParameters, applyDefaults, coerceTypes } from '@/lib/validation/parameters';
import { getSheetNameFromAddress, getIsSingleCellFromAddress, getRangeAsOffset } from '@/lib/utils/helper';
import { getResultFromCache, setResultCache } from '@/lib/cache/memory';
import { ServiceDefinition, ExecuteResponse, ExecuteErrorResponse } from '@/types';
import { logRequest } from '@/lib/logging/protocol';

export async function calculateService(
  service: ServiceDefinition,
  inputs: Record<string, any>,
  options: { noCache?: boolean } = {}
): Promise<ExecuteResponse | ExecuteErrorResponse> {
  const startTime = Date.now();
  const { apiJson, fileJson, useCaching } = service;
  const apiInputs = apiJson.inputs || [];
  const apiOutputs = apiJson.outputs || [];

  // 1. Check result cache (if caching enabled and not bypassed)
  if (useCaching && !options.noCache) {
    const cached = getResultFromCache(service.serviceId, inputs);
    if (cached) {
      logRequest(service.serviceId, inputs, cached.outputs.length, Date.now() - startTime, true, 'success');
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cached: true,
          timestamp: new Date().toISOString(),
        }
      };
    }
  }

  // 2. Validate inputs
  const validation = validateParameters(inputs, apiInputs);
  if (!validation.valid) {
    const error: ExecuteErrorResponse = {
      error: 'VALIDATION_ERROR',
      message: validation.message || 'Validation failed',
      details: validation.details,
      serviceId: service.serviceId,
    };
    logRequest(service.serviceId, inputs, 0, Date.now() - startTime, false, 'error', 'VALIDATION_ERROR');
    return error;
  }

  // 3. Apply defaults and coerce types
  const inputsWithDefaults = applyDefaults(inputs, apiInputs);
  const finalInputs = coerceTypes(inputsWithDefaults, apiInputs);

  // 4. Get or create workbook
  const { workbook, fromCache } = await getCachedWorkbook(
    service.serviceId,
    async (wb) => {
      wb.fromJSON(fileJson, {
        calcOnDemand: false,
        doNotRecalculateAfterLoad: true,
      });
    }
  );

  // 5. Set input values
  let activeSheet = workbook.getActiveSheet();
  let activeSheetName = activeSheet.name();
  const answerInputs: Array<{ name: string; title: string; value: any }> = [];

  // Create lookup map for input definitions
  const inputDefMap = new Map<string, any>();
  for (const inp of apiInputs) {
    if (inp.name) inputDefMap.set(inp.name.toLowerCase(), inp);
  }

  for (const [key, value] of Object.entries(finalInputs)) {
    const inputDef = inputDefMap.get(key.toLowerCase());
    if (!inputDef) continue;

    // Switch sheet if needed
    const sheetName = getSheetNameFromAddress(inputDef.address);
    if (sheetName !== activeSheetName) {
      activeSheet = workbook.getSheetFromName(sheetName);
      if (!activeSheet) {
        return {
          error: 'CALCULATION_ERROR',
          message: `Sheet not found: ${sheetName}`,
          serviceId: service.serviceId,
        };
      }
      activeSheetName = activeSheet.name();
    }

    // Set cell value
    activeSheet.getCell(inputDef.row, inputDef.col).value(value);

    answerInputs.push({
      name: inputDef.name,
      title: inputDef.title || inputDef.name,
      value: value,
    });
  }

  // 6. Read output values
  const answerOutputs: Array<{ name: string; title: string; value: any; formatString?: string }> = [];

  for (const output of apiOutputs) {
    const sheetName = getSheetNameFromAddress(output.address);
    if (sheetName !== activeSheetName) {
      activeSheet = workbook.getSheetFromName(sheetName);
      if (!activeSheet) {
        return {
          error: 'CALCULATION_ERROR',
          message: `Output sheet not found: ${sheetName}`,
          serviceId: service.serviceId,
        };
      }
      activeSheetName = activeSheet.name();
    }

    const isSingleCell = getIsSingleCellFromAddress(output.address);
    let cellResult: any;

    if (isSingleCell) {
      cellResult = activeSheet.getCell(output.row, output.col).value();
    } else {
      // Range output
      const rowCount = output.rowCount || 1;
      const colCount = output.colCount || 1;
      cellResult = activeSheet.getArray(output.row, output.col, rowCount, colCount, false);
    }

    const outputObj: any = {
      name: output.name,
      title: output.title || output.name,
      value: cellResult,
    };

    if (output.formatString) {
      outputObj.formatString = output.formatString;
    }

    answerOutputs.push(outputObj);
  }

  // 7. Build result
  const executionTime = Date.now() - startTime;
  const result: ExecuteResponse = {
    serviceId: service.serviceId,
    serviceName: service.title,
    inputs: answerInputs,
    outputs: answerOutputs,
    metadata: {
      executionTime,
      cached: false,
      version: service.version,
      timestamp: new Date().toISOString(),
    },
  };

  // 8. Cache result
  if (useCaching && !options.noCache) {
    setResultCache(service.serviceId, inputs, result);
  }

  // 9. Log request
  logRequest(service.serviceId, inputs, answerOutputs.length, executionTime, false, 'success');

  return result;
}
```

### 6.3 SpreadJS Server Module

```typescript
// lib/spreadjs/server.ts

let isInitialized = false;
let SpreadJS: any = null;
let browserEnvSetup = false;

// Process-level workbook cache
const workbookCache = new Map<string, { workbook: any; timestamp: number }>();
const CACHE_MAX_SIZE = 100;
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

function setupBrowserEnvironment() {
  if (browserEnvSetup) return;

  if (typeof window !== 'undefined') {
    throw new Error('SpreadJS server utilities cannot be used on client side');
  }

  // Note: No canvas required - we're doing calculations only, not rendering
  const mockBrowser = require('mock-browser').mocks.MockBrowser;
  const mockWindow = mockBrowser.createWindow();

  if (typeof global.window === 'undefined') global.window = mockWindow;
  if (typeof global.document === 'undefined') global.document = mockWindow.document;
  if (typeof global.navigator === 'undefined') {
    Object.defineProperty(global, 'navigator', {
      value: mockWindow.navigator,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  if (typeof global.self === 'undefined') global.self = global.window || global;
  if (typeof global.HTMLCollection === 'undefined') global.HTMLCollection = mockWindow.HTMLCollection;
  if (typeof global.getComputedStyle === 'undefined') global.getComputedStyle = mockWindow.getComputedStyle;
  if (typeof global.customElements === 'undefined') global.customElements = null;
  if (typeof global.HTMLElement === 'undefined') global.HTMLElement = mockWindow.HTMLElement;
  if (typeof global.HTMLDivElement === 'undefined') global.HTMLDivElement = mockWindow.HTMLDivElement;

  browserEnvSetup = true;
}

export function initializeSpreadJS() {
  if (isInitialized && SpreadJS) return SpreadJS;

  setupBrowserEnvironment();

  SpreadJS = require('@mescius/spread-sheets');
  const licenseKey = process.env.SPREADJS_LICENSE_KEY;

  if (!licenseKey) {
    console.error('WARNING: SPREADJS_LICENSE_KEY environment variable is not set');
  }

  SpreadJS.Spread.Sheets.LicenseKey = licenseKey;
  isInitialized = true;

  return SpreadJS;
}

export function getSpreadJS() {
  if (!isInitialized || !SpreadJS) {
    return initializeSpreadJS();
  }
  return SpreadJS;
}

export function createWorkbook() {
  const MC = getSpreadJS();
  return new MC.Spread.Sheets.Workbook();
}

export async function getCachedWorkbook(
  serviceId: string,
  createFn: (workbook: any) => void | Promise<void>
): Promise<{ workbook: any; fromCache: boolean }> {
  const cached = workbookCache.get(serviceId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { workbook: cached.workbook, fromCache: true };
  }

  // Create new workbook
  const workbook = createWorkbook();
  await createFn(workbook);

  // Evict oldest if cache full
  if (workbookCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = workbookCache.keys().next().value;
    workbookCache.delete(oldestKey);
  }

  // Cache the workbook
  workbookCache.set(serviceId, {
    workbook,
    timestamp: Date.now(),
  });

  return { workbook, fromCache: false };
}

export function clearServiceCache(serviceId: string) {
  workbookCache.delete(serviceId);
}

export function getCacheStats() {
  return {
    size: workbookCache.size,
    maxSize: CACHE_MAX_SIZE,
    ttlMs: CACHE_TTL_MS,
  };
}
```

---

## 7. Logging & Protocol System

### 7.1 Log File Structure

```
logs/
├── requests.log              # Request/response log (rotated daily)
├── errors.log                # Error log (rotated daily)
├── events.log                # System events (push, import, startup)
└── analytics/
    ├── 2026-01-23.json       # Daily analytics summary
    └── services/
        └── abc123.json       # Per-service analytics
```

### 7.2 Logger Implementation

```typescript
// lib/logging/logger.ts

import fs from 'fs/promises';
import path from 'path';

const LOGS_DIR = process.env.LOGS_DIR || path.join(process.cwd(), 'logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_MEMORY_LOGS = 1000; // Keep last 1000 in memory

// In-memory ring buffer for recent logs
const recentLogs: RequestLogEntry[] = [];

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export async function ensureLogDir() {
  await fs.mkdir(LOGS_DIR, { recursive: true });
  await fs.mkdir(path.join(LOGS_DIR, 'analytics', 'services'), { recursive: true });
}

export async function writeLog(filename: string, entry: LogEntry | RequestLogEntry) {
  await ensureLogDir();
  const filepath = path.join(LOGS_DIR, filename);
  const line = JSON.stringify(entry) + '\n';

  await fs.appendFile(filepath, line);
}

export function logEvent(event: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: event,
    data,
  };

  writeLog('events.log', entry).catch(console.error);
}

export function logError(error: Error | string, context?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error instanceof Error ? error.message : error,
    data: {
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    },
  };

  writeLog('errors.log', entry).catch(console.error);
}

export function addToRecentLogs(entry: RequestLogEntry) {
  recentLogs.push(entry);
  if (recentLogs.length > MAX_MEMORY_LOGS) {
    recentLogs.shift();
  }
}

export function getRecentLogs(options?: {
  limit?: number;
  serviceId?: string;
  status?: 'success' | 'error';
}): RequestLogEntry[] {
  let logs = [...recentLogs];

  if (options?.serviceId) {
    logs = logs.filter(l => l.serviceId === options.serviceId);
  }

  if (options?.status) {
    logs = logs.filter(l => l.status === options.status);
  }

  const limit = options?.limit || 100;
  return logs.slice(-limit).reverse();
}
```

### 7.3 Request Protocol

```typescript
// lib/logging/protocol.ts

import { v4 as uuidv4 } from 'uuid';
import { writeLog, addToRecentLogs, logError } from './logger';
import { updateAnalytics } from './analytics';

export interface RequestLogEntry {
  id: string;
  timestamp: string;
  serviceId: string;
  method: 'GET' | 'POST';
  path: string;
  ip: string;
  userAgent?: string;
  inputs: Record<string, any>;
  outputCount: number;
  executionTime: number;
  cached: boolean;
  status: 'success' | 'error';
  errorCode?: string;
  errorMessage?: string;
}

export function logRequest(
  serviceId: string,
  inputs: Record<string, any>,
  outputCount: number,
  executionTime: number,
  cached: boolean,
  status: 'success' | 'error',
  errorCode?: string,
  errorMessage?: string,
  requestInfo?: { method: 'GET' | 'POST'; path: string; ip: string; userAgent?: string }
) {
  const entry: RequestLogEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    serviceId,
    method: requestInfo?.method || 'POST',
    path: requestInfo?.path || `/api/execute/${serviceId}`,
    ip: requestInfo?.ip || 'unknown',
    userAgent: requestInfo?.userAgent,
    inputs,
    outputCount,
    executionTime,
    cached,
    status,
    errorCode,
    errorMessage,
  };

  // Write to file
  writeLog('requests.log', entry).catch(console.error);

  // Add to in-memory buffer
  addToRecentLogs(entry);

  // Update analytics
  updateAnalytics(serviceId, entry).catch(console.error);

  // Log errors separately
  if (status === 'error') {
    logError(errorMessage || 'Request error', {
      serviceId,
      errorCode,
      inputs,
    });
  }
}
```

### 7.4 Analytics Tracking

```typescript
// lib/logging/analytics.ts

import fs from 'fs/promises';
import path from 'path';
import { RequestLogEntry } from './protocol';

const LOGS_DIR = process.env.LOGS_DIR || path.join(process.cwd(), 'logs');

interface ServiceAnalytics {
  serviceId: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  cacheHits: number;
  totalExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  lastUpdated: string;
  hourlyStats: Record<string, number>;
}

// In-memory analytics (persisted periodically)
const analyticsCache = new Map<string, ServiceAnalytics>();

export async function updateAnalytics(serviceId: string, entry: RequestLogEntry) {
  let analytics = analyticsCache.get(serviceId);

  if (!analytics) {
    analytics = {
      serviceId,
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      cacheHits: 0,
      totalExecutionTime: 0,
      minExecutionTime: Infinity,
      maxExecutionTime: 0,
      lastUpdated: new Date().toISOString(),
      hourlyStats: {},
    };
  }

  // Update counters
  analytics.totalRequests++;
  if (entry.status === 'success') analytics.successCount++;
  if (entry.status === 'error') analytics.errorCount++;
  if (entry.cached) analytics.cacheHits++;

  // Update execution time stats
  analytics.totalExecutionTime += entry.executionTime;
  analytics.minExecutionTime = Math.min(analytics.minExecutionTime, entry.executionTime);
  analytics.maxExecutionTime = Math.max(analytics.maxExecutionTime, entry.executionTime);

  // Update hourly stats
  const hour = new Date().toISOString().slice(0, 13);
  analytics.hourlyStats[hour] = (analytics.hourlyStats[hour] || 0) + 1;

  analytics.lastUpdated = new Date().toISOString();
  analyticsCache.set(serviceId, analytics);

  // Persist every 100 requests
  if (analytics.totalRequests % 100 === 0) {
    await persistAnalytics(serviceId, analytics);
  }
}

async function persistAnalytics(serviceId: string, analytics: ServiceAnalytics) {
  const filepath = path.join(LOGS_DIR, 'analytics', 'services', `${serviceId}.json`);
  await fs.writeFile(filepath, JSON.stringify(analytics, null, 2));
}

export function getAnalytics(serviceId: string): ServiceAnalytics | null {
  return analyticsCache.get(serviceId) || null;
}

export function getAnalyticsSummary(serviceId: string, period: 'hour' | 'day' | 'total' = 'day') {
  const analytics = analyticsCache.get(serviceId);
  if (!analytics) return null;

  const avgExecutionTime = analytics.totalRequests > 0
    ? Math.round(analytics.totalExecutionTime / analytics.totalRequests)
    : 0;

  return {
    serviceId,
    period,
    requests: {
      total: analytics.totalRequests,
      success: analytics.successCount,
      errors: analytics.errorCount,
      cached: analytics.cacheHits,
    },
    performance: {
      avgExecutionTime,
      minExecutionTime: analytics.minExecutionTime === Infinity ? 0 : analytics.minExecutionTime,
      maxExecutionTime: analytics.maxExecutionTime,
    },
    cacheHitRate: analytics.totalRequests > 0
      ? Math.round((analytics.cacheHits / analytics.totalRequests) * 100) / 100
      : 0,
    lastRequest: analytics.lastUpdated,
  };
}
```

---

## 8. Configuration

### 8.1 Environment Variables

```bash
# .env.example

# =============================================================================
# SpreadAPI Runtime Service Configuration
# =============================================================================

# Server
PORT=3000
NODE_ENV=production

# SpreadJS License (REQUIRED)
SPREADJS_LICENSE_KEY=your-spreadjs-license-key

# Runtime Security
# Secret for receiving service pushes from SpreadAPI.io
RUNTIME_SECRET=your-secret-here

# Base URL (for generating endpoint URLs in responses)
RUNTIME_BASE_URL=http://localhost:3000

# Storage
# Directory for service JSON files (default: ./services)
SERVICES_DIR=/app/services

# Logging
# Directory for log files (default: ./logs)
LOGS_DIR=/app/logs

# Log level: debug, info, warn, error
LOG_LEVEL=info

# Caching
# Enable result caching (true/false)
CACHE_ENABLED=true

# Max cached results per service (default: 1000)
CACHE_MAX_RESULTS=1000

# Cache TTL in seconds (default: 3600 = 1 hour)
CACHE_TTL_SECONDS=3600

# External Redis (optional - if not set, uses in-memory cache)
# REDIS_URL=redis://localhost:6379
```

### 8.2 Next.js Configuration

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // For Docker deployment

  // Disable unnecessary features for API-only service
  images: {
    unoptimized: true,
  },

  // Server-side only packages
  serverExternalPackages: ['@mescius/spread-sheets', 'mock-browser'],

  // Environment variables exposed to server
  env: {
    SPREADJS_LICENSE_KEY: process.env.SPREADJS_LICENSE_KEY,
    RUNTIME_SECRET: process.env.RUNTIME_SECRET,
    RUNTIME_BASE_URL: process.env.RUNTIME_BASE_URL,
  },

  // Headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 9. Docker Deployment

### 9.1 Dockerfile

```dockerfile
# Dockerfile

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create directories for services and logs
RUN mkdir -p /app/services /app/logs && chown -R nextjs:nodejs /app/services /app/logs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV SERVICES_DIR=/app/services
ENV LOGS_DIR=/app/logs

CMD ["node", "server.js"]
```

### 9.2 Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  runtime:
    build: .
    container_name: spreadapi-runtime
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - SPREADJS_LICENSE_KEY=${SPREADJS_LICENSE_KEY}
      - RUNTIME_SECRET=${RUNTIME_SECRET}
      - RUNTIME_BASE_URL=${RUNTIME_BASE_URL:-http://localhost:3000}
      - CACHE_ENABLED=${CACHE_ENABLED:-true}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    volumes:
      - ./services:/app/services
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

# Optional: External Redis for distributed caching
#  redis:
#    image: redis:7-alpine
#    container_name: spreadapi-cache
#    restart: unless-stopped
#    volumes:
#      - cache_data:/data
#    command: redis-server --maxmemory 64mb --maxmemory-policy allkeys-lru

#volumes:
#  cache_data:
```

### 9.3 Development Docker Compose

```yaml
# docker-compose.dev.yml

version: '3.8'

services:
  runtime:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: spreadapi-runtime-dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - SPREADJS_LICENSE_KEY=${SPREADJS_LICENSE_KEY}
      - RUNTIME_SECRET=dev-secret
      - RUNTIME_BASE_URL=http://localhost:3000
      - LOG_LEVEL=debug
    volumes:
      - ./:/app
      - /app/node_modules
      - ./services:/app/services
      - ./logs:/app/logs
    command: npm run dev
```

---

## 10. Implementation Guide

### 10.1 Implementation Order

Follow this order to build the Runtime Service:

```
Phase 1: Foundation (Day 1-2)
├── 1.1 Project setup (Next.js, TypeScript, dependencies)
├── 1.2 Type definitions (types/index.ts)
├── 1.3 Storage module (lib/storage/services.ts)
├── 1.4 Basic health endpoint (app/api/health/route.ts)
└── 1.5 Test: Can start server and hit health endpoint

Phase 2: SpreadJS Integration (Day 3-4)
├── 2.1 SpreadJS server module (lib/spreadjs/server.ts)
├── 2.2 Helper utilities (lib/utils/helper.ts)
├── 2.3 Parameter validation (lib/validation/parameters.ts)
├── 2.4 Calculation engine (lib/spreadjs/calculate.ts)
└── 2.5 Test: Can load workbook and calculate

Phase 3: API Endpoints (Day 5-6)
├── 3.1 Execute endpoint (app/api/execute/[serviceId]/route.ts)
├── 3.2 Services list endpoint (app/api/services/route.ts)
├── 3.3 Push endpoint (app/api/push/route.ts)
├── 3.4 Import endpoint (app/api/import/route.ts)
├── 3.5 Token authentication (lib/auth/token.ts)
└── 3.6 Test: Full API flow

Phase 4: Logging & Caching (Day 7-8)
├── 4.1 Logger module (lib/logging/logger.ts)
├── 4.2 Request protocol (lib/logging/protocol.ts)
├── 4.3 Analytics tracking (lib/logging/analytics.ts)
├── 4.4 Logs endpoint (app/api/logs/route.ts)
├── 4.5 In-memory cache (lib/cache/memory.ts)
└── 4.6 Test: Logging and caching

Phase 5: Dashboard UI (Day 9)
├── 5.1 Dashboard page (app/page.tsx)
├── 5.2 Service list component
├── 5.3 Import form component
├── 5.4 Logs viewer component
└── 5.5 Test: UI functionality

Phase 6: Docker & Documentation (Day 10-11)
├── 6.1 Dockerfile
├── 6.2 docker-compose.yml
├── 6.3 README.md
├── 6.4 API documentation
└── 6.5 Test: Docker build and run
```

### 10.2 Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mescius/spread-sheets": "^18.0.0",
    "mock-browser": "^0.92.14",
    "uuid": "^9.0.0",
    "is": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 10.3 Testing Checklist

```markdown
## Testing Checklist

### Unit Tests
- [ ] Storage: Save/load/list services
- [ ] Validation: All parameter types and constraints
- [ ] Calculation: Input setting, output reading
- [ ] Token: Hash and verify

### Integration Tests
- [ ] Push endpoint: Receive and store service
- [ ] Import endpoint: Upload and store service
- [ ] Execute endpoint: GET and POST with various inputs
- [ ] Error handling: Invalid inputs, missing service, auth errors

### End-to-End Tests
- [ ] Full flow: Push service from mock SpreadAPI.io
- [ ] Full flow: Import service via UI
- [ ] Execute with caching enabled/disabled
- [ ] Check logs and analytics

### Docker Tests
- [ ] Build image successfully
- [ ] Start with docker-compose
- [ ] Health check passes
- [ ] Volume mounts persist data
- [ ] Environment variables work
```

### 10.4 SpreadAPI.io Integration

The SpreadAPI.io SaaS platform needs these additions to support the runtime:

```typescript
// SpreadAPI.io additions needed:

// 1. Runtime registration endpoint
POST /api/user/runtimes
{
  "name": "Production",
  "url": "https://runtime.customer.com",
  "secret": "shared-secret"
}

// 2. Push service to runtime
POST /api/services/{id}/deploy
{
  "runtimeId": "runtime-uuid"
}
// This calls POST {runtime-url}/api/push with service data

// 3. Export service for manual import
GET /api/services/{id}/export
// Returns downloadable JSON file

// 4. UI: Connected Runtimes section in service editor
// Shows list of registered runtimes with deploy buttons
```

---

## Summary

This specification provides everything needed to build the SpreadAPI Runtime Service:

1. **Clear project structure** with all files and their purposes
2. **Complete type definitions** for all data structures
3. **Two service delivery methods** (push and import)
4. **All API endpoints** with request/response formats
5. **Core calculation engine** adapted from the current project
6. **Logging and analytics system** for monitoring
7. **Configuration options** via environment variables
8. **Docker deployment** with production-ready setup
9. **Step-by-step implementation guide** with testing checklist

The runtime is designed to be:
- **Lightweight**: ~50MB Docker image, ~256MB RAM
- **Simple**: File-based storage, minimal dependencies
- **Secure**: Token authentication, no external calls
- **Observable**: Local logging and analytics
- **Portable**: Standard Docker/Next.js deployment
