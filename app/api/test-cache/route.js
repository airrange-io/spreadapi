import { NextResponse } from 'next/server';
import { getApiDefinition } from '../../../utils/helperApi';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiId = searchParams.get('api') || 'test1234_mdejqoua8ptor'; // Warming service
    const iterations = parseInt(searchParams.get('iterations') || '5');
    
    const results = [];
    
    // Test sequential calls to same API
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const definition = await getApiDefinition(apiId, null);
      const end = Date.now();
      
      results.push({
        iteration: i + 1,
        success: !definition.error,
        timeMs: end - start,
        hasApiJson: !!definition?.apiJson,
        hasFileJson: !!definition?.fileJson
      });
    }
    
    // Calculate stats
    const avgTime = results.reduce((sum, r) => sum + r.timeMs, 0) / results.length;
    const firstTime = results[0].timeMs;
    const cachedTimes = results.slice(1).map(r => r.timeMs);
    const avgCachedTime = cachedTimes.length > 0 
      ? cachedTimes.reduce((sum, t) => sum + t, 0) / cachedTimes.length 
      : 0;
    
    const response = {
      testInfo: {
        apiId,
        iterations,
        timestamp: new Date().toISOString()
      },
      results,
      summary: {
        avgTimeMs: Math.round(avgTime),
        firstCallMs: firstTime,
        avgCachedCallMs: Math.round(avgCachedTime),
        speedup: firstTime > 0 ? Math.round(firstTime / avgCachedTime) + 'x' : 'N/A',
        allSuccessful: results.every(r => r.success)
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in test-cache:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}