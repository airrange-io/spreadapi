import React, { Suspense } from 'react';
import { App, Spin } from 'antd';
import ApiTesterClient from './ApiTesterClient';

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <Spin size="large" />
    </div>
  );
}

export default function ApiTesterPage() {
  return (
    <App>
      <Suspense fallback={<LoadingFallback />}>
        <ApiTesterClient />
      </Suspense>
    </App>
  );
}