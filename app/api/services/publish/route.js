import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { createOrUpdateService } from '@/lib/publishService';

/**
 * Validate that a URL is a legitimate Vercel Blob URL
 * Prevents SSRF attacks by ensuring we only fetch from our blob storage
 */
function isValidBlobUrl(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    // Vercel Blob URLs are hosted on vercel-storage.com or blob.vercel-storage.com
    const validHosts = [
      'blob.vercel-storage.com',
      '.blob.vercel-storage.com',
      '.public.blob.vercel-storage.com'
    ];

    return validHosts.some(host =>
      parsed.hostname === host.replace(/^\./, '') ||
      parsed.hostname.endsWith(host)
    );
  } catch {
    return false;
  }
}

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
    const { serviceId, publishData, publishDataUrl, tenant = userId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    if (!publishData && !publishDataUrl) {
      return NextResponse.json(
        { error: 'publishData or publishDataUrl is required' },
        { status: 400 }
      );
    }

    let resolvedPublishData;
    let tempBlobUrl = null;

    if (publishDataUrl) {
      // Validate the URL is a legitimate Vercel Blob URL (prevent SSRF)
      if (!isValidBlobUrl(publishDataUrl)) {
        console.error('[Publish API] Invalid blob URL rejected:', publishDataUrl);
        return NextResponse.json(
          { error: 'Invalid temporary storage URL' },
          { status: 400 }
        );
      }

      // Large file flow: fetch data from blob URL
      console.log(`[Publish API] Fetching large payload from blob: ${publishDataUrl}`);
      tempBlobUrl = publishDataUrl;

      try {
        const response = await fetch(publishDataUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch publish data: ${response.status}`);
        }
        resolvedPublishData = await response.json();
      } catch (fetchError) {
        console.error('[Publish API] Failed to fetch blob:', fetchError);
        return NextResponse.json(
          { error: 'Failed to retrieve publish data from temporary storage' },
          { status: 500 }
        );
      }
    } else {
      // Small file flow: use inline data (existing behavior)
      resolvedPublishData = publishData;
    }

    // Call the server-side function with userId
    const result = await createOrUpdateService(serviceId, resolvedPublishData, tenant, userId);

    // Clean up temporary blob if used (best effort - don't fail if cleanup fails)
    if (tempBlobUrl) {
      try {
        await del(tempBlobUrl);
        console.log(`[Publish API] Cleaned up temp blob: ${tempBlobUrl}`);
      } catch (delError) {
        // Log but don't fail - the publish succeeded
        console.warn('[Publish API] Failed to delete temp blob:', delError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in publish API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish service' },
      { status: 500 }
    );
  }
}