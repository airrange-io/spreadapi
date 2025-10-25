import { NextResponse } from 'next/server';

/**
 * OpenID Connect Discovery Endpoint (OIDC)
 *
 * This is an ALIAS to oauth-authorization-server for compatibility.
 * Some OAuth clients (including ChatGPT) look for /.well-known/openid-configuration
 * instead of /.well-known/oauth-authorization-server.
 *
 * Returns the same metadata to ensure ChatGPT can discover our OAuth endpoints.
 *
 * CRITICAL: ChatGPT is stricter than Claude about discovery paths.
 * Missing this endpoint can cause ChatGPT to fail tool discovery after OAuth.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

  return NextResponse.json(
    {
      // OAuth 2.0 Authorization Server Metadata
      issuer: baseUrl,

      // Authorization endpoint (where users paste tokens and consent)
      authorization_endpoint: `${baseUrl}/oauth/authorize`,

      // Token endpoint (where authorization codes are exchanged for tokens)
      token_endpoint: `${baseUrl}/api/oauth/token`,

      // Dynamic Client Registration endpoint (RFC 7591)
      registration_endpoint: `${baseUrl}/oauth/register`,

      // Supported OAuth grant types
      grant_types_supported: ['authorization_code'],

      // Response types supported (authorization code flow)
      response_types_supported: ['code'],

      // PKCE methods supported (S256 = SHA-256 hash)
      code_challenge_methods_supported: ['S256'],

      // Available OAuth scopes
      scopes_supported: ['mcp:read', 'mcp:write'],

      // Token endpoint authentication methods
      token_endpoint_auth_methods_supported: ['none'],

      // PKCE support
      require_pushed_authorization_requests: false,

      // Service documentation
      service_documentation: `${baseUrl}/docs/oauth`,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
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
