import { NextResponse, after } from 'next/server';
import redis from '../../lib/redis.js';
import { calculateDirect, logCalls } from './calculateDirect.js';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '../../lib/rateLimit.ts';
import { createErrorResponse } from '../../lib/errors.ts';
import { parseAuthToken } from '../../utils/tokenUtils.js';
import { normalizeInputKeys } from '../../lib/inputNormalizer.js';

export const maxDuration = 30;

function getSuggestion(error) {
  const e = (error || '').toLowerCase();
  if (e.includes('authentication') || e.includes('token')) {
    return 'Provide a valid API token via the "token" parameter or Authorization header';
  }
  if (e.includes('not found') || e.includes('not published')) {
    return 'Check that the service ID is correct and the service is published';
  }
  if (e.includes('parameter') || e.includes('validation') || e.includes('required')) {
    return 'Check that all required parameters are provided with correct types';
  }
  if (e.includes('timeout')) {
    return 'The request timed out. Try again or simplify the calculation';
  }
  if (e.includes('sheet')) {
    return 'The workbook structure may have changed. Try republishing the service';
  }
  return null;
}

export async function POST(request, { params }) {
  const totalStart = Date.now();

  try {
    const { id: serviceId } = await params;

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
        details: { parseError: parseError.message }
      }, { status: 400 });
    }

    // Validate inputs
    if (!body.inputs || typeof body.inputs !== 'object') {
      const { body: errorBody, status } = createErrorResponse('INVALID_REQUEST', 'Request body must contain "inputs" object');
      return NextResponse.json({
        ...errorBody,
        details: {
          received: body.inputs === undefined ? 'missing' : typeof body.inputs,
          expected: 'object',
          example: { inputs: { param1: 'value1' } }
        }
      }, { status });
    }

    // Get token
    let token = body.token;
    if (!token) {
      token = parseAuthToken(request.headers.get('authorization'));
    }

    // Check webApp token
    let isWebAppAuthenticated = false;
    if (token && !token.startsWith('svc_tk_')) {
      try {
        const webAppToken = await redis.hGet(`service:${serviceId}`, 'webAppToken');
        if (webAppToken === token) {
          isWebAppAuthenticated = true;
        }
      } catch (err) {
        console.error('WebApp token check error:', err.message);
      }
    }

    // Rate limiting
    let rateLimitResult;
    try {
      rateLimitResult = await checkRateLimit(`service:${serviceId}`, RATE_LIMITS.PRO);
    } catch (err) {
      console.error('Rate limit error:', err.message);
      rateLimitResult = { allowed: true, limit: 1000, remaining: 999, reset: Date.now() + 60000 };
    }

    if (!rateLimitResult.allowed) {
      const { body: errorBody, status } = createErrorResponse('RATE_LIMIT_EXCEEDED', `Rate limit exceeded. Max ${RATE_LIMITS.PRO.maxRequests} requests/minute.`);
      return NextResponse.json(errorBody, { status, headers: getRateLimitHeaders(rateLimitResult) });
    }

    // Check service exists
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      let serviceExists = false;
      try {
        serviceExists = await redis.exists(`service:${serviceId}`);
      } catch (e) {}

      const message = serviceExists ? 'Service exists but is not published' : 'Service not found';
      return NextResponse.json({
        error: 'Not found',
        message,
        serviceId,
        suggestion: getSuggestion(message)
      }, { status: 404 });
    }

    // Normalize input keys to lowercase for consistent lookups
    const normalizedInputs = normalizeInputKeys(body.inputs);

    // Execute
    const result = await calculateDirect(serviceId, normalizedInputs, token, {
      nocdn: body.nocdn,
      nocache: body.nocache,
      isWebAppAuthenticated
    });

    // Log call counts after response (Vercel keeps function alive with after())
    after(() => logCalls(serviceId, token));

    if (result.error) {
      // Return detailed error if available (e.g., from 404 handling with parameters)
      if (result.parameters || result.service) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json({
        error: result.error,
        message: result.message || result.error,
        serviceId,
        inputs: body.inputs,
        details: result.details || null,
        suggestion: getSuggestion(result.error)
      }, { status: 400 });
    }

    const totalTime = Date.now() - totalStart;

    // Track analytics after response (non-blocking)
    const responseTime = result.metadata?.executionTime || totalTime;
    if (responseTime > 0) {
      after(async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const multi = redis.multi();

          multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:response_time_sum`, responseTime);
          multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:response_time_count`, 1);

          let bucket = '0-50ms';
          if (responseTime > 1000) bucket = '>1000ms';
          else if (responseTime > 500) bucket = '500-1000ms';
          else if (responseTime > 200) bucket = '200-500ms';
          else if (responseTime > 100) bucket = '100-200ms';
          else if (responseTime > 50) bucket = '50-100ms';

          multi.hIncrBy(`service:${serviceId}:analytics`, `response_dist:${bucket}`, 1);
          await multi.exec();
        } catch (err) {
          console.error('Analytics error:', err.message);
        }
      });
    }

    const headers = {
      'Access-Control-Allow-Origin': '*',
      ...getRateLimitHeaders(rateLimitResult)
    };

    if (body.nocdn || body.nocache) {
      headers['Cache-Control'] = 'no-store';
      headers['CDN-Cache-Control'] = 'no-store';
      headers['Vercel-CDN-Cache-Control'] = 'no-store';
    } else {
      headers['Cache-Control'] = 'public, max-age=300';
      headers['CDN-Cache-Control'] = 'max-age=300';
      headers['Vercel-CDN-Cache-Control'] = 'max-age=300';
    }

    return NextResponse.json({
      serviceId,
      serviceName: result.serviceName || null,
      serviceDescription: result.serviceDescription || null,
      inputs: result.inputs || [],
      outputs: result.outputs || [],
      metadata: {
        ...result.metadata,
        totalTime,
        timestamp: new Date().toISOString()
      }
    }, { headers });

  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);

    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found or not published'
      }, { status: 404 });
    }

    const format = searchParams.get('_format') || 'json';
    const pretty = searchParams.get('_pretty') === 'true';
    const nocdn = searchParams.get('nocdn') === 'true';
    const nocache = searchParams.get('nocache') === 'true';

    const inputs = {};
    let token = null;

    for (const [key, value] of searchParams) {
      if (key.toLowerCase() === 'token') {
        token = value;
      } else if (!['nocdn', 'nocache'].includes(key.toLowerCase()) && !key.startsWith('_')) {
        let parsedValue = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else {
          const numValue = Number(value);
          if (!isNaN(numValue) && value !== '') parsedValue = numValue;
        }
        // Normalize key to lowercase for consistent lookups
        inputs[key.toLowerCase()] = parsedValue;
      }
    }

    const postBody = { inputs };
    if (token) postBody.token = token;
    if (nocdn) postBody.nocdn = nocdn;
    if (nocache) postBody.nocache = nocache;

    const newHeaders = new Headers();
    const auth = request.headers.get('authorization');
    if (auth) newHeaders.set('authorization', auth);
    newHeaders.set('content-type', 'application/json');

    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: newHeaders,
      body: JSON.stringify(postBody)
    });

    const response = await POST(postRequest, { params: Promise.resolve({ id: serviceId }) });
    if (!response.ok) return response;

    const data = await response.json();

    const cacheHeaders = { 'Access-Control-Allow-Origin': '*' };
    if (nocdn || nocache) {
      cacheHeaders['Cache-Control'] = 'no-store';
      cacheHeaders['CDN-Cache-Control'] = 'no-store';
      cacheHeaders['Vercel-CDN-Cache-Control'] = 'no-store';
    } else {
      cacheHeaders['Cache-Control'] = 'public, max-age=300';
      cacheHeaders['CDN-Cache-Control'] = 'max-age=300';
      cacheHeaders['Vercel-CDN-Cache-Control'] = 'max-age=300';
    }

    if (format === 'plain') {
      const outputs = data.outputs || [];
      const text = Array.isArray(outputs)
        ? outputs.map(o => `${o.name}: ${o.value}`).join('\n')
        : Object.entries(outputs).map(([k, v]) => `${k}: ${v}`).join('\n');
      return new NextResponse(text, { headers: { 'Content-Type': 'text/plain', ...cacheHeaders } });
    }

    if (format === 'csv') {
      const outputs = data.outputs || [];
      const csvHeaders = Array.isArray(outputs) ? outputs.map(o => o.name).join(',') : Object.keys(outputs).join(',');
      const values = Array.isArray(outputs) ? outputs.map(o => o.value).join(',') : Object.values(outputs).join(',');
      return new NextResponse(`${csvHeaders}\n${values}`, { headers: { 'Content-Type': 'text/csv', ...cacheHeaders } });
    }

    if (pretty) {
      return new NextResponse(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json', ...cacheHeaders } });
    }

    return NextResponse.json(data, { headers: cacheHeaders });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

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
