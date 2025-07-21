import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateToken, generateTokenId, hashToken } from '@/utils/tokenUtils';

// For now, use a fixed test user (same as services API)
const TEST_USER_ID = 'test1234';

// GET /api/services/[id]/tokens - List all tokens for a service
export async function GET(request, { params }) {
  const { id } = await params;
  
  try {
    // Check if service exists and user owns it
    const service = await redis.hGetAll(`service:${id}`);
    
    if (!service || Object.keys(service).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    if (service.userId !== TEST_USER_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get all token IDs for this service
    const tokenIds = await redis.sMembers(`service:${id}:tokens`);
    
    // Get token details for each ID
    const tokens = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const tokenData = await redis.hGetAll(`token:${tokenId}`);
        if (!tokenData || Object.keys(tokenData).length === 0) return null;
        
        // Don't return the actual token hash
        const { tokenHash, ...safeData } = tokenData;
        
        return {
          id: tokenId,
          ...safeData,
          scopes: safeData.scopes ? JSON.parse(safeData.scopes) : [],
          createdAt: safeData.createdAt || null,
          lastUsedAt: safeData.lastUsedAt || null,
          expiresAt: safeData.expiresAt || null,
          usageCount: parseInt(safeData.usageCount || '0'),
        };
      })
    );
    
    // Filter out any null values
    const validTokens = tokens.filter(token => token !== null);
    
    return NextResponse.json({ tokens: validTokens });
    
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
  const { id } = await params;
  
  try {
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
    
    if (service.userId !== TEST_USER_ID) {
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
      userId: TEST_USER_ID,
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