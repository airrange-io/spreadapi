'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Input, Switch, Select, Tooltip, Divider } from 'antd';
import { AppstoreOutlined, SafetyOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

// Debounced Input component
const DebouncedInput: React.FC<{
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ defaultValue = '', onChange, placeholder, disabled }) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { setValue(defaultValue); }, [defaultValue]);
  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  return (
    <Input
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChange(e.target.value), 500);
      }}
      placeholder={placeholder}
      disabled={disabled}
      style={{ borderRadius: 8 }}
    />
  );
};

// Debounced TextArea component
const DebouncedTextArea: React.FC<{
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}> = ({ defaultValue = '', onChange, placeholder, rows, disabled }) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { setValue(defaultValue); }, [defaultValue]);
  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  return (
    <Input.TextArea
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChange(e.target.value), 500);
      }}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{ borderRadius: 8 }}
    />
  );
};

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
  webAppCustomCss?: string;
  inputs?: any[];
  outputs?: any[];
}

interface SettingsViewProps {
  apiConfig: ApiConfig;
  spreadsheetData?: any;
  workbookLoaded?: boolean;
  serviceId: string;
  serviceStatus?: { published?: boolean };
  availableTokens?: any[];
  isDemoMode?: boolean;
  isLoading?: boolean;
  onConfigChange: (updates: Partial<ApiConfig>) => void;
  onTokensChange?: (tokens: any[]) => void;
  onTokenCountChange?: (count: number) => void;
}

const SECTIONS = [
  { key: 'general', icon: <AppstoreOutlined />, translationKey: 'settings.general' },
  { key: 'security', icon: <SafetyOutlined />, translationKey: 'settings.security' },
  { key: 'performance', icon: <ThunderboltOutlined />, translationKey: 'settings.performance' },
] as const;

const SettingsView: React.FC<SettingsViewProps> = ({
  apiConfig,
  spreadsheetData,
  workbookLoaded = false,
  isLoading = false,
  onConfigChange,
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('general');
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const hasTableSheets = useMemo(() => {
    const fileJson = spreadsheetData?.fileJson || spreadsheetData;
    if (!fileJson || !fileJson.sheets) return false;
    for (const sheet of Object.values(fileJson.sheets) as any[]) {
      if (sheet?.dataManager?.tables && Object.keys(sheet.dataManager.tables).length > 0) return true;
    }
    return false;
  }, [spreadsheetData]);

  const cacheOptionsDisabled = !workbookLoaded || !hasTableSheets;

  const scrollToSection = (key: string) => {
    setActiveSection(key);
    const el = document.getElementById(`settings-section-${key}`);
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
    }
  };

  // Toggle card component for performance settings
  const ToggleCard: React.FC<{
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    tooltip?: string;
  }> = ({ title, description, checked, onChange, disabled, tooltip }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderRadius: 10,
      border: '1px solid #f0ecf5',
      background: checked ? '#faf8ff' : '#fff',
      marginBottom: 12,
    }}>
      <div style={{ flex: 1, marginRight: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
        <div style={{ color: '#888', fontSize: 13 }}>{description}</div>
      </div>
      <Tooltip title={tooltip}>
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={checked ? { background: '#9233E9' } : {}}
        />
      </Tooltip>
    </div>
  );

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      backgroundColor: '#fff',
    }}>
      {/* Sidebar Navigation */}
      <div style={{
        width: 180,
        minWidth: 180,
        borderRight: '1px solid #f0f0f0',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {SECTIONS.map((section) => (
          <div
            key={section.key}
            onClick={() => scrollToSection(section.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeSection === section.key ? 600 : 400,
              color: activeSection === section.key ? '#9233E9' : '#555',
              background: activeSection === section.key ? '#f5f0ff' : 'transparent',
              borderRadius: 8,
              margin: '0 8px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 16 }}>{section.icon}</span>
            {t(section.translationKey)}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 32px 32px',
        }}
      >
        {/* General Section */}
        <div id="settings-section-general">
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: '#9233E9',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            SERVICE INFO
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, color: '#555', fontWeight: 600 }}>{t('settings.serviceName')}</div>
            <DebouncedInput
              placeholder={t('settings.enterServiceName')}
              defaultValue={apiConfig.name}
              onChange={(name) => onConfigChange({ name })}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 8, color: '#555', fontWeight: 600 }}>{t('settings.description')}</div>
            <DebouncedTextArea
              placeholder={t('settings.enterDescription')}
              defaultValue={apiConfig.description}
              onChange={(description) => onConfigChange({ description })}
              rows={3}
              disabled={isLoading}
            />
            <div style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>
              {t('settings.descriptionHint')}
            </div>
          </div>
        </div>

        <Divider style={{ margin: '28px 0' }} />

        {/* Performance Section */}
        <div id="settings-section-performance">
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: '#9233E9',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            PERFORMANCE
          </div>

          <ToggleCard
            title={t('settings.enableResponseCaching')}
            description={t('settings.responseCachingDesc')}
            checked={apiConfig.enableCaching || false}
            onChange={(checked) => onConfigChange({ enableCaching: checked })}
            disabled={isLoading || cacheOptionsDisabled}
            tooltip={cacheOptionsDisabled ? t('settings.cacheTooltipNoTableSheets') : t('settings.cacheTooltipResponse')}
          />

          <ToggleCard
            title={t('settings.cacheTableSheetData')}
            description={t('settings.tableSheetCachingDesc')}
            checked={apiConfig.cacheTableSheetData || false}
            onChange={(checked) => onConfigChange({ cacheTableSheetData: checked })}
            disabled={isLoading || cacheOptionsDisabled}
            tooltip={cacheOptionsDisabled ? t('settings.cacheTooltipNoTableSheets') : t('settings.cacheTooltipTableSheet')}
          />

          {apiConfig.cacheTableSheetData && workbookLoaded && hasTableSheets && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, marginTop: 4 }}>
              <span style={{ color: '#888', fontSize: 13 }}>{t('settings.cacheDuration')}</span>
              <Select
                value={apiConfig.tableSheetCacheTTL || 300}
                onChange={(value) => onConfigChange({ tableSheetCacheTTL: value })}
                style={{ width: 130 }}
                disabled={isLoading}
                size="small"
              >
                <Select.Option value={60}>{t('settings.oneMinute')}</Select.Option>
                <Select.Option value={300}>{t('settings.fiveMinutes')}</Select.Option>
                <Select.Option value={900}>{t('settings.fifteenMinutes')}</Select.Option>
                <Select.Option value={1800}>{t('settings.thirtyMinutes')}</Select.Option>
                <Select.Option value={3600}>{t('settings.oneHour')}</Select.Option>
              </Select>
            </div>
          )}
        </div>

        <Divider style={{ margin: '28px 0' }} />

        {/* Security Section (placeholder for future) */}
        <div id="settings-section-security">
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: '#9233E9',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            {t('settings.security').toUpperCase()}
          </div>
          <div style={{ color: '#aaa', fontSize: 14 }}>
            {t('settings.security')} — coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
