import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateToken, generateTokenId, hashToken } from '@/utils/tokenUtils';
import { isDemoService } from '@/lib/constants';

// GET /api/services/[id]/tokens - List all tokens for a service
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  try {
    console.time(`[TOKENS] Total time for service ${id}`);
    
    // Get user ID from headers (set by middleware)
    const currentUserId = request.headers.get('x-user-id');
    
    console.log(`[TOKENS] Current user ID: ${currentUserId}, Service ID: ${id}`);

    if (!currentUserId) {
      console.timeEnd(`[TOKENS] Total time for service ${id}`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if service exists and user owns it - fetch only userId field
    console.time(`[TOKENS] Check service ownership`);
    const serviceUserId = await redis.hGet(`service:${id}`, 'userId');
    console.timeEnd(`[TOKENS] Check service ownership`);

    if (!serviceUserId) {
      console.timeEnd(`[TOKENS] Total time for service ${id}`);
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    console.log(`[TOKENS] Service owner: ${serviceUserId}, Current user: ${currentUserId}`);
    
    // Allow any authenticated user to access demo service tokens
    if (serviceUserId !== currentUserId && !isDemoService(id)) {
      console.log(`[TOKENS] Access denied. Owner: ${serviceUserId}, User: ${currentUserId}`);
      console.timeEnd(`[TOKENS] Total time for service ${id}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get all token IDs for this service
    console.time(`[TOKENS] Get token IDs`);
    const tokenIds = await redis.sMembers(`service:${id}:tokens`);
    console.timeEnd(`[TOKENS] Get token IDs`);
    
    // Early return if no tokens
    if (tokenIds.length === 0) {
      console.timeEnd(`[TOKENS] Total time for service ${id}`);
      return NextResponse.json({ tokens: [] });
    }
    
    // Use multi for better performance
    console.time(`[TOKENS] Fetch all token data`);
    const multi = redis.multi();
    
    tokenIds.forEach(tokenId => {
      multi.hGetAll(`token:${tokenId}`);
    });
    
    const results = await multi.exec();
    console.timeEnd(`[TOKENS] Fetch all token data`);
    
    // Process token data
    console.time(`[TOKENS] Process token data`);
    const tokens = results
      .map((tokenData, index) => {
        if (!tokenData || Object.keys(tokenData).length === 0) return null;
        
        // Don't return the actual token hash
        const { tokenHash, ...safeData } = tokenData;
        
        return {
          id: tokenIds[index],
          ...safeData,
          scopes: safeData.scopes ? JSON.parse(safeData.scopes) : [],
          createdAt: safeData.createdAt || null,
          lastUsedAt: safeData.lastUsedAt || null,
          expiresAt: safeData.expiresAt || null,
          usageCount: parseInt(safeData.usageCount || '0'),
        };
      })
      .filter(token => token !== null);
    console.timeEnd(`[TOKENS] Process token data`);
    
    console.timeEnd(`[TOKENS] Total time for service ${id}`);
    return NextResponse.json({ tokens });
    
  } catch (error) {
    console.error('Error listing tokens:', error);
    // Clean up any running timers
    try {
      console.timeEnd(`[TOKENS] Total time for service ${id}`);
    } catch (e) {
      // Timer might not be running
    }
    return NextResponse.json(
      { error: 'Failed to list tokens' },
      { status: 500 }
    );
  }
}

// POST /api/services/[id]/tokens - Create a new token
export async function POST(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  try {
    // Get user ID from headers (set by middleware)
    const currentUserId = request.headers.get('x-user-id');
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, description, scopes = ['execute'], expiresAt } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      );
    }
    
    // Check if service exists and user owns it
    const service = await redis.hGetAll(`service:${id}`);
    
    if (!service || Object.keys(service).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Check ownership
    if (service.userId !== currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Generate token and ID
    const tokenId = generateTokenId();
    const token = generateToken();
    const tokenHash = hashToken(token);
    
    // Store token data
    const tokenData = {
      serviceId: id,
      name,
      description: description || '',
      scopes: JSON.stringify(scopes),
      tokenHash,
      createdAt: new Date().toISOString(),
      usageCount: '0',
      userId: currentUserId,
    };
    
    if (expiresAt) {
      tokenData.expiresAt = expiresAt;
    }
    
    // Use Redis transaction to ensure atomicity
    const multi = redis.multi();
    
    // Store token data
    multi.hSet(`token:${tokenId}`, tokenData);
    
    // Add token ID to service's token set
    multi.sAdd(`service:${id}:tokens`, tokenId);
    
    // Create hash lookup for quick token validation
    multi.set(`token:hash:${tokenHash}`, tokenId);
    
    await multi.exec();
    
    // Return the token only once (user must save it)
    return NextResponse.json({
      id: tokenId,
      token, // This is the only time we return the actual token
      name,
      description: description || '',
      scopes,
      createdAt: tokenData.createdAt,
      expiresAt: expiresAt || null,
      message: 'Save this token securely. It will not be shown again.'
    });
    
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}