import { createServiceAI } from '@/lib/serviceAI';
import { getServiceDetails } from '@/utils/serviceHelpers';

// API endpoint for AI-powered service configuration suggestions
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { conversationHistory = [] } = body;

    // Get user ID from headers
    // For AI suggestions, we extract the owner from the service ID instead of strict auth check
    // Service IDs are in format: userId_serviceKey
    const userId = id.includes('_') ? id.split('_')[0] : null;

    // Fetch full service details
    const serviceDetails = await getServiceDetails(id, userId);

    if (!serviceDetails) {
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create ServiceAI instance and generate suggestions
    const serviceAI = createServiceAI(serviceDetails);
    const result = await serviceAI.generateAIInfo(conversationHistory);

    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Suggest AI Info] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate suggestions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
