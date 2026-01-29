# SpreadAPI Security & Compliance Overview

**Customer-Facing Documentation**

*Version 1.0 | January 2026*

---

## How SpreadAPI Protects Your Data

SpreadAPI is built with a **privacy-first, minimal data** architecture. We've designed our system to store only what's absolutely necessary—your Excel formulas and a single email address. This document provides a comprehensive overview of our security measures, infrastructure certifications, and compliance posture.

---

## Table of Contents

1. [Our Data Philosophy](#1-our-data-philosophy)
2. [Deployment Options](#2-deployment-options)
3. [Infrastructure Security](#3-infrastructure-security)
4. [Authentication Security](#4-authentication-security)
5. [Data Encryption](#5-data-encryption)
6. [API Security Features](#6-api-security-features)
7. [Temporary Data Handling](#7-temporary-data-handling)
8. [Compliance Frameworks](#8-compliance-frameworks)
9. [On-Premises: Maximum Security](#9-on-premises-maximum-security)
10. [Security Best Practices](#10-security-best-practices)
11. [Questions & Contact](#11-questions--contact)

---

## 1. Our Data Philosophy

Unlike traditional SaaS platforms that collect extensive user data, SpreadAPI takes a different approach:

### What We Store

| Data Type | Details |
|-----------|---------|
| **Email address** | For account identification only |
| **Excel formulas** | Your service logic and configurations |
| **Service metadata** | Names, descriptions, settings |

### What We DON'T Store

- Your name or personal details
- Calculation results (cached for max 15 minutes, then deleted)
- API query inputs
- Login times or IP addresses
- Payment information (handled by Stripe)

**This minimal approach means there's simply less data that could be compromised in a breach.**

---

## 2. Deployment Options

SpreadAPI offers two deployment models to meet different security requirements:

| Feature | Cloud (SaaS) | On-Premises |
|---------|--------------|-------------|
| **Infrastructure** | Managed by SpreadAPI | Your data center |
| **Data Location** | Provider regions (EU/US) | Your infrastructure |
| **Internet Required** | Yes | No (air-gap compatible) |
| **Vendor Access** | Limited, encrypted | Zero |
| **Best For** | General use, startups | Regulated industries |

---

## 3. Infrastructure Security

SpreadAPI runs on enterprise-grade infrastructure from industry-leading providers, each with rigorous security certifications.

### Vercel (Application Hosting)

Our application runs on Vercel's global edge network.

| Certification | Description |
|---------------|-------------|
| **SOC 2 Type 2** | Annual audit of security controls |
| **ISO 27001** | Information security management certification |
| **HIPAA** | Healthcare data compliance (Enterprise plans) |
| **GDPR** | EU data protection compliance with DPA |
| **PCI DSS v4.0** | Payment card security (SAQ-D attestation) |
| **TISAX Level 2** | Automotive industry compliance |
| **Data Privacy Framework** | US-EU data transfer certification |

[Learn more about Vercel Security →](https://vercel.com/security)

### Redis Cloud (Database)

Your service metadata is stored in Redis Cloud.

| Certification | Description |
|---------------|-------------|
| **SOC 2 Type 2** | Comprehensive security audit |
| **ISO 27001:2013** | Information security management |
| **ISO 27017:2015** | Cloud-specific security controls |
| **ISO 27018:2019** | Privacy and PII protection (GDPR aligned) |
| **ISO 42001** | AI systems management (2025) |

[Visit Redis Trust Center →](https://trust.redis.io/)

### Hanko (Authentication)

User authentication is handled by Hanko, a FIDO Alliance member.

| Feature | Security Benefit |
|---------|------------------|
| **Passkeys/WebAuthn** | Phishing-resistant authentication |
| **FIDO2 Certified** | Industry-standard security protocol |
| **No Password Storage** | Credentials never touch our servers |
| **Privacy-First Design** | Data minimization by default |
| **Open Source** | Auditable, transparent codebase |

[Learn about Hanko →](https://www.hanko.io/)

---

## 4. Authentication Security

SpreadAPI uses **passwordless authentication** through Hanko:

### How It Works

1. **Passkeys** - Cryptographic keys stored on your device (phone, laptop, security key)
2. **WebAuthn** - Browser-native authentication protocol
3. **No shared secrets** - Your credentials never travel over the network

### Security Benefits

| Traditional Passwords | SpreadAPI Passkeys |
|-----------------------|-------------------|
| Can be stolen in breaches | Keys never leave your device |
| Vulnerable to phishing | Only work on legitimate domain |
| Can be guessed/brute-forced | Cryptographically secure |
| Reused across sites | Unique per service |

---

## 5. Data Encryption

### In Transit

- All connections use **TLS 1.3** (latest standard)
- HTTPS enforced across all endpoints
- No data transmitted in plain text
- HSTS enabled to prevent downgrade attacks

### At Rest

- Redis Cloud encrypts stored data using AES-256
- Vercel Blob storage uses server-side encryption
- Service tokens stored as **SHA-256 hashes** (actual tokens never stored)
- OAuth tokens encrypted with automatic expiration

---

## 6. API Security Features

When you create an API with SpreadAPI, you get built-in security:

### Authentication Options

| Method | Use Case |
|--------|----------|
| **Service tokens** | Machine-to-machine API access |
| **OAuth 2.0 + PKCE** | AI integrations (ChatGPT, Claude) |
| **Web app tokens** | Embedded calculators |

### Rate Limiting

| Tier | Limit |
|------|-------|
| Free | 100 requests/minute |
| Pro | 1,000 requests/minute |
| Premium | 10,000 requests/minute |
| Enterprise | Custom |

### Token Security

- Tokens shown **once** at creation, then never again
- Only cryptographic hashes stored in database
- Revocable immediately via dashboard
- Scoped permissions available

---

## 7. Temporary Data Handling

SpreadAPI uses aggressive caching TTLs to ensure data doesn't persist:

| Data Type | Maximum Retention | Auto-Deletion |
|-----------|-------------------|---------------|
| Calculation results | 15 minutes | ✅ Automatic |
| API definition cache | 24 hours | ✅ Automatic |
| OAuth authorization codes | 10 minutes | ✅ One-time use |
| OAuth access tokens | 12 hours | ✅ Automatic |
| Rate limit counters | 60 seconds | ✅ Automatic |

**After these periods, data is automatically and permanently deleted.**

---

## 8. Compliance Frameworks

### GDPR Compliance

SpreadAPI fully supports GDPR requirements:

| Right | How We Support It |
|-------|-------------------|
| **Right to Access** | View all your data in dashboard |
| **Right to Rectification** | Edit service information anytime |
| **Right to Erasure** | Delete account and all associated data |
| **Right to Portability** | Export service definitions as JSON |
| **Right to Restrict Processing** | Control caching and processing settings |

**Additional GDPR measures:**
- Data minimization (email only)
- Purpose limitation (service operation only)
- Storage limitation (aggressive TTLs)
- Data Processing Addendum available

### HIPAA Considerations

SpreadAPI itself is not HIPAA-certified. However:

| Factor | Details |
|--------|---------|
| **Infrastructure** | Vercel offers HIPAA on Enterprise plans |
| **Data Exposure** | Minimal—15 min cache max, no result storage |
| **Logging** | No logs of API inputs/outputs |
| **On-Premises Option** | Full HIPAA compliance with your controls |

**For HIPAA-regulated workloads:**
- Consider our on-premises deployment
- Many Excel formula use cases don't involve PHI
- Contact us to discuss your specific requirements

### SOC 2 Alignment

While SpreadAPI as a company has not completed SOC 2 certification, our infrastructure is built entirely on SOC 2 Type 2 certified providers:

| Provider | SOC 2 Status |
|----------|--------------|
| Vercel | ✅ Type 2 |
| Redis Cloud | ✅ Type 2 |
| Stripe | ✅ Type 2 |

---

## 9. On-Premises: Maximum Security

For organizations with the strictest security requirements, SpreadAPI offers a fully on-premises deployment.

### Zero External Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR INFRASTRUCTURE                                         │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  Your Users      │      │  SpreadAPI       │             │
│  │  (Internal)      │ ──── │  Runtime         │             │
│  └──────────────────┘      │  (Docker/K8s)    │             │
│                            └──────────────────┘             │
│                                                              │
│  External connections: NONE                                  │
│  Vendor access: ZERO                                         │
│  Internet required: NO                                       │
└─────────────────────────────────────────────────────────────┘
```

### Enterprise Mode Guarantees

| Action | Data Location |
|--------|---------------|
| Import Excel files | Browser memory only |
| Define inputs/outputs | Browser memory only |
| Test calculations | Browser memory only |
| Export for Runtime | Download to your disk |
| Cloud sync | **DISABLED/BLOCKED** |

### Compliance Benefits

| Framework | On-Premises Support |
|-----------|---------------------|
| **GDPR** | Full control over data residency |
| **HIPAA** | Deploy in your compliant infrastructure |
| **SOC 2** | Integrate with your existing controls |
| **ISO 27001** | Deploy within your certified environment |
| **PCI DSS** | Maintain financial data isolation |
| **DORA** | Support digital operational resilience |
| **Air-Gap** | Fully offline operation |

### 4-Layer Security Model

1. **Network Isolation** - Runs within your corporate network perimeter
2. **Container Isolation** - Minimal Docker image, no root required
3. **Calculation Isolation** - Each request in isolated context
4. **API Security** - Your authentication, your rate limits

[Read the full On-Premises Guide →](./ENTERPRISE_ON_PREMISES_GUIDE.md)

---

## 10. Security Best Practices

### For All Users

#### Protect Your Service Tokens
```
✅ Store tokens in environment variables
✅ Rotate tokens periodically
✅ Revoke unused tokens immediately
✅ Use scoped tokens for different integrations

❌ Never commit tokens to version control
❌ Never share tokens in plain text
❌ Never use production tokens in development
```

#### Configure Rate Limits
- Set appropriate limits for your use case
- Monitor for unusual activity in analytics
- Use token-based auth for production workloads

#### Review Access Regularly
- Audit which services are published
- Check OAuth authorizations
- Remove unused AI integrations

### For Enterprise Users

#### On-Premises Deployment
- Deploy in private VPC/VNet
- Use your existing IAM for access control
- Enable request logging for audit trails
- Implement network segmentation

#### Container Security
- Run as non-root user (default)
- Use read-only file systems where possible
- Scan images for vulnerabilities
- Keep runtime updated

---

## 11. Questions & Contact

### Security Inquiries

For security questions, vulnerability reports, or compliance documentation requests:

- **Email**: team@airrange.io
- **Enterprise**: https://spreadapi.io/enterprise

### Documentation Requests

We can provide:
- Data Processing Addendum (DPA)
- Subprocessor list
- Security questionnaire responses
- Architecture diagrams
- Penetration test summaries (upon NDA)

---

## Summary

| Security Aspect | SpreadAPI Cloud | SpreadAPI On-Premises |
|-----------------|-----------------|----------------------|
| **Data Collection** | Email only | Zero external data |
| **Result Storage** | 15 min cache max | Not stored |
| **Authentication** | Passwordless (Hanko) | Your IAM |
| **Infrastructure** | SOC 2, ISO 27001 certified | Your certified environment |
| **Encryption** | TLS 1.3 + AES-256 | Your encryption |
| **GDPR** | Fully compliant | Customer-managed |
| **HIPAA** | Via Enterprise plan | Your controls |
| **Air-Gap** | Not available | ✅ Fully supported |
| **Vendor Access** | Limited, encrypted | Zero |

---

*Last updated: January 2026*

*For the latest security information, visit https://spreadapi.io/security*
