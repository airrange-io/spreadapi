import { NextResponse } from 'next/server';
import { getService } from '@/lib/storage';

// GET /api/services/[serviceId] - Get service info
export async function GET(request, { params }) {
  try {
    const { serviceId } = await params;
    const service = await getService(serviceId);

    if (!service) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `Service '${serviceId}' not found` },
        { status: 404 }
      );
    }

    const apiJson = service.apiJson || {};

    return NextResponse.json({
      serviceId: service.serviceId,
      name: apiJson.name || service.name || 'Unnamed',
      title: apiJson.title || service.title || 'Untitled',
      description: apiJson.description || service.description || '',
      uploadedAt: service.uploadedAt,
      inputs: (apiJson.inputs || []).map(inp => ({
        name: inp.name,
        title: inp.title || inp.name,
        type: inp.type || 'string',
        required: inp.mandatory !== false,
        description: inp.description,
        min: inp.min,
        max: inp.max,
        defaultValue: inp.defaultValue,
      })),
      outputs: (apiJson.outputs || []).map(out => ({
        name: out.name,
        title: out.title || out.name,
        type: out.type || 'any',
        description: out.description,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to get service', message: err.message },
      { status: 500 }
    );
  }
}
