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
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  let tempBlobUrl = null;
  let serviceId = null;

  console.warn(`[Publish API] ${requestId} - Request received`);

  // Helper to clean up temp blob on any exit path
  const cleanupTempBlob = async () => {
    if (tempBlobUrl) {
      try {
        await del(tempBlobUrl);
        console.log(`[Publish API] ${requestId} - Cleaned up temp blob`);
      } catch (e) {
        console.warn(`[Publish API] ${requestId} - Failed to delete temp blob:`, e.message);
      }
    }
  };

  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      console.warn(`[Publish API] ${requestId} - Unauthorized: no user ID`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    serviceId = body.serviceId;
    const { publishData, publishDataUrl, tenant = userId } = body;

    console.log(`[Publish API] ${requestId} - Publishing service ${serviceId} for user ${userId.substring(0, 8)}...`);

    if (!serviceId) {
      console.warn(`[Publish API] ${requestId} - Missing serviceId`);
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    if (!publishData && !publishDataUrl) {
      console.warn(`[Publish API] ${requestId} - Missing publishData`);
      return NextResponse.json(
        { error: 'publishData or publishDataUrl is required' },
        { status: 400 }
      );
    }

    let resolvedPublishData;

    if (publishDataUrl) {
      // Validate the URL is a legitimate Vercel Blob URL (prevent SSRF)
      if (!isValidBlobUrl(publishDataUrl)) {
        console.error(`[Publish API] ${requestId} - Invalid blob URL rejected`);
        return NextResponse.json(
          { error: 'Invalid temporary storage URL' },
          { status: 400 }
        );
      }

      // Large file flow: fetch data from blob URL
      console.log(`[Publish API] ${requestId} - Fetching large payload from blob`);
      tempBlobUrl = publishDataUrl;

      try {
        const fetchStart = Date.now();
        const response = await fetch(publishDataUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        resolvedPublishData = await response.json();
        console.log(`[Publish API] ${requestId} - Blob fetched in ${Date.now() - fetchStart}ms`);
      } catch (fetchError) {
        console.error(`[Publish API] ${requestId} - Failed to fetch blob:`, fetchError.message);
        await cleanupTempBlob();
        return NextResponse.json(
          { error: 'Failed to retrieve publish data from temporary storage' },
          { status: 500 }
        );
      }
    } else {
      // Small file flow: use inline data (existing behavior)
      console.log(`[Publish API] ${requestId} - Using inline data`);
      resolvedPublishData = publishData;
    }

    // Call the server-side function with userId
    const result = await createOrUpdateService(serviceId, resolvedPublishData, tenant, userId);

    // Clean up temporary blob on success
    await cleanupTempBlob();

    const duration = Date.now() - startTime;
    console.warn(`[Publish API] ${requestId} - Success for ${serviceId} in ${duration}ms`);

    return NextResponse.json(result);
  } catch (error) {
    // Clean up temporary blob on error
    await cleanupTempBlob();

    const duration = Date.now() - startTime;
    console.error(`[Publish API] ${requestId} - Error for ${serviceId || 'unknown'} after ${duration}ms:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to publish service' },
      { status: 500 }
    );
  }
}