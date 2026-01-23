import { NextResponse } from 'next/server';
import { getService } from '@/lib/storage';
import { executeCalculation } from '@/lib/calculate';

export const maxDuration = 30;

// POST /api/execute/[serviceId]
export async function POST(request, { params }) {
  try {
    const { serviceId } = await params;
    const body = await request.json();
    const inputs = body.inputs || body;

    // Get service
    const service = await getService(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `Service '${serviceId}' not found` },
        { status: 404 }
      );
    }

    // Execute calculation
    const result = await executeCalculation(service, inputs, {
      method: 'POST',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    if (result.error) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);

  } catch (err) {
    console.error('Execute error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

// GET /api/execute/[serviceId]?param1=value1&param2=value2
export async function GET(request, { params }) {
  try {
    const { serviceId } = await params;
    const { searchParams } = new URL(request.url);

    // Convert query params to inputs
    const inputs = {};
    for (const [key, value] of searchParams) {
      if (key.startsWith('_')) continue; // Skip special params

      // Try to parse as number or boolean
      let parsed = value;
      if (value === 'true') parsed = true;
      else if (value === 'false') parsed = false;
      else if (!isNaN(Number(value)) && value !== '') parsed = Number(value);

      inputs[key] = parsed;
    }

    // Get service
    const service = await getService(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `Service '${serviceId}' not found` },
        { status: 404 }
      );
    }

    // Execute calculation
    const result = await executeCalculation(service, inputs, {
      method: 'GET',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    if (result.error) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);

  } catch (err) {
    console.error('Execute error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
