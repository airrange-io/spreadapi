import { notFound } from 'next/navigation';
import redis from '@/lib/redis';
import WebViewRenderer from './WebViewRenderer';
import { SYSTEM_TEMPLATES } from '@/lib/systemTemplates';

interface PageProps {
  params: Promise<{
    id: string;
    viewId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WebViewPage({ params, searchParams }: PageProps) {
  const { id: serviceId, viewId } = await params;
  const queryParams = await searchParams;

  if (!serviceId || !viewId) {
    notFound();
  }

  // Check if this is interactive mode
  const isInteractive = queryParams.interactive === 'true';
  const token = queryParams.token as string;

  // Validate interactive mode requires token
  if (isInteractive) {
    // Get service data to validate token
    const serviceData = await redis.hGetAll(`service:${serviceId}`) as unknown as Record<string, string>;

    if (!serviceData || Object.keys(serviceData).length === 0) {
      notFound();
    }

    // Check if token is valid
    if (!serviceData.webAppToken || serviceData.webAppToken !== token) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '30px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '8px'
          }}>
            <h2 style={{ color: '#cf1322', marginTop: 0 }}>Invalid Token</h2>
            <p style={{ color: '#595959' }}>
              The token provided is invalid or this web app has been disabled.
              Please check your URL or contact the service owner.
            </p>
          </div>
        </div>
      );
    }
  }

  // Check if template exists (system templates only for now)
  if (!SYSTEM_TEMPLATES[viewId]) {
    notFound();
  }

  return (
    <WebViewRenderer
      serviceId={serviceId}
      viewId={viewId}
      queryParams={queryParams}
      isInteractive={isInteractive}
      token={token}
    />
  );
}

// Enable static optimization (but revalidate for token changes)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
