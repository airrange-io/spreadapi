import { NextResponse } from 'next/server';
import { createToken } from '@/lib/mcp-auth';

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
    const { name = 'API Token', description = '', serviceIds = [] } = body;
    
    // Create token for the authenticated user
    const result = await createToken(authenticatedUserId, name, description, serviceIds);
    
    return NextResponse.json({
      success: true,
      token: result.token,
      name: result.name,
      description: result.description,
      created: result.created,
      serviceIds: result.serviceIds
    });
  } catch (error) {
    console.error('Error creating MCP token:', error);
    return NextResponse.json(
      { error: 'Failed to create token', details: error.message },
      { status: 500 }
    );
  }
}

// Remove GET method - token creation should require authentication