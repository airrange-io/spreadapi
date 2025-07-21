import redis from '@/lib/redis';
import { hashToken, parseAuthToken } from './tokenUtils';

export async function validateServiceToken(request, serviceId) {
  try {
    // Check for token in Authorization header
    const authHeader = request.headers.get('authorization');
    let token = parseAuthToken(authHeader);
    
    // If not in header, check query parameters
    if (!token) {
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
    
    // Hash the token to look it up
    const tokenHash = hashToken(token);
    
    // Get token ID from hash
    const tokenId = await redis.get(`token:hash:${tokenHash}`);
    
    if (!tokenId) {
      return {
        valid: false,
        error: 'Invalid token',
        status: 401
      };
    }
    
    // Get token data
    const tokenData = await redis.hGetAll(`token:${tokenId}`);
    
    if (!tokenData || Object.keys(tokenData).length === 0) {
      return {
        valid: false,
        error: 'Token not found',
        status: 401
      };
    }
    
    // Check if token belongs to the requested service
    if (tokenData.serviceId !== serviceId) {
      return {
        valid: false,
        error: 'Token does not belong to this service',
        status: 403
      };
    }
    
    // Check if token is expired
    if (tokenData.expiresAt) {
      const expiryDate = new Date(tokenData.expiresAt);
      if (expiryDate < new Date()) {
        return {
          valid: false,
          error: 'Token expired',
          status: 401
        };
      }
    }
    
    // Update usage stats (fire and forget)
    const updatePromises = [
      redis.hIncrBy(`token:${tokenId}`, 'usageCount', 1),
      redis.hSet(`token:${tokenId}`, 'lastUsedAt', new Date().toISOString())
    ];
    
    // Track daily usage
    const today = new Date().toISOString().split('T')[0];
    updatePromises.push(
      redis.hIncrBy(`service:${serviceId}:token:usage:${today}`, tokenId, 1)
    );
    
    // Don't await these updates to avoid slowing down the request
    Promise.all(updatePromises).catch(err => 
      console.error('Error updating token usage stats:', err)
    );
    
    return {
      valid: true,
      tokenId,
      tokenData: {
        ...tokenData,
        scopes: tokenData.scopes ? JSON.parse(tokenData.scopes) : []
      }
    };
    
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      valid: false,
      error: 'Token validation failed',
      status: 500
    };
  }
}

// Helper function to check if token has required scope
export function hasScope(tokenData, requiredScope) {
  if (!tokenData.scopes || !Array.isArray(tokenData.scopes)) {
    return false;
  }
  
  // Token with 'execute' scope can perform the main service operation
  return tokenData.scopes.includes(requiredScope) || 
         tokenData.scopes.includes('*') ||
         tokenData.scopes.includes('execute'); // execute grants general API access
}

// Middleware helper for protected routes
export async function requireTokenAuth(request, serviceId, requiredScope = 'execute') {
  const validation = await validateServiceToken(request, serviceId);
  
  if (!validation.valid) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: validation.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }
  
  // Check scope if required
  if (requiredScope && !hasScope(validation.tokenData, requiredScope)) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }
  
  return {
    authorized: true,
    tokenData: validation.tokenData,
    tokenId: validation.tokenId
  };
}