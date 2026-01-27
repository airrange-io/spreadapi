'use client';

import React, { useState } from 'react';
import { Space, Input, Tooltip, Button, App, Alert, Modal } from 'antd';
import { InfoCircleOutlined, CopyOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';

const { TextArea } = Input;

interface WebAppSectionProps {
  webAppToken?: string;
  webAppConfig?: string;
  serviceId: string;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  onWebAppTokenChange: (token: string) => void;
  onWebAppConfigChange: (config: string) => void;
}

const WebAppSection: React.FC<WebAppSectionProps> = ({
  webAppToken,
  webAppConfig = '',
  serviceId,
  isLoading = false,
  hasUnsavedChanges = false,
  onWebAppTokenChange,
  onWebAppConfigChange,
}) => {
  const { notification } = App.useApp();
  const [configError, setConfigError] = useState<string | null>(null);
  const handleGenerateToken = () => {
    // Generate a URL-safe random token
    const token = crypto.randomUUID().replace(/-/g, '');
    onWebAppTokenChange(token);
    notification.success({ message: 'Web app token generated!' });
  };

  const handleDeleteToken = () => {
    Modal.confirm({
      title: 'Disable Web App',
      content: 'This will disable the web app and invalidate the current link. Are you sure?',
      okText: 'Disable',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        onWebAppTokenChange('');
        notification.success({ message: 'Web app disabled' });
      }
    });
  };

  const handleCopyLink = () => {
    const appUrl = `${window.location.origin}/app/v1/services/${serviceId}?token=${webAppToken}`;
    navigator.clipboard.writeText(appUrl);
    notification.success({ message: 'Link copied to clipboard!' });
  };

  const handleConfigChange = (value: string) => {
    onWebAppConfigChange(value);

    // Validate JSON if not empty
    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);

        // Validate structure
        if (!parsed.rules || !Array.isArray(parsed.rules)) {
          setConfigError('Config must have a "rules" array');
          return;
        }

        // Validate each rule
        for (let i = 0; i < parsed.rules.length; i++) {
          const rule = parsed.rules[i];
          if (!rule.output && !rule.input) {
            setConfigError(`Rule ${i + 1}: Must have either "output" or "input" field`);
            return;
          }
          if (rule.output && rule.input) {
            setConfigError(`Rule ${i + 1}: Cannot have both "output" and "input" fields`);
            return;
          }
          if (!rule.visible) {
            setConfigError(`Rule ${i + 1}: Missing "visible" field`);
            return;
          }
        }

        setConfigError(null);
      } catch (e) {
        setConfigError(e instanceof Error ? e.message : 'Invalid JSON');
      }
    } else {
      setConfigError(null);
    }
  };

  return (
    <CollapsibleSection title="Create a Web Frontend for Your API" defaultOpen={false}>
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        <Alert
          title="Web Frontend"
          description="Create a shareable web application that users can access directly without API knowledge. Generate a token to enable."
          type="info"
          showIcon
        />

        {!webAppToken ? (
          <div>
            <Button
              type="primary"
              onClick={handleGenerateToken}
              disabled={isLoading}
            >
              Generate Token & Enable Web App
            </Button>
          </div>
        ) : (
          <>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                Access Token
              </div>
              <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={webAppToken}
                    readOnly
                    style={{ flex: 1 }}
                  />
                  <Tooltip title="Regenerate token">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleGenerateToken}
                    />
                  </Tooltip>
                  <Tooltip title="Disable web app">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteToken}
                    />
                  </Tooltip>
                </Space.Compact>
                <div style={{ fontSize: '11px', color: '#999' }}>
                  Regenerate to revoke access to old links
                </div>
              </Space>
            </div>

            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                Web App URL
              </div>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/app/v1/services/${serviceId}?token=${webAppToken}`}
                  readOnly
                />
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleCopyLink}
                  title="Copy to clipboard"
                />
              </Space.Compact>
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                Share this{' '}
                <a
                  href={`${typeof window !== 'undefined' ? window.location.origin : ''}/app/v1/services/${serviceId}?token=${webAppToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4F2D7F', fontWeight: 600, textDecoration: 'none' }}
                >
                  link
                </a>
                {' '}with users to access your web application
              </div>
            </div>

            {hasUnsavedChanges && (
              <Alert
                title="Remember to click the Save button at the top to activate your web app settings"
                type="info"
                showIcon={false}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              />
            )}

            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                App Rules (Advanced)
                <Tooltip title={
                  <div>
                    <div style={{ marginBottom: 8 }}>Control which inputs/outputs are visible based on input values.</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'pre' }}>
{`{
  "rules": [
    {
      "input": "inputName",
      "visible": {
        "input": "otherInput",
        "equals": "value"
      }
    },
    {
      "output": "outputName",
      "visible": {
        "input": "inputName",
        "equals": "value"
      }
    }
  ]
}`}
                    </div>
                  </div>
                }>
                  <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </div>
              <TextArea
                value={webAppConfig}
                onChange={(e) => handleConfigChange(e.target.value)}
                placeholder='{"rules": []}'
                rows={8}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  backgroundColor: '#f5f5f5'
                }}
                disabled={isLoading}
              />
              {configError && (
                <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: 4 }}>
                  {configError}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#999', marginTop: 4 }}>
                Leave empty for default behavior (show all outputs)
              </div>
            </div>
          </>
        )}
      </Space>
    </CollapsibleSection>
  );
};

export default WebAppSection;
