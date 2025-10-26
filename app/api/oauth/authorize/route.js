import { NextResponse } from 'next/server';
import { createAuthorizationCode } from '@/lib/oauth-codes';
import redis from '@/lib/redis';
import { rateLimitByIP, createRateLimitResponse } from '@/lib/rate-limiter';

/**
 * OAuth Authorization Endpoint - Backend API
 *
 * Service-specific authorization for MCP endpoints.
 *
 * The user provides a service token and service ID. We validate the token
 * against the service's allowed tokens, then generate an authorization code
 * that maps to that service.
 *
 * This provides OAuth 2.1 authentication for ChatGPT and Claude Desktop
 * while maintaining the existing service token permission model.
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
      service_token = null, // Service token (direct API token)
      service_id = null, // Service ID for service-specific MCP endpoints
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

    // Validate required OAuth parameters
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

    // Validate service exists
    const serviceData = await redis.hGetAll(`service:${service_id}:published`);

    if (!serviceData || Object.keys(serviceData).length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Service not found or not published'
        },
        { status: 400 }
      );
    }

    // Check if service requires authentication
    const needsToken = serviceData.needsToken === 'true';
    const tokens = serviceData.tokens ? serviceData.tokens.split(',') : [];

    // Validate service token only if service requires it
    if (needsToken) {
      if (!service_token) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'This service requires a service token for authorization'
          },
          { status: 400 }
        );
      }

      if (!tokens.includes(service_token)) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Invalid service token'
          },
          { status: 400 }
        );
      }
    }

    // Service token is valid
    const userId = serviceData.tenantId;
    const serviceIds = [service_id];

    // Combine requested scopes with service-specific scope
    // ChatGPT requests scopes like "mcp:read mcp:write", we add our service scope
    const requestedScopes = scope ? scope.split(' ') : [];
    const serviceScope = `spapi:service:${service_id}:execute`;

    // Include all requested scopes plus our service-specific scope
    const allScopes = [...new Set([...requestedScopes, serviceScope])].join(' ');

    console.log('[OAuth] Validated service token:', {
      service_id,
      user_id: userId,
      requested_scopes: scope,
      granted_scopes: allScopes,
    });

    // Generate authorization code
    const authorizationCode = await createAuthorizationCode({
      userId: userId,
      clientId: client_id,
      redirectUri: redirect_uri,
      scope: allScopes,  // Include ALL scopes (requested + service-specific)
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      serviceIds: serviceIds,
    });

    // Store service token temporarily (will be used during token exchange)
    // TTL matches authorization code expiry (10 minutes)
    const tokenData = {
      service_token: service_token,
      service_id: service_id
    };

    await redis.set(
      `oauth:tokens:${authorizationCode}`,
      JSON.stringify(tokenData),
      { EX: 600 }
    );

    console.log('[OAuth] Authorization code issued:', {
      code: authorizationCode.substring(0, 16) + '...',
      client_id,
      redirect_uri,
      scope: actualScope,
      service_id,
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
