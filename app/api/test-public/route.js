import { NextResponse } from 'next/server';

export async function GET(request) {
  const userId = request.headers.get('x-user-id');
  const isPublicAccess = request.headers.get('x-public-access');
  
  return NextResponse.json({
    message: 'Test endpoint',
    authenticated: !!userId,
    userId: userId || 'none',
    isPublicAccess: isPublicAccess || false,
    headers: {
      'x-user-id': userId,
      'x-public-access': isPublicAccess
    }
  });
}