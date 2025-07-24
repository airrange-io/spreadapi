import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET /api/services/[id]/full - Get all service data in one call
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
    // Use Redis multi to get all data in one round trip
    const multi = redis.multi();
    
    // Queue all operations
    multi.hGetAll(`service:${id}`);
    multi.exists(`service:${id}:published`);
    multi.hGetAll(`service:${id}:published`);
    
    // Execute all at once
    const [serviceData, isPublished, publishedData] = await multi.exec();
    
    if (!serviceData || Object.keys(serviceData).length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership (allow demo-user to access demo service)
    const isDemoAccess = userId === 'demo-user' && id === 'test1234_mdejqoua8ptor';
    if (serviceData.userId !== userId && !isDemoAccess) {
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
    
    // Build combined response
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
        workbookUrl: serviceData.workbookUrl,
        workbookSize: serviceData.workbookSize,
        workbookModified: serviceData.workbookModified,
        createdAt: serviceData.createdAt,
        updatedAt: serviceData.updatedAt,
        // AI metadata
        aiDescription: serviceData.aiDescription || '',
        aiUsageExamples: (() => {
          try {
            return serviceData.aiUsageExamples ? JSON.parse(serviceData.aiUsageExamples) : [];
          } catch (e) {
            return [];
          }
        })(),
        aiTags: (() => {
          try {
            return serviceData.aiTags ? JSON.parse(serviceData.aiTags) : [];
          } catch (e) {
            return [];
          }
        })(),
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
      
      // Workbook info (for client to decide if it needs to fetch)
      workbook: {
        hasWorkbook: !!serviceData.workbookUrl,
        size: parseInt(serviceData.workbookSize || '0'),
        modified: serviceData.workbookModified
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Error fetching service data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service data' },
      { status: 500 }
    );
  }
}