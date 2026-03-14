import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import redis from '@/lib/redis';

// --- Auth helpers (shared with parent admin route) ---

const DEFAULT_ADMIN_EMAILS = ['s.methner@mac.com', 'stephan@airrange.io'];

function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS;
  if (envEmails) return envEmails.split(',').map(e => e.trim().toLowerCase());
  return DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase());
}

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL!;

function isLocalhostRequest(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  return (
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('::1') ||
    forwardedHost.startsWith('localhost') || forwardedHost.startsWith('127.0.0.1') ||
    forwardedFor.startsWith('127.0.0.1') || forwardedFor.startsWith('::1')
  );
}

async function getAuthenticatedUserEmail(request: NextRequest): Promise<string | null> {
  try {
    const hanko = request.cookies.get('hanko')?.value;
    if (!hanko) return null;
    const JWKS = createRemoteJWKSet(new URL(`${hankoApiUrl}/.well-known/jwks.json`));
    const verifiedJWT = await jwtVerify(hanko, JWKS);
    const userId = verifiedJWT.payload.sub as string;
    const email = await redis.hGet(`user:${userId}`, 'email');
    return email ? String(email).toLowerCase() : null;
  } catch {
    return null;
  }
}

async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const adminEmails = getAdminEmails();
  const isDev = process.env.NODE_ENV !== 'production';
  const isLocalhost = isLocalhostRequest(request);
  if (isDev && isLocalhost) return null;
  const userEmail = await getAuthenticatedUserEmail(request);
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!adminEmails.includes(userEmail)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

// --- Types ---

interface OrphanIssue {
  key: string;
  type: 'orphan_service' | 'orphan_published' | 'orphan_analytics' | 'orphan_cache' |
        'orphan_token' | 'orphan_token_hash' | 'stale_user_index' | 'orphan_mcp_state' |
        'orphan_mcp_token' | 'orphan_tenant' | 'unknown_key';
  reason: string;
  size?: number; // estimated memory in bytes
  safe_to_delete: boolean;
}

interface CategoryBreakdown {
  total: number;
  valid: number;
  issues: number;
}

interface CleanupReport {
  scanned_keys: number;
  valid_keys: number;
  issues: OrphanIssue[];
  summary: Record<string, number>;
  categories: Record<string, CategoryBreakdown>;
  entity_counts: {
    users_in_index: number;
    valid_users: number;
    services_in_indexes: number;
    valid_services: number;
    valid_tokens: number;
  };
  scan_duration_ms: number;
}

// --- Known key patterns ---

const KNOWN_PATTERNS = [
  'user:', 'users:index', 'service:', 'token:', 'oauth:', 'rate_limit:',
  'ratelimit:', 'mcp:', 'tenant:', 'warming:', 'stripe:', 'pusher:', 'calls:'
];

function isKnownKey(key: string): boolean {
  return KNOWN_PATTERNS.some(p => key.startsWith(p));
}

// --- Scan endpoint (GET = analyze, POST = delete) ---

