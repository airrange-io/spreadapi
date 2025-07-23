import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { getApiDefinition } from '../../../utils/helperApi';
const { initializeSpreadJS, createWorkbook } = require('../../../lib/spreadjs-server');

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // Initialize SpreadJS if not already done
    initializeSpreadJS();
    
    // Get published services to use for warming
    let warmServices = [];
    
    try {
      // Get user's services from the service index
      const TEST_USER_ID = 'test1234';
      const userServices = await redis.hGetAll(`user:${TEST_USER_ID}:services`);
      
      if (userServices && Object.keys(userServices).length > 0) {
        // Parse services and find published ones
        for (const [serviceId, serviceDataStr] of Object.entries(userServices)) {
          try {
            const serviceData = JSON.parse(serviceDataStr);
            if (serviceData.status === 'published') {
              warmServices.push({
                id: serviceId,
                name: serviceData.name || 'Unknown',
                token: null // Don't use token for warming
              });
              
              // Just use the first published service for warming
              break;
            }
          } catch (e) {
            console.error(`Error parsing service ${serviceId}:`, e);
          }
        }
      }
      
      // If no published services in index, use the dedicated warming service
      if (warmServices.length === 0) {
        const warmingServiceId = 'test1234_mdejqoua8ptor';
        const warmingService = await redis.hGetAll(`service:${warmingServiceId}`);
        
        if (warmingService && Object.keys(warmingService).length > 0) {
          // Check if it has published data
          const hasPublished = await redis.exists(`service:${warmingServiceId}:published`);
          if (hasPublished) {
            warmServices.push({
              id: warmingServiceId,
              name: warmingService.name || 'Warming Service',
              token: null // Assuming no token required for warming service
            });
          } else {
            console.log(`Warming service ${warmingServiceId} exists but is not published`);
          }
        } else {
          console.log(`Warming service ${warmingServiceId} not found`);
        }
      }
    } catch (e) {
      console.error('Error fetching services:', e);
    }
    
    // If no published services found, just warm up SpreadJS
    if (warmServices.length === 0) {
      console.log('No published services found for warming');
      // Still create a test workbook to warm up the library
      const testWorkbook = createWorkbook();
      
      return NextResponse.json({
        status: 'warm',
        timeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        message: 'No published services found, warmed SpreadJS only',
        spreadJsInitialized: true
      });
    }
    
    // Pre-fetch API definitions
    const promises = warmServices.map(api => 
      getApiDefinition(api.id, api.token).catch(err => ({
        apiId: api.id,
        error: err.message
      }))
    );
    
    const results = await Promise.all(promises);
    
    // Create a test workbook to warm up the library
    const testWorkbook = createWorkbook();
    
    // Warm the actual getResults endpoint with the first available service
    try {
      const firstService = warmServices[0];
      // Use minimal parameters for warming - this will return API docs if no params provided
      const warmUrl = `${request.url.replace('/warm', '/getresults')}?service=${firstService.id}${firstService.token ? `&token=${firstService.token}` : ''}`;
      const warmResponse = await fetch(warmUrl);
      console.log(`Warm fetch status: ${warmResponse.status} for service ${firstService.id}`);
    } catch (e) {
      // Ignore errors, just warming
      console.log('Warm fetch error (ignored):', e.message);
    }
    
    const endTime = Date.now();
    
    return NextResponse.json({
      status: 'warm',
      timeMs: endTime - startTime,
      timestamp: new Date().toISOString(),
      warmedServices: warmServices.map(s => ({
        id: s.id,
        name: s.name
      })),
      preloaded: results.map((r, idx) => ({
        apiId: r.apiId || warmServices[idx].id,
        cached: !r.error,
        error: r.error
      })),
      spreadJsInitialized: true
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}