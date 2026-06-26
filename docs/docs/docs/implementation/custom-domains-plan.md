# Custom Domains for SpreadAPI Services — Implementation Plan

## Problem statement

Customers want to expose their SpreadAPI services under their own domain (`api.acme.com/loanCalculator`) instead of the canonical `app.spreadapi.io/api/v1/services/{uuid}/execute`. This is partly cosmetic (their callers see *their* brand), partly practical (shorter paths, slug-based URLs), and partly trust ("this is **our** API"). The feature is the natural Pro/Premium-tier upsell after Pipedream sources.

This plan covers everything needed to ship the feature on the existing Vercel + Next.js 16 stack: the Vercel Domains API integration, the Next.js proxy changes, the Redis schema, the slug routing, the verification UX, and the security/abuse considerations.

---

## TL;DR for the impatient

- Vercel **already does multi-tenant SaaS custom domains** as a first-class product ("Vercel for Platforms"). All the heavy lifting — TLS via Let's Encrypt, edge routing, DNS verification — is built in.
- **Pro plan: unlimited custom domains** per project (soft cap 100 000). Hobby is capped at 50, so we cannot ship this on Hobby.
- **No additional vendor is needed.** Vercel-only path is the cheapest and fastest. Cloudflare for SaaS becomes interesting only if we hit pricing pain at very large scale.
- Implementation effort: **~7 working days for a polished v1**; a functional MVP is ~3 days.

---

## What Vercel actually gives us (verified facts)

### Limits per plan

