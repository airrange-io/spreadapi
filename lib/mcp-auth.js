/**
 * MCP Authentication for Service-Specific Endpoints
 *
 * Authentication method:
 * - OAuth Access Tokens (oat_...) - For ChatGPT and Claude Desktop
 *   Backed by service tokens validated during OAuth authorization
 */

import redis from './redis';

/**
 * Validate an OAuth access token (backed by service token)
 */
async function validateOAuthToken(token) {
  try {
    // Look up OAuth token metadata
    const metadata = await redis.hGetAll(`oauth:token:${token}`);

    if (!metadata || Object.keys(metadata).length === 0) {
      console.log('[MCP Auth] OAuth token not found or expired');
      return {
        valid: false,
        error: 'Token not found or expired'
      };
    }

    // Service token is already validated during authorization
    // No need to re-validate since it's directly from the service
    let serviceIds = [];
    try {
      if (metadata.service_ids) {
        serviceIds = JSON.parse(metadata.service_ids);
      }
    } catch (e) {
      console.error('[MCP Auth] Error parsing OAuth service_ids:', e);
    }

    console.log('[MCP Auth] OAuth token validated:', {
      user_id: metadata.user_id,
      client_id: metadata.client_id,
      service_id: metadata.service_id,
      scope: metadata.scope
    });

    return {
      valid: true,
      userId: metadata.user_id,
      tokenName: `OAuth: ${metadata.client_id}`,
      serviceIds: serviceIds,
      scope: metadata.scope,
      isOAuth: true
    };
  } catch (error) {
    console.error('[MCP Auth] OAuth token validation error:', error);
    return {
      valid: false,
      error: 'Invalid or expired OAuth token'
    };
  }
}

/**
 * Middleware to validate OAuth access tokens in MCP API routes
 *
 * All MCP connections (ChatGPT and Claude Desktop) now use OAuth 2.1
 * with service token-backed access tokens.
 */
export async function mcpAuthMiddleware(request) {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Check query parameter (for SSE/WebSocket compatibility)
    const url = new URL(request.url);
    token = url.searchParams.get('token');
  }

  if (!token) {
    return {
      valid: false,
      error: 'No token provided',
      status: 401
    };
  }

  // Validate OAuth access token
  if (!token.startsWith('oat_')) {
    console.error('[MCP Auth] Invalid token format (expected OAuth access token):', token.substring(0, 20) + '...');
    return {
      valid: false,
      error: 'Invalid token format',
      status: 401
    };
  }

  const validation = await validateOAuthToken(token);

  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error,
      status: 401
    };
  }

  return {
    valid: true,
    userId: validation.userId,
    tokenName: validation.tokenName,
    serviceIds: validation.serviceIds || [],
    isOAuth: true,
    scope: validation.scope
  };
}