import { NextResponse } from 'next/server';
import crypto from 'crypto';
import redis from '@/lib/redis';
import { fetchDataSource } from '@/lib/fetchDataSource';
import {
  setRows,
  recordRefresh,
  recordRefreshError,
  acquireRefreshLock,
  releaseRefreshLock,
  invalidateResultCache,
} from '@/lib/dataSourceRows';
import { checkRateLimit } from '@/lib/rateLimit';

export const maxDuration = 30;

// 10 MB to match the internal per-source Redis cap (lib/dataSourceRows.js).
// Raising from the earlier 5 MB so the editor's "All (10 000 rows)" preview
// seed always fits without needing a separate seed endpoint.
const MAX_PUSH_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_ROWS = 5000;

const REFRESH_RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyPrefix: 'ratelimit:ds-refresh',
};

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Load the service's dataSources from Redis, find the one matching sourceId.
// Checks BOTH the draft (service:X) and published (service:X:published) hashes.
// Drafts must work too — the editor seeds Redis on save before publish.
// Token-only auth means this is safe regardless of publish state.
async function loadDataSource(serviceId, sourceId) {
  const [draftRaw, publishedRaw] = await Promise.all([
    redis.hGet(`service:${serviceId}`, 'dataSources'),
    redis.hGet(`service:${serviceId}:published`, 'dataSources'),
  ]);

  const dataSourcesRaw = draftRaw || publishedRaw;
  if (!dataSourcesRaw) return { error: 'data source not found', status: 404 };

  let list;
  try { list = JSON.parse(dataSourcesRaw); }
  catch { return { error: 'corrupt dataSources config', status: 500 }; }

  const def = Array.isArray(list) ? list.find((d) => d && d.id === sourceId) : null;
  if (!def) return { error: 'data source not found', status: 404 };
  return { def };
}

export async function POST(request, { params }) {
  const t0 = Date.now();
  const { serviceId, sourceId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 401 });
  }

  // Rate limit per-token, not per-service — prevents stolen-token abuse
  const rl = await checkRateLimit(`token:${token.slice(0, 16)}`, REFRESH_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } },
    );
  }

  const loaded = await loadDataSource(serviceId, sourceId);
  if (loaded.error) {
    return NextResponse.json({ ok: false, error: loaded.error }, { status: loaded.status });
  }
  const { def } = loaded;

  if (!def.webhookToken || !constantTimeEqual(def.webhookToken, token)) {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }

  const gotLock = await acquireRefreshLock(serviceId, sourceId);
  if (!gotLock) {
    return NextResponse.json(
      { ok: false, error: 'A refresh is already in progress for this source' },
      { status: 409 },
    );
  }

  try {
    // Detect mode: push (body has rows), pull (body empty — fetch the URL)
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    const isPushMode = contentLength > 0;

    let rows;
    let totalRowsFetched;

    if (isPushMode) {
      if (contentLength > MAX_PUSH_BYTES) {
        await recordRefreshError(serviceId, sourceId, `Push payload too large (${contentLength} bytes)`);
        return NextResponse.json(
          { ok: false, error: `Push payload exceeds ${MAX_PUSH_BYTES} bytes` },
          { status: 413 },
        );
      }
      let body;
      try { body = await request.json(); }
      catch {
        await recordRefreshError(serviceId, sourceId, 'Push body is not valid JSON');
        return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
      }
      // Accept either a bare array or { rows: [...] }
      if (Array.isArray(body)) rows = body;
      else if (body && Array.isArray(body.rows)) rows = body.rows;
      else {
        await recordRefreshError(serviceId, sourceId, 'Push body must be an array or { rows: [...] }');
        return NextResponse.json(
          { ok: false, error: 'Body must be an array of rows or { rows: [...] }' },
          { status: 400 },
        );
      }
      totalRowsFetched = rows.length;
    } else {
      // Pull mode: re-fetch from the configured source URL
      const maxRows = def.maxRows || DEFAULT_MAX_ROWS;
      const result = await fetchDataSource(def.source, { maxRows });
      if (!result.ok) {
        await recordRefreshError(serviceId, sourceId, result.error);
        const statusByStage = { validate: 400, fetch: 502, parse: 422, path: 422 };
        return NextResponse.json(
          { ok: false, error: result.error, stage: result.stage },
          { status: statusByStage[result.stage] || 502 },
        );
      }
      rows = result.rows;
      totalRowsFetched = result.totalRowsFetched;
    }

    // Apply the maxRows cap in push mode too (defense in depth)
    const cap = def.maxRows || DEFAULT_MAX_ROWS;
    const capped = rows.length > cap ? rows.slice(0, cap) : rows;

    let bytes;
    try {
      bytes = await setRows(serviceId, sourceId, capped);
    } catch (e) {
      await recordRefreshError(serviceId, sourceId, e.message);
      return NextResponse.json({ ok: false, error: e.message }, { status: 413 });
    }

    await recordRefresh(serviceId, sourceId, {
      rowCount: capped.length,
      bytes,
      refreshedBy: isPushMode ? 'webhook-push' : 'webhook-pull',
    });

    await invalidateResultCache(serviceId);

    return NextResponse.json({
      ok: true,
      mode: isPushMode ? 'push' : 'pull',
      rowCount: capped.length,
      totalRowsFetched,
      bytes,
      cappedAt: capped.length < rows.length ? cap : null,
      refreshedAt: Date.now(),
      elapsedMs: Date.now() - t0,
    });
  } catch (e) {
    console.error('[datasource refresh]', serviceId, sourceId, e);
    await recordRefreshError(serviceId, sourceId, e.message || 'unknown error');
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  } finally {
    await releaseRefreshLock(serviceId, sourceId);
  }
}

// OPTIONS for CORS — third-party automation tools preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