/**
 * GET /api/admin/cleanup — Scan Redis and report orphaned keys
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const startTime = Date.now();

  try {
    const issues: OrphanIssue[] = [];

    // Step 1: Build sets of valid entities
    const validUserIds = new Set<string>();
    const validServiceIds = new Set<string>();
    const validTokenIds = new Set<string>();

    // Get all user IDs from index
    const userIdsRaw = await redis.sMembers('users:index');
    for (const uid of userIdsRaw) {
      const userId = String(uid);
      // Verify user actually exists (not just in index)
      const userData = await redis.hGetAll(`user:${userId}`);
      if (userData && Object.keys(userData).length > 0) {
        validUserIds.add(userId);
      } else {
        // Check if this empty user still has services or related keys
        const userServices = await redis.hGetAll(`user:${userId}:services`);
        const serviceIds = userServices ? Object.keys(userServices) : [];
        const activeServices: { id: string; name: string; calls: number }[] = [];
        for (const sid of serviceIds) {
          const sData = await redis.hGetAll(`service:${sid}`) as unknown as Record<string, string>;
          if (sData && Object.keys(sData).length > 0) {
            const totalCalls = await redis.hGet(`service:${sid}:analytics`, 'total');
            activeServices.push({
              id: sid,
              name: sData.name || '(unnamed)',
              calls: totalCalls ? parseInt(String(totalCalls), 10) : 0,
            });
          }
        }

        // Also check for user sub-keys (activity, etc.)
        const hasActivityKey = await redis.exists(`user:${userId}:activity`);
        const hasServicesKey = await redis.exists(`user:${userId}:services`);

        if (activeServices.length > 0) {
          const svcSummary = activeServices.map(s => `${s.name} (${s.id}, ${s.calls} calls)`).join('; ');
          issues.push({
            key: `users:index member "${userId}"`,
            type: 'stale_user_index',
            reason: `User hash empty but has ${activeServices.length} active service(s): ${svcSummary}`,
            safe_to_delete: false
          });
        } else {
          const extraKeys = [
            hasServicesKey ? 'services index' : null,
            hasActivityKey ? 'activity log' : null,
          ].filter(Boolean);
          issues.push({
            key: `users:index member "${userId}"`,
            type: 'stale_user_index',
            reason: `User hash empty, no active services${extraKeys.length > 0 ? ` (has orphaned: ${extraKeys.join(', ')})` : ''}`,
            safe_to_delete: true
          });
        }
      }
    }

    // Get all service IDs from user indexes
    for (const userId of validUserIds) {
      const services = await redis.hGetAll(`user:${userId}:services`);
      if (services) {
        for (const serviceId of Object.keys(services)) {
          // Verify the service hash actually exists
          const serviceData = await redis.hGetAll(`service:${serviceId}`);
          if (serviceData && Object.keys(serviceData).length > 0) {
            validServiceIds.add(serviceId);
          } else {
            issues.push({
              key: `user:${userId}:services field "${serviceId}"`,
              type: 'stale_user_index',
              reason: `Service ${serviceId} listed in user index but service:${serviceId} hash is missing`,
              safe_to_delete: true
            });
          }
        }
      }
    }

    // Step 2: Scan ALL keys and cross-reference
    let scannedKeys = 0;
    let validKeys = 0;
    const categories: Record<string, CategoryBreakdown> = {
      user: { total: 0, valid: 0, issues: 0 },
      service: { total: 0, valid: 0, issues: 0 },
      token: { total: 0, valid: 0, issues: 0 },
      oauth: { total: 0, valid: 0, issues: 0 },
      mcp: { total: 0, valid: 0, issues: 0 },
      tenant: { total: 0, valid: 0, issues: 0 },
      calls: { total: 0, valid: 0, issues: 0 },
      other: { total: 0, valid: 0, issues: 0 },
    };

    // Manual SCAN loop (scanIterator can stop early on some Redis servers)
    let cursor: string | number = '0';
    const allKeys: string[] = [];
    do {
      const result = await redis.scan(String(cursor), { MATCH: '*', COUNT: 500 });
      cursor = String(result.cursor);
      allKeys.push(...result.keys.map(k => String(k)));
    } while (String(cursor) !== '0');

    for (const k of allKeys) {
      scannedKeys++;

      // Skip known auto-TTL keys (rate limiting, pusher debounce)
      if (k.startsWith('rate_limit:') || k.startsWith('ratelimit:') || k.startsWith('pusher:')) {
        categories.other.total++;
        categories.other.valid++;
        validKeys++;
        continue;
      }

      // Skip global singletons
      if (k === 'users:index' || k === 'warming:lock' || k === 'stripe:pending-upgrades') {
        categories.other.total++;
        categories.other.valid++;
        validKeys++;
        continue;
      }

      // --- User keys ---
      if (k.startsWith('user:')) {
        categories.user.total++;
        const match = k.match(/^user:([^:]+)(?::(.+))?$/);
        if (match) {
          const userId = match[1];
          const suffix = match[2]; // services, activity, etc.
          if (validUserIds.has(userId)) {
            categories.user.valid++;
            validKeys++;
          } else {
            categories.user.issues++;
            issues.push({
              key: k,
              type: 'stale_user_index',
              reason: `User ${userId} not found in valid users set${suffix ? ` (sub-key: ${suffix})` : ''}`,
              safe_to_delete: true
            });
          }
        }
        continue;
      }

      // --- Service keys ---
      if (k.startsWith('service:')) {
        categories.service.total++;
        const match = k.match(/^service:([^:]+)(?::(.+))?$/);
        if (match) {
          const serviceId = match[1];
          const suffix = match[2]; // published, analytics, cache:*, tokens, etc.

          if (!suffix) {
            // Base service hash - check if it belongs to a valid user
            const serviceData = await redis.hGetAll(k) as unknown as Record<string, string>;
            const ownerUserId = serviceData?.userId ? String(serviceData.userId) : null;
            if (ownerUserId && !validUserIds.has(ownerUserId)) {
              categories.service.issues++;
              issues.push({
                key: k,
                type: 'orphan_service',
                reason: `Service owned by user ${ownerUserId} who no longer exists`,
                safe_to_delete: false // needs manual review - service might have active API users
              });
            } else {
              validServiceIds.add(serviceId); // also add services found by scan
              categories.service.valid++;
              validKeys++;
            }
          } else if (validServiceIds.has(serviceId)) {
            categories.service.valid++;
            validKeys++;
          } else {
            // Sub-key for a service that doesn't exist
            categories.service.issues++;
            let type: OrphanIssue['type'] = 'orphan_service';
            if (suffix === 'published') type = 'orphan_published';
            else if (suffix === 'analytics') type = 'orphan_analytics';
            else if (suffix.startsWith('cache:')) type = 'orphan_cache';

            issues.push({
              key: k,
              type,
              reason: `Service ${serviceId} not found in any user's service index`,
              safe_to_delete: suffix.startsWith('cache:') || suffix === 'analytics'
            });
          }
        }
        continue;
      }

      // --- Token keys ---
      if (k.startsWith('token:')) {
        categories.token.total++;
        const hashMatch = k.match(/^token:hash:(.+)$/);
        if (hashMatch) {
          // token:hash:{hash} → lookup tokenId, then check service
          const tokenId = await redis.get(k);
          if (tokenId) {
            const tokenData = await redis.hGetAll(`token:${tokenId}`) as unknown as Record<string, string>;
            const serviceId = tokenData?.serviceId ? String(tokenData.serviceId) : null;
            if (serviceId && !validServiceIds.has(serviceId)) {
              categories.token.issues++;
              issues.push({
                key: k,
                type: 'orphan_token_hash',
                reason: `Token hash lookup for token ${tokenId} references deleted service ${serviceId}`,
                safe_to_delete: true
              });
            } else {
              categories.token.valid++;
              validKeys++;
              validTokenIds.add(String(tokenId));
            }
          } else {
            categories.token.issues++;
            issues.push({
              key: k,
              type: 'orphan_token_hash',
              reason: 'Token hash key has no value (dangling lookup)',
              safe_to_delete: true
            });
          }
          continue;
        }

        const tokenMatch = k.match(/^token:([^:]+)$/);
        if (tokenMatch) {
          const tokenId = tokenMatch[1];
          const tokenData = await redis.hGetAll(k) as unknown as Record<string, string>;
          const serviceId = tokenData?.serviceId ? String(tokenData.serviceId) : null;
          if (serviceId && !validServiceIds.has(serviceId)) {
            categories.token.issues++;
            issues.push({
              key: k,
              type: 'orphan_token',
              reason: `Token ${tokenId} references deleted service ${serviceId}`,
              safe_to_delete: true
            });
          } else {
            categories.token.valid++;
            validKeys++;
            validTokenIds.add(tokenId);
          }
        }
        continue;
      }

      // --- OAuth keys ---
      if (k.startsWith('oauth:')) {
        categories.oauth.total++;
        // Check if they have TTL
        const ttl = await redis.ttl(k);
        if (ttl === -1) {
          // No TTL — should have one
          categories.oauth.issues++;
          issues.push({
            key: k,
            type: 'unknown_key',
            reason: 'OAuth key without TTL (should auto-expire)',
            safe_to_delete: true
          });
        } else {
          categories.oauth.valid++;
          validKeys++;
        }
        continue;
      }

      // --- MCP keys ---
      if (k.startsWith('mcp:')) {
        categories.mcp.total++;
        const stateMatch = k.match(/^mcp:state:([^:]+):(.+)$/);
        const indexMatch = k.match(/^mcp:state:index:(.+)$/);
        const userTokenMatch = k.match(/^mcp:user:([^:]+):tokens$/);
        const tokenMatch = k.match(/^mcp:token:(.+)$/);
        const sessionMatch = k.match(/^mcp:session:(.+)$/);

        if (indexMatch) {
          const userId = indexMatch[1];
          if (!validUserIds.has(userId)) {
            categories.mcp.issues++;
            issues.push({
              key: k,
              type: 'orphan_mcp_state',
              reason: `MCP state index for deleted user ${userId}`,
              safe_to_delete: true
            });
          } else { categories.mcp.valid++; validKeys++; }
        } else if (stateMatch) {
          const userId = stateMatch[1];
          if (!validUserIds.has(userId)) {
            categories.mcp.issues++;
            issues.push({
              key: k,
              type: 'orphan_mcp_state',
              reason: `MCP state for deleted user ${userId}`,
              safe_to_delete: true
            });
          } else { categories.mcp.valid++; validKeys++; }
        } else if (userTokenMatch) {
          const userId = userTokenMatch[1];
          if (!validUserIds.has(userId)) {
            categories.mcp.issues++;
            issues.push({
              key: k,
              type: 'orphan_mcp_token',
              reason: `MCP token set for deleted user ${userId}`,
              safe_to_delete: true
            });
          } else { categories.mcp.valid++; validKeys++; }
        } else if (tokenMatch) {
          // MCP token — check if the user still exists
          const tokenData = await redis.hGetAll(k) as unknown as Record<string, string>;
          const userId = tokenData?.user_id ? String(tokenData.user_id) : null;
          if (userId && !validUserIds.has(userId)) {
            categories.mcp.issues++;
            issues.push({
              key: k,
              type: 'orphan_mcp_token',
              reason: `MCP token for deleted user ${userId}`,
              safe_to_delete: true
            });
          } else { categories.mcp.valid++; validKeys++; }
        } else if (sessionMatch) {
          const ttl = await redis.ttl(k);
          if (ttl === -1) {
            categories.mcp.issues++;
            issues.push({
              key: k,
              type: 'orphan_mcp_state',
              reason: 'MCP session without TTL',
              safe_to_delete: true
            });
          } else { categories.mcp.valid++; validKeys++; }
        } else {
          categories.mcp.valid++;
          validKeys++;
        }
        continue;
      }

      // --- Tenant keys ---
      if (k.startsWith('tenant:')) {
        categories.tenant.total++;
        const tenantMatch = k.match(/^tenant:(.+)$/);
        if (tenantMatch) {
          const tenantId = tenantMatch[1];
          // Tenant ID is usually a userId
          if (!validUserIds.has(tenantId)) {
            categories.tenant.issues++;
            issues.push({
              key: k,
              type: 'orphan_tenant',
              reason: `Tenant ${tenantId} not found as a valid user`,
              safe_to_delete: true
            });
          } else { categories.tenant.valid++; validKeys++; }
        }
        continue;
      }

      // --- Calls tracking keys ---
      if (k.startsWith('calls:')) {
        categories.calls.total++;
        // calls:{date}:token:{tokenId} — check if token exists
        const callMatch = k.match(/^calls:[^:]+:token:(.+)$/);
        if (callMatch && !validTokenIds.has(callMatch[1])) {
          categories.calls.issues++;
          issues.push({
            key: k,
            type: 'orphan_token',
            reason: `Call tracking for unknown token ${callMatch[1]}`,
            safe_to_delete: true
          });
        } else { categories.calls.valid++; validKeys++; }
        continue;
      }

      // --- Unknown keys ---
      categories.other.total++;
      if (!isKnownKey(k)) {
        categories.other.issues++;
        issues.push({
          key: k,
          type: 'unknown_key',
          reason: 'Key does not match any known pattern',
          safe_to_delete: false
        });
      } else {
        categories.other.valid++;
        validKeys++;
      }
    }

    // Step 3: Build summary
    const summary: Record<string, number> = {};
    for (const issue of issues) {
      summary[issue.type] = (summary[issue.type] || 0) + 1;
    }

    const report: CleanupReport = {
      scanned_keys: scannedKeys,
      valid_keys: validKeys,
      issues,
      summary,
      categories,
      entity_counts: {
        users_in_index: userIdsRaw.length,
        valid_users: validUserIds.size,
        services_in_indexes: validServiceIds.size,
        valid_services: validServiceIds.size,
        valid_tokens: validTokenIds.size,
      },
      scan_duration_ms: Date.now() - startTime
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Redis cleanup scan error:', error);
    return NextResponse.json({ error: `Scan failed: ${error.message}` }, { status: 500 });
  }
}

/**
 * POST /api/admin/cleanup — Delete selected orphaned keys
 * Body: { keys: string[] }
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { keys, stale_index_entries } = body;

    const results: { key: string; deleted: boolean; error?: string }[] = [];

    // Delete orphaned keys
    if (keys && Array.isArray(keys)) {
      for (const key of keys) {
        try {
          await redis.del(key);
          results.push({ key, deleted: true });
        } catch (err: any) {
          results.push({ key, deleted: false, error: err.message });
        }
      }
    }

    // Clean stale user index entries
    if (stale_index_entries && Array.isArray(stale_index_entries)) {
      for (const entry of stale_index_entries) {
        try {
          if (entry.type === 'users_index') {
            // Remove user ID from users:index set
            await redis.sRem('users:index', entry.value);
            results.push({ key: `users:index:${entry.value}`, deleted: true });
          } else if (entry.type === 'user_services') {
            // Remove service ID from user:{userId}:services hash
            await redis.hDel(`user:${entry.userId}:services`, entry.value);
            results.push({ key: `user:${entry.userId}:services:${entry.value}`, deleted: true });
          }
        } catch (err: any) {
          results.push({ key: `index:${entry.value}`, deleted: false, error: err.message });
        }
      }
    }

    const deletedCount = results.filter(r => r.deleted).length;
    const failedCount = results.filter(r => !r.deleted).length;

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      failed: failedCount,
      results
    });
  } catch (error: any) {
    console.error('Redis cleanup delete error:', error);
    return NextResponse.json({ error: `Cleanup failed: ${error.message}` }, { status: 500 });
  }
}
