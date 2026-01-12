import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { cookies } from 'next/headers';

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;

/**
 * Verify Hanko JWT and extract user ID
 * In Next.js 16, proxy.ts is for routing only, so auth must be done in route handlers
 */
async function verifyAuth(request) {
  try {
    // Try to get user ID from proxy header first (backwards compatibility)
    const proxyUserId = request.headers.get('x-user-id');
    if (proxyUserId) {
      return proxyUserId;
    }

    // Otherwise, verify the Hanko cookie directly
    const cookieStore = await cookies();
    const hanko = cookieStore.get('hanko')?.value;

    if (!hanko) {
      return null;
    }

    const JWKS = createRemoteJWKSet(
      new URL(`${hankoApiUrl}/.well-known/jwks.json`)
    );

    const verifiedJWT = await jwtVerify(hanko, JWKS);
    return verifiedJWT.payload.sub;
  } catch (error) {
    console.warn('[Blob Upload] Auth verification failed:', error.message);
    return null;
  }
}

/**
 * API route for handling large publish data uploads via Vercel Blob client uploads.
 * This allows uploading files larger than the 4.5MB serverless function payload limit.
 *
 * POST /api/blob/publish-upload
 * - Generates upload tokens for client-side uploads
 * - Handles upload completion callbacks
 */
export async function POST(request) {
  const requestId = Math.random().toString(36).substring(7);
  console.warn(`[Blob Upload] ${requestId} - Request received`);

  try {
    // Clone request to read body twice (once for type check, once for handleUpload)
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();

    // Check if this is a Vercel Blob callback (upload completion)
    // Callbacks don't have cookies - they're server-to-server from Vercel
    // handleUpload validates callbacks cryptographically via token
    const isCallback = body.type === 'blob.upload-completed';

    let userId = null;

    if (isCallback) {
      // For callbacks, userId comes from the tokenPayload we set during token generation
      console.warn(`[Blob Upload] ${requestId} - Callback from Vercel (no auth needed)`);
    } else {
      // For token generation requests, verify auth
      userId = await verifyAuth(request);

      if (!userId) {
        console.warn(`[Blob Upload] ${requestId} - Unauthorized: no user ID`);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      console.warn(`[Blob Upload] ${requestId} - User: ${userId.substring(0, 8)}...`);
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.warn(`[Blob Upload] ${requestId} - Generating token for: ${pathname}`);
        return {
          allowedContentTypes: ['application/json', 'application/gzip', 'application/octet-stream'],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max for publish data
          tokenPayload: JSON.stringify({
            userId,
            type: 'publish-data',
            timestamp: Date.now()
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.warn(`[Blob Upload] ${requestId} - Upload completed: ${blob.pathname}, size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
      },
    });

    console.warn(`[Blob Upload] ${requestId} - Response sent`);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error(`[Blob Upload] ${requestId} - Error:`, error.message || error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 400 }
    );
  }
}
