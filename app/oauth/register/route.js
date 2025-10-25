import { NextResponse } from 'next/server';
import crypto from 'crypto';
import redis from '@/lib/redis';

/**
 * OAuth 2.0 Dynamic Client Registration Endpoint (RFC 7591)
 *
 * This endpoint allows OAuth clients (like ChatGPT) to register themselves
 * dynamically and obtain a client_id without manual configuration.
 *
 * ChatGPT will POST to this endpoint with client metadata, and we return
 * a client_id and registration details.
 *
 * For our token-based OAuth model, we accept all registrations and generate
 * client IDs, but don't require client secrets (public clients).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      client_name,
      redirect_uris = [],
      grant_types = ['authorization_code'],
      response_types = ['code'],
      token_endpoint_auth_method = 'none',
      scope,
    } = body;

    console.log('[OAuth Registration] Client registration request:', {
      client_name,
      redirect_uris,
    });

    // Validate redirect URIs (required for authorization code flow)
    if (!redirect_uris || redirect_uris.length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_redirect_uri',
          error_description: 'At least one redirect_uri is required',
        },
        { status: 400 }
      );
    }

    // Validate redirect URIs for ChatGPT
    const allowedRedirectUriPatterns = [
      /^https:\/\/chatgpt\.com\//,
      /^https:\/\/chat\.openai\.com\//,
    ];

    const validRedirectUris = redirect_uris.filter((uri) =>
      allowedRedirectUriPatterns.some((pattern) => pattern.test(uri))
    );

    if (validRedirectUris.length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_redirect_uri',
          error_description: 'Only ChatGPT redirect URIs are allowed',
        },
        { status: 400 }
      );
    }

    // Generate client_id
    const clientId = `dcr_${crypto.randomBytes(16).toString('hex')}`;

    // Store client registration in Redis
    const clientData = {
      client_id: clientId,
      client_name: client_name || 'ChatGPT',
      redirect_uris: JSON.stringify(validRedirectUris),
      grant_types: JSON.stringify(grant_types),
      response_types: JSON.stringify(response_types),
      token_endpoint_auth_method,
      scope: scope || 'mcp:read mcp:write',
      registered_at: Date.now().toString(),
    };

    await redis.hSet(`oauth:client:${clientId}`, clientData);

    // Set expiry to 30 days (clients can re-register if needed)
    await redis.expire(`oauth:client:${clientId}`, 30 * 24 * 60 * 60);

    console.log('[OAuth Registration] Client registered:', {
      client_id: clientId,
      client_name: client_name || 'ChatGPT',
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

    // Return client metadata (RFC 7591 response)
    return NextResponse.json(
      {
        client_id: clientId,
        client_name: client_name || 'ChatGPT',
        redirect_uris: validRedirectUris,
        grant_types,
        response_types,
        token_endpoint_auth_method,
        scope: scope || 'mcp:read mcp:write',

        // Informational fields
        client_id_issued_at: Math.floor(Date.now() / 1000),
        registration_access_token: null, // Not implementing update/delete for now
        registration_client_uri: `${baseUrl}/oauth/register?client_id=${clientId}`,

        // OAuth endpoints
        authorization_endpoint: `${baseUrl}/oauth/authorize`,
        token_endpoint: `${baseUrl}/oauth/token`,
      },
      {
        status: 201, // Created
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[OAuth Registration] Error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Failed to register client',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for retrieving client configuration (RFC 7591)
 * ChatGPT may call this to verify registration
 */
export async function GET(request) {
  // Extract client_id from query params
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');

  if (!clientId) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'client_id is required',
      },
      { status: 400 }
    );
  }

  try {
    // Retrieve client data from Redis
    const clientData = await redis.hGetAll(`oauth:client:${clientId}`);

    if (!clientData || Object.keys(clientData).length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_client',
          error_description: 'Client not found',
        },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

    // Return client configuration
    return NextResponse.json({
      client_id: clientData.client_id,
      client_name: clientData.client_name,
      redirect_uris: JSON.parse(clientData.redirect_uris),
      grant_types: JSON.parse(clientData.grant_types),
      response_types: JSON.parse(clientData.response_types),
      token_endpoint_auth_method: clientData.token_endpoint_auth_method,
      scope: clientData.scope,
      client_id_issued_at: parseInt(clientData.registered_at) / 1000,
      registration_client_uri: `${baseUrl}/oauth/register?client_id=${clientData.client_id}`,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/api/oauth/token`,
    });
  } catch (error) {
    console.error('[OAuth Registration] Error retrieving client:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Failed to retrieve client configuration',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
