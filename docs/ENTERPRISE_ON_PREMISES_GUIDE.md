# SpreadAPI Enterprise: On-Premises Deployment Guide

**Technical Documentation for Enterprise IT Architecture Teams**

*Version 1.0 | January 2026*

---

## Executive Summary

SpreadAPI transforms Excel spreadsheets into scalable REST APIs, enabling organizations to operationalize business logic built in Excel—tax calculations, pricing engines, risk models, compliance rules—without rewriting them in code.

For enterprises with strict data compliance requirements (financial services, consulting firms, insurance, healthcare), SpreadAPI offers a **fully on-premises deployment option** where sensitive data never leaves your infrastructure.

This document details the architecture, security model, and deployment options for IT teams evaluating SpreadAPI for regulated environments.

---

## Table of Contents

1. [The Business Problem](#1-the-business-problem)
2. [SpreadAPI Architecture Overview](#2-spreadapi-architecture-overview)
3. [On-Premises Deployment: SpreadAPI Runtime](#3-on-premises-deployment-spreadapi-runtime)
4. [Data Flow & Compliance Architecture](#4-data-flow--compliance-architecture)
5. [Security Model](#5-security-model)
6. [Deployment Options](#6-deployment-options)
7. [Technical Specifications](#7-technical-specifications)
8. [Compliance Checklist](#8-compliance-checklist)
9. [Getting Started](#9-getting-started)

---

## 1. The Business Problem

### Excel: The Enterprise's Hidden Business Logic Layer

Large organizations rely on Excel for critical business calculations:

| Domain | Examples |
|--------|----------|
| **Tax & Compliance** | VAT calculations, tax residency rules, transfer pricing models |
| **Financial Services** | Loan amortization, risk scoring, portfolio valuations |
| **Insurance** | Premium calculations, actuarial models, claims processing rules |
| **Consulting** | Fee calculations, resource pricing, engagement scoping |
| **Manufacturing** | Bill of materials, cost rollups, margin calculations |

These spreadsheets encode years of business knowledge, regulatory requirements, and edge-case handling. They are **trusted, audited, and battle-tested**.

### The Challenge: Scaling Excel Logic

Excel works well for individual analysts but fails when you need to:

- Embed calculations in web applications or portals
- Process thousands of calculations per minute
- Integrate with automation workflows (ERP, CRM, custom systems)
- Expose calculations to internal APIs or partner integrations
- Enable AI assistants to perform accurate calculations

**Traditional solutions** require rewriting Excel logic in code—a process that:
- Takes months of development time
- Introduces calculation discrepancies
- Creates maintenance burden (two systems to update)
- Often fails to handle Excel-specific edge cases

### SpreadAPI: A Different Approach

SpreadAPI runs your **actual Excel calculations** server-side, exposing them as REST APIs. No translation, no approximation—the same formulas, the same results.

---

## 2. SpreadAPI Architecture Overview

SpreadAPI consists of two deployment models:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT OPTIONS                                   │
├─────────────────────────────────┬───────────────────────────────────────────┤
│     CLOUD (spreadapi.io)        │         ON-PREMISES (Runtime)             │
├─────────────────────────────────┼───────────────────────────────────────────┤
│  • Multi-tenant SaaS            │  • Single-tenant, your infrastructure     │
│  • Managed infrastructure       │  • Docker/Kubernetes deployment           │
│  • Data stored in our cloud     │  • Data never leaves your network         │
│  • Suitable for non-sensitive   │  • Full data sovereignty                  │
│    workloads                    │  • Compliant with strictest policies      │
└─────────────────────────────────┴───────────────────────────────────────────┘
```

### Core Technology

SpreadAPI uses **SpreadJS**, an enterprise-grade spreadsheet calculation engine that:

- Supports **500+ Excel functions** including modern array functions (XLOOKUP, FILTER, SORT, UNIQUE, SEQUENCE, LET, LAMBDA)
- Handles complex dependencies, circular references, and iterative calculations
- Processes calculations in milliseconds (typically <100ms)
- Runs server-side in a secure, isolated environment

---

## 3. On-Premises Deployment: SpreadAPI Runtime

### What is SpreadAPI Runtime?

SpreadAPI Runtime is a **lightweight, self-contained calculation server** designed for on-premises deployment. It executes Excel-based services within your infrastructure, ensuring complete data isolation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        YOUR CORPORATE NETWORK                                │
│                                                                              │
│   ┌──────────────────┐        ┌──────────────────────────────────────────┐  │
│   │  Your Systems    │        │         SpreadAPI Runtime                │  │
│   │                  │        │                                          │  │
│   │  • Web Apps      │  REST  │  ┌─────────────┐    ┌─────────────────┐  │  │
│   │  • ERP/SAP       │◄──────►│  │  API Layer  │───►│ Calculation     │  │  │
│   │  • CRM           │  API   │  │  (Node.js)  │    │ Engine          │  │  │
│   │  • Automation    │        │  └─────────────┘    │ (SpreadJS)      │  │  │
│   │  • AI Agents     │        │         │           └─────────────────┘  │  │
│   │                  │        │         ▼                                │  │
│   └──────────────────┘        │  ┌─────────────────────────────────────┐ │  │
│                               │  │  Service Packages (Local Storage)   │ │  │
│                               │  │  • Tax Calculator                   │ │  │
│                               │  │  • Pricing Engine                   │ │  │
│                               │  │  • Risk Model                       │ │  │
│                               │  └─────────────────────────────────────┘ │  │
│                               └──────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  NO DATA LEAVES THIS BOUNDARY                                        │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Characteristics

| Feature | Description |
|---------|-------------|
| **Deployment** | Docker container or Node.js application |
| **Storage** | Local file system (no external database required) |
| **Network** | No outbound connections required |
| **Updates** | Manual container updates (you control the schedule) |
| **Scaling** | Horizontal scaling via container orchestration |

---

## 4. Data Flow & Compliance Architecture

### The Zero-Cloud-Storage Workflow

For maximum compliance, SpreadAPI supports a workflow where **no sensitive data ever touches external infrastructure**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│    PHASE 1: SERVICE DEVELOPMENT                                              │
│    (User's Browser - No Server Storage)                                      │
│                                                                              │
│    ┌─────────────┐     ┌──────────────────────────────────────────────────┐ │
│    │             │     │            Browser Application                   │ │
│    │   Excel     │────►│                                                  │ │
│    │   File      │     │  ┌─────────────────────────────────────────────┐ │ │
│    │             │     │  │  • File imported into browser memory        │ │ │
│    └─────────────┘     │  │  • Define inputs/outputs (click cells)      │ │ │
│                        │  │  • Test calculations locally                │ │ │
│                        │  │  • Configure API parameters                 │ │ │
│                        │  │  • NO server communication required         │ │ │
│                        │  └─────────────────────────────────────────────┘ │ │
│                        │                       │                          │ │
│                        │                       ▼                          │ │
│                        │  ┌─────────────────────────────────────────────┐ │ │
│                        │  │  "Export for Runtime" (Download JSON)       │ │ │
│                        │  └─────────────────────────────────────────────┘ │ │
│                        └──────────────────────────────────────────────────┘ │
│                                            │                                 │
│                                            ▼                                 │
│    ┌───────────────────────────────────────────────────────────────────────┐│
│    │                    Service Package (JSON File)                        ││
│    │    Contains: Workbook data + Input/Output definitions + Metadata      ││
│    └───────────────────────────────────────────────────────────────────────┘│
│                                            │                                 │
│                                            ▼                                 │
│    PHASE 2: DEPLOYMENT                                                       │
│    (Your Infrastructure Only)                                                │
│                                                                              │
│    ┌───────────────────────────────────────────────────────────────────────┐│
│    │                      SpreadAPI Runtime                                 ││
│    │                   (Your Server/Container)                              ││
│    │                                                                        ││
│    │     Upload JSON ──► Stored locally ──► Available via REST API         ││
│    └───────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Enterprise Mode: Disabled Cloud Storage

For organizations requiring absolute assurance that data cannot be stored externally, SpreadAPI offers **Enterprise Mode**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ENTERPRISE MODE CONFIGURATION                                              │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │   ✓  Import Excel files                    (browser memory only)     │ │
│   │   ✓  Define inputs and outputs             (browser memory only)     │ │
│   │   ✓  Test calculations locally             (browser memory only)     │ │
│   │   ✓  Export for Runtime                    (download to disk)        │ │
│   │                                                                       │ │
│   │   ✗  "Save to Cloud" button                DISABLED / HIDDEN         │ │
│   │   ✗  Sync to SpreadAPI servers             BLOCKED                   │ │
│   │   ✗  Store workbooks in external storage   IMPOSSIBLE                │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│   Result: Even accidental data leakage is architecturally impossible        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Comparison

| Step | Cloud Mode | On-Premises Mode |
|------|------------|------------------|
| Excel import | Browser → Server | Browser only |
| Configuration | Stored in cloud | Browser memory |
| Testing | Cloud execution | Browser execution |
| Saving | Cloud storage | Export to file |
| Deployment | Cloud hosting | Your Runtime server |
| Execution | SpreadAPI servers | Your infrastructure |
| Data at rest | Our Redis/storage | Your file system |
| Data in transit | HTTPS to our API | Internal network only |

---

## 5. Security Model

### Runtime Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   SpreadAPI Runtime Security Layers                                          │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 1: Network Isolation                                         │   │
│   │  • Runs entirely within your network perimeter                      │   │
│   │  • No required outbound internet connectivity                       │   │
│   │  • Compatible with air-gapped environments                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 2: Container Isolation                                       │   │
│   │  • Runs in isolated Docker container                                │   │
│   │  • Minimal attack surface (Node.js runtime only)                    │   │
│   │  • No database dependencies                                         │   │
│   │  • Stateless computation (scales horizontally)                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 3: Calculation Isolation                                     │   │
│   │  • Each calculation runs in isolated context                        │   │
│   │  • No shared state between requests                                 │   │
│   │  • Memory cleared after each execution                              │   │
│   │  • No file system access during calculation                         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 4: API Security                                              │   │
│   │  • Optional authentication (API keys, OAuth, custom)                │   │
│   │  • Rate limiting per endpoint                                       │   │
│   │  • Request/response logging (configurable)                          │   │
│   │  • Input validation against defined schemas                         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What Data is Stored?

| Data Type | Location | Encryption | Access |
|-----------|----------|------------|--------|
| Service definitions | Local JSON files | Your choice (disk encryption) | File system permissions |
| Workbook data | Local JSON files | Your choice | File system permissions |
| Request logs | Local log files | Your choice | Configurable retention |
| Calculation cache | In-memory only | N/A (RAM) | Cleared on restart |

### What Data is NOT Stored?

- **Input values** from API calls (processed, not persisted)
- **Output results** (returned, not stored)
- **Intermediate calculations** (memory only)
- **User credentials** (your identity provider)

---

## 6. Deployment Options

### Option A: Docker Deployment (Recommended)

```yaml
# docker-compose.yml
version: '3.8'
services:
  spreadapi-runtime:
    image: spreadapi/runtime:latest
    ports:
      - "3001:3001"
    volumes:
      - ./services:/app/services
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**Deployment Steps:**
```bash
# 1. Pull the image
docker pull spreadapi/runtime:latest

# 2. Create directories
mkdir -p services logs

# 3. Start the container
docker-compose up -d

# 4. Verify health
curl http://localhost:3001/api/health
```

### Option B: Kubernetes Deployment

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spreadapi-runtime
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spreadapi-runtime
  template:
    metadata:
      labels:
        app: spreadapi-runtime
    spec:
      containers:
      - name: runtime
        image: spreadapi/runtime:latest
        ports:
        - containerPort: 3001
        volumeMounts:
        - name: services
          mountPath: /app/services
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
      volumes:
      - name: services
        persistentVolumeClaim:
          claimName: spreadapi-services-pvc
```

### Option C: Azure / AWS / GCP

| Platform | Recommended Service |
|----------|---------------------|
| **Azure** | Azure Container Instances or AKS |
| **AWS** | ECS Fargate or EKS |
| **GCP** | Cloud Run or GKE |

All major cloud providers support Docker containers within your private VPC/VNet, ensuring data never traverses public networks.

### Network Requirements

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   NETWORK CONFIGURATION                                                      │
│                                                                              │
│   Inbound (Required):                                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Port 3001 (or configured port) - From your internal applications   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Outbound (NOT Required):                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  No outbound internet connectivity needed                           │   │
│   │  Runtime operates fully offline after deployment                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Technical Specifications

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check and version info |
| `/api/services` | GET | List deployed services |
| `/api/services/{id}` | GET | Service metadata and schema |
| `/api/execute/{id}` | GET | Execute with query parameters |
| `/api/execute/{id}` | POST | Execute with JSON body |
| `/api/upload` | POST | Deploy new service package |

### Request/Response Format

**Request (POST):**
```json
{
  "inputs": {
    "principal": 100000,
    "interestRate": 0.05,
    "years": 10,
    "compoundingFrequency": "monthly"
  }
}
```

**Response:**
```json
{
  "outputs": [
    { "name": "futureValue", "value": 164700.95 },
    { "name": "totalInterest", "value": 64700.95 },
    { "name": "effectiveRate", "value": 0.05116 }
  ],
  "metadata": {
    "executionTime": 23,
    "serviceVersion": "1.0.0",
    "cached": false
  }
}
```

### Supported Excel Features

| Category | Functions/Features |
|----------|-------------------|
| **Math & Trig** | SUM, SUMIF, SUMIFS, SUMPRODUCT, ROUND, etc. |
| **Statistical** | AVERAGE, MEDIAN, STDEV, PERCENTILE, etc. |
| **Financial** | NPV, IRR, PMT, FV, PV, RATE, XNPV, XIRR |
| **Lookup** | VLOOKUP, HLOOKUP, INDEX, MATCH, **XLOOKUP** |
| **Array Functions** | **FILTER, SORT, UNIQUE, SEQUENCE, SORTBY** |
| **Dynamic Arrays** | **LET, LAMBDA**, spill ranges |
| **Logical** | IF, IFS, SWITCH, AND, OR, NOT, XOR |
| **Text** | CONCAT, TEXTJOIN, LEFT, RIGHT, MID |
| **Date/Time** | DATE, DATEDIF, NETWORKDAYS, WORKDAY |
| **Information** | ISBLANK, ISERROR, ISNUMBER, TYPE |

**Full Excel 365 Compatibility**: Including newest dynamic array functions and LAMBDA support.

### Performance Characteristics

| Metric | Typical Value |
|--------|---------------|
| Cold start (first calculation) | 200-500ms |
| Warm calculation | 10-50ms |
| Complex workbook (1000+ formulas) | 50-200ms |
| Memory per service | ~10-50MB |
| Concurrent calculations | Limited by CPU cores |

---

## 8. Compliance Checklist

### For IT Security Review

| Requirement | SpreadAPI Runtime Compliance |
|-------------|------------------------------|
| **Data Residency** | ✅ All data stored on your infrastructure |
| **Data in Transit** | ✅ Internal network only (HTTPS optional) |
| **Data at Rest** | ✅ Your encryption, your policies |
| **Access Control** | ✅ Integrates with your IAM |
| **Audit Logging** | ✅ Configurable request logging |
| **No External Dependencies** | ✅ Runs fully offline |
| **Vendor Access** | ✅ Zero vendor access to your data |
| **Container Security** | ✅ Minimal image, no root required |
| **Network Isolation** | ✅ No outbound connections |
| **Intellectual Property** | ✅ Formulas never leave your network |

### Supporting Your Compliance Requirements

SpreadAPI Runtime's on-premises architecture is designed to fit within your existing compliance framework:

- **GDPR** - Keep all data processing within your EU infrastructure
- **SOC 2** - Integrate with your existing security controls
- **ISO 27001** - Deploy within your certified environment
- **HIPAA** - Process healthcare data in your compliant infrastructure
- **PCI DSS** - Maintain financial data isolation
- **DORA** - Support digital operational resilience requirements

*Note: SpreadAPI Runtime is a software component that runs in your infrastructure. Compliance certification is your organization's responsibility based on your overall security posture. The Runtime is designed to not introduce additional compliance risks—it has no external dependencies, no outbound connections, and stores no data outside your network.*

---

## 9. Getting Started

### Step 1: Development (Browser-Only)

1. Access SpreadAPI.io (Enterprise Mode enabled for your organization)
2. Import your Excel file (remains in browser memory)
3. Define inputs (cells that receive values)
4. Define outputs (cells that return results)
5. Test locally in your browser
6. Click **"Export for Runtime"** to download the service package

### Step 2: Deployment

```bash
# Deploy Runtime in your infrastructure
docker run -d -p 3001:3001 -v ./services:/app/services spreadapi/runtime

# Upload service package
curl -X POST http://localhost:3001/api/upload \
  -F "file=@tax-calculator_runtime.json"
```

### Step 3: Integration

```bash
# Call the service
curl "http://localhost:3001/api/execute/tax-calculator" \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"income": 150000, "filingStatus": "married", "deductions": 25000}}'
```

### Step 4: Scale

- Add more container replicas for throughput
- Use load balancer for high availability
- Monitor with your existing observability stack

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   COMPLETE DATA FLOW - ON-PREMISES DEPLOYMENT                                │
│                                                                              │
│   ┌──────────────┐                                                           │
│   │  Excel File  │  Your analyst's spreadsheet                               │
│   │  (on disk)   │  with business logic                                      │
│   └──────┬───────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  SpreadAPI Web App (Enterprise Mode)                                 │  │
│   │  ─────────────────────────────────────────                           │  │
│   │  • Runs entirely in browser                                          │  │
│   │  • "Save to Cloud" disabled                                          │  │
│   │  • Configure inputs/outputs                                          │  │
│   │  • Test calculations locally                                         │  │
│   │  • Export service package ────────────────────────────────┐          │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                   │          │
│                                                                   ▼          │
│                                                    ┌─────────────────────┐   │
│                                                    │  Service Package    │   │
│                                                    │  (JSON file)        │   │
│                                                    └──────────┬──────────┘   │
│                                                               │              │
│   ════════════════════════════════════════════════════════════╪══════════   │
│                         YOUR NETWORK BOUNDARY                 │              │
│   ════════════════════════════════════════════════════════════╪══════════   │
│                                                               │              │
│                                                               ▼              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  SpreadAPI Runtime (Your Server)                                     │  │
│   │  ─────────────────────────────────────────                           │  │
│   │  • Docker container in your infrastructure                           │  │
│   │  • Services stored locally                                           │  │
│   │  • No external network access                                        │  │
│   │  • Exposes REST API internally                                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│          ▲                                                                   │
│          │ REST API (internal)                                               │
│          │                                                                   │
│   ┌──────┴───────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │ Web Portal   │  │  ERP/SAP     │  │  Automation  │  │  AI Agents   │    │
│   │ (Internal)   │  │  Integration │  │  Workflows   │  │  (Internal)  │    │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                                                                      │  │
│   │   ✓  All data stays within your infrastructure                       │  │
│   │   ✓  No vendor access to your calculations or data                   │  │
│   │   ✓  Full audit trail under your control                             │  │
│   │   ✓  Scale horizontally as needed                                    │  │
│   │                                                                      │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Contact

For enterprise licensing, technical questions, or proof-of-concept discussions:

**Email:** team@airrange.io
**Web:** https://spreadapi.io/enterprise

---

*SpreadAPI is developed by Airrange GmbH. This documentation is intended for technical evaluation purposes. Actual deployment should be validated against your organization's specific security and compliance requirements.*
