import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getLicenseType, getLimits, type LicenseType } from '@/lib/licensing';

interface ServiceSummary {
  id: string;
  name: string;
  status: 'published' | 'draft';
  totalCalls: number;
  todayCalls: number;
  weekCalls: number;
  monthCalls: number;
  avgResponseTime: number;
  errorRate: number;
}

interface DailyData {
  date: string;
  calls: number;
  errors: number;
}

interface AggregatedAnalytics {
  summary: {
    totalServices: number;
    publishedServices: number;
    totalCalls: number;
    todayCalls: number;
    weekCalls: number;
    monthCalls: number;
    maxCallsPerMonth: number;
    avgResponseTime: number;
    errorRate: number;
  };
  license: {
    type: LicenseType;
    maxCallsPerMonth: number;
  };
  services: ServiceSummary[];
  dailyData: DailyData[];
  timestamp: string;
}

async function getServiceAnalyticsSummary(
  serviceId: string,
  serviceName: string,
  isPublished: boolean
): Promise<ServiceSummary> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Build date strings for the last 30 days
  const last30Days: string[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    last30Days.push(date.toISOString().split('T')[0]);
  }

  // Fetch analytics data using hmGet for efficiency
  const fieldsToFetch = [
    'total',
    'avg_response_time',
    ...last30Days.map(d => `${d}:calls`),
    ...last30Days.map(d => `${d}:errors`),
  ];

  const values = await redis.hmGet(`service:${serviceId}:analytics`, fieldsToFetch);

  // Build data object - convert any Buffer values to strings
  const data: Record<string, string | null> = {};
  fieldsToFetch.forEach((field, index) => {
    const val = values[index];
    data[field] = val ? String(val) : null;
  });

  // Calculate totals
  const totalCalls = parseInt(data['total'] || '0');
  const avgResponseTime = parseFloat(data['avg_response_time'] || '0');

  let todayCalls = 0;
  let weekCalls = 0;
  let monthCalls = 0;
  let totalErrors = 0;

  last30Days.forEach((date, index) => {
    const calls = parseInt(data[`${date}:calls`] || '0');
    const errors = parseInt(data[`${date}:errors`] || '0');

    monthCalls += calls;
    totalErrors += errors;

    if (index < 7) {
      weekCalls += calls;
    }
    if (index === 0) {
      todayCalls = calls;
    }
  });

  const errorRate = monthCalls > 0 ? (totalErrors / monthCalls) * 100 : 0;

  return {
    id: serviceId,
    name: serviceName,
    status: isPublished ? 'published' : 'draft',
    totalCalls,
    todayCalls,
    weekCalls,
    monthCalls,
    avgResponseTime,
    errorRate,
  };
}

async function getAggregatedDailyData(
  serviceIds: string[],
  days: number = 30
): Promise<DailyData[]> {
  const now = new Date();
  const dailyTotals: Record<string, { calls: number; errors: number }> = {};

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyTotals[dateStr] = { calls: 0, errors: 0 };
  }

  // Fetch data for all services
  for (const serviceId of serviceIds) {
    const fieldsToFetch = Object.keys(dailyTotals).flatMap(d => [
      `${d}:calls`,
      `${d}:errors`,
    ]);

    const values = await redis.hmGet(`service:${serviceId}:analytics`, fieldsToFetch);

    let fieldIndex = 0;
    for (const date of Object.keys(dailyTotals)) {
      const callsVal = values[fieldIndex];
      const errorsVal = values[fieldIndex + 1];
      const calls = parseInt(callsVal ? String(callsVal) : '0');
      const errors = parseInt(errorsVal ? String(errorsVal) : '0');
      dailyTotals[date].calls += calls;
      dailyTotals[date].errors += errors;
      fieldIndex += 2;
    }
  }

  // Convert to array sorted by date
  return Object.entries(dailyTotals)
    .map(([date, data]) => ({
      date,
      calls: data.calls,
      errors: data.errors,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get days parameter (default 30)
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 90);

    // Get user's license type
    const userData = await redis.hGet(`user:${userId}`, 'licenseType');
    const licenseType = getLicenseType(userData ? String(userData) : null);
    const limits = getLimits(licenseType);

    // Get user's service index
    const serviceIndex = await redis.hGetAll(`user:${userId}:services`);
    const serviceIds = Object.keys(serviceIndex);

    if (serviceIds.length === 0) {
      const emptyResult: AggregatedAnalytics = {
        summary: {
          totalServices: 0,
          publishedServices: 0,
          totalCalls: 0,
          todayCalls: 0,
          weekCalls: 0,
          monthCalls: 0,
          maxCallsPerMonth: limits.maxCallsPerMonth,
          avgResponseTime: 0,
          errorRate: 0,
        },
        license: {
          type: licenseType,
          maxCallsPerMonth: limits.maxCallsPerMonth,
        },
        services: [],
        dailyData: [],
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(emptyResult);
    }

    // Get service names and published status
    const multi = redis.multi();
    for (const serviceId of serviceIds) {
      multi.hGet(`service:${serviceId}`, 'name');
      multi.exists(`service:${serviceId}:published`);
    }
    const serviceInfoResults = await multi.exec();

    // Build service info map
    const serviceInfo: { id: string; name: string; isPublished: boolean }[] = [];
    if (serviceInfoResults) {
      for (let i = 0; i < serviceIds.length; i++) {
        const nameResult = serviceInfoResults[i * 2];
        const existsResult = serviceInfoResults[i * 2 + 1];
        const name = nameResult ? String(nameResult) : 'Untitled Service';
        const isPublished = Number(existsResult) === 1;
        serviceInfo.push({
          id: serviceIds[i],
          name,
          isPublished,
        });
      }
    }

    // Get analytics for each service
    const serviceSummaries = await Promise.all(
      serviceInfo.map(s => getServiceAnalyticsSummary(s.id, s.name, s.isPublished))
    );

    // Get aggregated daily data
    const dailyData = await getAggregatedDailyData(serviceIds, days);

    // Calculate totals
    let totalCalls = 0;
    let todayCalls = 0;
    let weekCalls = 0;
    let monthCalls = 0;
    let totalResponseTime = 0;
    let totalErrors = 0;
    let publishedCount = 0;

    for (const service of serviceSummaries) {
      totalCalls += service.totalCalls;
      todayCalls += service.todayCalls;
      weekCalls += service.weekCalls;
      monthCalls += service.monthCalls;
      totalResponseTime += service.avgResponseTime;
      totalErrors += service.monthCalls * (service.errorRate / 100);
      if (service.status === 'published') {
        publishedCount++;
      }
    }

    const avgResponseTime = serviceSummaries.length > 0
      ? totalResponseTime / serviceSummaries.length
      : 0;
    const errorRate = monthCalls > 0 ? (totalErrors / monthCalls) * 100 : 0;

    // Sort services by total calls descending
    serviceSummaries.sort((a, b) => b.totalCalls - a.totalCalls);

    const result: AggregatedAnalytics = {
      summary: {
        totalServices: serviceIds.length,
        publishedServices: publishedCount,
        totalCalls,
        todayCalls,
        weekCalls,
        monthCalls,
        maxCallsPerMonth: limits.maxCallsPerMonth,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 10) / 10,
      },
      license: {
        type: licenseType,
        maxCallsPerMonth: limits.maxCallsPerMonth,
      },
      services: serviceSummaries,
      dailyData,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error fetching aggregated analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
