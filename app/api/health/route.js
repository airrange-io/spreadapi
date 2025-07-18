export const runtime = 'edge'; // Use Edge Runtime for ultra-fast health checks

export async function GET() {
  return new Response(
    JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      runtime: 'edge'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}