import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { calculateDirect } from './calculateDirect';

/**
 * Execute a SpreadAPI service calculation
 *
 * POST /api/v1/services/{id}/execute
 * Body: { "inputs": { "param1": "value1", "param2": "value2" } }
 *
 * GET /api/v1/services/{id}/execute?param1=value1&param2=value2
 */

export async function POST(request, { params}) {
  const totalStart = Date.now();
  try {
    const { id: serviceId } = await params;
    const body = await request.json();
    console.log(`[v1/execute] Request parsing: ${Date.now() - totalStart}ms`);
    
    // Validate request
    if (!body.inputs || typeof body.inputs !== 'object') {
      return NextResponse.json({
        error: 'Invalid request',
        message: 'Request body must contain "inputs" object'
      }, { status: 400 });
    }
    
    // Check if service exists and is published
    const checkStart = Date.now();
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    console.log(`[v1/execute] Redis check: ${Date.now() - checkStart}ms`);
    
    if (!isPublished) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found or not published'
      }, { status: 404 });
    }
    
    // Result cache check now handled inside calculateDirect()
    // This allows all callers (route, MCP, chat) to benefit from result caching

    // Use direct calculation instead of HTTP call
    const calcStart = Date.now();
    const result = await calculateDirect(serviceId, body.inputs, body.token, {
      nocache: body.nocache
    });
    console.log(`[v1/execute] Direct calculation: ${Date.now() - calcStart}ms`);
    
    if (result.error) {
      return NextResponse.json({
        error: result.error,
        message: result.message || result.error,
        serviceId,
        inputs: body.inputs,
        details: result.parameters || result.details || null
      }, { status: 400 });
    }
    
    const totalTime = Date.now() - totalStart;
    console.log(`[v1/execute] Total execution time: ${totalTime}ms`);
    
    // Track response time analytics
    const responseTime = result.metadata?.executionTime || totalTime;
    if (responseTime > 0) {
      Promise.resolve().then(async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const multi = redis.multi();
          
          // Store response time for this request
          multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:response_time_sum`, responseTime);
          multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:response_time_count`, 1);
          
          // Track response time distribution
          let bucket = '0-50ms';
          if (responseTime > 1000) bucket = '>1000ms';
          else if (responseTime > 500) bucket = '500-1000ms';
          else if (responseTime > 200) bucket = '200-500ms';
          else if (responseTime > 100) bucket = '100-200ms';
          else if (responseTime > 50) bucket = '50-100ms';
          
          multi.hIncrBy(`service:${serviceId}:analytics`, `response_dist:${bucket}`, 1);
          
          await multi.exec();
          
          // Calculate average
          const [sumStr, countStr] = await redis.hmGet(
            `service:${serviceId}:analytics`,
            [`${today}:response_time_sum`, `${today}:response_time_count`]
          );
          
          if (sumStr && countStr) {
            const sum = parseInt(sumStr);
            const count = parseInt(countStr);
            const avg = Math.round(sum / count);
            await redis.hSet(`service:${serviceId}:analytics`, {
              [`${today}:avg_response_time`]: avg.toString(),
              'avg_response_time': avg.toString()
            });
          }
        } catch (err) {
          console.error('Error tracking response time:', err);
        }
      });
    }
    
    // HTTP edge caching strategy (per Vercel docs)
    // If nocache requested, bypass all caching layers
    // Otherwise use edge cache for performance
    const headers = {
      'Access-Control-Allow-Origin': '*', // CORS for browser requests
    };

    if (body.nocache) {
      // Bypass all caches: browser, other CDNs, and Vercel edge
      headers['Cache-Control'] = 'no-store';
      headers['CDN-Cache-Control'] = 'no-store';
      headers['Vercel-CDN-Cache-Control'] = 'no-store';
    } else {
      // Multi-layer caching strategy:
      // Browser: 5 minutes, Other CDNs: 5 minutes, Vercel Edge: 5 minutes
      headers['Cache-Control'] = 'public, max-age=300';
      headers['CDN-Cache-Control'] = 'max-age=300';
      headers['Vercel-CDN-Cache-Control'] = 'max-age=300';
    }

    return NextResponse.json({
      serviceId,
      inputs: result.inputs || [],
      outputs: result.outputs || [],
      metadata: {
        ...result.metadata,
        totalTime,
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { headers });
    
  } catch (error) {
    console.error('Service execution error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// GET method for simple calculations (Excel, browser testing, etc.)
export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Check if service exists and is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found or not published'
      }, { status: 404 });
    }
    
    // For GET requests, token is passed as query parameter
    // Token validation is handled by calculateDirect()
    
    // Extract special parameters
    const format = searchParams.get('_format') || 'json'; // json, csv, plain
    const pretty = searchParams.get('_pretty') === 'true';
    const nocache = searchParams.get('nocache') === 'true';

    // Convert query params to inputs object (excluding special params)
    const inputs = {};
    let token = null;

    for (const [key, value] of searchParams) {
      if (key === 'token') {
        token = value;
      } else if (key === 'nocache') {
        // Skip nocache - already extracted above
      } else if (!key.startsWith('_')) {
        // Parse value types: boolean > number > string
        let parsedValue = value;

        // Check for boolean
        if (value === 'true') {
          parsedValue = true;
        } else if (value === 'false') {
          parsedValue = false;
        } else {
          // Try to parse as number
          const numValue = Number(value);
          if (!isNaN(numValue) && value !== '') {
            parsedValue = numValue;
          }
        }

        inputs[key] = parsedValue;
      }
    }
    
    // Delegate to POST handler
    const postBody = { inputs };
    if (token) {
      postBody.token = token;
    }
    if (nocache) {
      postBody.nocache = nocache;
    }
    
    // Create a new request with proper headers
    const newHeaders = new Headers();
    // Copy necessary headers
    const contentType = request.headers.get('content-type');
    if (contentType) newHeaders.set('content-type', contentType);
    const auth = request.headers.get('authorization');
    if (auth) newHeaders.set('authorization', auth);
    const cookie = request.headers.get('cookie');
    if (cookie) newHeaders.set('cookie', cookie);
    
    // Set content-type for JSON
    newHeaders.set('content-type', 'application/json');
    
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: newHeaders,
      body: JSON.stringify(postBody)
    });
    
    const response = await POST(postRequest, { params: await params });
    
    // Check if the response is an error
    if (!response.ok) {
      return response; // Return error response as-is
    }
    
    const data = await response.json();

    // HTTP edge caching strategy (per Vercel docs) - same as POST
    const cacheHeaders = {
      'Access-Control-Allow-Origin': '*',
    };

    if (nocache) {
      cacheHeaders['Cache-Control'] = 'no-store';
      cacheHeaders['CDN-Cache-Control'] = 'no-store';
      cacheHeaders['Vercel-CDN-Cache-Control'] = 'no-store';
    } else {
      cacheHeaders['Cache-Control'] = 'public, max-age=300';
      cacheHeaders['CDN-Cache-Control'] = 'max-age=300';
      cacheHeaders['Vercel-CDN-Cache-Control'] = 'max-age=300';
    }

    // Format response based on _format parameter
    if (format === 'plain') {
      // Plain text for Excel WEBSERVICE function
      const outputs = data.outputs || [];
      let text = '';

      // Handle both object and array formats
      if (Array.isArray(outputs)) {
        text = outputs
          .map(output => `${output.alias || output.name}: ${output.value}`)
          .join('\n');
      } else if (typeof outputs === 'object') {
        text = Object.entries(outputs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }

      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          ...cacheHeaders,
        }
      });
    }

    if (format === 'csv') {
      // CSV format for Excel import
      const outputs = data.outputs || [];
      let headers = '';
      let values = '';

      // Handle both object and array formats
      if (Array.isArray(outputs)) {
        headers = outputs.map(o => o.alias || o.name).join(',');
        values = outputs.map(o => o.value).join(',');
      } else if (typeof outputs === 'object') {
        headers = Object.keys(outputs).join(',');
        values = Object.values(outputs).join(',');
      }

      const csv = `${headers}\n${values}`;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          ...cacheHeaders,
        }
      });
    }

    // Default JSON response
    if (pretty) {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          ...cacheHeaders,
        }
      });
    }

    // Return the data as JSON with CORS headers
    return NextResponse.json(data, {
      headers: cacheHeaders,
    });
    
  } catch (error) {
    console.error('GET execution error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
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
    }
  });
}