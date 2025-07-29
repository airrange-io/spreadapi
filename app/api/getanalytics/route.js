import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { getError } from '../../../utils/helper';

//===============================================
// Function
//===============================================

// Enhanced analytics function with more comprehensive tracking
async function getServiceAnalytics(serviceId, options = {}) {
  try {
    const { days = 7 } = options;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();
    
    // Get last N days of data
    const lastNDays = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      lastNDays.push(dateStr);
    }
    
    // Build specific fields to fetch (more efficient than hGetAll)
    const fieldsToFetch = ['total', 'errors', 'avg_response_time', 'cache:hits', 'cache:misses'];
    
    // Add hourly fields for today
    for (let hour = 0; hour <= currentHour; hour++) {
      fieldsToFetch.push(`${today}:${hour}`);
    }
    
    // Add daily fields for requested days
    lastNDays.forEach(date => {
      fieldsToFetch.push(`${date}:calls`);
      fieldsToFetch.push(`${date}:errors`);
      fieldsToFetch.push(`${date}:avg_response_time`);
    });
    
    // Add response time distribution fields
    const responseBuckets = ['0-50ms', '50-100ms', '100-200ms', '200-500ms', '500-1000ms', '>1000ms'];
    responseBuckets.forEach(bucket => {
      fieldsToFetch.push(`response_dist:${bucket}`);
    });
    
    // Use hMGet for specific fields instead of hGetAll (more efficient)
    const values = await redis.hmGet(`service:${serviceId}:analytics`, fieldsToFetch);
    
    // Build analytics data object from specific fields
    const analyticsData = {};
    fieldsToFetch.forEach((field, index) => {
      if (values[index] !== null) {
        analyticsData[field] = values[index];
      }
    });
    
    // Parse analytics data
    const totalCalls = parseInt(analyticsData.total || '0');
    
    // Parse today's hourly calls
    let todayCalls = 0;
    const hourlyData = [];
    for (let hour = 0; hour <= currentHour; hour++) {
      const calls = parseInt(analyticsData[`${today}:${hour}`] || '0');
      todayCalls += calls;
      hourlyData.push({ hour, calls });
    }
    
    // Parse last 7 days data
    const dailyData = [];
    let totalErrors = 0;
    lastNDays.forEach((date, index) => {
      const calls = parseInt(analyticsData[`${date}:calls`] || '0');
      const errors = parseInt(analyticsData[`${date}:errors`] || '0');
      const avgResponseTime = parseInt(analyticsData[`${date}:avg_response_time`] || '0');
      totalErrors += errors;
      dailyData.push({
        date,
        calls,
        errors,
        avgResponseTime: avgResponseTime > 0 ? avgResponseTime : undefined,
        isToday: index === 0
      });
    });
    
    // Parse cache data
    const cacheHits = parseInt(analyticsData['cache:hits'] || '0');
    const cacheMisses = parseInt(analyticsData['cache:misses'] || '0');
    const cacheTotal = cacheHits + cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? (cacheHits / cacheTotal * 100).toFixed(1) : '0.0';
    
    // Calculate success rate
    const successRate = totalCalls > 0 
      ? ((totalCalls - totalErrors) / totalCalls * 100).toFixed(1) 
      : '100.0';
    
    // Get average response time from analytics hash
    const avgResponseTime = analyticsData.avg_response_time || '0';
    
    // Parse response time distribution
    const responseTimeDistribution = [];
    const buckets = ['0-50ms', '50-100ms', '100-200ms', '200-500ms', '500-1000ms', '>1000ms'];
    buckets.forEach(bucket => {
      const count = parseInt(analyticsData[`response_dist:${bucket}`] || '0');
      if (count > 0) {
        responseTimeDistribution.push({
          range: bucket,
          count
        });
      }
    });
    
    // Also get legacy data format for backward compatibility
    const serviceInfo = await redis.hGetAll("service:" + serviceId);
    let callsByDate = [];
    let callsByToken = [];
    let callsByDateAndToken = [];
    
    if (serviceInfo) {
      const legacyCalls = serviceInfo.calls ? parseInt(serviceInfo.calls) : 0;
      
      // get all calls by date for this service (legacy format)
      for (const [key, value] of Object.entries(serviceInfo)) {
        if (key?.includes("calls:20")) {
          const calls = parseInt(value);
          const keyInfo = key.replace("calls:", "");
          if (keyInfo.includes("token")) {
            const dateStr = keyInfo.split(":token")[0];
            const token = keyInfo.split(":")[2];
            callsByDateAndToken.push({
              date: dateStr,
              token: token,
              calls: calls,
            });
          } else {
            callsByDate.push({
              date: keyInfo,
              calls: calls,
            });
          }
        } else if (key?.includes("calls:token")) {
          const calls = parseInt(value);
          const token = key.split(":")[2];
          callsByToken.push({ token: token, calls: calls });
        }
      }
    }
    
    return {
      serviceId,
      summary: {
        totalCalls: totalCalls || (serviceInfo?.calls ? parseInt(serviceInfo.calls) : 0),
        todayCalls,
        totalErrors,
        successRate: parseFloat(successRate),
        avgResponseTime: parseFloat(avgResponseTime || '0')
      },
      cache: {
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: parseFloat(cacheHitRate)
      },
      hourlyData: hourlyData.reverse(), // Most recent first
      dailyData: dailyData.reverse(), // Most recent first
      responseTimeDistribution,
      // Legacy format for backward compatibility
      created: serviceInfo?.created,
      callsByDate,
      callsByToken,
      callsByTokenAndDate: callsByDateAndToken,
      lastUpdated: now.toISOString()
    };
    
  } catch (error) {
    console.error('Error fetching analytics for service:', serviceId, error);
    return {
      serviceId,
      error: 'Failed to fetch analytics',
      summary: {
        totalCalls: 0,
        todayCalls: 0,
        totalErrors: 0,
        successRate: 100,
        avgResponseTime: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      hourlyData: [],
      dailyData: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

async function getServicesByTenant(tenantId) {
  if (!tenantId) return getError("tenant is required");
  let result = { tenant: tenantId };
  let services = [];
  let serviceAnalytics = [];

  try {
    const tenantInfo = await redis.hGetAll("tenant:" + tenantId);
    for (const [key] of Object.entries(tenantInfo)) {
      if (key?.includes("service:")) {
        let index = key.indexOf("service:");
        let serviceId = key.substring(index + 8);
        if (services.indexOf(serviceId) === -1) {
          services.push(serviceId);
          const analytics = await getServiceAnalytics(serviceId);
          serviceAnalytics.push({ serviceId: serviceId, analytics: analytics });
        }
      }
    }
  } catch (error) {
    console.error("ERROR getServicesByTenant", error);
  }
  result.services = serviceAnalytics;
  return result;
}

//===============================================
// Route Handlers
//===============================================

// Simple in-memory cache
const analyticsCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Support multiple parameter names for service ID
    let serviceId = searchParams.get('serviceId') || 
                   searchParams.get('api') || 
                   searchParams.get('service') || 
                   searchParams.get('id');
    
    const serviceIds = searchParams.get('serviceIds');
    const tenantId = searchParams.get('tenant');
    
    // Handle single service analytics
    if (serviceId) {
      const days = parseInt(searchParams.get('days') || '7');
      const cacheKey = `${serviceId}:${days}`;
      
      // Check cache first
      const cached = analyticsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return NextResponse.json(cached.data, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'private, max-age=30'
          }
        });
      }
      
      // Fetch fresh data
      const analytics = await getServiceAnalytics(serviceId, { days });
      
      // Cache the result
      analyticsCache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });
      
      // Clean old cache entries if too many
      if (analyticsCache.size > 100) {
        const oldestKey = analyticsCache.keys().next().value;
        analyticsCache.delete(oldestKey);
      }
      
      return NextResponse.json(analytics, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'private, max-age=30'
        }
      });
    }
    
    // Handle multiple services analytics (batch request)
    if (serviceIds) {
      const ids = serviceIds.split(',').filter(id => id.trim());
      const analyticsPromises = ids.map(id => getServiceAnalytics(id.trim()));
      const analyticsResults = await Promise.all(analyticsPromises);
      
      // Create a map for easy lookup
      const analyticsMap = {};
      analyticsResults.forEach(result => {
        analyticsMap[result.serviceId] = result;
      });
      
      return NextResponse.json({
        services: analyticsMap,
        count: ids.length,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle tenant-based query (legacy)
    if (tenantId) {
      const result = await getServicesByTenant(tenantId);
      return NextResponse.json(result);
    }
    
    // No service ID provided
    return NextResponse.json(
      { error: 'serviceId, serviceIds, or tenant parameter is required' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error in getanalytics endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to record analytics events
export async function POST(request) {
  try {
    const body = await request.json();
    const { serviceId, event, data } = body;
    
    if (!serviceId || !event) {
      return NextResponse.json(
        { error: 'serviceId and event are required' },
        { status: 400 }
      );
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();
    
    // Record the event based on type
    switch (event) {
      case 'call':
        // Use multi for atomic updates
        const multi = redis.multi();
        // Update analytics hash
        multi.hIncrBy(`service:${serviceId}:analytics`, 'total', 1);
        multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:${currentHour}`, 1);
        multi.hIncrBy(`service:${serviceId}:analytics`, `${today}:calls`, 1);
        // Also update legacy format for backward compatibility
        multi.hIncrBy(`service:${serviceId}`, 'calls', 1);
        multi.hIncrBy(`service:${serviceId}`, `calls:${today}`, 1);
        await multi.exec();
        break;
        
      case 'error':
        // Increment error count
        await redis.hIncrBy(`service:${serviceId}:analytics`, `${today}:errors`, 1);
        break;
        
      case 'cache_hit':
        await redis.hIncrBy(`service:${serviceId}:analytics`, 'cache:hits', 1);
        break;
        
      case 'cache_miss':
        await redis.hIncrBy(`service:${serviceId}:analytics`, 'cache:misses', 1);
        break;
        
      case 'response_time':
        // Update average response time (simplified - in production, use proper averaging)
        if (data?.responseTime) {
          await redis.hSet(`service:${serviceId}:analytics`, { avg_response_time: data.responseTime.toString() });
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ 
      success: true,
      serviceId,
      event,
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}