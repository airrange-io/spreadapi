import { NextResponse } from 'next/server';

/**
 * OAuth Authorization Server Metadata Endpoint (RFC 8414)
 *
 * This endpoint publishes metadata about SpreadAPI's OAuth authorization server,
 * allowing OAuth clients (like ChatGPT) to discover:
 * - Authorization and token endpoint URLs
 * - Supported grant types and authentication methods
 * - Available scopes
 * - PKCE support
 *
 * ChatGPT uses this to automatically configure the OAuth flow.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://spreadapi.io';
  const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL;

  return NextResponse.json(
    {
      // OAuth 2.0 Authorization Server Metadata
      issuer: baseUrl,

      // Authorization endpoint (where users log in and consent)
      authorization_endpoint: `${baseUrl}/oauth/authorize`,

      // Token endpoint (where authorization codes are exchanged for tokens)
      token_endpoint: `${baseUrl}/oauth/token`,

      // JWKS endpoint for token signature verification
      // We use Hanko's JWKS since tokens are Hanko JWTs
      jwks_uri: `${hankoApiUrl}/.well-known/jwks.json`,

      // Supported OAuth grant types
      grant_types_supported: ['authorization_code'],

      // Response types supported (authorization code flow)
      response_types_supported: ['code'],

      // PKCE methods supported (S256 = SHA-256 hash)
      code_challenge_methods_supported: ['S256'],

      // Available OAuth scopes
      scopes_supported: ['mcp:read', 'mcp:write'],

      // Token endpoint authentication methods
      // "none" = public clients (ChatGPT doesn't need a secret)
      token_endpoint_auth_methods_supported: ['none'],

      // Indicate that we support PKCE (required for public clients)
      require_pushed_authorization_requests: false,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow CORS
      },
    }
  );
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
