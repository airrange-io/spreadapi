import { NextResponse, after } from 'next/server';
import redis from '@/lib/redis';
import { calculateDirect, logCalls } from '../execute/calculateDirect';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { createErrorResponse } from '@/lib/errors';
import { normalizeInputKeys } from '@/lib/inputNormalizer';

// Vercel timeout configuration - Critical for batch processing!
export const maxDuration = 30;

/**
 * POST /api/v1/services/{id}/batch
 *
 * Execute multiple calculations in a single request
 * Maximum 100 requests per batch
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const batchStart = Date.now();

  try {
    const { id: serviceId } = await params;
    const body = await request.json();

    // Validate batch request
    if (!body.requests || !Array.isArray(body.requests)) {
      const { body: errorBody, status } = createErrorResponse(
        'INVALID_REQUEST',
        'Request body must contain "requests" array'
      );
      return NextResponse.json(errorBody, { status });
    }

    // Limit batch size
    const maxBatchSize = 100;
    if (body.requests.length > maxBatchSize) {
      const { body: errorBody, status } = createErrorResponse(
        'INVALID_REQUEST',
        `Batch size exceeds maximum of ${maxBatchSize} requests`,
        {
          details: { max: maxBatchSize, provided: body.requests.length }
        }
      );
      return NextResponse.json(errorBody, { status });
    }

    if (body.requests.length === 0) {
      const { body: errorBody, status } = createErrorResponse(
        'INVALID_REQUEST',
        'Requests array cannot be empty'
      );
      return NextResponse.json(errorBody, { status });
    }

    // Check service exists
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      const { body: errorBody, status } = createErrorResponse('NOT_FOUND');
      return NextResponse.json(errorBody, { status });
    }

    // Rate limiting (count as batch.length requests)
    const token = body.token;
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const rateLimitConfig = token ? RATE_LIMITS.PRO : RATE_LIMITS.IP_LIMIT;
    const rateLimitKey = token ? `service:${serviceId}:token:${token}` : `ip:${clientIp}`;

    // Check if batch fits within rate limit
    // We need to check if we have enough remaining requests for the batch
    const rateLimitResult = await checkRateLimit(rateLimitKey, rateLimitConfig);

    // For batch, check if remaining requests can accommodate the batch size
    if (rateLimitResult.remaining < body.requests.length) {
      const { body: errorBody, status } = createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        `Batch size ${body.requests.length} would exceed rate limit. Only ${rateLimitResult.remaining} requests remaining.`,
        {
          details: {
            batchSize: body.requests.length,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining
          }
        }
      );
      return NextResponse.json(errorBody, {
        status,
        headers: getRateLimitHeaders(rateLimitResult)
      });
    }

    // Execute all requests with concurrency control and timeout
    const MAX_CONCURRENT = 10; // Limit concurrent executions
    const CALCULATION_TIMEOUT = 30000; // 30 seconds per calculation

    const executeWithTimeout = async (req: any, index: number) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Calculation timeout')), CALCULATION_TIMEOUT)
      );

      const calculationPromise = (async () => {
        try {
          if (!req.inputs || typeof req.inputs !== 'object') {
            throw new Error(`Request ${index}: inputs must be an object`);
          }

          // Normalize input keys to lowercase for consistent lookups
          const normalizedInputs = normalizeInputKeys(req.inputs);

          const result = await calculateDirect(
            serviceId,
            normalizedInputs,
            token,
            {
              nocdn: body.nocdn || req.nocdn,
              nocache: body.nocache || req.nocache
            }
          );

          return {
            index,
            success: !result.error,
            ...(result.error ? {
              error: result.error,
              message: result.message
            } : {
              outputs: result.outputs,
              metadata: result.metadata
            })
          };
        } catch (error: any) {
          return {
            index,
            success: false,
            error: 'CALCULATION_ERROR',
            message: error.message
          };
        }
      })();

      return Promise.race([calculationPromise, timeoutPromise]);
    };

    // Process in batches of MAX_CONCURRENT
    const results: any[] = [];
    for (let i = 0; i < body.requests.length; i += MAX_CONCURRENT) {
      const batch = body.requests.slice(i, i + MAX_CONCURRENT);
      const batchResults = await Promise.allSettled(
        batch.map((req, batchIndex) => executeWithTimeout(req, i + batchIndex))
      );
      results.push(...batchResults);
    }

    // Format results
    const responses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          index,
          success: false,
          error: 'INTERNAL_ERROR',
          message: result.reason?.message || 'Unknown error'
        };
      }
    });

    const successCount = responses.filter(r => r.success).length;
    const errorCount = responses.length - successCount;

    const batchTime = Date.now() - batchStart;

    // Log call counts for each successful calculation
    after(async () => {
      for (let i = 0; i < successCount; i++) {
        await logCalls(serviceId, token);
      }
    });

    return NextResponse.json({
      serviceId,
      batch: {
        total: body.requests.length,
        successful: successCount,
        failed: errorCount,
        executionTime: batchTime
      },
      results: responses,
      metadata: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        ...getRateLimitHeaders(rateLimitResult),
        'Cache-Control': 'no-store' // Batch results should not be cached
      }
    });

  } catch (error: any) {
    console.error('Batch execution error:', error);
    const { body: errorBody, status } = createErrorResponse(
      'INTERNAL_ERROR',
      error.message
    );
    return NextResponse.json(errorBody, { status });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
