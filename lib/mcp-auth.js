/**
 * MCP Authentication and Token Management
 *
 * Supports two authentication methods:
 * 1. MCP Tokens (spapi_live_...) - For Claude Desktop via npx bridge
 * 2. OAuth Tokens (Hanko JWTs) - For ChatGPT via OAuth flow
 */

import redis from './redis';
import crypto from 'crypto';
import { verifyHankoJWT } from './hanko-jwt';

/**
 * Generate a new MCP token
 */
export async function generateToken() {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const token = `spapi_live_${randomBytes}`;
  return token;
}

/**
 * Create and store a new token
 * @param {string} userId - User ID
 * @param {string} name - Token name
 * @param {string} description - Token description
 * @param {string[]} serviceIds - Array of allowed service IDs (empty = all services)
 */
export async function createToken(userId, name, description = '', serviceIds = []) {
  const token = await generateToken();
  const created = new Date().toISOString();

  // Store token data and add to user's token set in single round-trip
  const multi = redis.multi();

  multi.hSet(`mcp:token:${token}`, {
    name,
    description,
    userId,
    created,
    lastUsed: created,
    requests: 0,
    isActive: 'true',
    // Store service IDs as JSON array
    serviceIds: JSON.stringify(serviceIds || [])
  });

  // Add to user's token set
  multi.sAdd(`mcp:user:${userId}:tokens`, token);

  await multi.exec();

  return {
    token,
    name,
    description,
    created,
    serviceIds: serviceIds || []
  };
}

/**
 * Validate a token and update usage stats
 */
export async function validateToken(token) {
  if (!token || !token.startsWith('spapi_live_')) {
    console.error('[MCP Auth] Invalid token format:', token ? token.substring(0, 20) + '...' : 'no token');
    return { valid: false, error: 'Invalid token format' };
  }
  
  console.log('[MCP Auth] Validating token:', token.substring(0, 20) + '...');
  const tokenData = await redis.hGetAll(`mcp:token:${token}`);
  
  if (!tokenData || Object.keys(tokenData).length === 0) {
    console.error('[MCP Auth] Token not found in Redis');
    return { valid: false, error: 'Token not found or inactive' };
  }
  
  if (!tokenData.isActive || tokenData.isActive !== 'true') {
    console.error('[MCP Auth] Token is inactive:', tokenData.isActive);
    return { valid: false, error: 'Token not found or inactive' };
  }
  
  // Update usage stats
  const multi = redis.multi();
  multi.hIncrBy(`mcp:token:${token}`, 'requests', 1);
  multi.hSet(`mcp:token:${token}`, 'lastUsed', new Date().toISOString());
  await multi.exec();
  
  // Parse service IDs
  let serviceIds = [];
  try {
    if (tokenData.serviceIds) {
      serviceIds = JSON.parse(tokenData.serviceIds);
    }
  } catch (e) {
    console.error('Error parsing serviceIds:', e);
  }
  
  return {
    valid: true,
    userId: tokenData.userId,
    tokenName: tokenData.name,
    serviceIds: serviceIds
  };
}

/**
 * Get user's tokens
 */
export async function getUserTokens(userId) {
  const tokenIds = await redis.sMembers(`mcp:user:${userId}:tokens`);
  
  if (!tokenIds || tokenIds.length === 0) {
    return [];
  }
  
  const tokens = [];
  for (const tokenId of tokenIds) {
    const tokenData = await redis.hGetAll(`mcp:token:${tokenId}`);
    if (tokenData && tokenData.isActive === 'true') {
      // Parse service IDs
      let serviceIds = [];
      try {
        if (tokenData.serviceIds) {
          serviceIds = JSON.parse(tokenData.serviceIds);
        }
      } catch (e) {
        console.error('Error parsing serviceIds:', e);
      }
      
      tokens.push({
        id: tokenId,  // Full token ID for API calls
        token: tokenId.substring(0, 16) + '...',  // Show partial token
        name: tokenData.name,
        description: tokenData.description,
        created: tokenData.created,
        lastUsed: tokenData.lastUsed,
        requests: parseInt(tokenData.requests || '0'),
        serviceIds: serviceIds
      });
    }
  }
  
  // Sort by created date, newest first
  tokens.sort((a, b) => new Date(b.created) - new Date(a.created));
  
  return tokens;
}

/**
 * Revoke a token
 */
export async function revokeToken(userId, token) {
  // Verify ownership
  const tokenData = await redis.hGetAll(`mcp:token:${token}`);
  if (!tokenData || tokenData.userId !== userId) {
    throw new Error('Token not found or unauthorized');
  }
  
  // Mark as inactive instead of deleting (for audit trail)
  await redis.hSet(`mcp:token:${token}`, 'isActive', 'false');
  
  // Remove from user's active set
  await redis.sRem(`mcp:user:${userId}:tokens`, token);
  
  return { success: true };
}

/**
 * Validate an OAuth access token (maps to MCP tokens)
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

    // Parse the underlying MCP tokens
    let mcpTokens = [];
    try {
      if (metadata.mcp_tokens) {
        mcpTokens = JSON.parse(metadata.mcp_tokens);
      }
    } catch (e) {
      console.error('[MCP Auth] Error parsing MCP tokens:', e);
    }

    // Validate all underlying MCP tokens are still valid
    // If any token is invalid, the OAuth token should fail
    for (const mcpToken of mcpTokens) {
      const validation = await validateToken(mcpToken);
      if (!validation.valid) {
        console.log('[MCP Auth] Underlying MCP token invalid, revoking OAuth token');
        // Clean up expired OAuth token
        await redis.del(`oauth:token:${token}`);
        return {
          valid: false,
          error: 'OAuth token expired (MCP token revoked or expired)'
        };
      }
    }

    // Parse service IDs (already combined during authorization)
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
      mcp_token_count: mcpTokens.length,
      service_count: serviceIds.length
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
 * Middleware to validate MCP tokens in API routes
 *
 * Supports both:
 * - MCP tokens (spapi_live_...) for Claude Desktop
 * - OAuth tokens (Hanko JWTs) for ChatGPT
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

  // Determine token type and validate accordingly
  let validation;

  if (token.startsWith('spapi_live_')) {
    // MCP token (Claude Desktop)
    validation = await validateToken(token);
  } else if (token.startsWith('oat_')) {
    // OAuth access token (ChatGPT)
    validation = await validateOAuthToken(token);
  } else {
    // Unknown token format
    console.error('[MCP Auth] Unknown token format:', token.substring(0, 20) + '...');
    return {
      valid: false,
      error: 'Invalid token format',
      status: 401
    };
  }

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
    isOAuth: validation.isOAuth || false,
    scope: validation.scope
  };
}