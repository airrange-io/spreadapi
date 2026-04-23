import { NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { cookies } from 'next/headers';
import {
  deleteDataSource,
  getMeta,
  setRows,
  recordRefresh,
  invalidateResultCache,
} from '@/lib/dataSourceRows';

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;
const JWKS = hankoApiUrl
  ? createRemoteJWKSet(new URL(`${hankoApiUrl}/.well-known/jwks.json`))
  : null;

async function verifyAuth(request) {
  try {
    const proxyUserId = request.headers.get('x-user-id');
    if (proxyUserId) return proxyUserId;
    if (!JWKS) return null;
    const cookieStore = await cookies();
    const hanko = cookieStore.get('hanko')?.value;
    if (!hanko) return null;
    const verified = await jwtVerify(hanko, JWKS);
    return verified.payload.sub || null;
  } catch {
    return null;
  }
}

// DELETE /api/datasource/:serviceId/:sourceId
// Cleans up the rows + meta + lock for a removed data source. Called by the
// editor UI after a user deletes a source. Auth via Hanko session — the caller
// is the logged-in editor, not the webhook caller.
export async function DELETE(request, { params }) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { serviceId, sourceId } = await params;
  if (!serviceId || !sourceId) {
    return NextResponse.json({ ok: false, error: 'Missing params' }, { status: 400 });
  }
  try {
    await deleteDataSource(serviceId, sourceId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE datasource]', serviceId, sourceId, e);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

// GET /api/datasource/:serviceId/:sourceId
// Returns meta info about a single data source's rows (row count, last
// refresh, last error). Used by the UI to show "Last refreshed: ..." chips.
export async function GET(request, { params }) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { serviceId, sourceId } = await params;
  if (!serviceId || !sourceId) {
    return NextResponse.json({ ok: false, error: 'Missing params' }, { status: 400 });
  }
  const meta = await getMeta(serviceId, sourceId);
  return NextResponse.json({ ok: true, meta });
}

// POST /api/datasource/:serviceId/:sourceId
// Hanko-authed seed endpoint. Writes rows straight into the Redis rows key.
// Used by the editor when a new data source is created — the push can run
// before the user clicks the top-bar Save button, so the definition isn't
// in Redis yet (the token-based webhook endpoint would 404). This endpoint
// relies on Hanko session auth instead.
//
// Body: either a bare JSON array of rows or { rows: [...] }.
const MAX_SEED_BYTES = 10 * 1024 * 1024;
export async function POST(request, { params }) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { serviceId, sourceId } = await params;
  if (!serviceId || !sourceId) {
    return NextResponse.json({ ok: false, error: 'Missing params' }, { status: 400 });
  }

  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_SEED_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Seed payload exceeds ${MAX_SEED_BYTES} bytes` },
      { status: 413 },
    );
  }

  let body;
  try { body = await request.json(); }
  catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  let rows;
  if (Array.isArray(body)) rows = body;
  else if (body && Array.isArray(body.rows)) rows = body.rows;
  else {
    return NextResponse.json(
      { ok: false, error: 'Body must be an array of rows or { rows: [...] }' },
      { status: 400 },
    );
  }

  try {
    const bytes = await setRows(serviceId, sourceId, rows);
    await recordRefresh(serviceId, sourceId, {
      rowCount: rows.length,
      bytes,
      refreshedBy: `editor:${userId}`,
    });
    await invalidateResultCache(serviceId);
    return NextResponse.json({
      ok: true,
      rowCount: rows.length,
      bytes,
      refreshedAt: Date.now(),
    });
  } catch (e) {
    console.error('[POST datasource seed]', serviceId, sourceId, e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Internal error' },
      { status: 500 },
    );
  }
}
