import { NextResponse } from 'next/server';
import { createToken } from '../../../../../lib/mcp-auth';

export async function POST(request) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create MCP tokens' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, serviceIds } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Token name must be 100 characters or less' },
        { status: 400 }
      );
    }
    
    // Validate serviceIds if provided
    if (serviceIds && !Array.isArray(serviceIds)) {
      return NextResponse.json(
        { error: 'Service IDs must be an array' },
        { status: 400 }
      );
    }

    // Create token
    const tokenData = await createToken(
      userId,
      name.trim(),
      description?.trim() || '',
      serviceIds || []
    );

    return NextResponse.json(tokenData, { status: 201 });
    
  } catch (error) {
    console.error('Error creating MCP token:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}