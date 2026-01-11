import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

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
  console.log(`[Blob Upload] ${requestId} - Request received`);

  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      console.warn(`[Blob Upload] ${requestId} - Unauthorized: no user ID`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[Blob Upload] ${requestId} - User: ${userId.substring(0, 8)}...`);

    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.log(`[Blob Upload] ${requestId} - Generating token for: ${pathname}`);
        return {
          allowedContentTypes: ['application/json'],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max for publish data
          tokenPayload: JSON.stringify({
            userId,
            type: 'publish-data',
            timestamp: Date.now()
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log(`[Blob Upload] ${requestId} - Upload completed: ${blob.pathname}, size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
      },
    });

    console.log(`[Blob Upload] ${requestId} - Response sent`);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error(`[Blob Upload] ${requestId} - Error:`, error.message || error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 400 }
    );
  }
}
