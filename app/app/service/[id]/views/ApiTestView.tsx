'use client';

import React, { lazy, Suspense, useRef, useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton, Space, Alert } from 'antd';
import { useContainerWidth } from '@/hooks/useContainerWidth';

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

const IntegrationExamples = dynamic(() => import('../components/IntegrationExamples'), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false
});

const CollapsibleSection = dynamic(() => import('../components/CollapsibleSection'), {
  loading: () => <Skeleton active paragraph={{ rows: 2 }} />,
  ssr: false
});

const WebhookManagement = dynamic(() => import('../WebhookManagement'), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false
});

const ApiDocumentation = dynamic(() => import('../components/ApiDocumentation'), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false
});

interface ApiTestViewProps {
  serviceId: string;
  apiConfig: {
    name?: string;
    inputs: any[];
    outputs: any[];
    requireToken?: boolean;
    webAppEnabled?: boolean;
    webAppToken?: string;
    webAppConfig?: string;
    webhookEnabled?: boolean;
    webhookUrl?: string;
    webhookSecret?: string;
  };
  serviceStatus?: {
    published?: boolean;
  };
  availableTokens?: any[];
  isDemoMode?: boolean;
  configLoaded?: boolean;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  onRequireTokenChange?: (value: boolean) => void;
  onTokenCountChange?: (count: number) => void;
  onTokensChange?: (tokens: any[]) => void;
  onConfigChange?: (updates: any) => void;
}

const ApiTestView: React.FC<ApiTestViewProps> = ({
  serviceId,
  apiConfig,
  serviceStatus,
  availableTokens = [],
  isDemoMode = false,
  configLoaded = false,
  isLoading = false,
  hasUnsavedChanges = false,
  onRequireTokenChange,
  onTokenCountChange,
  onTokensChange,
  onConfigChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const tokenManagementRef = useRef<{ refreshTokens: () => Promise<void> }>(null);

  // Use robust container width measurement
  const { width: containerWidth } = useContainerWidth(containerRef, {
    fallbackWidth: 800, // Reasonable default for 2-column layout
    debounceMs: 100,
    maxRetries: 10 // Try harder to get the width
  });

  // Track fade-in effect separately
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

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
        {/* <div style={{ marginTop: 16 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div> */}
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
          serviceName={apiConfig.name}
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

        {/* Webhook Management */}
        <WebhookManagement
          serviceId={serviceId}
          webhookEnabled={apiConfig.webhookEnabled || false}
          webhookUrl={apiConfig.webhookUrl || ''}
          webhookSecret={apiConfig.webhookSecret || ''}
          isDemoMode={isDemoMode}
          onConfigChange={onConfigChange}
        />

        {/* API Documentation Section */}
        <CollapsibleSection
          title="API Documentation"
          defaultOpen={false}
          style={{ marginTop: 0 }}
        >
          <ApiDocumentation
            serviceId={serviceId}
            isPublished={serviceStatus?.published || false}
          />
        </CollapsibleSection>

        {/* Integration Examples Section */}
        <CollapsibleSection
          title="Integration Examples"
          defaultOpen={false}
          style={{ marginTop: 0 }}
        >
          <IntegrationExamples
            serviceId={serviceId}
            serviceName={apiConfig.name || ''}
            requireToken={apiConfig.requireToken || false}
            parameterValues={{}}
            inputs={apiConfig.inputs || []}
            outputs={apiConfig.outputs || []}
          />
        </CollapsibleSection>
      </Space>
    </div>
  );
};

export default ApiTestView;