| Capability                       | Hobby | Pro                              | Enterprise                       |
|----------------------------------|-------|----------------------------------|----------------------------------|
| Custom domains per project       | 50    | Unlimited (soft cap **100 000**) | Unlimited (soft cap **1 000 000**) |
| Wildcard subdomains              | ✓     | ✓                                | ✓                                |
| Auto-issued SSL (Let's Encrypt)  | ✓     | ✓                                | ✓                                |
| Custom-uploaded SSL              | —     | —                                | ✓                                |
| Multi-tenant preview URLs        | —     | —                                | ✓                                |

Soft caps are flexible — Vercel says "contact support to increase". For our market (B2B services in financial / engineering domains), 100k is comfortably above any realistic horizon.

### Vercel REST + SDK

- **SDK package**: `@vercel/sdk` (npm). All operations have typed wrappers under `@vercel/sdk/funcs/*`.
- **Auth**: bearer token in `VERCEL_TOKEN`. Scoped to a team via `teamId` (or `slug`).
- **Endpoints we need**:
  - `POST /v10/projects/{idOrName}/domains` → add domain → returns `{verified, verification[]}`
  - `GET  /v9/projects/{idOrName}/domains/{domain}` → status incl. config issues
  - `POST /v9/projects/{idOrName}/domains/{domain}/verify` → re-trigger verification
  - `DELETE /v9/projects/{idOrName}/domains/{domain}` → unlink from project
  - `DELETE /v6/domains/{domain}` → remove from account entirely
- **Rate limits** (per team):
  - 100 add/hour
  - 50 verify/hour
  - 100 remove/hour
  These are per *team*, not per *user* — important for our multi-tenant scenario where many of our customers might be configuring at once. We need server-side queuing if we exceed.
- **Verification model**:
  - If the domain isn't claimed elsewhere on Vercel: a CNAME / A-record pointing to Vercel is sufficient → `verified: true` immediately on add.
  - If the domain *is* already on another Vercel account: TXT record challenge returned in `verification[]` (`{type:'TXT', domain, value, reason}`). User must add it, then we POST `/verify`.
- **Error codes worth handling**:
  - `400` — invalid domain string, redirect-loop, etc.
  - `402` — payment method missing (only if exceeding plan limits)
  - `403` — token lacks scope, or domain not allowed
  - `409` — domain already on this project, or owned-but-unverified by someone else

### DNS realities

- Propagation: 24–48 hours worst case (typically <1 hour for major resolvers).
- Each DNS label is capped at 63 chars (RFC 1035). Not relevant for `api.acme.com` style; relevant if we ever auto-generate wildcard subdomains with long names.
- For wildcards (`*.acme.com`) the user must point their *nameservers* to Vercel (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`). For single hostnames, a CNAME or A record is enough. v1 ships with single-hostname only.

---

## Architecture

### High-level request flow

```
GET https://api.acme.com/loan-calc/execute?users=10
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Vercel Edge Network                                             │
│  • TLS terminated using Let's Encrypt cert auto-issued for       │
│    api.acme.com                                                  │
│  • Routes request into our Next.js app, Host header preserved   │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ proxy.ts (already exists)                                       │
│  • Reads request.headers.get('host')                             │
│  • Canonical host (app.spreadapi.io)? → existing behaviour       │
│  • Custom host? → resolveCustomDomain(host)                      │
│      → { tenantId, slug → serviceId } from Redis                 │
│      → NextResponse.rewrite(/api/v1/services/{serviceId}/execute)│
│      → set request headers: x-spreadapi-domain, x-tenant-id     │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Existing /api/v1/services/[id]/execute route                    │
│   ↳ calculateDirect(serviceId, inputs, apiToken, options)        │
│  • Behaves identically to a canonical-domain call                 │
│  • Optional: rate-limits using x-tenant-id instead of just userId│
└─────────────────────────────────────────────────────────────────┘
```

The big architectural decision is that **custom domains are pure proxy/rewrite at the edge**. The `calculateDirect` engine and the rest of the pipeline never see a different shape of request. This keeps the change additive and the blast radius small.

### Two URL shapes the user can choose between

| Shape | Example | Effort | DX |
|---|---|---|---|
| **Path-preserving** (default) | `api.acme.com/api/v1/services/abc-123-uuid/execute` | low | weak — user still sees a UUID |
| **Slug-mapped** | `api.acme.com/loan-calc/execute` | medium | strong — opaque-looking own API |

We ship **both** — the path-preserving shape works automatically for any custom domain (since we're effectively a transparent proxy), and the slug-mapped shape is a per-service opt-in. This means a customer can add a domain without immediately defining slugs (instant value) and tighten the URLs over time.

For the slug shape, the custom-domain proxy rewrites:

```
GET /loan-calc/execute       → /api/v1/services/{lookup(loan-calc)}/execute
GET /loan-calc                → /api/v1/services/{lookup(loan-calc)}/execute   (alias)
GET /                         → /api/v1/services      (the customer's service catalog)
```

Slugs are scoped per **tenant**, not per domain. A tenant with multiple custom domains shares the same slug → service mapping; the same slug from different domains resolves to the same service. This matches the mental model "I publish APIs, I sometimes pin them to a domain".

### What we do *not* support in v1

- Wildcard subdomains (`*.acme.com`). Possible later — needs Vercel nameservers, which is a steeper onboarding step.
- Per-domain branded error pages.
- Per-domain rate-limit overrides.
- Domain ownership transfer between SpreadAPI accounts.
- Apex-vs-www redirect helper UI (do it manually via the Vercel dashboard if needed; can be exposed in v2).
- Custom SSL upload (Enterprise-only on Vercel; not in our plan tier yet).

---

## Data model

### New Redis keys

```
domain:{hostname}                     hash    Single-domain record. Keyed by lowercase hostname.
                                              Fields:
                                                tenantId         text   our internal tenant id (= ownerUserId today)
                                                ownerUserId      text   the user that added the domain
                                                status           text   pending_dns | verifying | active | error
                                                vercelDomain     text   echo from Vercel API (used for cleanup)
                                                verificationType text   TXT | CNAME | none
                                                verificationName text   what the user must add (e.g. _vercel)
                                                verificationValue text  value to put in the TXT/CNAME
                                                verifiedAt       int    epoch ms when active
                                                createdAt        int    epoch ms
                                                updatedAt        int    epoch ms
                                                lastError        text   last upstream error string (if any)
                                                lastErrorAt      int    epoch ms

tenant:{tenantId}:domains             set     Reverse index for listing a tenant's domains.

tenant:{tenantId}:slug:{slug}         text    Per-tenant slug → serviceId map. Lowercase slug only.

service:{serviceId}:slug              text    Reverse map for the slug live on this service (one current slug, plus aliases stored in :slug:aliases).

service:{serviceId}:slug:aliases      set     Optional aliases for backward-compat after a slug rename.
```

The proxy reads `domain:{hostname}` once per request (with a process-cache layer, see below). The slug lookup is a single Redis `GET` after the host lookup.

### Caching

We already have a process-level cache pattern in `getApiDefinition()` (TTL 10 min, per-instance Map). Custom-domain lookups follow the same template:

- `lib/customDomains.ts` exports `resolveDomain(host)` → `{ tenantId, slug → serviceId } | null`.
- Process-cache hit: <1 ms.
- Process-cache miss → Redis `HGETALL domain:{host}` + `GET tenant:{tenantId}:slug:{slug}` (when a slug path is in play).
- Cache TTL 10 min — same as getApiDefinition. Invalidations on domain delete and slug change are explicit (`cache.delete`).

Negative caching: a request to an unknown host is a likely scan / mistake / DNS misconfiguration. We cache misses for 60 s to absorb scanners cheaply.

### Tenant model

`tenantId` already exists in the codebase (`service:{id}.tenantId`, `tenant:{id}` analytics hash). Today it's set during publish to `userId || 'default'` (see `lib/publishService.js:100`). We **reuse** this as the domain owner. No new tenant primitive needed.

The reverse: a tenant can own multiple domains, a domain belongs to exactly one tenant. Enforced at write time (the add-domain endpoint refuses if the host is already in `domain:{host}` under a different tenantId).

---

## Vercel SDK integration

### Wrapper module

`lib/vercel.ts` (new):

```ts
import { VercelCore } from '@vercel/sdk/core.js';
import { projectsAddProjectDomain } from '@vercel/sdk/funcs/projectsAddProjectDomain.js';
import { projectsGetProjectDomain } from '@vercel/sdk/funcs/projectsGetProjectDomain.js';
import { projectsVerifyProjectDomain } from '@vercel/sdk/funcs/projectsVerifyProjectDomain.js';
import { projectsRemoveProjectDomain } from '@vercel/sdk/funcs/projectsRemoveProjectDomain.js';
import { domainsDeleteDomain } from '@vercel/sdk/funcs/domainsDeleteDomain.js';

const vercel = new VercelCore({ bearerToken: process.env.VERCEL_TOKEN! });
const projectId = process.env.VERCEL_PROJECT_ID!;
const teamId = process.env.VERCEL_TEAM_ID!;

export async function vercelAddDomain(domain: string) {
  return projectsAddProjectDomain(vercel, {
    idOrName: projectId,
    teamId,
    requestBody: { name: domain },
  });
}

export async function vercelDomainStatus(domain: string) {
  return projectsGetProjectDomain(vercel, { idOrName: projectId, teamId, domain });
}

export async function vercelVerifyDomain(domain: string) {
  return projectsVerifyProjectDomain(vercel, { idOrName: projectId, teamId, domain });
}

export async function vercelRemoveDomain(domain: string) {
  // Two calls per Vercel docs: detach from project, then remove from account
  await projectsRemoveProjectDomain(vercel, { idOrName: projectId, teamId, domain });
  await domainsDeleteDomain(vercel, { domain }).catch(() => {/* ignore */});
}
```

### Env vars

```
VERCEL_TOKEN=             # Vercel personal/team token with project:write
VERCEL_PROJECT_ID=        # the SpreadAPI Vercel project id (prj_xxx)
VERCEL_TEAM_ID=           # Vercel team id (team_xxx)
NEXT_PUBLIC_CANONICAL_HOST=app.spreadapi.io   # used by proxy to detect "is this a custom domain?"
```

### Rate-limit handling

Vercel allows 100 add/h, 50 verify/h, 100 remove/h *per team*. We need:

1. A small in-process bucket (`lib/vercelRateLimit.ts`) that returns "too soon, queue for X seconds" when the bucket is empty.
2. The HTTP routes that hit Vercel propagate `Retry-After` to the client when rate-limited.
3. A periodic background re-verifier (cron at `/api/cron/verify-pending-domains`, every 5 min) that picks up `status=pending_dns` domains added more than 60 s ago and calls `vercelDomainStatus` + `vercelVerifyDomain` to advance their state. Bound this loop so a flood of pending domains doesn't burn the verify budget.

---

## Code changes — file inventory

### New files

| Path | Purpose |
|---|---|
| `lib/vercel.ts` | Typed wrappers around the Vercel Domains SDK calls. |
| `lib/customDomains.ts` | Redis CRUD for `domain:*`, `tenant:*:domains`, slug maps. Exports `resolveDomain(host)` (with process cache) for proxy use. |
| `lib/vercelRateLimit.ts` | Small token-bucket against Vercel's per-team API limits. |
| `app/api/domains/route.ts` | `GET` (list current user's domains) + `POST` (add a domain — adds to Vercel + Redis, returns verification challenge). |
| `app/api/domains/[host]/route.ts` | `GET` (status incl. live Vercel poll) + `DELETE` (detach + remove from Vercel + clear Redis). |
| `app/api/domains/[host]/verify/route.ts` | `POST` — manually re-trigger verification. |
| `app/api/services/[id]/slug/route.ts` | `GET`/`PUT` — get/set the per-tenant slug for a service. Validates slug format and uniqueness. |
| `app/api/cron/verify-pending-domains/route.ts` | Vercel Cron entrypoint — picks up pending domains, advances their state. Cron schedule: `*/5 * * * *`. |
| `app/(app)/app/settings/domains/page.tsx` | Settings UI — list, add, verify-instructions, remove, slug-management. |
| `app/(app)/app/settings/domains/components/AddDomainModal.tsx` | Inline modal for the add-domain flow. |
| `app/(app)/app/settings/domains/components/DnsInstructions.tsx` | The "set this CNAME / TXT" panel with copy-to-clipboard. |

### Modified files

| Path | Change |
|---|---|
| `proxy.ts` | Inspect Host header at the top. If non-canonical: call `resolveDomain()`, set `x-spreadapi-domain` + `x-tenant-id` request headers, optionally `NextResponse.rewrite()` from `/{slug}/...` to `/api/v1/services/{id}/...`. The matcher gets a top-level `'/((?!api|_next|fonts|favicon\\.ico).*)'` entry so root paths reach us — for the canonical host this is a no-op shortcut. |
| `app/api/v1/services/[id]/execute/route.ts` | If `x-tenant-id` is present (i.e. came via custom domain), use it for analytics aggregation in `logCalls()`. No semantic change to the calculation. |
| `app/api/v1/services/[id]/execute/calculateDirect.js` | Optional: a per-tenant rate limit hook that reads the new header. Out of scope for v1. |
| `app/(app)/app/settings/page.tsx` | New "Custom domains" tile linking to the new sub-page. |
| `package.json` | Add `@vercel/sdk` (latest stable). |
| `vercel.json` (or `next.config.ts`) | Cron entry for verify-pending-domains. |
| `.env.example` | Document the four new env vars. |

### Code-impact summary

- **Backend**: ~600 LOC across 7 new files + ~80 LOC of changes in proxy.ts.
- **Frontend**: one settings page, one modal, ~400 LOC.
- **No changes to**: `calculateDirect.js` engine, fetchDataSource, MCP, OAuth, Hanko, the SpreadJS path. Custom domains are an edge concern.

---

## Build sequence

The phases are deliberately small and reversible. Each one ends with a working state.

### v1.0 — Single-domain MVP (3 days)

**Scope:** A Pro user can add `api.acme.com` via Settings, get DNS instructions, and once propagated their existing `/api/v1/services/{id}/execute` URLs work on that domain. **No slug rewriting yet.**

- `lib/vercel.ts` + env vars + smoke test against a sandbox project.
- `lib/customDomains.ts` (CRUD only; no slug logic).
- `app/api/domains` routes (GET / POST / DELETE).
- `proxy.ts` — host inspection + non-canonical-host short-circuit. Just sets `x-tenant-id`; no rewrite (the path is already `/api/v1/services/...`).
- Settings UI — list + add + remove + DNS instructions panel.

**Done when:** a domain can be added, DNS is verified by Vercel, the service responds on the custom domain, and removing the domain unlinks it both client-side and Vercel-side.

### v1.1 — Slug-mapped URLs (2 days)

**Scope:** User can give a service a slug (`loan-calc`) per tenant. URLs become `api.acme.com/loan-calc/execute`.

- `app/api/services/[id]/slug/route.ts` (PUT validates format, GET returns current).
- `proxy.ts` rewrite: `/{slug}` and `/{slug}/{action}` → `/api/v1/services/{serviceId}/{action || 'execute'}`.
- Settings: per-service slug editor inline in the service card.
- Backwards compatibility: alias set keeps old slugs resolving for 90 days after rename.

**Done when:** `curl https://api.acme.com/loan-calc/execute?users=10` returns the same response as the canonical UUID URL.

### v1.2 — Verification UX polish (1 day)

**Scope:** Robust UX around pending verification.

- Background poller (Vercel Cron) re-checks pending domains every 5 min.
- Settings page surfaces real-time status with a manual "Re-check now" button.
- Helpful error states ("DNS not propagated yet — please wait", "Domain owned by another Vercel account — add this TXT record", "Vercel says this domain is invalid").
- Rate-limit handling on the API routes.

**Done when:** a domain stuck in `pending_dns` for >5 min auto-advances to `active` once DNS resolves, without the user manually refreshing.

### v1.3 — Hardening (1 day)

- Domain-add abuse limits per tenant (e.g. 5 unverified domains pending at once).
- Slug uniqueness validation, reserved-words list (`api`, `admin`, `_next`, etc.).
- Audit log entries for add / remove / verify (Redis stream).
- Tests against a Vercel sandbox project.

### Total: ~7 days for a fully polished feature, ~3 days for a working MVP.

---

## Security & abuse considerations

### Domain-hijack prevention

Vercel handles cross-project ownership challenges automatically — if the domain is already on another Vercel project, our `add` call returns `verified: false` plus a TXT challenge. The user must own the domain to add the TXT record. We surface this clearly in the UI; the domain stays in `status: pending` until the user verifies it.

### Spoofing of "owned" domains

Cannot happen — the domain only becomes `active` once Vercel reports `verified: true`. Until then, requests to it don't hit our app at all (no certificate issued).

### Mass-add abuse

A bad-actor user could try to add hundreds of domains to:
- Burn our Vercel API rate-limit budget for everyone else.
- Prove the domain → us mapping for a domain they then resell or use for phishing.

**Mitigations:**
- Pro-only feature (license check).
- 5 unverified domains per tenant ceiling.
- Reject obvious patterns: TLDs we don't support, IP literals, `localhost`, our own canonical host.
- Vercel's TXT-record verification means even if added, the domain doesn't actually serve content unless the attacker controls it.

### Path/slug collision

User picks slug `app` — collides with the dashboard route on the canonical domain. **Solution:** slug rewriting only applies on **custom** hosts. `app.spreadapi.io/app` continues to work as before. On `api.acme.com/app/execute`, the proxy rewrites to the customer's service.

We still maintain a small reserved-slug list (`api`, `_next`, `health`, etc.) to avoid surprising the user later if we add features under those paths.

### Token leak via custom domain

The existing service-token model is unchanged — tokens travel in the Authorization header or `?token=` query param. They don't leak via the URL path. No CSRF concerns because there are no cookies on custom domains (Hanko cookies are scoped to `app.spreadapi.io`).

### Cleanup on cancellation

If a user downgrades from Pro → Free, what happens to their domains?
- Behavior: existing domains keep working for 30 days (grandfathered), with a banner in the settings page. After 30 days, scheduled removal via cron.
- Code: `tenant:{id}:downgradeAt` epoch ms → cron checks daily, removes if past grace.

### CORS

Custom-domain requests don't need cookies. The execute endpoint already sends permissive CORS (`Access-Control-Allow-Origin: *` for execute) so the JS embedding in customer pages works. No change.

---

## UX flow (settings page)

```
Settings → Custom domains
┌────────────────────────────────────────────────────────────────┐
│ Custom domains                              [+ Add a domain]   │
├────────────────────────────────────────────────────────────────┤
│ api.acme.com                          ● Active   [Edit] [✕]   │
│   Mapped slugs: loan-calc, mortgage                            │
├────────────────────────────────────────────────────────────────┤
│ data.acme.com                         ◐ Verifying TLS ...     │
│   This usually takes 1–2 minutes. We'll let you know.          │
├────────────────────────────────────────────────────────────────┤
│ test.acme.io                          ⚠ DNS not found yet     │
│   Add this CNAME at your DNS provider:                         │
│   ┌────────────────────────────────────────────────┐           │
│   │ Type:   CNAME                                   │           │
│   │ Host:   test                                    │           │
│   │ Target: cname.vercel-dns.com         [Copy]    │           │
│   └────────────────────────────────────────────────┘           │
│   [Re-check now]  [Remove]                                     │
└────────────────────────────────────────────────────────────────┘
```

The Add modal:
1. **Step 1**: input `api.acme.com`, validate format client-side.
2. **Step 2** (after submit): backend calls Vercel, returns `{verified, verification[]}`. UI shows DNS instructions (CNAME for unowned domain; TXT challenge for already-claimed-on-Vercel cases).
3. **Step 3**: status updates in real time (poll every 5 s for the first minute, then 30 s up to 10 min). Auto-closes modal on `active`.

Per-service slug field lives inline in the service card on `/app/services/{id}`:
```
┌──────────────────────────────────────────────┐
│ Loan Calculator                             │
│ Service ID: abc-123-uuid           [Copy]    │
│ Slug (custom domains): [ loan-calc      ]   │
│   Available on: api.acme.com/loan-calc       │
└──────────────────────────────────────────────┘
```

---

## Open questions to settle before shipping

1. **Slug uniqueness boundary** — per tenant (one tenant cannot have two services with the same slug; two tenants can both have `loan-calc`). Confirmed by architecture, but worth sanity-checking with the product side.

2. **Apex vs www** — do we need to add both `acme.com` and `www.acme.com` automatically, or leave that to the user? Recommendation: leave to user, document the redirect option in the help text.

3. **Self-service on Hobby/Free?** — Vercel's 50-domain Hobby cap means we'd run out fast. Recommendation: Pro-only feature.

4. **Slug reserved words** — minimal list (`api`, `admin`, `_next`, `health`, `health-check`, `assets`) or generous list? Conservative is safer; we can shrink later.

5. **Analytics view per domain** — show "calls per domain"? Easy to add since we already have per-tenant analytics. Defer to v2.

6. **Domain transfer between SpreadAPI accounts** — out of scope. The customer can remove + re-add on the new account; works since their DNS records don't change.

7. **Webhook on domain status change** — emit a Pusher event to update the settings UI in real time, or just rely on the polling? The polling is simple enough; webhooks can come later.

8. **Vercel project picker** — we hard-code `VERCEL_PROJECT_ID`. If we ever split into prod/staging projects, we need a per-environment env var. Already implicit (env vars differ per Vercel environment), so just document.

---

## File touch-list summary

| Path | v1.0 | v1.1 | v1.2 | v1.3 |
|---|---|---|---|---|
| `lib/vercel.ts` | new |  |  |  |
| `lib/customDomains.ts` | new | edit |  | edit |
| `lib/vercelRateLimit.ts` |  |  | new |  |
| `app/api/domains/route.ts` | new |  |  | edit |
| `app/api/domains/[host]/route.ts` | new |  | edit |  |
| `app/api/domains/[host]/verify/route.ts` |  |  | new |  |
| `app/api/services/[id]/slug/route.ts` |  | new |  | edit |
| `app/api/cron/verify-pending-domains/route.ts` |  |  | new |  |
| `app/(app)/app/settings/domains/page.tsx` | new | edit | edit |  |
| `app/(app)/app/settings/domains/components/*` | new |  | edit |  |
| `proxy.ts` | edit | edit |  |  |
| `app/api/v1/services/[id]/execute/route.ts` | edit |  |  |  |
| `vercel.json` |  |  | edit |  |
| `package.json` | edit |  |  |  |

---

## Why Vercel-only beats Cloudflare for SaaS for us

I evaluated Cloudflare for SaaS as an alternative. It's a great product, used by big SaaS players. For us, **today**, it loses on three axes:

1. **No new vendor**: we already have Vercel, the team knows it. Adding Cloudflare means a second control plane, a second pricing dimension, a second outage domain.
2. **Pricing curve**: Vercel includes "unlimited" custom domains in Pro at no per-domain markup. Cloudflare for SaaS starts billing per hostname above 100 free. Until we have thousands of custom domains, the included price wins.
3. **Latency / routing**: both serve via global anycast. There's no measurable difference at our scale.

The point at which Cloudflare for SaaS starts being interesting is when:
- We hit Vercel's per-team rate limits (50 verifications/hour) regularly. Unlikely until many thousands of customers.
- We want very fine-grained per-tenant cache rules at the edge that go beyond what Vercel gives us.
- We need a fallback origin / multi-cloud posture.

None of those apply to v1. **Vercel-only is the right call.**

---

## Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Vercel API outage during a customer add → leaves Redis and Vercel out of sync | low | Idempotent retries; Redis state is "pending" until Vercel confirms; we can reconcile via the cron poller. |
| Vercel rate-limit hit during a marketing-driven sign-up wave | medium | Token-bucket queue; graceful UI message "your domain is in queue, will be added in ~30 s". |
| User gives up before DNS propagates → orphan domain on Vercel project | medium | Cron sweeper removes domains in `status: pending_dns` for >7 days, with email notice at day 5. |
| User's other apps stop working because they accidentally deleted their CNAME elsewhere | low | Not our problem to fix, but DNS-instructions UI explicitly says "this CNAME goes on the api.* subdomain — your apex domain is unaffected". |
| Customer expects subdomain routing (`*.api.acme.com`) | low (v1) | Document as "coming later". v2 can add wildcards once we add the nameserver-handover flow. |

---

## Decision log (for the next reader)

| Date | Decision | Reason |
|---|---|---|
| 2026-04-25 | Vercel for Platforms (built-in custom domains), not Cloudflare for SaaS or self-hosted Caddy. | Cheapest, fastest, no vendor sprawl. |
| 2026-04-25 | Slug mapping per tenant, not per domain. | Mental model "I publish APIs, I attach domains". Slugs are stable across re-domaining. |
| 2026-04-25 | Both path-preserving (`/api/v1/services/{uuid}/execute`) and slug-mapped URLs supported on the same custom domain. | Instant value on add (no slug needed); polish over time. |
| 2026-04-25 | Pro-only feature. | Hobby plan caps at 50 domains across all projects, untenable. |
| 2026-04-25 | DataSource refresh webhook URL stays on `app.spreadapi.io`, not the customer's custom domain. | Webhook tokens are per-source secrets, not for branding. Keeping them on canonical avoids needing to re-issue when a domain changes. |
| 2026-04-25 | No wildcards in v1. | Saves having to ask the customer to repoint nameservers; can add in v2. |

---

## Quick numbers (Vercel API budget)

At Vercel's per-team rate limit of 100 add/hour and 50 verify/hour, we can comfortably onboard:

- ~2 400 domain adds per day, sustained
- ~1 200 verifications per day, sustained
- Bursts are absorbed by Vercel's typical headroom; the published numbers are the *minimum* we can rely on.

For SpreadAPI's expected scale (low thousands of paying customers), we're orders of magnitude under the limits. The cron-based re-verifier is the only flow with risk of bursting (if many domains land in `pending_dns` simultaneously) — it's bounded by a `LIMIT 20` per tick and rate-limit-aware.

---

## What I would NOT do

- **Build our own ACME/Let's Encrypt integration.** Vercel does this. Time wasted, ongoing operational burden.
- **Run a Caddy proxy.** Same reason. Only relevant if we leave Vercel.
- **Try to support cookies / dashboard on custom domains.** Cookies don't span domains cleanly; the dashboard stays on the canonical host. Custom domains are API-only by design.
- **Auto-buy domains for users.** Out of scope; users come with a domain they already own.
- **Re-architect the tenant model.** The existing `tenantId` field, derived from `userId`, is sufficient. Don't introduce a new "Organization" primitive just for this feature.

---

**Next concrete step if greenlit:** create `feature/custom-domains` branch off `main`, install `@vercel/sdk`, wire up env vars + a sandbox Vercel project, and ship v1.0.
