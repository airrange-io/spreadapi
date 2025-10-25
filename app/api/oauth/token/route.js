import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getAuthorizationCode,
  deleteAuthorizationCode,
  verifyPKCE,
} from '@/lib/oauth-codes';
import redis from '@/lib/redis';
import { rateLimitByIP, createRateLimitResponse } from '@/lib/rate-limiter';

/**
 * Generate a unique OAuth access token
 * Format: oat_{random} where oat = OAuth Access Token
 */
function generateOAuthAccessToken() {
  return `oat_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * OAuth Token Endpoint (RFC 6749)
 *
 * Simplified token-based flow:
 * 1. Validates the authorization code
 * 2. Verifies PKCE code_verifier matches code_challenge
 * 3. Verifies client_id and redirect_uri match
 * 4. Returns an OAuth access token that maps to the user's MCP tokens
 *
 * The OAuth token is a wrapper - when ChatGPT makes requests with it,
 * we proxy to the underlying MCP tokens for permission checks.
 */
export async function POST(request) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const rateCheck = await rateLimitByIP(request, 'oauth_token', 10, 60);
    if (rateCheck.limited) {
      return NextResponse.json(
        createRateLimitResponse(rateCheck.retryAfter),
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfter.toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Window': '60',
          },
        }
      );
    }

    // Parse request body (supports both JSON and form-urlencoded)
    const contentType = request.headers.get('content-type');
    let body;

    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      // application/x-www-form-urlencoded (standard OAuth format)
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }

    const {
      grant_type,
      code,
      client_id,
      redirect_uri,
      code_verifier,
    } = body;

    console.log('[OAuth Token] Exchange request:', {
      grant_type,
      code: code?.substring(0, 16) + '...',
      client_id,
    });

    // Validate grant_type
    if (grant_type !== 'authorization_code') {
      return NextResponse.json(
        {
          error: 'unsupported_grant_type',
          error_description: 'Only authorization_code grant type is supported',
        },
        { status: 400 }
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'code is required' },
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

    if (!code_verifier) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'code_verifier is required (PKCE)' },
        { status: 400 }
      );
    }

    // Retrieve authorization code data
    const codeData = await getAuthorizationCode(code);

    if (!codeData) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'Invalid, expired, or already used authorization code',
        },
        { status: 400 }
      );
    }

    // Verify client_id matches
    if (codeData.clientId !== client_id) {
      console.error('[OAuth Token] client_id mismatch:', {
        expected: codeData.clientId,
        received: client_id,
      });
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'client_id mismatch' },
        { status: 400 }
      );
    }

    // Verify redirect_uri matches
    if (codeData.redirectUri !== redirect_uri) {
      console.error('[OAuth Token] redirect_uri mismatch:', {
        expected: codeData.redirectUri,
        received: redirect_uri,
      });
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'redirect_uri mismatch' },
        { status: 400 }
      );
    }

    // Verify PKCE
    const pkceValid = verifyPKCE(
      code_verifier,
      codeData.codeChallenge,
      codeData.codeChallengeMethod
    );

    if (!pkceValid) {
      await deleteAuthorizationCode(code); // Prevent retry attacks
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'PKCE verification failed',
        },
        { status: 400 }
      );
    }

    // Retrieve the MCP tokens stored during authorization
    const mcpTokensJson = await redis.get(`oauth:mcp_tokens:${code}`);

    if (!mcpTokensJson) {
      console.error('[OAuth Token] No MCP tokens found for code:', code.substring(0, 16));
      await deleteAuthorizationCode(code);
      return NextResponse.json(
        {
          error: 'server_error',
          error_description: 'Failed to retrieve authorization data',
        },
        { status: 500 }
      );
    }

    const mcpTokens = JSON.parse(mcpTokensJson);

    // Default expiry: 12 hours (43200 seconds)
    // In a more advanced setup, you could check MCP token expiry
    const expiresIn = 43200;

    // Generate unique OAuth access token
    const oauthAccessToken = generateOAuthAccessToken();

    // Store OAuth token metadata with MCP tokens
    // This creates the mapping: OAuth token → MCP tokens
    await redis.hSet(`oauth:token:${oauthAccessToken}`, {
      mcp_tokens: JSON.stringify(mcpTokens), // Store MCP tokens
      client_id: client_id,
      user_id: codeData.userId,
      scope: codeData.scope,
      service_ids: JSON.stringify(codeData.serviceIds),
      authorized_at: Date.now().toString(),
    });

    // Set expiry
    await redis.expire(`oauth:token:${oauthAccessToken}`, expiresIn);

    // Delete authorization code (one-time use) and cleanup temp MCP token storage
    await deleteAuthorizationCode(code);
    await redis.del(`oauth:mcp_tokens:${code}`);

    console.log('[OAuth Token] Access token issued:', {
      user_id: codeData.userId,
      client_id,
      service_count: codeData.serviceIds.length,
      mcp_token_count: mcpTokens.length,
      expires_in: expiresIn,
      token_prefix: oauthAccessToken.substring(0, 16) + '...',
    });

    // Return OAuth token response
    return NextResponse.json(
      {
        access_token: oauthAccessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: codeData.scope,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[OAuth Token] Error processing token request:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
