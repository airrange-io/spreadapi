import { NextResponse } from 'next/server';

export async function GET(request) {
  const timings = {
    start: Date.now(),
    steps: []
  };
  
  const logStep = (name) => {
    const now = Date.now();
    const elapsed = timings.steps.length > 0 
      ? now - timings.steps[timings.steps.length - 1].timestamp 
      : now - timings.start;
    timings.steps.push({
      name,
      timestamp: now,
      elapsed,
      total: now - timings.start
    });
  };

  try {
    logStep('Request received');
    
    // Test 1: NextJS overhead
    const { searchParams } = new URL(request.url);
    logStep('URL parsed');
    
    // Test 2: Module loading
    const { getApiDefinition } = await import('../../../utils/helperApi');
    logStep('Module imported');
    
    // Test 3: Simple computation
    let sum = 0;
    for (let i = 0; i < 100000; i++) {
      sum += i;
    }
    logStep('Computation done');
    
    // Test 4: Object creation
    const result = {
      timestamp: new Date().toISOString(),
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        isVercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || 'unknown'
      }
    };
    logStep('Object created');
    
    // Test 5: Response creation
    const response = NextResponse.json({
      ...result,
      sum,
      timings: {
        totalMs: Date.now() - timings.start,
        steps: timings.steps
      }
    });
    logStep('Response created');
    
    // Add timing headers
    response.headers.set('X-Total-Time', Date.now() - timings.start);
    response.headers.set('X-Server-Region', process.env.VERCEL_REGION || 'unknown');
    
    return response;
    
  } catch (error) {
    logStep('Error occurred');
    return NextResponse.json({ 
      error: error.message,
      timings: {
        totalMs: Date.now() - timings.start,
        steps: timings.steps
      }
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}