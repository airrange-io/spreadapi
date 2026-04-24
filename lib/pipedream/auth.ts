import { cookies } from 'next/headers';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { NextRequest } from 'next/server';

// Same pattern as app/api/datasource/preview/route.js: the proxy may have
// already set x-user-id; if not (e.g. local dev without middleware), fall
// back to verifying the Hanko cookie directly.
const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;
const JWKS = hankoApiUrl
  ? createRemoteJWKSet(new URL(`${hankoApiUrl}/.well-known/jwks.json`))
  : null;

export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    const proxyUserId = request.headers.get('x-user-id');
    if (proxyUserId) return proxyUserId;
    if (!JWKS) return null;
    const cookieStore = await cookies();
    const hanko = cookieStore.get('hanko')?.value;
    if (!hanko) return null;
    const verified = await jwtVerify(hanko, JWKS);
    return (verified.payload.sub as string | undefined) || null;
  } catch {
    return null;
  }
}
