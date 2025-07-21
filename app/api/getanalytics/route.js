import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { getError } from '../../../utils/helper';

//===============================================
// Function
//===============================================

// Enhanced analytics function with more comprehensive tracking
async function getServiceAnalytics(serviceId) {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();
    
    // Get last 7 days of data
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
    }
    
    // Build Redis pipeline for efficient data retrieval
    const pipeline = redis.pipeline();
    
    // Get total calls
    pipeline.get(`analytics:${serviceId}:total`);
    
    // Get today's calls per hour
    for (let hour = 0; hour <= currentHour; hour++) {
      pipeline.get(`analytics:${serviceId}:${today}:${hour}`);
    }
    
    // Get last 7 days data
    last7Days.forEach(date => {
      pipeline.get(`analytics:${serviceId}:${date}:calls`);
      pipeline.get(`analytics:${serviceId}:${date}:errors`);
    });
    
    // Get cache statistics
    pipeline.get(`analytics:${serviceId}:cache:hits`);
    pipeline.get(`analytics:${serviceId}:cache:misses`);
    
    // Execute pipeline
    const results = await pipeline.exec();
    let resultIndex = 0;
    
    // Parse total calls
    const totalCalls = parseInt(results[resultIndex++][1] || '0');
    
    // Parse today's hourly calls
    let todayCalls = 0;
    const hourlyData = [];
    for (let hour = 0; hour <= currentHour; hour++) {
      const calls = parseInt(results[resultIndex++][1] || '0');
      todayCalls += calls;
      hourlyData.push({ hour, calls });
    }
    
    // Parse last 7 days data
    const dailyData = [];
    let totalErrors = 0;
    last7Days.forEach((date, index) => {
      const calls = parseInt(results[resultIndex++][1] || '0');
      const errors = parseInt(results[resultIndex++][1] || '0');
      totalErrors += errors;
      dailyData.push({
        date,
        calls,
        errors,
        isToday: index === 0
      });
    });
    
    // Parse cache data
    const cacheHits = parseInt(results[resultIndex++][1] || '0');
    const cacheMisses = parseInt(results[resultIndex++][1] || '0');
    const cacheTotal = cacheHits + cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? (cacheHits / cacheTotal * 100).toFixed(1) : '0.0';
    
    // Calculate success rate
    const successRate = totalCalls > 0 
      ? ((totalCalls - totalErrors) / totalCalls * 100).toFixed(1) 
      : '100.0';
    
    // Get average response time (if tracked)
    const avgResponseTime = await redis.get(`analytics:${serviceId}:avg_response_time`);
    
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
      const analytics = await getServiceAnalytics(serviceId);
      return NextResponse.json(analytics);
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
        // Increment total calls
        await redis.incr(`analytics:${serviceId}:total`);
        // Increment today's hourly calls
        await redis.incr(`analytics:${serviceId}:${today}:${currentHour}`);
        // Increment today's total calls
        await redis.incr(`analytics:${serviceId}:${today}:calls`);
        // Also update legacy format for backward compatibility
        await redis.hIncrBy(`service:${serviceId}`, 'calls', 1);
        await redis.hIncrBy(`service:${serviceId}`, `calls:${today}`, 1);
        break;
        
      case 'error':
        // Increment error count
        await redis.incr(`analytics:${serviceId}:${today}:errors`);
        break;
        
      case 'cache_hit':
        await redis.incr(`analytics:${serviceId}:cache:hits`);
        break;
        
      case 'cache_miss':
        await redis.incr(`analytics:${serviceId}:cache:misses`);
        break;
        
      case 'response_time':
        // Update average response time (simplified - in production, use proper averaging)
        if (data?.responseTime) {
          await redis.set(`analytics:${serviceId}:avg_response_time`, data.responseTime);
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