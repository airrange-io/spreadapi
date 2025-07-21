import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET /api/services/[id]/full - Get all service data in one call
export async function GET(request, { params }) {
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
    
    // Parse inputs/outputs
    let inputs = [];
    let outputs = [];
    
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
    
    // Build combined response
    const response = {
      // Service configuration
      service: {
        id: serviceData.id,
        name: serviceData.name || 'Untitled Service',
        description: serviceData.description || '',
        inputs,
        outputs,
        enableCaching: serviceData.cacheEnabled !== 'false',
        requireToken: serviceData.requireToken === 'true',
        workbookUrl: serviceData.workbookUrl,
        workbookSize: serviceData.workbookSize,
        workbookModified: serviceData.workbookModified,
        createdAt: serviceData.createdAt,
        updatedAt: serviceData.updatedAt
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