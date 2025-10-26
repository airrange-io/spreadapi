import { NextResponse } from 'next/server';

/**
 * OAuth Protected Resource Metadata Endpoint (RFC 9728)
 *
 * This endpoint publishes metadata about the protected MCP resources (single-service endpoints),
 * allowing OAuth clients (like ChatGPT) to discover:
 * - Which authorization servers are trusted
 * - What scopes are available
 * - How bearer tokens should be sent
 *
 * ChatGPT reads this to discover our OAuth authorization server for single-service MCP endpoints.
 *
 * CRITICAL: Must be at domain root /.well-known/oauth-protected-resource
 * (not /api/.well-known/...) for ChatGPT discovery to work!
 */
export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

  // Extract resource from query parameter (optional - for specific service endpoints)
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');

  return NextResponse.json(
    {
      // The protected resource (single-service MCP endpoints)
      resource: resource || `${baseUrl}/api/mcp/services/*`,

      // Authorization servers that can issue tokens for this resource
      authorization_servers: [baseUrl],

      // How clients should send bearer tokens
      bearer_methods_supported: ['header'],

      // Available OAuth scopes
      scopes_supported: ['mcp:read', 'mcp:write'],
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
