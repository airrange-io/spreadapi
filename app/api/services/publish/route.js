import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { gunzip } from 'zlib';
import { promisify } from 'util';
import { createOrUpdateService } from '@/lib/publishService';

const gunzipAsync = promisify(gunzip);

// Maximum decompressed size to prevent decompression bombs (500MB)
const MAX_DECOMPRESSED_SIZE = 500 * 1024 * 1024;

/**
 * Decompress gzip data from base64 string (async to avoid blocking event loop)
 * @param {string} base64Data - Base64 encoded gzip data
 * @returns {Promise<object>} Parsed JSON object
 */
async function decompressBase64(base64Data) {
  const compressed = Buffer.from(base64Data, 'base64');
  const decompressed = await gunzipAsync(compressed);

  if (decompressed.length > MAX_DECOMPRESSED_SIZE) {
    throw new Error(`Decompressed data exceeds maximum size (${MAX_DECOMPRESSED_SIZE} bytes)`);
  }

  return JSON.parse(decompressed.toString('utf-8'));
}

/**
 * Decompress gzip data from binary buffer (async to avoid blocking event loop)
 * @param {Buffer} compressedBuffer - Gzip compressed data
 * @returns {Promise<object>} Parsed JSON object
 */
async function decompressBuffer(compressedBuffer) {
  const decompressed = await gunzipAsync(compressedBuffer);

  if (decompressed.length > MAX_DECOMPRESSED_SIZE) {
    throw new Error(`Decompressed data exceeds maximum size (${MAX_DECOMPRESSED_SIZE} bytes)`);
  }

  return JSON.parse(decompressed.toString('utf-8'));
}

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
    const { compressedData, publishData, publishDataUrl, isCompressed, tenant = userId } = body;

    console.log(`[Publish API] ${requestId} - Publishing service ${serviceId} for user ${userId.substring(0, 8)}...`);

    if (!serviceId) {
      console.warn(`[Publish API] ${requestId} - Missing serviceId`);
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    if (!compressedData && !publishData && !publishDataUrl) {
      console.warn(`[Publish API] ${requestId} - Missing publishData`);
      return NextResponse.json(
        { error: 'compressedData, publishData, or publishDataUrl is required' },
        { status: 400 }
      );
    }

    let resolvedPublishData;

    if (compressedData) {
      // Most common: compressed data sent inline as base64
      console.log(`[Publish API] ${requestId} - Decompressing inline data`);
      try {
        const decompressStart = Date.now();
        resolvedPublishData = await decompressBase64(compressedData);
        console.warn(`[Publish API] ${requestId} - Decompressed in ${Date.now() - decompressStart}ms`);
      } catch (decompressError) {
        console.error(`[Publish API] ${requestId} - Decompression failed:`, decompressError.message);
        return NextResponse.json(
          { error: 'Failed to decompress publish data' },
          { status: 400 }
        );
      }
    } else if (publishDataUrl) {
      // Large file flow: fetch data from blob URL
      if (!isValidBlobUrl(publishDataUrl)) {
        console.error(`[Publish API] ${requestId} - Invalid blob URL rejected`);
        return NextResponse.json(
          { error: 'Invalid temporary storage URL' },
          { status: 400 }
        );
      }

      console.log(`[Publish API] ${requestId} - Fetching large payload from blob`);
      tempBlobUrl = publishDataUrl;

      try {
        const fetchStart = Date.now();
        const response = await fetch(publishDataUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        if (isCompressed) {
          // Compressed blob: fetch as binary and decompress
          const blobBuffer = Buffer.from(await response.arrayBuffer());
          const blobSizeKB = (blobBuffer.length / 1024).toFixed(1);
          resolvedPublishData = await decompressBuffer(blobBuffer);
          console.warn(`[Publish API] ${requestId} - Blob fetched and decompressed: ${blobSizeKB}KB in ${Date.now() - fetchStart}ms`);
        } else {
          // Legacy uncompressed blob (backwards compat)
          const blobText = await response.text();
          const blobSizeKB = (blobText.length / 1024).toFixed(1);
          resolvedPublishData = JSON.parse(blobText);
          console.warn(`[Publish API] ${requestId} - Blob fetched: ${blobSizeKB}KB in ${Date.now() - fetchStart}ms`);
        }
      } catch (fetchError) {
        console.error(`[Publish API] ${requestId} - Failed to fetch/decompress blob:`, fetchError.message);
        await cleanupTempBlob();
        return NextResponse.json(
          { error: 'Failed to retrieve publish data from temporary storage' },
          { status: 500 }
        );
      }
    } else {
      // Legacy: uncompressed inline data (backwards compat)
      const inlineSizeKB = (JSON.stringify(publishData).length / 1024).toFixed(1);
      console.warn(`[Publish API] ${requestId} - Inline data (uncompressed): ${inlineSizeKB}KB`);
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