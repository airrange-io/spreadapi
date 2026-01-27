'use client';

import React, { useState } from 'react';
import { Input, Button, Space, Alert, Typography, App } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

const { Text } = Typography;

interface WebhookManagementProps {
  serviceId: string;
  webhookUrl?: string;
  webhookSecret?: string;
  isDemoMode?: boolean;
  onConfigChange?: (updates: any) => void;
}

const WebhookManagement: React.FC<WebhookManagementProps> = ({
  serviceId,
  webhookUrl = '',
  webhookSecret = '',
  isDemoMode = false,
  onConfigChange
}) => {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    if (!webhookUrl) {
      notification.error({ message: t('webhook.enterUrl') });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/services/${serviceId}/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          webhookSecret
        })
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        notification.success({ message: t('webhook.testSuccess') });
      } else {
        notification.error({ message: t('webhook.testFailed', { error: result.error }) });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || t('webhook.testError')
      });
      notification.error({ message: t('webhook.testError') });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ marginBottom: 8 }}>{t('webhook.title')}</Typography.Title>
      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
        {t('webhook.description')}
      </Text>

      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        {/* Webhook URL */}
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>{t('webhook.urlLabel')}</div>
          <Input
            placeholder="https://your-domain.com/webhook"
            value={webhookUrl}
            onChange={(e) => {
              if (onConfigChange) {
                onConfigChange({ webhookUrl: e.target.value });
              }
            }}
            disabled={isDemoMode}
            style={{ fontFamily: 'monospace' }}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            {t('webhook.urlHint')}
          </Text>
        </div>

        {/* Webhook Secret (Optional) */}
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            {t('webhook.secretLabel')} <Text type="secondary">({t('webhook.optional')})</Text>
          </div>
          <Input.Password
            placeholder={t('webhook.secretPlaceholder')}
            value={webhookSecret}
            onChange={(e) => {
              if (onConfigChange) {
                onConfigChange({ webhookSecret: e.target.value });
              }
            }}
            disabled={isDemoMode}
            style={{ fontFamily: 'monospace' }}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            {t('webhook.secretHint')}
          </Text>
        </div>

        {/* Test Button */}
        <div>
          <Button
            type="primary"
            onClick={handleTest}
            loading={testing}
            disabled={!webhookUrl || isDemoMode}
          >
            {testing ? t('webhook.testing') : t('webhook.testButton')}
          </Button>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
            {t('webhook.testHint')}
          </Text>
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert
            title={testResult.success ? t('webhook.testSuccessTitle') : t('webhook.testFailedTitle')}
            description={
              <div style={{ fontSize: 13 }}>
                {testResult.success ? (
                  <>
                    <div><strong>{t('webhook.status')}:</strong> {testResult.status} {testResult.statusText}</div>
                    <div><strong>{t('webhook.responseTime')}:</strong> {testResult.responseTime}ms</div>
                    {testResult.body && (
                      <div style={{ marginTop: 8 }}>
                        <strong>{t('webhook.response')}:</strong>
                        <pre style={{
                          marginTop: 4,
                          padding: 8,
                          background: '#f5f5f5',
                          borderRadius: 4,
                          fontSize: 12,
                          maxHeight: 150,
                          overflow: 'auto'
                        }}>
                          {testResult.body}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div><strong>{t('webhook.error')}:</strong> {testResult.error}</div>
                )}
              </div>
            }
            type={testResult.success ? 'success' : 'error'}
            icon={testResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            showIcon
            closable
            onClose={() => setTestResult(null)}
          />
        )}

        {/* Info Alert */}
        <Alert
          title={t('webhook.howItWorksTitle')}
          description={
            <div style={{ fontSize: 13 }}>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>{t('webhook.infoTriggered')}</li>
                <li>{t('webhook.infoPayload')}</li>
                <li>{t('webhook.infoNonBlocking')}</li>
                <li>{t('webhook.infoRateLimit')}</li>
                <li>{t('webhook.infoCircuitBreaker')}</li>
                <li>{t('webhook.infoSecurity')}</li>
              </ul>
              <div style={{ marginTop: 8 }}>
                {t('webhook.viewStats')}
              </div>
            </div>
          }
          type="info"
        />

        {isDemoMode && (
          <Alert
            title={t('webhook.demoDisabled')}
            type="warning"
            showIcon
          />
        )}
      </Space>
    </div>
  );
};

export default WebhookManagement;
