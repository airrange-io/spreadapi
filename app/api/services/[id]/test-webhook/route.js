import { NextResponse } from 'next/server';
import { testWebhook } from '@/lib/webhookHelpers.js';

// Simple rate limiting for webhook tests (max 10 per minute per service)
const testRateLimiter = new Map();
const MAX_TESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function isTestRateLimited(serviceId) {
  const now = Date.now();
  const tracker = testRateLimiter.get(serviceId);

  if (!tracker) {
    testRateLimiter.set(serviceId, { count: 1, windowStart: now });
    return false;
  }

  // Check if window expired
  if (now - tracker.windowStart > RATE_LIMIT_WINDOW) {
    tracker.count = 1;
    tracker.windowStart = now;
    return false;
  }

  // Increment count
  tracker.count++;

  // Check limit
  if (tracker.count > MAX_TESTS_PER_MINUTE) {
    return true;
  }

  return false;
}

/**
 * POST /api/services/[id]/test-webhook
 * Test webhook configuration before saving
 */
export async function POST(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const body = await request.json();
    const { webhookUrl, webhookSecret } = body;

    // Validate required fields
    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'webhookUrl is required'
        },
        { status: 400 }
      );
    }

    // Rate limiting check
    if (isTestRateLimited(serviceId)) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Maximum ${MAX_TESTS_PER_MINUTE} tests per minute allowed.`
        },
        { status: 429 }
      );
    }

    // Test the webhook using the helper function
    const result = await testWebhook(webhookUrl, webhookSecret);

    // Return result (success or failure details)
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test webhook: ' + error.message
      },
      { status: 500 }
    );
  }
}
