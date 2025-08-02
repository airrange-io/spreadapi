import { NextResponse } from 'next/server';
import { putBlob, delBlob } from '../../../../lib/blob-client';
import redis from '../../../../lib/redis';
import { isDemoService, DEMO_USER_ID } from '@/lib/constants';

// Optimized PUT /api/workbook/[id] - Save workbook with better performance
export async function PUT(request, { params }) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get request body - handle both FormData (SJS) and JSON
    let workbookBuffer;
    let fileExtension = 'sjs';
    let contentType = 'application/octet-stream';
    
    const contentTypeHeader = request.headers.get('content-type');
    
    if (contentTypeHeader && contentTypeHeader.includes('multipart/form-data')) {
      // Handle SJS file upload
      const formData = await request.formData();
      const workbookFile = formData.get('workbook');
      
      if (!workbookFile) {
        return NextResponse.json({ error: 'Workbook file is required' }, { status: 400 });
      }
      
      // Stream the file instead of loading into memory for large files
      if (workbookFile.size > 50 * 1024 * 1024) { // 50MB threshold
        // For large files, use streaming
        const stream = workbookFile.stream();
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        workbookBuffer = Buffer.concat(chunks);
      } else {
        workbookBuffer = Buffer.from(await workbookFile.arrayBuffer());
      }
    } else {
      // Handle JSON data
      const body = await request.json();
      const { workbookData } = body;
      
      if (!workbookData) {
        return NextResponse.json({ error: 'Workbook data is required' }, { status: 400 });
      }
      
      const workbookJson = JSON.stringify(workbookData);
      workbookBuffer = Buffer.from(workbookJson);
      fileExtension = 'json';
      contentType = 'application/json';
    }

    // Check size (Vercel Blob limit is 512MB)
    const sizeMB = workbookBuffer.length / (1024 * 1024);
    if (sizeMB > 500) {
      return NextResponse.json({ 
        error: 'Workbook size exceeds limit (500MB)' 
      }, { status: 413 });
    }

    // Use Redis multi for pipelining
    const multi = redis.multi();
    
    // Get service data and check ownership in one go
    multi.hGetAll(`service:${id}`);
    multi.exists(`service:${id}:published`);
    
    const [service, isPublished] = await multi.exec();
    
    if (!service || Object.keys(service).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Verify ownership
    const isDemoAccess = userId === DEMO_USER_ID && isDemoService(id);
    if (service.userId !== userId && !isDemoAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete old workbook if exists (in parallel with upload)
    const deletePromise = service.workbookUrl ? 
      delBlob(service.workbookUrl.replace(process.env.NEXT_VERCEL_BLOB_URL || '', '')).catch(() => {}) : 
      Promise.resolve();

    // Use timestamp-based versioning for immutable blobs
    const timestamp = Date.now();
    const uploadPath = `users/${userId}/workbooks/${id}-${timestamp}.${fileExtension}`;
    
    // Upload new workbook and delete old one in parallel
    const [blob] = await Promise.all([
      putBlob(uploadPath, workbookBuffer, {
        access: 'public',
        contentType: contentType,
        addRandomSuffix: false, // Use timestamp for versioning
        cacheControlMaxAge: 31536000, // 1 year - immutable content
      }),
      deletePromise
    ]);

    // Update Redis with multi
    const updateTimestamp = new Date().toISOString();
    const updateMulti = redis.multi();
    
    // Update service hash
    updateMulti.hSet(`service:${id}`, {
      workbookUrl: blob.url,
      workbookSize: workbookBuffer.length.toString(),
      workbookModified: updateTimestamp,
      updatedAt: updateTimestamp
    });
    
    // Update user's service index
    const indexData = {
      id: id,
      name: service.name || 'Untitled Service',
      description: service.description || '',
      status: isPublished ? 'published' : 'draft',
      createdAt: service.createdAt,
      updatedAt: updateTimestamp,
      publishedAt: null,
      calls: 0,
      lastUsed: null,
      workbookUrl: blob.url
    };
    updateMulti.hSet(`user:${userId}:services`, id, JSON.stringify(indexData));
    
    // Execute all updates
    await updateMulti.exec();

    return NextResponse.json({
      success: true,
      workbookUrl: blob.url,
      timestamp: updateTimestamp,
      size: sizeMB.toFixed(2) + ' MB',
      // Return new ETag for cache invalidation
      etag: `"${id}-${updateTimestamp}"`
    }, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error saving workbook:', error);
    return NextResponse.json({ 
      error: 'Failed to save workbook',
      details: error.message 
    }, { status: 500 });
  }
}