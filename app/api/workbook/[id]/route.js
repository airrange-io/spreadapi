import { NextResponse } from 'next/server';
import { putBlob, delBlob } from '../../../../lib/blob-client';
import redis from '../../../../lib/redis';

// For now, use a fixed test user (same as services API)
const TEST_USER_ID = 'test1234';

// GET /api/workbook/[id] - Retrieve workbook from blob storage
export async function GET(request, { params }) {
  try {
    // In Next.js 15, params might be a Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get service data from Redis (stored as JSON string)
    const serviceData = await redis.get(`service:${id}`);
    
    if (!serviceData) {
      // Return 204 No Content for non-existent services (expected for new services)
      return new NextResponse(null, { status: 204 });
    }

    const service = JSON.parse(serviceData);
    
    // TODO: Add proper user authentication here
    // For now, we're using TEST_USER_ID, but in production you should:
    // 1. Get the authenticated user from session/JWT
    // 2. Verify service.userId === authenticatedUserId
    // Example:
    // const authenticatedUserId = await getAuthenticatedUser(request);
    // if (service.userId !== authenticatedUserId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }
    
    // Get workbook URL from service data
    const workbookUrl = service.workbookUrl;
    
    if (!workbookUrl) {
      // Return 204 No Content when no workbook exists yet (expected for new services)
      return new NextResponse(null, { status: 204 });
    }

    // Fetch the workbook from blob storage
    console.log(`Fetching workbook from blob storage`);
    
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
        
        console.log('SJS workbook fetched successfully');
        return NextResponse.json({
          workbookData: null, // No JSON data
          workbookBlob: base64, // Base64 encoded SJS data
          format: 'sjs',
          lastModified: service.workbookModified || service.modified,
          success: true
        });
      } else {
        // Return JSON data for JSON files
        const workbookData = await response.json();
        console.log('JSON workbook fetched successfully');
        
        return NextResponse.json({
          workbookData,
          workbookBlob: null,
          format: 'json',
          lastModified: service.workbookModified || service.modified,
          success: true
        });
      }
      
    } catch (error) {
      console.error('Error fetching blob:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch workbook',
        details: error.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error fetching workbook:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch workbook',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT /api/workbook/[id] - Save workbook to blob storage
export async function PUT(request, { params }) {
  try {
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

    // Get service data from Redis (stored as JSON string)
    console.log(`Looking for service with ID: ${id}`);
    const serviceData = await redis.get(`service:${id}`);
    
    if (!serviceData) {
      console.error(`Service not found in Redis: service:${id}`);
      // Try to check if service exists in user's services list
      const userService = await redis.hGet(`user:${TEST_USER_ID}:services`, id);
      if (userService) {
        console.log('Service exists in user list but not in service data - creating default service data');
        // Create default service data
        const defaultService = {
          userId: TEST_USER_ID,
          file: null,
          inputs: [],
          outputs: [],
          metadata: {}
        };
        await redis.set(`service:${id}`, JSON.stringify(defaultService));
        var service = defaultService;
      } else {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }
    } else {
      var service = JSON.parse(serviceData);
    }
    
    // TODO: Add proper user authentication here
    // Verify the user has permission to update this workbook
    // const authenticatedUserId = await getAuthenticatedUser(request);
    // if (service.userId !== authenticatedUserId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // Check size (Vercel Blob limit is 512MB)
    const sizeMB = workbookBuffer.length / (1024 * 1024);
    if (sizeMB > 500) {
      return NextResponse.json({ 
        error: 'Workbook size exceeds limit (500MB)' 
      }, { status: 413 });
    }

    // Delete old workbook if exists
    if (service.workbookUrl) {
      try {
        const blobUrl = service.workbookUrl.replace(process.env.NEXT_VERCEL_BLOB_URL || '', '');
        await delBlob(blobUrl);
      } catch (error) {
        console.warn('Failed to delete old workbook:', error);
      }
    }

    // Upload new workbook to blob storage - use userId for organization
    const userId = service.userId || TEST_USER_ID;
    const uploadPath = `users/${userId}/workbooks/${id}.${fileExtension}`;
    const timestamp = new Date().toISOString();
    
    console.log(`Uploading workbook to path: ${uploadPath}, size: ${sizeMB.toFixed(2)}MB, type: ${contentType}`);
    const blob = await putBlob(uploadPath, workbookBuffer, {
      access: 'public', // Required when using custom token
      contentType: contentType,
      addRandomSuffix: true, // Add random suffix for security
      cacheControlMaxAge: 0, // No cache - always fetch fresh data
    });
    console.log(`Workbook uploaded successfully`);

    // Update service with new workbook URL
    const updatedService = {
      ...service,
      workbookUrl: blob.url,
      workbookModified: timestamp,
      modified: timestamp,
    };
    
    await redis.set(`service:${id}`, JSON.stringify(updatedService));

    return NextResponse.json({
      success: true,
      workbookUrl: blob.url,
      timestamp,
      size: sizeMB.toFixed(2) + ' MB'
    });

  } catch (error) {
    console.error('Error saving workbook:', error);
    return NextResponse.json({ 
      error: 'Failed to save workbook',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/workbook/[id] - Delete workbook from blob storage
export async function DELETE(request, { params }) {
  try {
    // In Next.js 15, params might be a Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get service data from Redis (stored as JSON string)
    const serviceData = await redis.get(`service:${id}`);
    
    if (!serviceData) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    const service = JSON.parse(serviceData);

    // Delete workbook from blob storage if exists
    if (service.workbookUrl) {
      try {
        const blobUrl = service.workbookUrl.replace(process.env.NEXT_VERCEL_BLOB_URL || '', '');
        await delBlob(blobUrl);
        
        // Remove workbook URL from service
        const updatedService = { ...service };
        delete updatedService.workbookUrl;
        delete updatedService.workbookModified;
        
        await redis.set(`service:${id}`, JSON.stringify(updatedService));
        
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