'use client';

import React from 'react';
import { Space, Input, Checkbox, Tooltip, Button, message, Alert } from 'antd';
import { InfoCircleOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';

interface WebAppSectionProps {
  webAppEnabled?: boolean;
  webAppToken?: string;
  serviceId: string;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  onWebAppEnabledChange: (checked: boolean) => void;
  onWebAppTokenChange: (token: string) => void;
}

const WebAppSection: React.FC<WebAppSectionProps> = ({
  webAppEnabled = false,
  webAppToken,
  serviceId,
  isLoading = false,
  hasUnsavedChanges = false,
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
            )}

            {webAppToken && hasUnsavedChanges && (
              <Alert
                message="Remember to click the Save button at the top to activate your web app settings"
                type="info"
                showIcon={false}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              />
            )}
          </>
        )}
      </Space>
    </CollapsibleSection>
  );
};

export default WebAppSection;
