'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Space, Input, Checkbox, Tooltip, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';

// Debounced Input component to prevent parent re-renders on every keystroke
interface DebouncedInputProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  delay?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({
  defaultValue = '',
  onChange,
  placeholder,
  disabled,
  delay = 500
}) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Update local state when defaultValue changes from parent
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer to call parent onChange after delay
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

// Debounced TextArea component to prevent parent re-renders on every keystroke
interface DebouncedTextAreaProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  delay?: number;
}

const DebouncedTextArea: React.FC<DebouncedTextAreaProps> = ({
  defaultValue = '',
  onChange,
  placeholder,
  rows,
  disabled,
  delay = 500
}) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Update local state when defaultValue changes from parent
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer to call parent onChange after delay
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Input.TextArea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  );
};

interface SettingsSectionProps {
  apiName: string;
  apiDescription: string;
  enableCaching: boolean;
  cacheTableSheetData: boolean;
  tableSheetCacheTTL: number;
  hasTableSheets: boolean;
  workbookLoaded: boolean;
  isLoading?: boolean;
  onApiNameChange: (value: string) => void;
  onApiDescriptionChange: (value: string) => void;
  onEnableCachingChange: (checked: boolean) => void;
  onCacheTableSheetDataChange: (checked: boolean) => void;
  onTableSheetCacheTTLChange: (value: number) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  apiName,
  apiDescription,
  enableCaching,
  cacheTableSheetData,
  tableSheetCacheTTL,
  hasTableSheets,
  workbookLoaded,
  isLoading = false,
  onApiNameChange,
  onApiDescriptionChange,
  onEnableCachingChange,
  onCacheTableSheetDataChange,
  onTableSheetCacheTTLChange,
}) => {
  // Determine if cache options should be disabled and why
  const cacheOptionsDisabled = !workbookLoaded || !hasTableSheets;

  // Generate tooltip text based on state
  const getCacheTooltip = (optionName: string) => {
    if (!workbookLoaded) {
      return `Load the workbook first to determine if this service uses external data sources. ${optionName} settings are only available for services with TableSheet data connections.`;
    }
    if (!hasTableSheets) {
      return `This option is only available for services with TableSheet data connections. Caching is always enabled for services without external data sources.`;
    }
    // Workbook loaded and has TableSheets - show regular help text
    if (optionName === 'Response caching') {
      return "Cache API responses for improved performance. Disable if your TableSheet data changes frequently and you need real-time results.";
    }
    return "Cache external TableSheet data sources for better performance. Disable for real-time data that changes frequently.";
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginTop: '8px',
    }}>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <CollapsibleSection title="Service Info" defaultOpen={true}>
          <Space orientation="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Service Name</strong></div>
            <DebouncedInput
              placeholder="Enter service name"
              defaultValue={apiName}
              onChange={onApiNameChange}
              disabled={isLoading}
              delay={500}
            />
          </div>

          <div>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Description</strong></div>
            <DebouncedTextArea
              placeholder="Describe what this API does"
              defaultValue={apiDescription}
              onChange={onApiDescriptionChange}
              rows={2}
              disabled={isLoading}
              delay={500}
            />
          </div>

          <div style={{ marginTop: '0px' }}>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>External Data Caching</strong></div>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Space align="center">
                <Checkbox
                  checked={enableCaching}
                  onChange={(e) => onEnableCachingChange(e.target.checked)}
                  disabled={isLoading || cacheOptionsDisabled}
                >
                  Enable response caching
                </Checkbox>
                <Tooltip title={getCacheTooltip('Response caching')}>
                  <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </Space>

              <Space align="center">
                <Checkbox
                  checked={cacheTableSheetData}
                  onChange={(e) => onCacheTableSheetDataChange(e.target.checked)}
                  disabled={isLoading || cacheOptionsDisabled}
                >
                  Cache TableSheet data
                </Checkbox>
                <Tooltip title={getCacheTooltip('TableSheet caching')}>
                  <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </Space>

              {cacheTableSheetData && workbookLoaded && hasTableSheets && (
                <Space align="center" style={{ marginLeft: '24px' }}>
                  <span style={{ color: '#666' }}>Cache duration:</span>
                  <Select
                    value={tableSheetCacheTTL}
                    onChange={onTableSheetCacheTTLChange}
                    style={{ width: '120px' }}
                    disabled={isLoading}
                  >
                    <Select.Option value={60}>1 minute</Select.Option>
                    <Select.Option value={300}>5 minutes</Select.Option>
                    <Select.Option value={900}>15 minutes</Select.Option>
                    <Select.Option value={1800}>30 minutes</Select.Option>
                    <Select.Option value={3600}>1 hour</Select.Option>
                  </Select>
                </Space>
              )}
            </Space>
          </div>
        </Space>
      </CollapsibleSection>

      </Space>
    </div>
  );
};

export default SettingsSection;