import { NextResponse } from 'next/server';
import { validateToken } from '@/lib/mcp-auth';

/**
 * OAuth 2.0 Token Endpoint for ChatGPT Integration
 *
 * Implements Client Credentials flow where:
 * - client_id: "chatgpt" (or user's email)
 * - client_secret: The user's MCP token (spapi_live_...)
 *
 * This allows ChatGPT to exchange credentials for an access token
 * which is then used in subsequent MCP requests.
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    let clientId, clientSecret, grantType;

    // OAuth 2.0 supports both application/json and application/x-www-form-urlencoded
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      clientId = body.client_id;
      clientSecret = body.client_secret;
      grantType = body.grant_type;
    } else {
      // application/x-www-form-urlencoded (standard OAuth format)
      const formData = await request.formData();
      clientId = formData.get('client_id');
      clientSecret = formData.get('client_secret');
      grantType = formData.get('grant_type');
    }

    console.log('[OAuth Token] Request received:', {
      clientId: clientId ? clientId.substring(0, 20) + '...' : 'none',
      grantType,
      hasSecret: !!clientSecret
    });

    // Validate grant_type (only client_credentials supported)
    if (grantType && grantType !== 'client_credentials') {
      return NextResponse.json(
        {
          error: 'unsupported_grant_type',
          error_description: 'Only client_credentials grant type is supported'
        },
        { status: 400 }
      );
    }

    // Validate client_secret (this is the user's MCP token)
    if (!clientSecret) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'client_secret is required'
        },
        { status: 400 }
      );
    }

    // Validate the MCP token (client_secret)
    const tokenValidation = await validateToken(clientSecret);

    if (!tokenValidation.valid) {
      console.error('[OAuth Token] Invalid token:', tokenValidation.error);
      return NextResponse.json(
        {
          error: 'invalid_client',
          error_description: 'Invalid client credentials'
        },
        { status: 401 }
      );
    }

    console.log('[OAuth Token] Token validated successfully for user:', tokenValidation.userId);

    // Return OAuth 2.0 token response
    // The access_token is the same as the MCP token (client_secret)
    // This allows our existing Bearer token auth to work without changes
    const response = {
      access_token: clientSecret,
      token_type: 'Bearer',
      expires_in: 86400, // 24 hours
      scope: 'mcp.tools mcp.read mcp.execute'
    };

    console.log('[OAuth Token] Returning access token for user:', tokenValidation.userId);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[OAuth Token] Error processing request:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error'
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
