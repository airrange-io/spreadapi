# Testing ChatGPT OAuth Integration
**Complete Testing Guide for Development and Production**

---

## Problem: ChatGPT Cannot Connect to Localhost

### Why Localhost Doesn't Work

The OAuth flow involves **two types of requests**:

1. **Browser Redirects** (User's browser):
   - ✅ User's browser CAN access localhost
   - User is redirected to `http://localhost:3000/oauth/authorize`
   - User completes authorization
   - Browser redirects back to ChatGPT with authorization code

2. **Server-to-Server Token Exchange** (ChatGPT's servers):
   - ❌ ChatGPT's servers CANNOT access localhost
   - ChatGPT backend tries to call `http://localhost:3000/api/oauth/token`
   - Fails because localhost on ChatGPT's servers ≠ your machine

**Result:** Authorization works, but token exchange fails.

---

## Solution 1: ngrok (Recommended for Testing)

**ngrok** creates a secure tunnel from a public URL to your localhost.

### Step 1: Install ngrok

```bash
# macOS (Homebrew)
brew install ngrok

# Or download from https://ngrok.com/download
```

### Step 2: Sign Up for Free Account

```bash
# Sign up at https://dashboard.ngrok.com/signup
# Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken

ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Your Development Server

```bash
# Terminal 1: Start Next.js dev server
npm run dev
# Running on http://localhost:3000
```

### Step 4: Start ngrok Tunnel

```bash
# Terminal 2: Create tunnel to localhost:3000
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Your public URL:** `https://abc123.ngrok-free.app`

### Step 5: Update Environment Variables (Temporary)

Create a `.env.local.ngrok` file for testing:

```bash
# .env.local.ngrok (DO NOT commit this file!)
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
NEXT_PUBLIC_HANKO_API_URL=https://your-hanko-instance.hanko.io
```

Load these variables:
```bash
# Stop your dev server (Ctrl+C)
# Restart with ngrok URL
cp .env.local .env.local.backup
cp .env.local.ngrok .env.local
npm run dev
```

### Step 6: Test ChatGPT Connection

1. Open ChatGPT
2. Go to Settings → Personalization → Custom GPTs → Add custom MCP
3. Enter your ngrok URL:
   ```
   https://abc123.ngrok-free.app
   ```
4. ChatGPT discovers OAuth endpoints automatically
5. Follow the authorization flow
6. ✅ Token exchange should work!

### Step 7: Monitor Requests

ngrok provides a web interface to see all requests:
```bash
# Open in browser
http://localhost:4040
```

You can see:
- All HTTP requests to your tunnel
- Request/response headers
- Request/response bodies
- Timing information

**Very useful for debugging OAuth flow!**

### Step 8: Clean Up After Testing

```bash
# Stop ngrok (Ctrl+C in Terminal 2)

# Restore original environment variables
cp .env.local.backup .env.local
rm .env.local.ngrok .env.local.backup

# Restart dev server
npm run dev
```

---

## Solution 2: Cloudflare Tunnel (Alternative)

Cloudflare Tunnel is another option (free, no signup required for temporary tunnels).

### Install cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Start Tunnel

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start tunnel
cloudflared tunnel --url http://localhost:3000
```

Output:
```
Your quick tunnel has been created! Visit it at:
https://abc-def-ghi.trycloudflare.com
```

Use this URL for ChatGPT testing (same steps as ngrok).

**Pros:**
- No signup required
- Free
- Fast

**Cons:**
- URL changes every time
- No web dashboard like ngrok

---

## Solution 3: localtunnel (Another Alternative)

```bash
# Install
npm install -g localtunnel

# Start tunnel
lt --port 3000
```

Output:
```
your url is: https://xyz123.loca.lt
```

**Note:** localtunnel URLs often trigger security warnings. ngrok is more reliable.

---

## Solution 4: Deploy to Vercel (Production Testing)

For testing with real production environment:

### Step 1: Deploy to Vercel

```bash
# Login to Vercel
npx vercel login

# Deploy
npx vercel --prod
```

### Step 2: Get Deployment URL

```
✅ Production: https://spreadapi.vercel.app
```

### Step 3: Update ChatGPT Connection

Use your production URL:
```
https://spreadapi.vercel.app
```

**Pros:**
- Real production environment
- Stable URL
- HTTPS by default
- Fast CDN

**Cons:**
- Need to deploy for every change
- May affect production users

**Recommendation:** Use Vercel preview deployments for testing:
```bash
# Deploy to preview (not production)
npx vercel

# Get preview URL
# https://spreadapi-abc123.vercel.app
```

---

## Comparison: Testing Methods

| Method | Setup Time | Cost | URL Stability | Best For |
|--------|-----------|------|---------------|----------|
| **ngrok** | 5 min | Free tier OK | Changes daily (free) | Development testing |
| **Cloudflare Tunnel** | 2 min | Free | Changes each run | Quick tests |
| **localtunnel** | 1 min | Free | Changes each run | Quick tests |
| **Vercel Preview** | 5 min | Free | Stable per deploy | Pre-production testing |
| **Vercel Production** | 5 min | Free | Stable | Production |

---

## Recommended Testing Workflow

### 1. Local Development (No ChatGPT)
```bash
# Standard local development
npm run dev
# Test with Claude Desktop using MCP tokens
```

### 2. ChatGPT Integration Testing
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Update .env.local with ngrok URL
# Test OAuth flow with ChatGPT
# Monitor requests at http://localhost:4040
```

### 3. Pre-Production Testing
```bash
# Deploy to Vercel preview
npx vercel

# Test with ChatGPT using preview URL
# Verify everything works
```

### 4. Production Deployment
```bash
# Deploy to production
npx vercel --prod

# Update ChatGPT connection to production URL
# Monitor logs in Vercel dashboard
```

---

## Testing Checklist

### Before Testing with ChatGPT

- [ ] Next.js dev server running (`npm run dev`)
- [ ] ngrok tunnel running (`ngrok http 3000`)
- [ ] `.env.local` updated with ngrok URL
- [ ] Hanko authentication working
- [ ] Redis connection working
- [ ] At least one service created in your account

### During OAuth Flow Testing

- [ ] ChatGPT discovers OAuth endpoints (check metadata)
- [ ] Redirect to authorization page works
- [ ] Hanko login works
- [ ] Service selection shows your services
- [ ] Authorization code generated
- [ ] Redirect back to ChatGPT works
- [ ] Token exchange succeeds
- [ ] ChatGPT discovers MCP tools
- [ ] Can execute service via ChatGPT

### After Testing

- [ ] Check ngrok web interface for all requests
- [ ] Check Redis for OAuth tokens (`KEYS oauth:*`)
- [ ] Check server logs for errors
- [ ] Verify rate limiting works (try >10 requests)
- [ ] Test logout (tokens should be revoked)
- [ ] Test token expiry

---

## Common Issues and Solutions

### Issue 1: ngrok URL Changes

**Problem:** Free ngrok URLs change every time you restart ngrok.

**Solutions:**
1. Use ngrok paid plan ($8/month) for static URLs
2. Use Vercel preview deployments
3. Accept the inconvenience for testing

### Issue 2: CORS Errors

**Problem:** ChatGPT can't access your ngrok URL due to CORS.

**Solution:** OAuth endpoints already have proper CORS headers:
```javascript
// Already implemented in your code
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'POST, OPTIONS',
```

### Issue 3: Hanko Cookie Not Working

**Problem:** Hanko cookies don't work across ngrok domain.

**Solution:** This is already handled! Your implementation:
1. Stores Hanko JWT in Redis during authorization
2. Retrieves it during token exchange
3. Doesn't rely on cookies for OAuth flow

### Issue 4: Rate Limiting During Testing

**Problem:** Hit rate limit (10 req/min) during testing.

**Solutions:**
```bash
# Option 1: Clear rate limit in Redis
redis-cli DEL "rate_limit:oauth_token:YOUR_IP"

# Option 2: Wait 60 seconds

# Option 3: Temporarily increase limit in code (for testing only!)
# lib/rate-limiter.js
const rateCheck = await rateLimitByIP(request, 'oauth_token', 100, 60); // Higher limit
```

### Issue 5: ngrok Shows "Visit Site" Button

**Problem:** ngrok free tier shows interstitial page on first visit.

**Solution:** This is normal. Click "Visit Site" once. ChatGPT's automated requests won't see this page.

---

## Monitoring and Debugging

### View All Requests (ngrok)
```bash
# Open ngrok web interface
open http://localhost:4040
```

### Check Redis State
```bash
# View all OAuth-related keys
redis-cli KEYS "oauth:*"

# View specific token metadata
redis-cli HGETALL "oauth:token:oat_abc123..."

# View user's tokens
redis-cli SMEMBERS "user:YOUR_USER_ID:oauth_tokens"

# Check rate limiting
redis-cli GET "rate_limit:oauth_token:YOUR_IP"
```

### Check Server Logs
```bash
# Your terminal running npm run dev shows:
[OAuth Token] Exchange request: {...}
[OAuth Token] Access token issued: {...}
[MCP Auth] OAuth token validated: {...}
[Hanko] JWKS cached globally for improved performance
```

### Test Endpoints Manually

**1. OAuth Discovery:**
```bash
curl https://abc123.ngrok-free.app/.well-known/oauth-authorization-server
```

Expected:
```json
{
  "issuer": "https://abc123.ngrok-free.app",
  "authorization_endpoint": "https://abc123.ngrok-free.app/api/oauth/authorize",
  "token_endpoint": "https://abc123.ngrok-free.app/api/oauth/token",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code"],
  "code_challenge_methods_supported": ["S256"]
}
```

**2. MCP Discovery:**
```bash
curl https://abc123.ngrok-free.app/api/mcp
```

Expected: MCP server info + OAuth metadata

---

## Cost Comparison

### Free Options (Good for Testing)

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **ngrok** | Unlimited connections | URL changes daily, 1 agent, 40 connections/min |
| **Cloudflare Tunnel** | Unlimited | URL changes each run |
| **localtunnel** | Unlimited | URL changes, security warnings |
| **Vercel** | 100 GB bandwidth/month | Hobby plan restrictions |

### Paid Options (Production)

| Service | Cost | Benefits |
|---------|------|----------|
| **ngrok Pro** | $8/month | Static URL, 3 agents, 120 connections/min |
| **Vercel Pro** | $20/month | More bandwidth, analytics, faster builds |
| **Custom Domain** | $10-15/year | Professional URL, full control |

**Recommendation for Testing:** Use ngrok free tier with daily URL changes.

**Recommendation for Production:** Deploy to Vercel with custom domain.

---

## Summary

### For Development
- ✅ Use ngrok or Cloudflare Tunnel
- ✅ Test OAuth flow end-to-end
- ✅ Monitor requests in ngrok dashboard
- ✅ Check Redis state during testing

### For Production
- ✅ Deploy to Vercel (or similar hosting)
- ✅ Use production URL in ChatGPT
- ✅ Monitor with Vercel analytics
- ✅ Set up proper error tracking

### Security Note
- ⚠️ Never commit `.env.local.ngrok` with ngrok URLs
- ⚠️ Don't use ngrok URLs in production
- ⚠️ Rate limits are lower during testing (expected)
- ⚠️ ngrok free tier URLs are public - anyone with the URL can access

---

**Testing Time Estimate:**
- ngrok setup: 5 minutes (first time)
- OAuth flow testing: 10 minutes
- End-to-end verification: 15 minutes
- **Total: ~30 minutes**

---

**Created:** 2025-10-25
**Last Updated:** 2025-10-25
**Status:** Ready for Testing
