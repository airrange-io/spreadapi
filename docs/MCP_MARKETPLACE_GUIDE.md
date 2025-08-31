# SpreadAPI MCP Marketplace Guide

## Overview

SpreadAPI's MCP tokens work as **API keys for the marketplace model**. Service creators can generate tokens that grant access to specific services, which they can then share, sell, or distribute to other users.

## How It Works

### 1. Service Owner Creates Services
```javascript
// Service owner creates and publishes Excel-based services
const serviceId = "user123_compound_interest";
await publishService(serviceId, excelData);
```

### 2. Service Owner Creates Access Tokens
```javascript
// Create a token with access to specific services
const token = await createToken(
  userId,           // Token owner's user ID
  "Premium Access", // Token name
  "Access to financial calculators", // Description
  [serviceId1, serviceId2]  // Specific services this token can access
);

// Or create unlimited access token (access to all published services)
const unlimitedToken = await createToken(
  userId,
  "Full Access",
  "Access to all services",
  []  // Empty array = access to all published services
);
```

### 3. Token Distribution
Service owners can:
- **Sell tokens** on their website or marketplace
- **Share tokens** with specific clients
- **Create tiered access** with different token levels
- **Revoke access** by deactivating tokens

### 4. End Users Use Tokens
```bash
# Users configure Claude Desktop with the token
SPREADAPI_URL=https://spreadapi.io/api/mcp/v1
SPREADAPI_TOKEN=spapi_live_xxxxx
```

## Token Access Models

### Model 1: Specific Service Access
```javascript
// Token with access to specific services only
{
  token: "spapi_live_xxx",
  serviceIds: ["service1", "service2", "service3"]
}
```
- Token can ONLY access the listed services
- Good for tiered pricing models
- Easy to control what each customer can access

### Model 2: All Owner's Services
```javascript
// Token with access to all services owned by token creator
{
  token: "spapi_live_xxx",
  serviceIds: []  // Empty = all services owned by the token creator
}
```
- Token can access ANY service owned by the token creator
- Good for giving full access to your own services
- No need to update when you add new services
- CANNOT access other users' services

## Security & Access Control

### Token-Based Access (NEW)
- Tokens grant access regardless of who uses them
- No user ownership checks - it's purely token-based
- If you have the token, you have the access

### Service Requirements
- Services must be **published** to be accessible
- Draft services cannot be accessed via MCP
- Services are checked for existence at call time

## API Endpoints

### Create Token
```bash
POST /api/mcp/create-token
{
  "userId": "service_owner_id",
  "name": "Premium Access Token",
  "description": "Access to premium calculators",
  "serviceIds": ["service1", "service2"]  // or [] for all
}
```

### List User's Tokens
```bash
GET /api/mcp/tokens
Authorization: Bearer {user_auth_token}
```

### Revoke Token
```bash
DELETE /api/mcp/tokens/{token_id}
Authorization: Bearer {user_auth_token}
```

## Use Cases

### 1. SaaS Model
- Create different service tiers
- Basic tier: Token with access to 3 services
- Pro tier: Token with access to 10 services
- Enterprise: Token with unlimited access

### 2. Client Projects
- Create custom Excel services for a client
- Generate a token specifically for that client
- Client integrates with their Claude Desktop
- Revoke access when contract ends

### 3. Public API Marketplace
- List your services on a marketplace
- Generate unique tokens for each purchase
- Track usage per token
- Monetize your Excel expertise

### 4. Internal Tools
- Create services for your organization
- Generate tokens for different departments
- Control access to sensitive calculations
- Audit trail via token usage stats

## Example: Creating a Marketplace Service

```javascript
// 1. Service owner creates a mortgage calculator
const serviceId = generateServiceId(userId);
const mortgageCalc = {
  inputs: ["loanAmount", "interestRate", "term"],
  outputs: ["monthlyPayment", "totalInterest"],
  excel: mortgageWorkbook
};
await publishService(serviceId, mortgageCalc);

// 2. Create access tokens for different tiers
// Basic tier - just the mortgage calc
const basicToken = await createToken(userId, "Basic", "Mortgage calculator", [serviceId]);

// Pro tier - mortgage + investment calcs
const proToken = await createToken(userId, "Pro", "All financial calculators", 
  [mortgageServiceId, investmentServiceId, retirementServiceId]);

// 3. Share/sell tokens
console.log("Basic Plan Token:", basicToken.token);
console.log("Pro Plan Token:", proToken.token);

// 4. Users configure Claude Desktop
// They can now use: "Calculate my mortgage for a $300k loan at 5% for 30 years"
```

## Token Management Best Practices

1. **Name tokens clearly** - Use descriptive names for easy management
2. **Set appropriate access** - Only grant access to necessary services
3. **Monitor usage** - Check token usage statistics regularly
4. **Rotate tokens** - Periodically regenerate tokens for security
5. **Document access** - Keep records of who has which tokens

## Migration from User-Based Model

The system has been updated from a user-ownership model to a token-based marketplace model:

### Old Model (Removed)
- Token could only access services owned by the token's user
- Required checking `user:${userId}:services` index
- Limited marketplace capabilities

### New Model (Current)
- Token specifies which services it can access
- No user ownership checks
- Full marketplace support
- Services just need to be published

## Troubleshooting

### "Service not found or not published"
- Check if service exists: `redis.exists('service:${serviceId}:published')`
- Ensure service is published, not just draft
- Verify service ID is correct

### "This token does not have access to this service"
- Token has specific service restrictions
- Service ID is not in the token's allowed list
- Solution: Create new token with access to this service

### "Token not found or inactive"
- Token may have been revoked
- Token format is invalid (must start with `spapi_live_`)
- Generate a new token

## Summary

The SpreadAPI MCP marketplace model enables:
- **Monetization** of Excel expertise
- **Controlled access** to services
- **Easy distribution** via tokens
- **No user management** required
- **Flexible pricing** models

Service creators maintain full control while users get simple token-based access to powerful Excel calculations through their AI assistants.