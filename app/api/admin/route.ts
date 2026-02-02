import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getLicenseType, type LicenseType } from '@/lib/licensing';

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

function isLocalhostRequest(request: NextRequest): boolean {
  // Check if running in development mode
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Check request headers for localhost access
  const host = request.headers.get('host') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const forwardedFor = request.headers.get('x-forwarded-for') || '';

  const isLocalhost =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('::1') ||
    forwardedHost.startsWith('localhost') ||
    forwardedHost.startsWith('127.0.0.1') ||
    forwardedFor.startsWith('127.0.0.1') ||
    forwardedFor.startsWith('::1');

  return isLocalhost;
}

export async function GET(request: NextRequest) {
  // Check if request is from localhost or development mode
  if (!isLocalhostRequest(request)) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access only available from localhost' },
      { status: 403 }
    );
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
