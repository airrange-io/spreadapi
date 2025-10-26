import { NextResponse } from 'next/server';

/**
 * Service-Specific OAuth Authorization Server Metadata Endpoint
 *
 * This endpoint publishes OAuth metadata for a specific SpreadAPI service,
 * allowing OAuth clients (like ChatGPT) to discover the authorization endpoint
 * with the service_id parameter already included.
 *
 * This is critical for the service-specific MCP flow where ChatGPT needs to
 * authorize access to a specific service.
 */
export async function GET(request, { params }) {
  const { serviceId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

  return NextResponse.json(
    {
      // OAuth 2.0 Authorization Server Metadata
      issuer: baseUrl,

      // Authorization endpoint with service_id parameter
      authorization_endpoint: `${baseUrl}/oauth/authorize?service_id=${serviceId}`,

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

      // Available OAuth scopes for this service
      scopes_supported: [
        'mcp:read',
        'mcp:write',
        `spapi:service:${serviceId}:execute`
      ],

      // Token endpoint authentication methods
      // "none" = public clients (ChatGPT doesn't need a secret)
      token_endpoint_auth_methods_supported: ['none'],

      // Indicate that we support PKCE (required for public clients)
      require_pushed_authorization_requests: false,

      // Service-specific resource
      resource: `${baseUrl}/api/mcp/service/${serviceId}`,

      // Service documentation
      service_documentation: `${baseUrl}/docs/oauth`,
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
