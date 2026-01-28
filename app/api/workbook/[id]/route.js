import { NextResponse } from 'next/server';
import { putBlob, delBlob } from '../../../../lib/blob-client';
import redis from '../../../../lib/redis';


// GET /api/workbook/[id] - Retrieve workbook from blob storage
export async function GET(request, { params }) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In Next.js 15, params might be a Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get service data from hash structure
    const service = await redis.hGetAll(`service:${id}`);
    
    if (!service || Object.keys(service).length === 0) {
      return new NextResponse(null, { status: 204 });
    }
    
    
    // Verify ownership
    if (service.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if client has cached version
    const clientEtag = request.headers.get('if-none-match');
    const currentEtag = `"${service.workbookModified || service.updatedAt || 'no-workbook'}"`;
    
    if (clientEtag && clientEtag === currentEtag && service.workbookUrl) {
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'ETag': currentEtag,
          'Cache-Control': 'private, must-revalidate'
        }
      });
    }
    
    
    // Get workbook URL from service data
    const workbookUrl = service.workbookUrl;
    
    if (!workbookUrl) {
      // Return 204 No Content when no workbook exists yet (expected for new services)
      return new NextResponse(null, { status: 204 });
    }

    // Fetch the workbook from blob storage
    
    try {
      // Fetch the blob content
      const response = await fetch(workbookUrl, {
        cache: 'no-store' // Prevent caching
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch blob: ${response.status}`);
        return NextResponse.json({ 
          error: 'Failed to fetch workbook from storage',
          workbookData: null
        }, { status: 500 });
      }
      
      // Check if it's SJS (binary) or JSON format
      const contentType = response.headers.get('content-type') || '';
      const isSJS = contentType.includes('octet-stream') || workbookUrl.includes('.sjs');
      
      if (isSJS) {
        // Return blob data for SJS files
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        return NextResponse.json({
          workbookData: null, // No JSON data
          workbookBlob: base64, // Base64 encoded SJS data
          format: 'sjs',
          lastModified: service.updatedAt || service.createdAt,
          success: true
        }, {
          headers: {
            'Cache-Control': 'private, must-revalidate',
            'ETag': currentEtag,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Return JSON data for JSON files
        const workbookData = await response.json();
        
        return NextResponse.json({
          workbookData,
          workbookBlob: null,
          format: 'json',
          lastModified: service.updatedAt || service.createdAt,
          success: true
        }, {
          headers: {
            'Cache-Control': 'private, must-revalidate',
            'ETag': currentEtag,
            'Content-Type': 'application/json'
          }
        });
      }
      
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch workbook',
        details: error.message 
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch workbook',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT /api/workbook/[id] - Save workbook to blob storage
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
    
    // In Next.js 15, params might be a Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
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
      
      workbookBuffer = Buffer.from(await workbookFile.arrayBuffer());
    } else {
      // Handle JSON data (fallback)
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

    // Get service data from new hash structure
    const service = await redis.hGetAll(`service:${id}`);
    
    if (!service || Object.keys(service).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Verify ownership
    if (service.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    

    // Check size (50MB max for workbook storage)
    const sizeMB = workbookBuffer.length / (1024 * 1024);
    if (sizeMB > 50) {
      return NextResponse.json({
        error: 'Workbook size exceeds limit (50MB)'
      }, { status: 413 });
    }

    // Delete old workbook if exists
    if (service.workbookUrl) {
      try {
        const blobUrl = service.workbookUrl.replace(process.env.NEXT_VERCEL_BLOB_URL || '', '');
        await delBlob(blobUrl);
      } catch (error) {
      }
    }

    // Upload new workbook to blob storage - use userId for organization
    const uploadPath = `users/${userId}/workbooks/${id}.${fileExtension}`;
    const timestamp = new Date().toISOString();
    
    const blob = await putBlob(uploadPath, workbookBuffer, {
      access: 'public', // Required when using custom token
      contentType: contentType,
      addRandomSuffix: true, // Add random suffix for security
      cacheControlMaxAge: 0, // No cache - always fetch fresh data
    });

    // Update service hash with new workbook URL and size
    const updateData = {
      workbookUrl: blob.url,
      workbookSize: workbookBuffer.length.toString(), // Store size in bytes as string
      updatedAt: timestamp
    };
    
    console.log(`[Workbook PUT] Updating service hash with:`, updateData);
    await redis.hSet(`service:${id}`, updateData);
    
    // Update user's service index with the new workbook URL
    const isPublished = await redis.exists(`service:${id}:published`);
    const publishedData = isPublished ? await redis.hGetAll(`service:${id}:published`) : null;
    
    const indexData = {
      id: id,
      name: service.name || 'Untitled Service',
      description: service.description || '',
      status: isPublished ? 'published' : 'draft',
      createdAt: service.createdAt,
      updatedAt: timestamp,
      publishedAt: publishedData?.created || null,
      calls: parseInt(publishedData?.calls || '0'),
      lastUsed: publishedData?.lastUsed || null,
      workbookUrl: blob.url
    };
    await redis.hSet(`user:${userId}:services`, id, JSON.stringify(indexData));
    

    return NextResponse.json({
      success: true,
      workbookUrl: blob.url,
      timestamp,
      size: sizeMB.toFixed(2) + ' MB'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to save workbook',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/workbook/[id] - Delete workbook from blob storage
export async function DELETE(request, { params }) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In Next.js 15, params might be a Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get service data from hash structure
    const service = await redis.hGetAll(`service:${id}`);
    
    if (!service || Object.keys(service).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Check if service is published
    const isPublished = await redis.exists(`service:${id}:published`);
    if (isPublished) {
      return NextResponse.json({ 
        error: 'Cannot delete workbook from published service. Unpublish first.' 
      }, { status: 400 });
    }
    
    // Verify ownership
    if (service.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete workbook from blob storage if exists
    if (service.workbookUrl) {
      try {
        const blobUrl = service.workbookUrl.replace(process.env.NEXT_VERCEL_BLOB_URL || '', '');
        await delBlob(blobUrl);
        
        // Remove workbook URL from service hash
        const timestamp = new Date().toISOString();
        await redis.hDel(`service:${id}`, 'workbookUrl');
        await redis.hSet(`service:${id}`, 'updatedAt', timestamp);
        
        // Update user's service index to remove workbook URL
        const indexData = {
          id: id,
          name: service.name || 'Untitled Service',
          description: service.description || '',
          status: 'draft', // Cannot be published without workbook
          createdAt: service.createdAt,
          updatedAt: timestamp,
          publishedAt: null,
          calls: 0,
          lastUsed: null,
          workbookUrl: ''
        };
        await redis.hSet(`user:${userId}:services`, id, JSON.stringify(indexData));
        
        return NextResponse.json({
          success: true,
          message: 'Workbook deleted successfully'
        });
      } catch (error) {
        console.error('Failed to delete workbook:', error);
        return NextResponse.json({ 
          error: 'Failed to delete workbook',
          details: error.message 
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'No workbook to delete'
    });

  } catch (error) {
    console.error('Error deleting workbook:', error);
    return NextResponse.json({ 
      error: 'Failed to delete workbook',
      details: error.message 
    }, { status: 500 });
  }
}