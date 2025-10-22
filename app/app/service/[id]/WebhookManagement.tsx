'use client';

import React, { useState } from 'react';
import { Switch, Input, Button, Space, Alert, Spin, Typography, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface WebhookManagementProps {
  serviceId: string;
  webhookEnabled?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  isDemoMode?: boolean;
  onConfigChange?: (updates: any) => void;
}

const WebhookManagement: React.FC<WebhookManagementProps> = ({
  serviceId,
  webhookEnabled = false,
  webhookUrl = '',
  webhookSecret = '',
  isDemoMode = false,
  onConfigChange
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    if (!webhookUrl) {
      message.error('Please enter a webhook URL');
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
        message.success('Webhook test successful!');
      } else {
        message.error(`Webhook test failed: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Failed to test webhook'
      });
      message.error('Failed to test webhook');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>Webhook Automation</Typography.Title>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {/* Enable/Disable Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Enable Webhooks</div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Automatically trigger webhooks after each calculation
            </Text>
          </div>
          <Switch
            checked={webhookEnabled}
            onChange={(checked) => {
              if (onConfigChange) {
                onConfigChange({ webhookEnabled: checked });
              }
            }}
            disabled={isDemoMode}
          />
        </div>

        {webhookEnabled && (
          <>
            {/* Webhook URL */}
            <div>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Webhook URL</div>
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
                The URL to POST calculation results to. Must be a valid HTTPS endpoint.
              </Text>
            </div>

            {/* Webhook Secret (Optional) */}
            <div>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                Webhook Secret <Text type="secondary">(optional)</Text>
              </div>
              <Input.Password
                placeholder="Your secret key for authentication"
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
                Sent as <code>X-Webhook-Secret</code> header for authentication
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
                {testing ? 'Testing...' : 'Test Webhook'}
              </Button>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                Send a test payload to verify your webhook endpoint
              </Text>
            </div>

            {/* Test Result */}
            {testResult && (
              <Alert
                message={testResult.success ? 'Test Successful' : 'Test Failed'}
                description={
                  <div style={{ fontSize: 13 }}>
                    {testResult.success ? (
                      <>
                        <div><strong>Status:</strong> {testResult.status} {testResult.statusText}</div>
                        <div><strong>Response Time:</strong> {testResult.responseTime}ms</div>
                        {testResult.body && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Response:</strong>
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
                      <div><strong>Error:</strong> {testResult.error}</div>
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
              message="How Webhooks Work"
              description={
                <div style={{ fontSize: 13 }}>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    <li>Webhooks are triggered after every calculation (API, web app, snippets, MCP, chat)</li>
                    <li>Payload includes inputs, outputs, and execution metadata</li>
                    <li>Non-blocking: webhooks fire after the response is sent (zero latency impact)</li>
                    <li>Rate limited: max 100 webhooks per minute per service</li>
                    <li>Circuit breaker: auto-disables after 10 consecutive failures</li>
                    <li>Security: SSRF protection blocks private IPs and localhost</li>
                  </ul>
                  <div style={{ marginTop: 8 }}>
                    View webhook statistics in the <strong>Usage</strong> tab.
                  </div>
                </div>
              }
              type="info"
              icon={<InfoCircleOutlined />}
              showIcon
            />
          </>
        )}

        {isDemoMode && (
          <Alert
            message="Webhook configuration is disabled in demo mode"
            type="warning"
            showIcon
          />
        )}
      </Space>
    </div>
  );
};

export default WebhookManagement;
