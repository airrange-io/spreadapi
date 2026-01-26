import { NextResponse } from 'next/server';
import redis from '@/lib/redis';


// GET /api/services/[id]/metadata - Get only service metadata without workbook
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
    // Use Redis multi for efficient data fetching
    const multi = redis.multi();
    multi.hGetAll(`service:${id}`);
    multi.exists(`service:${id}:published`);
    multi.hGetAll(`service:${id}:published`);
    
    const [serviceData, isPublished, publishedData] = await multi.exec();
    
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
    
    // Parse complex fields
    const parseJsonField = (field, defaultValue = []) => {
      try {
        return field ? JSON.parse(field) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };
    
    // Generate ETag based on service update time (not workbook)
    const etag = `"${id}-${serviceData.updatedAt || 'v1'}"`;
    
    // Check client cache
    const clientEtag = request.headers.get('if-none-match');
    if (clientEtag && clientEtag === etag) {
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, must-revalidate'
        }
      });
    }
    
    // Return only service configuration and status - NO workbook data
    const response = {
      config: {
        id: serviceData.id,
        name: serviceData.name || 'Untitled Service',
        description: serviceData.description || '',
        inputs: parseJsonField(serviceData.inputs),
        outputs: parseJsonField(serviceData.outputs),
        areas: parseJsonField(serviceData.areas),
        enableCaching: serviceData.cacheEnabled !== 'false',
        requireToken: serviceData.requireToken === 'true',
        cacheTableSheetData: serviceData.cacheTableSheetData !== 'false',
        tableSheetCacheTTL: parseInt(serviceData.tableSheetCacheTTL) || 300,
        aiDescription: serviceData.aiDescription || '',
        aiUsageExamples: parseJsonField(serviceData.aiUsageExamples),
        aiTags: parseJsonField(serviceData.aiTags),
        category: serviceData.category || '',
        // Include workbook metadata but not the actual data
        hasWorkbook: !!serviceData.workbookUrl,
        workbookSize: parseInt(serviceData.workbookSize || '0'),
        workbookModified: serviceData.workbookModified
      },
      status: {
        published: isPublished > 0,
        status: isPublished > 0 ? 'published' : 'draft',
        publishedAt: publishedData?.created || null,
        version: publishedData?.version || null,
        calls: parseInt(publishedData?.calls || '0'),
        lastUsed: publishedData?.lastUsed || null
      },
      timestamps: {
        createdAt: serviceData.createdAt,
        updatedAt: serviceData.updatedAt
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
        'ETag': etag,
        // Allow CDN caching for metadata
        'Vercel-CDN-Cache-Control': 'max-age=60, stale-while-revalidate=300'
      }
    });
    
  } catch (error) {
    console.error('Error fetching service metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service metadata' },
      { status: 500 }
    );
  }
}