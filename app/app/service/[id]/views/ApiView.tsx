'use client';

import React, { lazy, Suspense, useRef, useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton, Space, Alert } from 'antd';
import { useContainerWidth } from '@/hooks/useContainerWidth';
import ApiNavigationMenu, { type ApiMenuSection } from '../components/ApiNavigationMenu';

// Dynamically import components
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

const WebhookManagement = dynamic(() => import('../WebhookManagement'), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false
});

// Documentation components (lazy loaded per menu selection)
const SwaggerUIWrapper = dynamic(() => import('../components/documentation/SwaggerUIWrapper'), {
  loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
  ssr: false
});

const QuickStartGuide = dynamic(() => import('../components/documentation/QuickStartGuide'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
  ssr: false
});

const ErrorCodesReference = dynamic(() => import('../components/documentation/ErrorCodesReference'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
  ssr: false
});

// Integration components (lazy loaded per menu selection)
const CodeExample = dynamic(() => import('../components/integration/CodeExample'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false
});

const StandaloneUIExample = dynamic(() => import('../components/integration/StandaloneUIExample'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false
});

interface ApiViewProps {
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

const ApiView: React.FC<ApiViewProps> = ({
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
  const [selectedKey, setSelectedKey] = useState<ApiMenuSection>('test');
  const tokenManagementRef = useRef<{ refreshTokens: () => Promise<void> }>(null);

  // Use robust container width measurement
  const { width: containerWidth } = useContainerWidth(containerRef, {
    fallbackWidth: 800,
    debounceMs: 100,
    maxRetries: 10
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

  // Render content based on selected menu item
  const renderContent = () => {
    // Alert banner for unpublished services (shown for test and docs sections)
    const showUnpublishedAlert = !serviceStatus?.published && (
      selectedKey === 'test' ||
      selectedKey.startsWith('docs-')
    );

    const alertBanner = showUnpublishedAlert && (
      <Alert
        message="Service must be published to test"
        type="warning"
        style={{ marginBottom: 16, borderRadius: 8 }}
        showIcon
      />
    );

    // Prepare common props for integration examples
    const exampleProps = {
      serviceId,
      serviceName: apiConfig.name,
      requireToken: apiConfig.requireToken,
      parameterValues: {}, // Could be populated with example values
      inputs: apiConfig.inputs || [],
      outputs: apiConfig.outputs || []
    };

    // Content mapping
    const contentMap: Record<ApiMenuSection, React.ReactNode> = {
      'test': (
        <>
          {alertBanner}
          <ApiEndpointPreview
            serviceId={serviceId}
            isPublished={serviceStatus?.published || false}
            requireToken={apiConfig.requireToken || false}
          />
          <div style={{ marginTop: 16 }}>
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
          </div>
        </>
      ),
      'tokens': (
        <TokenManagement
          ref={tokenManagementRef}
          serviceId={serviceId}
          requireToken={apiConfig.requireToken || false}
          isDemoMode={isDemoMode}
          onRequireTokenChange={onRequireTokenChange}
          onTokenCountChange={onTokenCountChange}
          onTokensChange={onTokensChange}
        />
      ),
      'webhooks': (
        <WebhookManagement
          serviceId={serviceId}
          webhookEnabled={apiConfig.webhookEnabled || false}
          webhookUrl={apiConfig.webhookUrl || ''}
          webhookSecret={apiConfig.webhookSecret || ''}
          isDemoMode={isDemoMode}
          onConfigChange={onConfigChange}
        />
      ),
      'docs-interactive': (
        <>
          {alertBanner}
          <SwaggerUIWrapper
            serviceId={serviceId}
            isPublished={serviceStatus?.published || false}
          />
        </>
      ),
      'docs-quickstart': (
        <QuickStartGuide
          serviceId={serviceId}
          isPublished={serviceStatus?.published}
        />
      ),
      'docs-errors': <ErrorCodesReference />,
      'example-curl': <CodeExample language="curl" {...exampleProps} />,
      'example-javascript': <CodeExample language="javascript" {...exampleProps} />,
      'example-python': <CodeExample language="python" {...exampleProps} />,
      'example-nodejs': <CodeExample language="nodejs" {...exampleProps} />,
      'example-php': <CodeExample language="php" {...exampleProps} />,
      'example-excel': <CodeExample language="excel" {...exampleProps} />,
      'example-googlesheets': <CodeExample language="googlesheets" {...exampleProps} />,
      'example-postman': <CodeExample language="postman" {...exampleProps} />,
      'example-standalone': <StandaloneUIExample {...exampleProps} />
    };

    return contentMap[selectedKey] || contentMap['test'];
  };

  // Show skeleton until config is loaded to prevent status flicker
  if (!configLoaded) {
    return (
      <div ref={containerRef} style={{ padding: '16px' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        display: 'flex',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {/* Left Menu Navigation */}
      <ApiNavigationMenu
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />

      {/* Right Content Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
        background: '#fff'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ApiView;
