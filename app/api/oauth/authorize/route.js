import { NextResponse } from 'next/server';
import { createAuthorizationCode } from '@/lib/oauth-codes';
import { validateToken } from '@/lib/mcp-auth';
import redis from '@/lib/redis';
import { rateLimitByIP, createRateLimitResponse } from '@/lib/rate-limiter';

/**
 * OAuth Authorization Endpoint - Backend API
 *
 * Simplified token-based authorization (no user login required).
 *
 * The user provides one or more MCP tokens, we validate them,
 * and generate an authorization code that maps to those tokens.
 *
 * This makes OAuth a thin wrapper around MCP tokens to satisfy
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
      mcp_tokens = [], // Array of MCP tokens from user
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
    if (!mcp_tokens || mcp_tokens.length === 0) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'At least one MCP token is required' },
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

    // Validate all MCP tokens and collect service IDs
    const validatedTokens = [];
    const allServiceIds = new Set(); // Use Set to avoid duplicates
    let userId = null;

    for (const token of mcp_tokens) {
      // Validate token format
      if (!token.startsWith('spapi_live_')) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: `Invalid token format: ${token.substring(0, 20)}...`
          },
          { status: 400 }
        );
      }

      // Validate token exists and is active
      const validation = await validateToken(token);

      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: `Invalid or inactive token: ${token.substring(0, 20)}...`
          },
          { status: 400 }
        );
      }

      // Store validated token info
      validatedTokens.push({
        token: token,
        userId: validation.userId,
        serviceIds: validation.serviceIds || []
      });

      // Collect service IDs (empty array = all services)
      if (validation.serviceIds && validation.serviceIds.length > 0) {
        validation.serviceIds.forEach(id => allServiceIds.add(id));
      }

      // Use userId from first token (all tokens should belong to same user ideally,
      // but we allow mixing for flexibility)
      if (!userId) {
        userId = validation.userId;
      }
    }

    // Convert Set to Array
    const serviceIds = Array.from(allServiceIds);

    console.log('[OAuth] Validated tokens:', {
      token_count: validatedTokens.length,
      service_count: serviceIds.length,
      user_id: userId,
    });

    // Generate authorization code
    const authorizationCode = await createAuthorizationCode({
      userId: userId || 'anonymous', // Fallback if no userId
      clientId: client_id,
      redirectUri: redirect_uri,
      scope: scope || 'mcp:read mcp:write',
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      serviceIds: serviceIds,
    });

    // Store MCP tokens temporarily (will be used during token exchange)
    // Store as JSON array so we can map OAuth token → MCP tokens later
    // TTL matches authorization code expiry (10 minutes)
    await redis.set(
      `oauth:mcp_tokens:${authorizationCode}`,
      JSON.stringify(mcp_tokens),
      { EX: 600 }
    );

    console.log('[OAuth] Authorization code issued:', {
      code: authorizationCode.substring(0, 16) + '...',
      client_id,
      redirect_uri, // Log the redirect_uri
      service_count: serviceIds.length,
      mcp_token_count: mcp_tokens.length,
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
