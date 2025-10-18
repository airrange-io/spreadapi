import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET /api/services/[id]/webapp?token=xxx - Get service data for web app (public, token-validated)
export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    // Always use the current draft version for web app settings
    // This way users only need to "Save" - no need to republish
    const serviceData = await redis.hGetAll(`service:${serviceId}`);

    if (!serviceData || Object.keys(serviceData).length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Validate web app is enabled and token matches
    const webAppEnabled = serviceData.webAppEnabled === 'true' || serviceData.webAppEnabled === true;

    if (!webAppEnabled) {
      return NextResponse.json(
        { error: 'Web app not enabled for this service. Please enable it in Settings and click Save.' },
        { status: 403 }
      );
    }

    if (serviceData.webAppToken !== token) {
      return NextResponse.json(
        { error: 'Invalid access token. Please check your URL or regenerate the token.' },
        { status: 403 }
      );
    }

    // Parse JSON fields
    const inputs = JSON.parse(serviceData.inputs || '[]');
    const outputs = JSON.parse(serviceData.outputs || '[]');

    const response = {
      name: serviceData.name || '',
      description: serviceData.description || '',
      inputs: inputs,
      outputs: outputs,
      webAppEnabled: serviceData.webAppEnabled === 'true',
      webAppToken: serviceData.webAppToken
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching web app service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
