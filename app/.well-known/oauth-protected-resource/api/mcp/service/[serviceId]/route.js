import { NextResponse } from 'next/server';

/**
 * Protected Resource Metadata Endpoint (RFC 9728)
 *
 * This endpoint provides metadata about this specific MCP service as an OAuth 2.0 protected resource.
 * ChatGPT uses this to discover which authorization server to use and what scopes are available.
 *
 * Per RFC 9728 and MCP 2025-06-18 spec, this helps clients discover:
 * - The exact resource identifier (must match the MCP endpoint URL)
 * - Which authorization server(s) protect this resource
 * - Available scopes for this specific service
 */
export async function GET(request, { params }) {
  const { serviceId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

  // The resource identifier must exactly match the MCP endpoint URL
  const resourceUrl = `${baseUrl}/api/mcp/service/${serviceId}`;

  return NextResponse.json(
    {
      // Exact MCP endpoint URL (must match what the client configured)
      resource: resourceUrl,

      // Authorization server(s) that protect this resource
      // Points to the root AS metadata endpoint
      authorization_servers: [baseUrl],

      // How tokens should be presented (header is standard for MCP)
      bearer_methods_supported: ['header'],

      // Scopes available for this specific service
      scopes_supported: [
        'mcp:read',
        'mcp:write',
        `spapi:service:${serviceId}:execute`
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
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
