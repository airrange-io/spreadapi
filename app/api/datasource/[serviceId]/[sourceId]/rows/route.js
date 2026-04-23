import { NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { cookies } from 'next/headers';
import { getRows, getMeta } from '@/lib/dataSourceRows';

// Hanko-authed read endpoint for the editor. Returns the full rows currently
// stored in Redis for a given data source (capped by `limit` for UI-safety).
// NOT called by the runtime execute path — that reads via lib/dataSourceRows
// directly server-side. This endpoint exists so the editor can show the real
// current dataset instead of only the 10-row sample in apiConfig.

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;
const JWKS = hankoApiUrl
  ? createRemoteJWKSet(new URL(`${hankoApiUrl}/.well-known/jwks.json`))
  : null;

const DEFAULT_LIMIT = 10000;
const HARD_LIMIT = 20000; // safety ceiling — beyond this the UI isn't useful anyway

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

export async function GET(request, { params }) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { serviceId, sourceId } = await params;
  if (!serviceId || !sourceId) {
    return NextResponse.json({ ok: false, error: 'Missing params' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = parseInt(searchParams.get('limit') || '', 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, HARD_LIMIT)
    : DEFAULT_LIMIT;

  try {
    const [rows, meta] = await Promise.all([
      getRows(serviceId, sourceId),
      getMeta(serviceId, sourceId),
    ]);

    if (!rows) {
      return NextResponse.json({ ok: true, rows: [], meta, truncated: false });
    }

    const truncated = rows.length > limit;
    const payload = truncated ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      ok: true,
      rows: payload,
      totalRows: rows.length,
      returnedRows: payload.length,
      truncated,
      meta,
    });
  } catch (e) {
    console.error('[GET datasource rows]', serviceId, sourceId, e);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
