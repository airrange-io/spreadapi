import { NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { cookies } from 'next/headers';
import { fetchDataSource } from '@/lib/fetchDataSource';

const DEFAULT_SAMPLE_ROWS = 10;
// Up from 100 — editors can now ask for up to this many rows when the user
// wants to test formulas against a larger sample ("All" in the modal maps to
// this cap).
const MAX_PREVIEW_ROWS = 10000;

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

export async function POST(request) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 }); }

  const { sampleRows } = body || {};
  const maxRows = Math.min(Math.max(parseInt(sampleRows, 10) || DEFAULT_SAMPLE_ROWS, 1), MAX_PREVIEW_ROWS);

  const result = await fetchDataSource(body, { maxRows });

  if (!result.ok) {
    const statusByStage = { validate: 400, fetch: 502, parse: 422, path: 422 };
    return NextResponse.json(result, { status: statusByStage[result.stage] || 400 });
  }

  return NextResponse.json({
    ok: true,
    rows: result.rows,
    totalRowsFetched: result.totalRowsFetched,
    columns: result.columns,
  });
}
