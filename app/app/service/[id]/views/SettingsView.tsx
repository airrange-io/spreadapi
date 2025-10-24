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
  aiUsageGuidance?: string;
  aiUsageExamples?: string[];
  aiTags?: string[];
  category?: string;
  webAppEnabled?: boolean;
  webAppToken?: string;
  inputs?: any[];
  outputs?: any[];
}

interface SettingsViewProps {
  // Settings props
  apiConfig: ApiConfig;
  spreadsheetData?: any;
  workbookLoaded?: boolean;

  // Token props
  serviceId: string;
  serviceStatus?: {
    published?: boolean;
  };
  availableTokens?: any[];
  isDemoMode?: boolean;
  isLoading?: boolean;

  // Event handlers
  onConfigChange: (updates: Partial<ApiConfig>) => void;
  onTokensChange?: (tokens: any[]) => void;
  onTokenCountChange?: (count: number) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  apiConfig,
  spreadsheetData,
  workbookLoaded = false,
  serviceId,
  serviceStatus,
  availableTokens = [],
  isDemoMode = false,
  isLoading = false,
  onConfigChange,
  onTokensChange,
  onTokenCountChange
}) => {
  const [mounted, setMounted] = useState(false);

  // Note: All text inputs now use DebouncedInput/DebouncedTextArea which manage
  // their own state internally, preventing parent re-renders on every keystroke

  // Detect if workbook has TableSheets (external data connections)
  const hasTableSheets = React.useMemo(() => {
    const fileJson = spreadsheetData?.fileJson || spreadsheetData;
    if (!fileJson || !fileJson.sheets) return false;

    // Check if any sheet has TableSheet data connections
    for (const sheet of Object.values(fileJson.sheets) as any[]) {
      if (sheet && sheet.dataManager && sheet.dataManager.tables) {
        const tables = sheet.dataManager.tables;
        if (typeof tables === 'object' && Object.keys(tables).length > 0) {
          return true;
        }
      }
    }

    return false;
  }, [spreadsheetData]);

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
          hasTableSheets={hasTableSheets}
          workbookLoaded={workbookLoaded}
          aiDescription={apiConfig.aiDescription || ''}
          aiUsageGuidance={apiConfig.aiUsageGuidance || ''}
          aiUsageExamples={apiConfig.aiUsageExamples || []}
          aiTags={apiConfig.aiTags || []}
          category={apiConfig.category || ''}
          isLoading={isLoading}
          onApiNameChange={(name) => onConfigChange({ name })}
          onApiDescriptionChange={(description) => onConfigChange({ description })}
          onEnableCachingChange={(enableCaching) => onConfigChange({ enableCaching })}
          onCacheTableSheetDataChange={(cacheTableSheetData) => onConfigChange({ cacheTableSheetData })}
          onTableSheetCacheTTLChange={(tableSheetCacheTTL) => onConfigChange({ tableSheetCacheTTL })}
          onAiDescriptionChange={(aiDescription) => onConfigChange({ aiDescription })}
          onAiUsageGuidanceChange={(aiUsageGuidance) => onConfigChange({ aiUsageGuidance })}
          onAiUsageExamplesChange={(aiUsageExamples) => onConfigChange({ aiUsageExamples })} // Keep instant for tags
          onAiTagsChange={(aiTags) => onConfigChange({ aiTags })} // Keep instant for tags
          onCategoryChange={(category) => onConfigChange({ category })} // Instant for select
        />
      </Suspense>
    </div>
  );
};

export default SettingsView;