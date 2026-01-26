import { NextResponse } from 'next/server';
import redis from '@/lib/redis';


// GET /api/services/[id]/complete - Get all service data including workbook info in one call
export async function GET(request, { params }) {
  // Get user ID from headers (set by middleware)
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const { id } = await params;
  
  try {
    // Use Redis multi for pipelining (node-redis syntax)
    const multi = redis.multi();
    
    // Queue all operations
    multi.hGetAll(`service:${id}`);
    multi.exists(`service:${id}:published`);
    multi.hGetAll(`service:${id}:published`);
    
    // Execute all at once
    const [serviceData, isPublished, publishedData] = await multi.exec();
    
    // node-redis returns values directly, not [err, value] tuples
    
    if (!serviceData || Object.keys(serviceData).length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (serviceData.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Parse inputs/outputs/areas
    let inputs = [];
    let outputs = [];
    let areas = [];
    
    try {
      inputs = serviceData.inputs ? JSON.parse(serviceData.inputs) : [];
    } catch (e) {
      console.error('Error parsing inputs:', e);
    }
    
    try {
      outputs = serviceData.outputs ? JSON.parse(serviceData.outputs) : [];
    } catch (e) {
      console.error('Error parsing outputs:', e);
    }
    
    try {
      areas = serviceData.areas ? JSON.parse(serviceData.areas) : [];
    } catch (e) {
      console.error('Error parsing areas:', e);
    }
    
    // Parse AI metadata
    let aiUsageExamples = [];
    let aiTags = [];
    
    try {
      aiUsageExamples = serviceData.aiUsageExamples ? JSON.parse(serviceData.aiUsageExamples) : [];
    } catch (e) {
      aiUsageExamples = [];
    }
    
    try {
      aiTags = serviceData.aiTags ? JSON.parse(serviceData.aiTags) : [];
    } catch (e) {
      aiTags = [];
    }
    
    // Generate ETag based on service data and workbook modification time
    const etag = `"${id}-${serviceData.workbookModified || serviceData.updatedAt || 'v1'}"`;
    
    // Check if client has cached version
    const clientEtag = request.headers.get('if-none-match');
    if (clientEtag && clientEtag === etag) {
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, must-revalidate',
          'Vercel-CDN-Cache-Control': 'max-age=300, stale-while-revalidate=60'
        }
      });
    }
    
    // Build complete response
    const response = {
      // Service configuration
      service: {
        id: serviceData.id,
        name: serviceData.name || 'Untitled Service',
        description: serviceData.description || '',
        inputs,
        outputs,
        areas,
        enableCaching: serviceData.cacheEnabled !== 'false',
        requireToken: serviceData.requireToken === 'true',
        cacheTableSheetData: serviceData.cacheTableSheetData !== 'false',
        tableSheetCacheTTL: parseInt(serviceData.tableSheetCacheTTL) || 300,
        createdAt: serviceData.createdAt,
        updatedAt: serviceData.updatedAt,
        // AI metadata
        aiDescription: serviceData.aiDescription || '',
        aiUsageExamples,
        aiTags,
        category: serviceData.category || ''
      },
      
      // Status information
      status: {
        published: isPublished > 0,
        publishedAt: publishedData?.created || null,
        version: publishedData?.version || null,
        calls: parseInt(publishedData?.calls || '0'),
        lastUsed: publishedData?.lastUsed || null
      },
      
      // Workbook information - return URL directly for client-side fetching
      workbook: serviceData.workbookUrl ? {
        url: serviceData.workbookUrl,
        size: parseInt(serviceData.workbookSize || '0'),
        modified: serviceData.workbookModified,
        // Determine format from URL
        format: serviceData.workbookUrl.includes('.sjs') ? 'sjs' : 'json'
      } : null
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
        'ETag': etag,
        'Vercel-CDN-Cache-Control': 'max-age=300, stale-while-revalidate=60'
      }
    });
    
  } catch (error) {
    console.error('Error fetching complete service data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service data' },
      { status: 500 }
    );
  }
}