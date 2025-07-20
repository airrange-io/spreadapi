import { NextResponse } from 'next/server';
import { put, del, head } from '@vercel/blob';
import redis from '../../../../lib/redis';

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
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = JSON.parse(serviceData);
    
    // Get workbook URL from service data
    const workbookUrl = service.workbookUrl;
    
    if (!workbookUrl) {
      return NextResponse.json({ 
        error: 'No workbook found for this service',
        workbookData: null 
      }, { status: 200 });
    }

    // Fetch workbook data from blob storage with cache-busting
    const cacheBuster = `?t=${Date.now()}`;
    const fetchUrl = `${workbookUrl}${cacheBuster}`;
    console.log(`Fetching workbook from URL: ${fetchUrl}`);
    
    const blobResponse = await fetch(fetchUrl, {
      cache: 'no-store', // Disable caching
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!blobResponse.ok) {
      console.error(`Failed to fetch workbook: ${blobResponse.status} ${blobResponse.statusText}`);
      return NextResponse.json({ 
        error: 'Failed to fetch workbook from storage',
        workbookData: null
      }, { status: 200 });
    }

    const workbookData = await blobResponse.json();
    console.log('Workbook fetched successfully, size:', JSON.stringify(workbookData).length);
    
    return NextResponse.json({
      workbookData,
      lastModified: service.workbookModified || service.modified,
      success: true
    });

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

    // Get request body
    const body = await request.json();
    const { workbookData } = body;
    
    if (!workbookData) {
      return NextResponse.json({ error: 'Workbook data is required' }, { status: 400 });
    }

    // Get service data from Redis (stored as JSON string)
    const serviceData = await redis.get(`service:${id}`);
    
    if (!serviceData) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    const service = JSON.parse(serviceData);

    // Prepare workbook data for storage
    const workbookJson = JSON.stringify(workbookData);
    const workbookBuffer = Buffer.from(workbookJson);
    
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
        await del(blobUrl);
      } catch (error) {
        console.warn('Failed to delete old workbook:', error);
      }
    }

    // Upload new workbook to blob storage
    const tenant = service.tenantId || 'default';
    const uploadPath = `${tenant}/workbooks/${id}.json`;
    const timestamp = new Date().toISOString();
    
    console.log(`Uploading workbook to path: ${uploadPath}, size: ${sizeMB.toFixed(2)}MB`);
    const blob = await put(uploadPath, workbookBuffer, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      cacheControlMaxAge: 0, // No cache - always fetch fresh data
    });
    console.log(`Workbook uploaded successfully to: ${blob.url}`);

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
        await del(blobUrl);
        
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