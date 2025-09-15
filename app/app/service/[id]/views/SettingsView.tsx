'use client';

import React, { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
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
  isLoading?: boolean;

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
  isLoading = false,
  onConfigChange,
  onTokensChange,
  onTokenCountChange
}) => {
  const [mounted, setMounted] = useState(false);
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  // Local state for immediate UI updates
  const [localConfig, setLocalConfig] = useState<Partial<ApiConfig>>({
    name: apiConfig.name,
    description: apiConfig.description,
    aiDescription: apiConfig.aiDescription
  });
  
  // Update local state when props change
  useEffect(() => {
    setLocalConfig({
      name: apiConfig.name,
      description: apiConfig.description,
      aiDescription: apiConfig.aiDescription
    });
  }, [apiConfig.name, apiConfig.description, apiConfig.aiDescription]);
  
  // Add fade-in effect
  useEffect(() => {
    setMounted(true);
    
    // Cleanup debounce timers on unmount
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  // Create debounced version of config change handler
  const debouncedConfigChange = useCallback((field: string, value: any, delay: number = 500) => {
    // Update local state immediately for responsive UI
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    
    // Clear existing timer for this field
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }
    
    // Set new timer for parent callback
    debounceTimers.current[field] = setTimeout(() => {
      onConfigChange({ [field]: value });
      delete debounceTimers.current[field];
    }, delay);
  }, [onConfigChange]); // setLocalConfig is a state setter, so it's stable and doesn't need to be in deps
  
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
          apiName={localConfig.name || apiConfig.name}
          apiDescription={localConfig.description || apiConfig.description}
          enableCaching={apiConfig.enableCaching || false}
          cacheTableSheetData={apiConfig.cacheTableSheetData || false}
          tableSheetCacheTTL={apiConfig.tableSheetCacheTTL || 300}
          aiDescription={localConfig.aiDescription || apiConfig.aiDescription || ''}
          aiUsageExamples={apiConfig.aiUsageExamples || []}
          aiTags={apiConfig.aiTags || []}
          category={apiConfig.category || ''}
          isLoading={isLoading}
          onApiNameChange={(name) => debouncedConfigChange('name', name, 500)}
          onApiDescriptionChange={(description) => debouncedConfigChange('description', description, 500)}
          onEnableCachingChange={(enableCaching) => onConfigChange({ enableCaching })} // Instant for checkboxes
          onCacheTableSheetDataChange={(cacheTableSheetData) => onConfigChange({ cacheTableSheetData })} // Instant for checkboxes
          onTableSheetCacheTTLChange={(tableSheetCacheTTL) => onConfigChange({ tableSheetCacheTTL })} // Instant for select
          onAiDescriptionChange={(aiDescription) => debouncedConfigChange('aiDescription', aiDescription, 500)}
          onAiUsageExamplesChange={(aiUsageExamples) => onConfigChange({ aiUsageExamples })} // Keep instant for tags
          onAiTagsChange={(aiTags) => onConfigChange({ aiTags })} // Keep instant for tags
          onCategoryChange={(category) => onConfigChange({ category })} // Instant for select
        />
      </Suspense>
    </div>
  );
};

export default SettingsView;