'use client';

import React, { lazy, Suspense, useRef, useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton, Space, Alert } from 'antd';

// Dynamically import components to avoid any SSR issues
const ServiceTester = dynamic(() => import('../ServiceTester'), {
  loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
  ssr: false
});

const ApiEndpointPreview = dynamic(() => import('../ApiEndpointPreview'), {
  loading: () => <Skeleton active paragraph={{ rows: 2 }} />,
  ssr: false
});

const TokenManagement = dynamic(() => import('../TokenManagement'), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false
});

interface ApiTestViewProps {
  serviceId: string;
  apiConfig: {
    inputs: any[];
    outputs: any[];
    requireToken?: boolean;
  };
  serviceStatus?: {
    published?: boolean;
  };
  availableTokens?: any[];
  isDemoMode?: boolean;
  configLoaded?: boolean;
  onRequireTokenChange?: (value: boolean) => void;
  onTokenCountChange?: (count: number) => void;
  onTokensChange?: (tokens: any[]) => void;
}

const ApiTestView: React.FC<ApiTestViewProps> = ({
  serviceId,
  apiConfig,
  serviceStatus,
  availableTokens = [],
  isDemoMode = false,
  configLoaded = false,
  onRequireTokenChange,
  onTokenCountChange,
  onTokensChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const tokenManagementRef = useRef<{ refreshTokens: () => Promise<void> }>(null);

  // Track container width and trigger fade-in
  useLayoutEffect(() => {
    // Trigger fade-in effect
    setMounted(true);
    
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    updateWidth();
    // Measure again after a short delay to ensure layout is complete
    const timeout = setTimeout(updateWidth, 100);
    
    window.addEventListener('resize', updateWidth);
    
    // Also use ResizeObserver for more accurate tracking
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateWidth);
      resizeObserver.disconnect();
    };
  }, [configLoaded]); // Re-run when configLoaded changes

  const handleTestComplete = async () => {
    // Refresh token stats after successful test
    if (tokenManagementRef.current) {
      await tokenManagementRef.current.refreshTokens();
    }
  };


  // Show skeleton until config is loaded to prevent status flicker
  if (!configLoaded) {
    return (
      <div ref={containerRef} style={{ padding: '16px' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <div style={{ marginTop: 16 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '16px',
        paddingTop: '14px',
        paddingLeft: '5px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {!serviceStatus?.published && (
          <Alert
            message="Service must be published to test"
            type="warning"
            style={{ borderRadius: 8 }}
            // banner
            showIcon
          />
        )}
        
        {/* API Endpoint Preview */}
        <ApiEndpointPreview
          serviceId={serviceId}
          isPublished={serviceStatus?.published || false}
          requireToken={apiConfig.requireToken || false}
        />
        
        {/* Service Tester */}
        <ServiceTester
          serviceId={serviceId}
          isPublished={serviceStatus?.published || false}
          inputs={apiConfig.inputs || []}
          outputs={apiConfig.outputs || []}
          requireToken={apiConfig.requireToken}
          existingToken={availableTokens.length > 0 ? availableTokens[0].id : undefined}
          containerWidth={containerWidth}
          onTestComplete={handleTestComplete}
        />
        
        {/* Token Management */}
        <TokenManagement
          ref={tokenManagementRef}
          serviceId={serviceId}
          requireToken={apiConfig.requireToken || false}
          isDemoMode={isDemoMode}
          onRequireTokenChange={onRequireTokenChange}
          onTokenCountChange={onTokenCountChange}
          onTokensChange={onTokensChange}
        />
      </Space>
    </div>
  );
};

export default ApiTestView;