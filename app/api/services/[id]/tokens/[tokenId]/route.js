import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// DELETE /api/services/[id]/tokens/[tokenId] - Revoke a token
export async function DELETE(request, { params }) {
  const { id, tokenId } = await params;
  
  try {
    // Get user ID from headers (set by middleware)
    const currentUserId = request.headers.get('x-user-id');
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if service exists and user owns it
    const service = await redis.hGetAll(`service:${id}`);
    
    if (!service || Object.keys(service).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    if (service.userId !== currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get token data to find the hash
    const tokenData = await redis.hGetAll(`token:${tokenId}`);
    
    if (!tokenData || Object.keys(tokenData).length === 0) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }
    
    // Verify token belongs to this service
    if (tokenData.serviceId !== id) {
      return NextResponse.json({ error: 'Token does not belong to this service' }, { status: 403 });
    }
    
    // Use Redis transaction to ensure atomicity
    const multi = redis.multi();
    
    // Remove token data
    multi.del(`token:${tokenId}`);
    
    // Remove from service's token set
    multi.sRem(`service:${id}:tokens`, tokenId);
    
    // Remove hash lookup
    if (tokenData.tokenHash) {
      multi.del(`token:hash:${tokenData.tokenHash}`);
    }
    
    await multi.exec();
    
    return NextResponse.json({ 
      success: true,
      message: 'Token revoked successfully' 
    });
    
  } catch (error) {
    console.error('Error revoking token:', error);
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500 }
    );
  }
}

// GET /api/services/[id]/tokens/[tokenId] - Get token details
export async function GET(request, { params }) {
  const { id, tokenId } = await params;
  
  try {
    // Get user ID from headers (set by middleware)
    const currentUserId = request.headers.get('x-user-id');
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if service exists and user owns it
    const service = await redis.hGetAll(`service:${id}`);
    
    if (!service || Object.keys(service).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    if (service.userId !== currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get token data
    const tokenData = await redis.hGetAll(`token:${tokenId}`);
    
    if (!tokenData || Object.keys(tokenData).length === 0) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }
    
    // Verify token belongs to this service
    if (tokenData.serviceId !== id) {
      return NextResponse.json({ error: 'Token does not belong to this service' }, { status: 403 });
    }
    
    // Don't return the token hash or scopes
    const { tokenHash, scopes, ...safeData } = tokenData;

    return NextResponse.json({
      id: tokenId,
      ...safeData,
      createdAt: safeData.createdAt || null,
      lastUsedAt: safeData.lastUsedAt || null,
      expiresAt: safeData.expiresAt || null,
      usageCount: parseInt(safeData.usageCount || '0'),
    });
    
  } catch (error) {
    console.error('Error getting token details:', error);
    return NextResponse.json(
      { error: 'Failed to get token details' },
      { status: 500 }
    );
  }
}