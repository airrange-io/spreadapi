'use client';

import React, { lazy, Suspense } from 'react';
import { Skeleton } from 'antd';

// Lazy load the section components
const SettingsSection = lazy(() => import('../components/SettingsSection'));

interface SettingsViewProps {
  // Settings props
  apiConfig: {
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
  };

  // Token props
  serviceId: string;
  serviceStatus?: {
    published?: boolean;
  };
  availableTokens?: any[];
  isDemoMode?: boolean;

  // Event handlers
  onConfigChange: (updates: Partial<typeof apiConfig>) => void;
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
  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: '16px',
      paddingTop: '6px',
      paddingLeft: '5px',
      backgroundColor: '#ffffff'
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