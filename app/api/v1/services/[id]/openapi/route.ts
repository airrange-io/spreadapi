import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateOpenAPISpec } from '@/lib/openapi/generator';
import yaml from 'yaml';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json or yaml

    // Check if service is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'NOT_FOUND',
        message: 'Service not found or not published'
      }, { status: 404 });
    }

    // Get service definition
    const publishedDataRaw = await redis.hGetAll(`service:${serviceId}:published`);
    const publishedData: any = publishedDataRaw;

    const definition = {
      name: publishedData.title || 'Untitled Service',
      description: publishedData.description || '',
      inputs: JSON.parse(publishedData.inputs || '[]'),
      outputs: JSON.parse(publishedData.outputs || '[]'),
      requiresToken: publishedData.needsToken === 'true'
    };

    // Generate OpenAPI spec
    const spec = generateOpenAPISpec(serviceId, definition);

    // Return in requested format
    if (format === 'yaml') {
      const yamlSpec = yaml.stringify(spec);
      return new NextResponse(yamlSpec, {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    return NextResponse.json(spec, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate OpenAPI specification'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
