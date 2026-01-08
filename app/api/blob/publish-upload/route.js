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
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate and configure the upload
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
        // Log upload completion for debugging
        console.log(`[Blob Upload] Publish data upload completed: ${blob.pathname}, size: ${blob.size}`);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in blob publish-upload:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 400 }
    );
  }
}
