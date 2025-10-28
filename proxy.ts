import { NextResponse, NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL!;

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Handle redirects for old URLs
  const redirects: Record<string, string> = {
    // Redirect old product routes to new root locations
    '/product': '/',
    '/product/how-excel-api-works': '/how-excel-api-works',
    '/product/excel-ai-integration': '/excel-ai-integration',
    '/product/why-ai-fails-at-math': '/why-ai-fails-at-math',
    // Redirect dashboard routes to /app
    '/profile': '/app/profile',
    '/services': '/app/services',
    '/cache-diagnostics': '/app/cache-diagnostics',
    '/cache-stats': '/app/cache-stats',
    '/chat': '/app/chat',
  };
  
  if (redirects[pathname]) {
    return NextResponse.redirect(new URL(redirects[pathname], req.url), 301);
  }
  
  // Handle service/[id] redirects
  if (pathname.startsWith('/service/')) {
    const newPath = pathname.replace('/service/', '/app/service/');
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }
  
  // Define protected routes
  const protectedRoutes = [
    '/app/',
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
    // '/api/warm', // Removed - cron jobs need unauthenticated access
    '/api/mcp/tokens', // MCP token management requires auth
    '/api/mcp/create-token', // MCP token creation requires auth
    '/api/mcp/update-token', // MCP token update requires auth
    '/api/v1/services', // Service management requires auth
    // Note: /api/v1/services/*/execute is handled separately to allow public access
  ];
  
  // Check if current path needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Execute endpoints might be public (if service doesn't require token)
  const isExecuteEndpoint = pathname.match(/^\/api\/v1\/services\/[^\/]+\/execute/);
  
  // Service details endpoint might be public for published services
  const isServiceDetailsEndpoint = pathname.match(/^\/api\/v1\/services\/[^\/]+$/);
  
  // Services list endpoint should be public to allow service discovery
  const isServicesListEndpoint = pathname === '/api/v1/services';

  // Check if this is a web app request (has token query parameter)
  const isWebAppRequest = pathname.match(/^\/app\/v1\/services\/[^\/]+$/) && req.nextUrl.searchParams.has('token');

  // Check if this is a view route (embeddable views - should be public or token-protected)
  const isViewRoute = pathname.match(/^\/app\/v1\/services\/[^\/]+\/view\/[^\/]+$/);

  // Skip auth for public routes
  if (!isProtectedRoute || isExecuteEndpoint || isServiceDetailsEndpoint || isServicesListEndpoint || isWebAppRequest || isViewRoute) {
    // For web app requests, add header to indicate public access
    if (isWebAppRequest) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-webapp-access', 'true');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For view routes, add header to indicate public/embeddable access
    if (isViewRoute) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-view-access', 'true');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For v1 API endpoints, pass through without auth
    // The endpoints themselves will check if the service requires a token
    if (isExecuteEndpoint || isServiceDetailsEndpoint || isServicesListEndpoint) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-public-access', 'true');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

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
    '/app/:path*',
    '/service/:path*',  // This will catch old service routes and redirect them
    '/analytics/:path*',
    
    // Handle redirects
    '/product/:path*',
    '/profile',
    '/services',
    '/cache-diagnostics',
    '/cache-stats',
    '/chat',
    
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
    // '/api/warm', // Removed - cron jobs need unauthenticated access
    
    // MCP routes (token management needs auth)
    '/api/mcp/tokens/:path*',
    '/api/mcp/create-token',
    '/api/mcp/update-token',
    
    // v1 API routes
    '/api/v1/:path*',
  ]
};