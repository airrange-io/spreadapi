import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import redis from '@/lib/redis';
import { getLicenseType, type LicenseType } from '@/lib/licensing';

// Admin email allowlist - can also be set via ADMIN_EMAILS env var
const DEFAULT_ADMIN_EMAILS = [
  's.methner@mac.com',
  'stephan@airrange.io',
];

function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS;
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim().toLowerCase());
  }
  return DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase());
}

interface UserSummary {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  lastActivity: string;
  licenseType: LicenseType;
  serviceCount: number;
  totalCalls: number;
}

interface DailyCount {
  date: string;
  count: number;
}

interface DailyCalls {
  date: string;
  calls: number;
}

interface TopService {
  id: string;
  name: string;
  userId: string;
  userEmail: string;
  calls: number;
}

interface AdminDashboardData {
  users: UserSummary[];
  totals: {
    userCount: number;
    serviceCount: number;
    totalCalls: number;
    todayCalls: number;
  };
  signupTrend: DailyCount[];
  callsTrend: DailyCalls[];
  topServices: TopService[];
}

const hankoApiUrl = process.env.NEXT_PUBLIC_HANKO_API_URL!;

function isLocalhostRequest(request: NextRequest): boolean {
  // Check request headers for localhost access
  const host = request.headers.get('host') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const forwardedFor = request.headers.get('x-forwarded-for') || '';

  return (
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('::1') ||
    forwardedHost.startsWith('localhost') ||
    forwardedHost.startsWith('127.0.0.1') ||
    forwardedFor.startsWith('127.0.0.1') ||
    forwardedFor.startsWith('::1')
  );
}

