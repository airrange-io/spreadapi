import { Suspense } from 'react';
import { Spin } from 'antd';
import AnalyticsPageClient from './AnalyticsPageClient';

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" />
      </div>
    }>
      <AnalyticsPageClient serviceId={id} />
    </Suspense>
  );
}