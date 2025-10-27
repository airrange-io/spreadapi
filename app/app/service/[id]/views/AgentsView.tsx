'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Skeleton, Spin } from 'antd';
import dynamic from 'next/dynamic';
import AgentsNavigationMenu, { AgentsMenuSection } from '../components/AgentsNavigationMenu';
import AIAssistantSection from '../components/AIAssistantSection';

const { Sider, Content } = Layout;

// Lazy load chat component with AI libraries only when needed
const ServiceChatSection = dynamic(() => import('../components/ServiceChatSection'), {
  loading: () => (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    }}>
      <Spin size="default" />
      <div style={{ color: '#999', fontSize: '14px' }}>Loading chat...</div>
    </div>
  ),
  ssr: false
});

const ServiceMCPSettings = dynamic(() => import('@/components/ServiceMCPSettings'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
  ssr: false
});

interface AgentsViewProps {
  serviceId: string;
  apiConfig?: any;
  serviceStatus?: {
    published?: boolean;
  };
  isDemoMode?: boolean;
  configLoaded?: boolean;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  onConfigChange?: (updates: any) => void;
}

const AgentsView: React.FC<AgentsViewProps> = ({
  serviceId,
  apiConfig,
  serviceStatus,
  isDemoMode = false,
  configLoaded = false,
  isLoading = false,
  hasUnsavedChanges = false,
  onConfigChange
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedSection, setSelectedSection] = useState<AgentsMenuSection>('ai-info');
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track window width for sider collapse
  useEffect(() => {
    const handleResize = () => {
      setSiderCollapsed(window.innerWidth < 1024);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (selectedSection) {
      case 'ai-info':
        return (
          <AIAssistantSection
            serviceId={serviceId}
            aiDescription={apiConfig?.aiDescription || ''}
            aiUsageGuidance={apiConfig?.aiUsageGuidance || ''}
            aiUsageExamples={apiConfig?.aiUsageExamples || []}
            aiTags={apiConfig?.aiTags || []}
            category={apiConfig?.category || ''}
            isLoading={isLoading}
            onAiDescriptionChange={(value) => onConfigChange?.({ aiDescription: value })}
            onAiUsageGuidanceChange={(value) => onConfigChange?.({ aiUsageGuidance: value })}
            onAiUsageExamplesChange={(values) => onConfigChange?.({ aiUsageExamples: values })}
            onAiTagsChange={(values) => onConfigChange?.({ aiTags: values })}
            onCategoryChange={(value) => onConfigChange?.({ category: value })}
          />
        );

      case 'chat-test':
        return (
          <ServiceChatSection
            serviceId={serviceId}
            serviceName={apiConfig?.name || 'Service'}
            isLoading={isLoading}
            apiConfig={apiConfig}
          />
        );

      case 'mcp':
        return (
          <div style={{ padding: '16px' }}>
            <ServiceMCPSettings
              serviceId={serviceId}
              serviceName={apiConfig?.name || 'Service'}
              needsToken={apiConfig?.requireToken || false}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{
      height: '100%',
      backgroundColor: '#ffffff',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      <Sider
        width={200}
        collapsedWidth={80}
        collapsed={siderCollapsed}
        style={{ backgroundColor: '#ffffff' }}
      >
        <AgentsNavigationMenu
          selectedKey={selectedSection}
          onSelect={setSelectedSection}
        />
      </Sider>
      <Content style={{
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#ffffff'
      }}>
        {renderContent()}
      </Content>
    </Layout>
  );
};

export default AgentsView;
