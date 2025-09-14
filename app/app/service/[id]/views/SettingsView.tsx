'use client';

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Skeleton } from 'antd';

// Lazy load the section components
const SettingsSection = lazy(() => import('../components/SettingsSection'));

interface ApiConfig {
  name: string;
  description: string;
  enableCaching?: boolean;
  requireToken?: boolean;
  cacheTableSheetData?: boolean;
  tableSheetCacheTTL?: number;
  aiDescription?: string;
  aiUsageExamples?: string[];
  aiTags?: string[];
  category?: string;
  inputs?: any[];
  outputs?: any[];
}

interface SettingsViewProps {
  // Settings props
  apiConfig: ApiConfig;

  // Token props
  serviceId: string;
  serviceStatus?: {
    published?: boolean;
  };
  availableTokens?: any[];
  isDemoMode?: boolean;

  // Event handlers
  onConfigChange: (updates: Partial<ApiConfig>) => void;
  onTokensChange?: (tokens: any[]) => void;
  onTokenCountChange?: (count: number) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  apiConfig,
  serviceId,
  serviceStatus,
  availableTokens = [],
  isDemoMode = false,
  onConfigChange,
  onTokensChange,
  onTokenCountChange
}) => {
  const [mounted, setMounted] = useState(false);
  
  // Add fade-in effect
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: '16px',
      paddingTop: '6px',
      paddingLeft: '5px',
      backgroundColor: '#ffffff',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      <Suspense fallback={<Skeleton active paragraph={{ rows: 10 }} />}>
        <SettingsSection
          apiName={apiConfig.name}
          apiDescription={apiConfig.description}
          enableCaching={apiConfig.enableCaching || false}
          cacheTableSheetData={apiConfig.cacheTableSheetData || false}
          tableSheetCacheTTL={apiConfig.tableSheetCacheTTL || 300}
          aiDescription={apiConfig.aiDescription || ''}
          aiUsageExamples={apiConfig.aiUsageExamples || []}
          aiTags={apiConfig.aiTags || []}
          category={apiConfig.category || ''}
          onApiNameChange={(name) => onConfigChange({ name })}
          onApiDescriptionChange={(description) => onConfigChange({ description })}
          onEnableCachingChange={(enableCaching) => onConfigChange({ enableCaching })}
          onCacheTableSheetDataChange={(cacheTableSheetData) => onConfigChange({ cacheTableSheetData })}
          onTableSheetCacheTTLChange={(tableSheetCacheTTL) => onConfigChange({ tableSheetCacheTTL })}
          onAiDescriptionChange={(aiDescription) => onConfigChange({ aiDescription })}
          onAiUsageExamplesChange={(aiUsageExamples) => onConfigChange({ aiUsageExamples })}
          onAiTagsChange={(aiTags) => onConfigChange({ aiTags })}
          onCategoryChange={(category) => onConfigChange({ category })}
        />
      </Suspense>
    </div>
  );
};

export default SettingsView;