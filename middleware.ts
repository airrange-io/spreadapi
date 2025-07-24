import { NextResponse, NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL!;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Define protected routes
  const protectedRoutes = [
    '/service/',
    '/analytics/',
    '/api/services',
    '/api/workbook',
    '/api/manageapi',
    '/api/cache-stats',
    '/api/cache/blob',
    '/api/debug-cache',
    '/api/debug-service',
    '/api/diagnose-cache',
    '/api/performance-diagnostic',
    '/api/redis-pool-stats',
    '/api/timing-breakdown',
    '/api/test-cache',
    '/api/warm',
  ];
  
  // Check if current path needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Skip auth for public routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // For API routes, return 401 instead of redirect
  const isApiRoute = pathname.startsWith('/api/');
  
  // Get the Hanko token from cookie
  const hanko = req.cookies.get("hanko")?.value;
  
  // If no token, handle appropriately
  if (!hanko) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized - No authentication token' },
        { status: 401 }
      );
    }
    
    // Redirect to login with return URL
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Create JWKS client (jose handles caching internally)
    const JWKS = createRemoteJWKSet(
      new URL(`${hankoApiUrl}/.well-known/jwks.json`)
    );
    
    // Verify the JWT
    const verifiedJWT = await jwtVerify(hanko, JWKS);
    
    // Extract user ID from JWT
    const userId = verifiedJWT.payload.sub as string;
    
    // For API routes, add user ID to headers
    if (isApiRoute) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', userId);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // For page routes, continue normally
    return NextResponse.next();
  } catch (error: any) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Redirect to login with return URL
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Protected page routes
    '/service/:path*',
    '/analytics/:path*',
    
    // Protected API routes
    '/api/services/:path*',
    '/api/workbook/:path*',
    '/api/manageapi/:path*',
    '/api/cache-stats',
    '/api/cache/:path*',
    '/api/debug-cache',
    '/api/debug-service',
    '/api/diagnose-cache',
    '/api/performance-diagnostic',
    '/api/redis-pool-stats',
    '/api/timing-breakdown',
    '/api/test-cache',
    '/api/warm',
  ]
};