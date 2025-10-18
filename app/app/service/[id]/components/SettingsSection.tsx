'use client';

import React from 'react';
import { Space, Input, Checkbox, Tooltip, Select, Button, message, Alert } from 'antd';
import { InfoCircleOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';

interface SettingsSectionProps {
  apiName: string;
  apiDescription: string;
  enableCaching: boolean;
  cacheTableSheetData: boolean;
  tableSheetCacheTTL: number;
  aiDescription: string;
  aiUsageExamples: string[];
  aiTags: string[];
  category: string;
  aiUsageGuidance?: string;
  webAppEnabled?: boolean;
  webAppToken?: string;
  serviceId: string;
  isLoading?: boolean;
  onApiNameChange: (value: string) => void;
  onApiDescriptionChange: (value: string) => void;
  onEnableCachingChange: (checked: boolean) => void;
  onCacheTableSheetDataChange: (checked: boolean) => void;
  onTableSheetCacheTTLChange: (value: number) => void;
  onAiDescriptionChange: (value: string) => void;
  onAiUsageExamplesChange: (values: string[]) => void;
  onAiTagsChange: (values: string[]) => void;
  onCategoryChange: (value: string) => void;
  onAiUsageGuidanceChange: (value: string) => void;
  onWebAppEnabledChange: (checked: boolean) => void;
  onWebAppTokenChange: (token: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  apiName,
  apiDescription,
  enableCaching,
  cacheTableSheetData,
  tableSheetCacheTTL,
  aiDescription,
  aiUsageExamples,
  aiTags,
  category,
  aiUsageGuidance,
  webAppEnabled = false,
  webAppToken,
  serviceId,
  isLoading = false,
  onApiNameChange,
  onApiDescriptionChange,
  onEnableCachingChange,
  onCacheTableSheetDataChange,
  onTableSheetCacheTTLChange,
  onAiDescriptionChange,
  onAiUsageExamplesChange,
  onAiTagsChange,
  onCategoryChange,
  onAiUsageGuidanceChange,
  onWebAppEnabledChange,
  onWebAppTokenChange,
}) => {
  const handleGenerateToken = () => {
    // Generate a URL-safe random token
    const token = crypto.randomUUID().replace(/-/g, '');
    onWebAppTokenChange(token);
    message.success('Web app token generated!');
  };

  const handleCopyLink = () => {
    const appUrl = `${window.location.origin}/app/v1/services/${serviceId}?token=${webAppToken}`;
    navigator.clipboard.writeText(appUrl);
    message.success('Link copied to clipboard!');
  };
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginTop: '8px',
    }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <CollapsibleSection title="Service Info" defaultOpen={true}>
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Service Name</strong></div>
            <Input
              placeholder="Enter service name"
              value={apiName}
              onChange={(e) => onApiNameChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Description</strong></div>
            <Input.TextArea
              placeholder="Describe what this API does"
              value={apiDescription}
              onChange={(e) => onApiDescriptionChange(e.target.value)}
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginTop: '0px' }}>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Advanced Options</strong></div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space align="center">
                <Checkbox
                  checked={enableCaching}
                  onChange={(e) => onEnableCachingChange(e.target.checked)}
                  disabled={isLoading}
                >
                  Enable response caching
                </Checkbox>
                <Tooltip title="Cache API responses for improved performance. Users can bypass CDN cache with nocdn=true or bypass all caches with nocache=true.">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </Space>
              
              <Space align="center">
                <Checkbox
                  checked={cacheTableSheetData}
                  onChange={(e) => onCacheTableSheetDataChange(e.target.checked)}
                  disabled={isLoading}
                >
                  Cache TableSheet data
                </Checkbox>
                <Tooltip title="Cache external TableSheet data for better performance. Disable for real-time data that changes frequently.">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </Space>
              
              {cacheTableSheetData && (
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

      <CollapsibleSection title="AI Assistant Information" defaultOpen={false}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>AI Description</div>
              <Input.TextArea
                placeholder="Detailed explanation for AI assistants about what this service does and when to use it..."
                value={aiDescription}
                onChange={(e) => onAiDescriptionChange(e.target.value)}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Usage Guidance</div>
              <Input.TextArea
                placeholder="When should AI use this service? E.g., 'Use when user wants to calculate mortgage payments or compare loan terms'"
                value={aiUsageGuidance || ''}
                onChange={(e) => onAiUsageGuidanceChange(e.target.value)}
                rows={2}
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Usage Examples</div>
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Add example questions or use cases (press Enter to add)"
                value={aiUsageExamples}
                onChange={onAiUsageExamplesChange}
                tokenSeparators={[',']}
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Tags</div>
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Add searchable tags (e.g., finance, mortgage, loan)"
                value={aiTags}
                onChange={onAiTagsChange}
                tokenSeparators={[',']}
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Category</div>
              <Select
                style={{ width: '100%' }}
                placeholder="Select a category"
                value={category}
                onChange={onCategoryChange}
                disabled={isLoading}
              >
                <Select.Option value="finance">Finance</Select.Option>
                <Select.Option value="math">Mathematics</Select.Option>
                <Select.Option value="statistics">Statistics</Select.Option>
                <Select.Option value="business">Business</Select.Option>
                <Select.Option value="science">Science</Select.Option>
                <Select.Option value="engineering">Engineering</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </div>
        </Space>
      </CollapsibleSection>

      <CollapsibleSection title="Web App" defaultOpen={false}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <div>
            <Space align="center">
              <Checkbox
                checked={webAppEnabled}
                onChange={(e) => onWebAppEnabledChange(e.target.checked)}
                disabled={isLoading}
              >
                Enable Web App
              </Checkbox>
              <Tooltip title="Create a public web application that users can access directly without API knowledge">
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
              </Tooltip>
            </Space>
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4, marginLeft: 24 }}>
              Provides a beautiful, shareable web interface for your service
            </div>
          </div>

          {webAppEnabled && (
            <>
              <div>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  Access Token
                </div>
                {!webAppToken ? (
                  <Button
                    type="primary"
                    onClick={handleGenerateToken}
                    disabled={isLoading}
                  >
                    Generate Token
                  </Button>
                ) : (
                  <>
                    <Alert
                      message="Remember to Save"
                      description="Click the Save button at the top to activate your web app settings."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                      <Input
                        value={webAppToken}
                        readOnly
                        addonAfter={
                          <ReloadOutlined
                            onClick={handleGenerateToken}
                            style={{ cursor: 'pointer' }}
                            title="Regenerate token"
                          />
                        }
                      />
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        Regenerate to revoke access to old links
                      </div>
                    </Space>
                  </>
                )}
              </div>

              {webAppToken && (
                <div>
                  <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                    Web App URL
                  </div>
                  <Input
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/app/v1/services/${serviceId}?token=${webAppToken}`}
                    readOnly
                    addonAfter={
                      <CopyOutlined
                        onClick={handleCopyLink}
                        style={{ cursor: 'pointer' }}
                        title="Copy to clipboard"
                      />
                    }
                  />
                  <div style={{ fontSize: '11px', color: '#999', marginTop: 4 }}>
                    Share this link with users to access your web application
                  </div>
                </div>
              )}
            </>
          )}
        </Space>
      </CollapsibleSection>
      </Space>
    </div>
  );
};

export default SettingsSection;