import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * POST /api/mcp/update-token - Update token service access
 */
export async function POST(request) {
  try {
    // Get authenticated user ID from headers
    const authenticatedUserId = request.headers.get('x-user-id');
    
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { 
      token,
      addServices = [], 
      removeServices = [], 
      replaceServices = null
    } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Get existing token data
    const tokenData = await redis.hGetAll(`mcp:token:${token}`);
    
    if (!tokenData || Object.keys(tokenData).length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Check ownership - only token owner can update it
    if (tokenData.userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only update your own tokens' },
        { status: 403 }
      );
    }
    
    // Check if token is active
    if (tokenData.isActive !== 'true') {
      return NextResponse.json(
        { error: 'Cannot update inactive token' },
        { status: 400 }
      );
    }
    
    // Parse current service IDs
    let currentServiceIds = [];
    try {
      if (tokenData.serviceIds) {
        currentServiceIds = JSON.parse(tokenData.serviceIds);
      }
    } catch (e) {
      console.error('Error parsing serviceIds:', e);
    }
    
    // Update service IDs based on operation
    let newServiceIds;
    
    if (replaceServices !== null) {
      // Complete replacement of service list
      newServiceIds = replaceServices;
    } else {
      // Add/remove operations
      newServiceIds = [...currentServiceIds];
      
      // Add new services (avoid duplicates)
      for (const serviceId of addServices) {
        if (!newServiceIds.includes(serviceId)) {
          newServiceIds.push(serviceId);
        }
      }
      
      // Remove services
      newServiceIds = newServiceIds.filter(id => !removeServices.includes(id));
    }
    
    // Update service IDs in Redis
    await redis.hSet(`mcp:token:${token}`, {
      serviceIds: JSON.stringify(newServiceIds),
      modified: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      token: token.substring(0, 20) + '...',
      serviceIds: newServiceIds,
      changes: {
        previous: currentServiceIds.length,
        added: addServices.filter(id => !currentServiceIds.includes(id)).length,
        removed: removeServices.filter(id => currentServiceIds.includes(id)).length,
        total: newServiceIds.length
      }
    });
    
  } catch (error) {
    console.error('Error updating token:', error);
    return NextResponse.json(
      { error: 'Failed to update token', details: error.message },
      { status: 500 }
    );
  }
}