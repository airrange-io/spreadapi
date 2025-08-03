import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('id');
  
  if (!serviceId) {
    return NextResponse.json({ error: 'Service ID required' });
  }
  
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    // Get cookies for internal fetch
    const cookieHeader = request.headers.get('cookie');
    
    // Test both endpoints
    const headers = {
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(cookieHeader ? { 'cookie': cookieHeader } : {})
    };
    
    // Try the /full endpoint
    const fullUrl = `${baseUrl}/api/services/${serviceId}/full`;
    const fullResponse = await fetch(fullUrl, { headers });
    
    // Try the regular endpoint
    const regularUrl = `${baseUrl}/api/services/${serviceId}`;
    const regularResponse = await fetch(regularUrl, { headers });
    
    const result = {
      serviceId,
      userId,
      hasCookie: !!cookieHeader,
      fullEndpoint: {
        url: fullUrl,
        status: fullResponse.status,
        statusText: fullResponse.statusText,
        data: fullResponse.ok ? await fullResponse.json() : null
      },
      regularEndpoint: {
        url: regularUrl,
        status: regularResponse.status,
        statusText: regularResponse.statusText,
        data: regularResponse.ok ? await regularResponse.json() : null
      }
    };
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}