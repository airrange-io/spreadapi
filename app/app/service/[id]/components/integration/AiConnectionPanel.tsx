'use client';

import React, { useState, useMemo } from 'react';
import { Button, Input, Typography, Space, Select, Alert, App } from 'antd';
import { CopyOutlined, ThunderboltOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AiConnectionPanelProps {
  serviceId: string;
  serviceName?: string;
  isPublished?: boolean;
  requireToken?: boolean;
  availableTokens?: any[];
  inputs?: any[];
  outputs?: any[];
}

const AiConnectionPanel: React.FC<AiConnectionPanelProps> = ({
  serviceId,
  serviceName,
  isPublished = false,
  requireToken = false,
  availableTokens = [],
  inputs = [],
  outputs = [],
}) => {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>(
    availableTokens.length > 0 ? availableTokens[0].id : undefined
  );
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find selected token value
  const selectedToken = useMemo(() => {
    if (!requireToken) return null;
    return availableTokens.find(t => t.id === selectedTokenId);
  }, [selectedTokenId, availableTokens, requireToken]);

  // Build the URL
  const connectionUrl = useMemo(() => {
    const base = typeof window !== 'undefined'
      ? `${window.location.origin}/api/d/${serviceId}`
      : `https://spreadapi.io/api/d/${serviceId}`;

    if (requireToken && selectedToken?.token) {
      return `${base}?token=${selectedToken.token}`;
    }
    return base;
  }, [serviceId, requireToken, selectedToken]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(connectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      notification.success({ message: 'URL copied to clipboard' });
    } catch {
      notification.error({ message: 'Failed to copy' });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(connectionUrl);
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: '#bfbfbf',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 8,
  };

  if (!isPublished) {
    return (
      <Alert
        title="Service must be published to generate an AI connection URL."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 8 }}>
          AI Connection
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Give this URL to any AI agent (ChatGPT, Claude, Cursor, Zapier, etc.).
          The AI calls this URL, reads the briefing, and instantly knows how to use your service — no documentation needed.
        </Text>
      </div>

      {/* Token selector */}
      {requireToken && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeaderStyle}>API Token</div>
          {availableTokens.length > 0 ? (
            <Select
              value={selectedTokenId}
              onChange={setSelectedTokenId}
              style={{ width: '100%' }}
              options={availableTokens.map(t => ({
                value: t.id,
                label: t.name || t.id,
              }))}
              placeholder="Select a token"
            />
          ) : (
            <Alert
              title="No API tokens found. Create one in the API Tokens section first."
              type="info"
              showIcon
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      )}

      {/* Connection URL */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionHeaderStyle}>Connection URL</div>
        <div style={{
          background: '#fafafa',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <code style={{
            flex: 1,
            fontSize: 12,
            fontFamily: 'SF Mono, Fira Code, Menlo, monospace',
            wordBreak: 'break-all',
            color: '#434343',
          }}>
            {connectionUrl}
          </code>
          <Button
            type="primary"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              background: copied ? '#52c41a' : '#9133E8',
              borderColor: copied ? '#52c41a' : '#9133E8',
              boxShadow: 'none',
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionHeaderStyle}>How it works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { step: '1', label: 'Copy the URL above and paste it into any AI tool' },
            { step: '2', label: 'The AI calls GET on the URL and receives a complete briefing' },
            { step: '3', label: 'The AI knows your parameters, constraints, and how to calculate' },
            { step: '4', label: 'The AI calls POST with inputs and gets results instantly' },
          ].map(({ step, label }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#F0EEFF',
                color: '#7B3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {step}
              </div>
              <Text style={{ fontSize: 13, color: '#595959' }}>{label}</Text>
            </div>
          ))}
        </div>
      </div>

      {/* Compatible with */}
      <div style={{ marginBottom: 24 }}>
        <div style={sectionHeaderStyle}>Compatible with</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['ChatGPT', 'Claude', 'Cursor', 'Windsurf', 'Zapier', 'n8n', 'Custom Agents'].map(name => (
            <span key={name} style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: '#fafafa',
              border: '1px solid #f0f0f0',
              fontSize: 12,
              color: '#595959',
            }}>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Test button */}
      <div style={{ marginBottom: 20 }}>
        <Button
          icon={<ThunderboltOutlined />}
          onClick={handleTest}
          loading={testing}
          style={{ borderColor: '#d9d9d9' }}
        >
          Test Discovery
        </Button>
      </div>

      {/* Test result */}
      {testResult && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionHeaderStyle}>Discovery Response</div>
          <pre style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: 16,
            fontSize: 11,
            fontFamily: 'SF Mono, Fira Code, Menlo, monospace',
            overflow: 'auto',
            maxHeight: 400,
            color: '#434343',
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AiConnectionPanel;
