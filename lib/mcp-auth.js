/**
 * MCP Authentication and Token Management
 */

import redis from './redis';
import crypto from 'crypto';

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
  
  // Store token data
  await redis.hSet(`mcp:token:${token}`, {
    name,
    description,
    userId,
    created: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    requests: 0,
    isActive: 'true',
    // Store service IDs as JSON array
    serviceIds: JSON.stringify(serviceIds || [])
  });
  
  // Add to user's token set
  await redis.sAdd(`mcp:user:${userId}:tokens`, token);
  
  return {
    token,
    name,
    description,
    created: new Date().toISOString(),
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
 * Middleware to validate MCP tokens in API routes
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
  
  const validation = await validateToken(token);
  
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
    serviceIds: validation.serviceIds || []
  };
}