async function getAuthenticatedUserEmail(request: NextRequest): Promise<string | null> {
  try {
    const hanko = request.cookies.get('hanko')?.value;
    if (!hanko) return null;

    const JWKS = createRemoteJWKSet(
      new URL(`${hankoApiUrl}/.well-known/jwks.json`)
    );
    const verifiedJWT = await jwtVerify(hanko, JWKS);
    const userId = verifiedJWT.payload.sub as string;

    // Get user email from Redis
    const email = await redis.hGet(`user:${userId}`, 'email');
    return email ? String(email).toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const adminEmails = getAdminEmails();
  const isDev = process.env.NODE_ENV !== 'production';
  const isLocalhost = isLocalhostRequest(request);

  // In development + localhost, allow access without auth
  if (isDev && isLocalhost) {
    // Continue to data fetching
  } else {
    // In production, require authenticated admin user
    const userEmail = await getAuthenticatedUserEmail(request);

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
  }

  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get all user IDs
    const userIdsRaw = await redis.sMembers('users:index');
    const userIds = userIdsRaw.map(id => String(id));

    if (!userIds || userIds.length === 0) {
      const emptyResult: AdminDashboardData = {
        users: [],
        totals: {
          userCount: 0,
          serviceCount: 0,
          totalCalls: 0,
          todayCalls: 0,
        },
        signupTrend: [],
        callsTrend: [],
        topServices: [],
      };
      return NextResponse.json(emptyResult);
    }

    // Batch fetch user data
    const multi = redis.multi();
    for (const userId of userIds) {
      multi.hGetAll(`user:${userId}`);
      multi.hGetAll(`user:${userId}:services`);
    }
    const results = await multi.exec();

    // Process user data and collect service IDs
    const users: UserSummary[] = [];
    const allServiceIds: string[] = [];
    const serviceToUser: Map<string, { id: string; email: string }> = new Map();
    const signupDates: string[] = [];

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const userData = results ? (results[i * 2] as unknown as Record<string, string> | null) : null;
      const servicesData = results ? (results[i * 2 + 1] as unknown as Record<string, string> | null) : null;

      if (!userData || Object.keys(userData).length === 0) continue;

      const serviceIds = servicesData ? Object.keys(servicesData) : [];
      allServiceIds.push(...serviceIds);

      const email = String(userData.email || 'Unknown');
      serviceIds.forEach(sid => serviceToUser.set(sid, { id: userId, email }));

      // Track signup date for trend
      if (userData.createdAt) {
        const signupDate = String(userData.createdAt).split('T')[0];
        signupDates.push(signupDate);
      }

      users.push({
        id: userId,
        email,
        createdAt: String(userData.createdAt || ''),
        lastLogin: String(userData.lastLogin || ''),
        lastActivity: String(userData.lastActivity || ''),
        licenseType: getLicenseType(String(userData.licenseType || '')),
        serviceCount: serviceIds.length,
        totalCalls: 0, // Will be populated later
      });
    }

    // Fetch service data and analytics
    const serviceAnalytics: Map<string, { name: string; total: number; todayCalls: number }> = new Map();

    if (allServiceIds.length > 0) {
      // Build date strings for the last 30 days
      const last30Days: string[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
      }

      const serviceMulti = redis.multi();
      for (const serviceId of allServiceIds) {
        serviceMulti.hGet(`service:${serviceId}`, 'name');
        serviceMulti.hGet(`service:${serviceId}:analytics`, 'total');
        // Get today's calls
        serviceMulti.hGet(`service:${serviceId}:analytics`, `${today}:calls`);
        // Get last 30 days of calls
        for (const date of last30Days) {
          serviceMulti.hGet(`service:${serviceId}:analytics`, `${date}:calls`);
        }
      }
      const serviceResults = await serviceMulti.exec();

      // Process service analytics
      const fieldsPerService = 3 + last30Days.length;
      for (let i = 0; i < allServiceIds.length; i++) {
        const serviceId = allServiceIds[i];
        const baseIndex = i * fieldsPerService;
        const name = serviceResults?.[baseIndex] ? String(serviceResults[baseIndex]) : 'Untitled Service';
        const total = serviceResults?.[baseIndex + 1] ? parseInt(String(serviceResults[baseIndex + 1])) : 0;
        const todayCalls = serviceResults?.[baseIndex + 2] ? parseInt(String(serviceResults[baseIndex + 2])) : 0;

        serviceAnalytics.set(serviceId, { name, total, todayCalls });
      }

      // Calculate calls trend (last 30 days)
      const callsByDate: Map<string, number> = new Map();
      last30Days.forEach(date => callsByDate.set(date, 0));

      for (let i = 0; i < allServiceIds.length; i++) {
        const baseIndex = i * fieldsPerService;
        for (let j = 0; j < last30Days.length; j++) {
          const date = last30Days[j];
          const calls = serviceResults?.[baseIndex + 3 + j] ? parseInt(String(serviceResults[baseIndex + 3 + j])) : 0;
          callsByDate.set(date, (callsByDate.get(date) || 0) + calls);
        }
      }

      // Update user total calls
      for (const user of users) {
        const userServiceIds = Array.from(serviceToUser.entries())
          .filter(([, userData]) => userData.id === user.id)
          .map(([sid]) => sid);

        user.totalCalls = userServiceIds.reduce((sum, sid) => {
          const analytics = serviceAnalytics.get(sid);
          return sum + (analytics?.total || 0);
        }, 0);
      }

      // Calculate totals
      let totalCalls = 0;
      let todayCalls = 0;
      serviceAnalytics.forEach(({ total, todayCalls: tc }) => {
        totalCalls += total;
        todayCalls += tc;
      });

      // Build signup trend (last 30 days)
      const signupsByDate: Map<string, number> = new Map();
      last30Days.forEach(date => signupsByDate.set(date, 0));
      signupDates.forEach(date => {
        if (signupsByDate.has(date)) {
          signupsByDate.set(date, (signupsByDate.get(date) || 0) + 1);
        }
      });

      const signupTrend: DailyCount[] = last30Days
        .reverse()
        .map(date => ({ date, count: signupsByDate.get(date) || 0 }));

      const callsTrend: DailyCalls[] = Array.from(callsByDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, calls]) => ({ date, calls }));

      // Build top services list
      const topServices: TopService[] = Array.from(serviceAnalytics.entries())
        .map(([id, { name, total }]) => {
          const userInfo = serviceToUser.get(id);
          return {
            id,
            name,
            userId: userInfo?.id || '',
            userEmail: userInfo?.email || 'Unknown',
            calls: total,
          };
        })
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 10);

      // Sort users by total calls descending
      users.sort((a, b) => b.totalCalls - a.totalCalls);

      const result: AdminDashboardData = {
        users,
        totals: {
          userCount: users.length,
          serviceCount: allServiceIds.length,
          totalCalls,
          todayCalls,
        },
        signupTrend,
        callsTrend,
        topServices,
      };

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'private, no-cache',
        },
      });
    }

    // No services case
    const result: AdminDashboardData = {
      users,
      totals: {
        userCount: users.length,
        serviceCount: 0,
        totalCalls: 0,
        todayCalls: 0,
      },
      signupTrend: [],
      callsTrend: [],
      topServices: [],
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
