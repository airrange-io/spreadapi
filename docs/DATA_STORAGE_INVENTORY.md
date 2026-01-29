# SpreadAPI Data Storage Inventory

**Technical Documentation for Security & Compliance Teams**

*Version 1.0 | January 2026*

---

## Executive Summary

SpreadAPI is designed with a **minimal data footprint** philosophy. The system primarily stores Excel formulas and calculation logic, not user data or query results. This document provides a complete inventory of all data stored by the SpreadAPI system across both Cloud and On-Premises deployments.

---

## Table of Contents

1. [Data Philosophy](#1-data-philosophy)
2. [Cloud Deployment: Data Inventory](#2-cloud-deployment-data-inventory)
3. [On-Premises Deployment: Data Inventory](#3-on-premises-deployment-data-inventory)
4. [Data Retention Policies](#4-data-retention-policies)
5. [Third-Party Data Processors](#5-third-party-data-processors)
6. [GDPR Data Subject Rights](#6-gdpr-data-subject-rights)

---

## 1. Data Philosophy

SpreadAPI follows **data minimization** principles:

| Principle | Implementation |
|-----------|----------------|
| Collect only essentials | Email address only for account identification |
| Don't store results | 15-minute cache maximum, then auto-deleted |
| Don't log user activity | No tracking of API inputs/outputs |
| Use secure infrastructure | All providers are SOC 2 certified |
| Support data rights | Users can delete all their data anytime |

---

## 2. Cloud Deployment: Data Inventory

### 2.1 User Data (Minimal)

| Data Field | Purpose | Storage Location | Retention |
|------------|---------|------------------|-----------|
| Email address | Account identification | Redis | Until account deletion |
| User ID | Unique identifier (from Hanko) | Redis | Until account deletion |
| License type | Service tier (free/pro/premium) | Redis | Until account deletion |
| Verification status | Email verified flag | Redis | Until account deletion |
| Auth method flags | Has passkey/password | Redis | Until account deletion |

**What we DON'T store about users:**
- Full name
- Physical address
- Phone number
- Login timestamps
- IP addresses (beyond rate limiting)
- Browser fingerprints
- Location data

### 2.2 Service Data (Excel Formulas)

| Data Field | Purpose | Storage Location | Retention |
|------------|---------|------------------|-----------|
| Service name & description | User-defined metadata | Redis | Until service deletion |
| Excel workbook | Formula logic (uploaded file) | Vercel Blob | Until service deletion |
| Input/output definitions | API parameter structure | Redis | Until service deletion |
| Configuration | Caching, rate limits, tokens | Redis | Until service deletion |

### 2.3 Temporary/Cached Data

| Data Type | TTL | Purpose |
|-----------|-----|---------|
| Calculation results | 15 minutes | Performance optimization |
| API definition cache | 24 hours | Reduce blob storage reads |
| OAuth authorization codes | 10 minutes | One-time use auth flow |
| OAuth access tokens | 12 hours | MCP/ChatGPT integration |
| MCP states | 1-24 hours | Stateful calculations |
| Rate limit counters | 60 seconds | Abuse prevention |
| User activity log | 30 days | Account activity (capped at 100 entries) |

### 2.4 Analytics (Aggregated Only)

| Metric | Granularity | Contains PII |
|--------|-------------|--------------|
| Total API calls | Per service | No |
| Daily call counts | Per date | No |
| Response times | Averaged | No |
| Cache hit rates | Percentage | No |
| Error counts | Per date | No |

### 2.5 Security Token Handling

| Token Type | Storage Method | Notes |
|------------|----------------|-------|
| Service tokens | SHA-256 hash only | Actual tokens never stored |
| OAuth access tokens | Hashed with metadata | 12-hour expiry |
| OAuth auth codes | Temporary storage | 10-minute, one-time use |

### 2.6 What We DON'T Store (Cloud)

- **Query Results** - Calculation outputs are NOT stored permanently (15 min cache max)
- **User Credentials** - Passwords managed by Hanko (external service)
- **Input Data** - API inputs processed and discarded
- **Personal Information** - No names, addresses, phone numbers
- **Payment Details** - Handled entirely by Stripe

---

## 3. On-Premises Deployment: Data Inventory

### 3.1 Zero Cloud Storage Architecture

In on-premises/enterprise mode, **no data ever leaves your infrastructure**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ON-PREMISES DATA FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Browser (Enterprise Mode)                                      │
│   ├── Excel file: Memory only (never uploaded)                   │
│   ├── Configuration: Memory only                                 │
│   └── Export: JSON file downloaded to disk                       │
│                                                                  │
│   SpreadAPI Runtime (Docker/K8s)                                 │
│   ├── Service definitions: Local JSON files                      │
│   ├── Workbook data: Local JSON files                            │
│   ├── Request logs: Local files (daily rotation)                 │
│   └── Calculation cache: In-memory only                          │
│                                                                  │
│   External Connections: NONE                                     │
│   ├── No internet required                                       │
│   ├── No vendor access                                           │
│   └── Air-gapped compatible                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Enterprise Mode Guarantees

| Action | Cloud Data |
|--------|------------|
| Import Excel files | Browser memory only |
| Define inputs/outputs | Browser memory only |
| Test calculations | Browser memory only |
| Export for Runtime | Download to disk |
| Save to Cloud | DISABLED/BLOCKED |
| Sync to SpreadAPI servers | IMPOSSIBLE |

### 3.3 Runtime Data Storage

| Data Type | Storage Location | Retention |
|-----------|------------------|-----------|
| Service definitions | Local JSON files | Until deleted |
| Workbook formulas | Local JSON files | Until deleted |
| Request logs | Local log files | Configurable rotation |
| Calculation cache | In-memory only | Request lifetime |

### 3.4 What's NOT Stored (On-Premises)

- Input values (processed and discarded)
- Output results (returned and discarded)
- Intermediate calculations (memory only)
- User credentials (customer IAM)
- Any external telemetry

---

## 4. Data Retention Policies

### 4.1 Cloud Retention

| Data Category | Retention Period | Deletion Method |
|---------------|------------------|-----------------|
| User accounts | Until user deletes | Manual deletion via dashboard |
| Services | Until user deletes | Manual deletion via dashboard |
| Calculation cache | 15 minutes | Automatic TTL expiry |
| OAuth tokens | 12 hours | Automatic TTL expiry |
| User activity log | 30 days | Automatic TTL expiry |
| Rate limit data | 60 seconds | Automatic TTL expiry |

### 4.2 On-Premises Retention

| Data Category | Retention Period | Deletion Method |
|---------------|------------------|-----------------|
| Service files | Until admin deletes | File system deletion |
| Request logs | Configurable | Log rotation policy |
| Cache data | Request duration | Automatic memory cleanup |

---

## 5. Third-Party Data Processors

### 5.1 Cloud Deployment Processors

| Provider | Data Shared | Purpose | Certifications |
|----------|-------------|---------|----------------|
| **Hanko** | Email, auth status | Authentication | FIDO Alliance Member, GDPR compliant |
| **Vercel** | Excel files, API calls | Hosting & storage | SOC 2 Type 2, ISO 27001, HIPAA (Enterprise), GDPR |
| **Redis Cloud** | Metadata, cache | Database | SOC 2 Type 2, ISO 27001, ISO 27017, ISO 27018 |
| **Stripe** | Payment data | Billing | PCI DSS Level 1, SOC 2 |

### 5.2 On-Premises Deployment Processors

| Provider | Data Shared | Purpose |
|----------|-------------|---------|
| **None** | Zero external data sharing | All processing local |

---

## 6. GDPR Data Subject Rights

SpreadAPI supports the following GDPR rights:

| Right | Cloud Implementation | On-Premises Implementation |
|-------|---------------------|---------------------------|
| **Right to Access** | Dashboard shows all user data | Customer-managed |
| **Right to Rectification** | Edit services anytime | Customer-managed |
| **Right to Erasure** | Delete account and all data | Customer-managed |
| **Right to Portability** | Export service definitions | Full export by design |
| **Right to Restrict Processing** | Control caching settings | Customer-managed |

---

## 7. Data Flow Diagrams

### 7.1 Cloud Data Flow

```
User Browser
     │
     ▼
┌─────────────────┐
│  Vercel Edge    │  ← No persistent data
│  (CDN/Hosting)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hanko Cloud    │  ← Credentials (external service)
│  (Auth)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redis Cloud    │  ← Metadata, formulas, cache (TTL-based)
│  (Database)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel Blob    │  ← Excel workbooks only
│  (File Storage) │
└─────────────────┘
```

### 7.2 On-Premises Data Flow

```
User Browser (Enterprise Mode)
     │
     │ Excel file stays in browser memory
     │
     ▼
┌─────────────────┐
│  Export JSON    │  ← Downloaded to user's disk
│  (Local File)   │
└────────┬────────┘
         │
         │ Manual upload to corporate infrastructure
         │
         ▼
┌─────────────────────────────────────────┐
│  Corporate Network                       │
│  ┌─────────────────┐                    │
│  │ SpreadAPI       │  ← Service files   │
│  │ Runtime         │  ← In-memory cache │
│  │ (Docker/K8s)    │  ← Local logs      │
│  └─────────────────┘                    │
│                                         │
│  No external connections                │
└─────────────────────────────────────────┘
```

---

## 8. Compliance Summary

| Requirement | Cloud | On-Premises |
|-------------|-------|-------------|
| **Data Minimization** | ✅ Email only | ✅ Zero user data |
| **Result Storage** | ✅ 15 min cache max | ✅ Not stored |
| **Data Residency** | Provider regions | ✅ Your infrastructure |
| **Vendor Access** | Limited (encrypted) | ✅ Zero vendor access |
| **Air-Gap Compatible** | ❌ Requires internet | ✅ Fully offline |
| **GDPR Compliant** | ✅ Yes | ✅ Customer-managed |
| **HIPAA Ready** | Via Enterprise plan | ✅ Your controls |

---

## Contact

For data protection inquiries:
- **Email**: team@airrange.io
- **Enterprise**: https://spreadapi.io/enterprise

---

*This document is maintained by the SpreadAPI team and updated with each significant infrastructure change.*
