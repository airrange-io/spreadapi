import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request) {
  try {
    const userId = 'test1234';
    const userData = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      tenantId: 'tenant1234',
      role: 'developer',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Create user record
    await redis.hSet(`user:${userId}`, userData);
    
    // Verify by reading back
    const savedUser = await redis.hGetAll(`user:${userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: savedUser
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const userId = 'test1234';
    const user = await redis.hGetAll(`user:${userId}`);
    
    if (!user || Object.keys(user).length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}