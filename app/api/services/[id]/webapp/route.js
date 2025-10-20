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

    // Note: inputs and outputs include format information:
    // - inputs: format, percentageDecimals, allowedValues, min, max, defaultValue, etc.
    // - outputs: formatString (e.g., "€#,##0.00", "#,##0.0 kg", "0.00%")
    // This allows web apps to properly format and display values

    const response = {
      name: serviceData.name || '',
      description: serviceData.description || '',
      inputs: inputs.map(input => ({
        ...input,
        // Ensure format information is included
        ...(input.format && { format: input.format }),
        ...(input.percentageDecimals !== undefined && { percentageDecimals: input.percentageDecimals }),
        ...(input.formatter && { formatter: input.formatter })
      })),
      outputs: outputs.map(output => ({
        ...output,
        // Include simple, editable format string
        ...(output.formatString && { formatString: output.formatString })
      })),
      webAppEnabled: serviceData.webAppEnabled === 'true',
      webAppToken: serviceData.webAppToken,
      webAppConfig: serviceData.webAppConfig || ''
    };

    return NextResponse.json(response, {
      headers: {
        // Cache for 60 seconds, allow stale content while revalidating
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        // Security headers for embedded contexts
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      }
    });
  } catch (error) {
    console.error('Error fetching web app service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
