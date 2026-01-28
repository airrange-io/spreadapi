import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { calculateDirect } from './calculateDirect';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { createErrorResponse } from '@/lib/errors';
import { parseAuthToken } from '@/utils/tokenUtils';

export const maxDuration = 30;

/**
 * SpreadAPI.run - High-performance service execution
 * 100% compatible with spreadapi.io/api/v1/services/{id}/execute
 */

export async function POST(request, { params }) {
  const totalStart = Date.now();
  try {
    const { id: serviceId } = await params;
    const body = await request.json();

    if (!body.inputs || typeof body.inputs !== 'object') {
      const { body: errorBody, status } = createErrorResponse('INVALID_REQUEST', 'Request body must contain "inputs" object');
      return NextResponse.json(errorBody, { status });
    }

    let token = body.token;
    if (!token) {
      token = parseAuthToken(request.headers.get('authorization'));
    }

    let isWebAppAuthenticated = false;
    if (token && !token.startsWith('svc_tk_')) {
      const webAppToken = await redis.hGet(`service:${serviceId}`, 'webAppToken');
      if (webAppToken === token) {
        isWebAppAuthenticated = true;
      }
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(`service:${serviceId}`, RATE_LIMITS.PRO);
    if (!rateLimitResult.allowed) {
      const { body: errorBody, status } = createErrorResponse('RATE_LIMIT_EXCEEDED', `Rate limit exceeded. Max ${RATE_LIMITS.PRO.maxRequests} requests/minute.`);
      return NextResponse.json(errorBody, { status, headers: getRateLimitHeaders(rateLimitResult) });
    }

    // Check service exists
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({ error: 'Not found', message: 'Service not found or not published' }, { status: 404 });
    }

    // Execute
    const result = await calculateDirect(serviceId, body.inputs, token, {
      nocdn: body.nocdn,
      nocache: body.nocache,
      isWebAppAuthenticated
    });

    if (result.error) {
      return NextResponse.json({
        error: result.error,
        message: result.message || result.error,
        serviceId,
        inputs: body.inputs,
        details: result.details || null
      }, { status: 400 });
    }

    const totalTime = Date.now() - totalStart;

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
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { headers });

  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);

    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({ error: 'Not found', message: 'Service not found or not published' }, { status: 404 });
    }

    const format = searchParams.get('_format') || 'json';
    const pretty = searchParams.get('_pretty') === 'true';
    const nocdn = searchParams.get('nocdn') === 'true';
    const nocache = searchParams.get('nocache') === 'true';

    const inputs = {};
    let token = null;

    for (const [key, value] of searchParams) {
      if (key === 'token') {
        token = value;
      } else if (!['nocdn', 'nocache'].includes(key) && !key.startsWith('_')) {
        let parsedValue = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else {
          const numValue = Number(value);
          if (!isNaN(numValue) && value !== '') parsedValue = numValue;
        }
        inputs[key] = parsedValue;
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
      const headers = Array.isArray(outputs) ? outputs.map(o => o.name).join(',') : Object.keys(outputs).join(',');
      const values = Array.isArray(outputs) ? outputs.map(o => o.value).join(',') : Object.values(outputs).join(',');
      return new NextResponse(`${headers}\n${values}`, { headers: { 'Content-Type': 'text/csv', ...cacheHeaders } });
    }

    if (pretty) {
      return new NextResponse(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json', ...cacheHeaders } });
    }

    return NextResponse.json(data, { headers: cacheHeaders });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
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
