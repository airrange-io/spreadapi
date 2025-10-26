import { NextResponse } from 'next/server';
import { createAuthorizationCode } from '@/lib/oauth-codes';
import { validateServiceToken } from '@/utils/tokenAuth';
import redis from '@/lib/redis';
import { rateLimitByIP, createRateLimitResponse } from '@/lib/rate-limiter';

/**
 * OAuth Authorization Endpoint - Backend API
 *
 * Single-service authorization for ChatGPT MCP integration.
 *
 * The user provides a service_id and optional service_token (for private services).
 * We validate the token if provided, and generate an authorization code.
 *
 * This makes OAuth a thin wrapper around service tokens to satisfy
 * ChatGPT's OAuth requirement while keeping the same permission model.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      client_id,
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method,
      service_id,      // Single service ID
      service_token,   // Optional service token (null for public services)
    } = body;

    // Rate limiting: 10 req/min per IP
    const rateCheck = await rateLimitByIP(request, 'oauth_authorize', 10, 60);

    if (rateCheck.limited) {
      return NextResponse.json(
        createRateLimitResponse(rateCheck.retryAfter),
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfter.toString(),
          },
        }
      );
    }

    // Validate required parameters
    if (!service_id) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'service_id is required' },
        { status: 400 }
      );
    }

    if (!client_id) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'client_id is required' },
        { status: 400 }
      );
    }

    if (!redirect_uri) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'redirect_uri is required' },
        { status: 400 }
      );
    }

    if (!code_challenge) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'code_challenge is required (PKCE)' },
        { status: 400 }
      );
    }

    if (code_challenge_method !== 'S256') {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'code_challenge_method must be S256',
        },
        { status: 400 }
      );
    }

    // Check if client is dynamically registered
    let clientData = null;
    if (client_id.startsWith('dcr_')) {
      // Dynamically registered client
      clientData = await redis.hGetAll(`oauth:client:${client_id}`);

      if (!clientData || Object.keys(clientData).length === 0) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Unknown client_id' },
          { status: 400 }
        );
      }

      // Validate redirect_uri matches registered URIs
      const registeredUris = JSON.parse(clientData.redirect_uris);
      if (!registeredUris.includes(redirect_uri)) {
        console.warn('[OAuth] redirect_uri not registered:', redirect_uri);
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'redirect_uri not registered for this client' },
          { status: 400 }
        );
      }
    } else {
      // Legacy: hardcoded ChatGPT client_id
      const allowedRedirectUris = [
        'https://chatgpt.com/oauth/callback',
        'https://chat.openai.com/oauth/callback',
        'https://chatgpt.com/connector_platform_oauth_redirect',
        'https://chatgpt.com/aip/g-oauth-callback',  // New GPT OAuth callback
        'https://chatgpt.com/g/oauth/callback',  // Alternative GPT callback
      ];

      if (!allowedRedirectUris.includes(redirect_uri)) {
        console.warn('[OAuth] Invalid redirect_uri:', redirect_uri);
        console.warn('[OAuth] Allowed URIs:', allowedRedirectUris);
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
          { status: 400 }
        );
      }
    }

    // Verify service exists
    const serviceExists = await redis.exists(`service:${service_id}:published`);
    if (!serviceExists) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: `Service ${service_id} not found or not published` },
        { status: 400 }
      );
    }

    // Load service to check if it requires a token
    const serviceData = await redis.hGetAll(`service:${service_id}:published`);
    const isPublic = serviceData.public === 'true';

    // Validate service token if provided (for private services)
    if (service_token) {
      // Create a mock request object with the token
      const mockRequest = {
        headers: {
          get: (name) => name === 'authorization' ? `Bearer ${service_token}` : null
        }
      };

      const validation = await validateServiceToken(mockRequest, service_id);

      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: validation.error || 'Invalid service token'
          },
          { status: 400 }
        );
      }
    } else if (!isPublic) {
      // Private service but no token provided
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'This service requires a service token' },
        { status: 400 }
      );
    }

    console.log('[OAuth] Service authorized:', {
      service_id,
      is_public: isPublic,
      has_token: !!service_token
    });

    // Generate authorization code
    const authorizationCode = await createAuthorizationCode({
      userId: 'anonymous', // No user required for service-based auth
      clientId: client_id,
      redirectUri: redirect_uri,
      scope: scope || 'mcp:read mcp:write',
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      serviceIds: [service_id], // Single service
    });

    // Store service_id and service_token temporarily (will be used during token exchange)
    // TTL matches authorization code expiry (10 minutes)
    await redis.hSet(`oauth:auth:${authorizationCode}`, {
      service_id,
      service_token: service_token || '',
      client_id,
      redirect_uri,
      scope: scope || 'mcp:read mcp:write',
      created: new Date().toISOString()
    });
    await redis.expire(`oauth:auth:${authorizationCode}`, 600);

    console.log('[OAuth] Authorization code issued:', {
      code: authorizationCode.substring(0, 16) + '...',
      client_id,
      redirect_uri,
      service_id,
      has_token: !!service_token
    });

    return NextResponse.json({
      code: authorizationCode,
    });
  } catch (error) {
    console.error('[OAuth] Error generating authorization code:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Failed to generate authorization code' },
      { status: 500 }
    );
  }
}
