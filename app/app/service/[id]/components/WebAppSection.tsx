'use client';

import React, { useState } from 'react';
import { Space, Input, Tooltip, Button, App, Alert, Modal } from 'antd';
import { InfoCircleOutlined, CopyOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';
import { useTranslation } from '@/lib/i18n';

const { TextArea } = Input;

interface WebAppSectionProps {
  webAppToken?: string;
  webAppConfig?: string;
  serviceId: string;
  requireToken?: boolean;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  onWebAppTokenChange: (token: string) => void;
  onWebAppConfigChange: (config: string) => void;
}

const WebAppSection: React.FC<WebAppSectionProps> = ({
  webAppToken,
  webAppConfig = '',
  serviceId,
  requireToken = false,
  isLoading = false,
  hasUnsavedChanges = false,
  onWebAppTokenChange,
  onWebAppConfigChange,
}) => {
  const { notification } = App.useApp();
  const { t, locale } = useTranslation();
  const [configError, setConfigError] = useState<string | null>(null);
  const handleGenerateToken = () => {
    // Generate a URL-safe random token
    const token = crypto.randomUUID().replace(/-/g, '');
    onWebAppTokenChange(token);
    notification.success({ title: t('webApp.tokenGenerated') });
  };

  const handleDeleteToken = () => {
    Modal.confirm({
      title: t('webApp.disableWebApp'),
      content: t('webApp.disableConfirm'),
      okText: t('webApp.disable'),
      okButtonProps: { danger: true },
      cancelText: t('common.cancel'),
      onOk: () => {
        onWebAppTokenChange('');
        notification.success({ title: t('webApp.webAppDisabled') });
      }
    });
  };

  const webAppUrl = requireToken && webAppToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/app/v1/services/${serviceId}?token=${webAppToken}`
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/app/v1/services/${serviceId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webAppUrl);
    notification.success({ title: t('webApp.linkCopied') });
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
    <CollapsibleSection title={t('webApp.createWebFrontend')} defaultOpen={false}>
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        <Alert
          title={t('webApp.webFrontend')}
          description={t('webApp.webFrontendDesc')}
          type="info"
          showIcon
        />

        {/* Token management - only for token-protected services */}
        {requireToken && (
          <>
            {!webAppToken ? (
              <div>
                <Button
                  type="primary"
                  onClick={handleGenerateToken}
                  disabled={isLoading}
                >
                  {t('webApp.generateTokenEnable')}
                </Button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  {t('webApp.accessToken')}
                </div>
                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      value={webAppToken}
                      readOnly
                      style={{ flex: 1 }}
                    />
                    <Tooltip title={t('webApp.regenerateToken')}>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleGenerateToken}
                      />
                    </Tooltip>
                    <Tooltip title={t('webApp.disableWebApp')}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteToken}
                      />
                    </Tooltip>
                  </Space.Compact>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {t('webApp.regenerateToRevoke')}
                  </div>
                </Space>
              </div>
            )}
          </>
        )}

        {/* Web App URL - always shown (for public services without token, for protected with token) */}
        {(!requireToken || webAppToken) && (
          <>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                {t('webApp.webAppUrl')}
              </div>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  value={webAppUrl}
                  readOnly
                />
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleCopyLink}
                  title={t('webApp.copyToClipboard')}
                />
              </Space.Compact>
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                {({ en: <>
                    Share this{' '}
                    <a
                      href={webAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#4F2D7F', fontWeight: 600, textDecoration: 'none' }}
                    >
                      link
                    </a>
                    {' '}with users to access your web application
                  </>,
                  de: <>
                    Teilen Sie diesen{' '}
                    <a
                      href={webAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#4F2D7F', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Link
                    </a>
                    {' '}mit Benutzern, um auf Ihre Webanwendung zuzugreifen
                  </>
                } as Record<string, React.ReactNode>)[locale] ?? <>
                    Share this{' '}
                    <a
                      href={webAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#4F2D7F', fontWeight: 600, textDecoration: 'none' }}
                    >
                      link
                    </a>
                    {' '}with users to access your web application
                  </>}
              </div>
            </div>

            {hasUnsavedChanges && (
              <Alert
                title={t('webApp.rememberToSave')}
                type="info"
                showIcon={false}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              />
            )}
          </>
        )}

        {/* Advanced rules - always shown */}
        {(!requireToken || webAppToken) && (
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {t('webApp.appRulesAdvanced')}
                <Tooltip title={
                  <div>
                    <div style={{ marginBottom: 8 }}>{t('webApp.controlVisibility')}</div>
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
                {t('webApp.leaveEmptyDefault')}
              </div>
            </div>
        )}
      </Space>
    </CollapsibleSection>
  );
};

export default WebAppSection;
