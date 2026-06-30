import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateToken, generateTokenId, hashToken } from '@/utils/tokenUtils';
import { applyTokenRequirement } from '@/lib/tokenRequirement';


// GET /api/services/[id]/tokens - List all tokens for a service
export async function GET(request, { params }) {
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

    // Check if service exists and user owns it - fetch only userId field
    const serviceUserId = await redis.hGet(`service:${id}`, 'userId');

    if (!serviceUserId) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify ownership
    if (serviceUserId !== currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all token IDs for this service
    const tokenIds = await redis.sMembers(`service:${id}:tokens`);

    // Early return if no tokens
    if (tokenIds.length === 0) {
      return NextResponse.json({ tokens: [] });
    }

    // Use multi for better performance
    const multi = redis.multi();

    tokenIds.forEach(tokenId => {
      multi.hGetAll(`token:${tokenId}`);
    });

    const results = await multi.exec();

    // Process token data
    const tokens = results
      .map((tokenData, index) => {
        if (!tokenData || Object.keys(tokenData).length === 0) return null;

        // Don't return the actual token hash or scopes
        const { tokenHash, scopes, ...safeData } = tokenData;

        return {
          id: tokenIds[index],
          ...safeData,
          createdAt: safeData.createdAt || null,
          lastUsedAt: safeData.lastUsedAt || null,
          expiresAt: safeData.expiresAt || null,
          usageCount: parseInt(safeData.usageCount || '0'),
        };
      })
      .filter(token => token !== null);

    return NextResponse.json({ tokens });

  } catch (error) {
    console.error('Error listing tokens:', error);
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
    const { name, description, expiresAt } = body;
    
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

    // Read the resulting cardinality inside the same transaction so concurrent
    // creates can't both miss the 0->1 transition (Redis runs each MULTI atomically).
    multi.sCard(`service:${id}:tokens`);

    const results = await multi.exec();
    const tokenCount = results[results.length - 1];

    // If this is the first token, enable the token requirement automatically
    // and propagate it to the live (published) service immediately. Fail-closed:
    // creating a token should protect the API without a manual save/re-publish.
    try {
      if (tokenCount === 1) {
        await applyTokenRequirement(id, true);
      }
    } catch (reqError) {
      console.error('Failed to auto-enable token requirement:', reqError);
    }

    // Return the token only once (user must save it)
    return NextResponse.json({
      id: tokenId,
      token, // This is the only time we return the actual token
      name,
      description: description || '',
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