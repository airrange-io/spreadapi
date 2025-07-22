import { NextResponse } from 'next/server';
import { createToken } from '../../../../../lib/mcp-auth';

export async function POST(request) {
  try {
    // TODO: Add proper authentication with Hanko
    // For now, using a fixed temporary user ID for consistency
    const tempUserId = 'temp-user-default';

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
      tempUserId,
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