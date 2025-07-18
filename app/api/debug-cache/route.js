import { NextResponse } from 'next/server';
import { getApiDefinition } from '../../../utils/helperApi';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiId = searchParams.get('api') || 'ab3202cb-d0af-41af-88ce-7e51f5f6b6d3';
  const token = searchParams.get('token') || 'hiqelc-b-o';
  
  console.log('Making first API call...');
  const start1 = Date.now();
  const result1 = await getApiDefinition(apiId, token);
  const time1 = Date.now() - start1;
  
  console.log('Making second API call (should be cached)...');
  const start2 = Date.now();
  const result2 = await getApiDefinition(apiId, token);
  const time2 = Date.now() - start2;
  
  return NextResponse.json({
    firstCallTime: time1,
    secondCallTime: time2,
    shouldBeCached: time2 < 10,
    hasError: result1?.error || result2?.error
  });
}