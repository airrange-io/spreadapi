import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('id') || 'test1234_mdctzfumgsds0';
  
  const debugInfo = {
    serviceId,
    timestamp: new Date().toISOString(),
    data: {}
  };
  
  try {
    // 1. Check draft service data
    debugInfo.data.draftService = await redis.hGetAll(`service:${serviceId}`);
    
    // 2. Check published service data
    debugInfo.data.publishedService = await redis.hGetAll(`service:${serviceId}:published`);
    
    // 3. Check API cache
    try {
      debugInfo.data.apiCache = await redis.json.get(`cache:api:${serviceId}`);
    } catch (e) {
      debugInfo.data.apiCache = { error: e.message };
    }
    
    // 4. If published, fetch and parse the blob data
    if (debugInfo.data.publishedService?.urlData) {
      const blobUrl = `${process.env.NEXT_PUBLIC_VERCEL_BLOB_URL || 'https://7p0wqn8xxzvf61la.public.blob.vercel-storage.com'}${debugInfo.data.publishedService.urlData}`;
      debugInfo.data.blobUrl = blobUrl;
      
      try {
        const response = await fetch(blobUrl);
        if (response.ok) {
          debugInfo.data.blobData = await response.json();
        } else {
          debugInfo.data.blobError = `${response.status} ${response.statusText}`;
        }
      } catch (e) {
        debugInfo.data.blobError = e.message;
      }
    }
    
    // Summary
    debugInfo.summary = {
      draftServiceName: debugInfo.data.draftService?.name || 'NOT SET',
      publishedServiceTitle: debugInfo.data.publishedService?.title || 'NOT SET',
      apiCacheName: debugInfo.data.apiCache?.apiJson?.name || 'NOT SET',
      blobDataName: debugInfo.data.blobData?.apiJson?.name || 'NOT SET'
    };
    
    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      serviceId
    }, { status: 500 });
  }
}