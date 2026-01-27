'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface ServiceMCPSettingsProps {
  serviceId: string;
  serviceName: string;
  needsToken: boolean;
}

/**
 * ServiceMCPSettings Component
 *
 * Displays MCP (Model Context Protocol) integration settings for a specific service.
 * Shows:
 * - Service-specific MCP endpoint URL
 * - ChatGPT integration instructions (with OAuth flow)
 * - Claude Desktop configuration (with NPM bridge)
 * - Copy-to-clipboard functionality for easy setup
 */
export default function ServiceMCPSettings({
  serviceId,
  serviceName,
  needsToken
}: ServiceMCPSettingsProps) {
  const { t } = useTranslation();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Generate URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';
  const mcpUrl = `${baseUrl}/api/mcp/service/${serviceId}`;
  const oauthAuthUrl = `${baseUrl}/oauth/authorize`;

  // Claude Desktop configuration
  const claudeConfig = {
    mcpServers: {
      [serviceId]: {
        command: "npx",
        args: ["spreadapi-mcp"],
        env: {
          SPREADAPI_URL: mcpUrl,
          ...(needsToken && { SPREADAPI_TOKEN: "your_service_token_here" })
        }
      }
    }
  };

  const claudeConfigJson = JSON.stringify(claudeConfig, null, 2);

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mcp-settings">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: '#1f1f1f'
        }}>
          {t('mcp.heading')}
        </h3>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#666'
        }}>
          {t('mcp.headingDescription')}
        </p>
      </div>

      {/* MCP Endpoint URL */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#1f1f1f'
        }}>
          {t('mcp.endpointUrlLabel')}
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={mcpUrl}
            readOnly
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'monospace',
              backgroundColor: '#f5f5f5',
              color: '#1f1f1f'
            }}
          />
          <button
            onClick={() => copyToClipboard(mcpUrl, 'url')}
            style={{
              padding: '8px 16px',
              backgroundColor: copiedItem === 'url' ? '#52c41a' : '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            {copiedItem === 'url' ? t('mcp.copied') : t('mcp.copy')}
          </button>
        </div>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '12px',
          color: '#999'
        }}>
          {t('mcp.endpointUrlHint')}
        </p>
      </div>

      {/* ChatGPT Instructions */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f1f1f'
        }}>
          {t('mcp.forChatGPT')}
        </h4>

        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e8e8e8',
          borderRadius: '6px',
          padding: '16px'
        }}>
          <ol style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            color: '#1f1f1f',
            lineHeight: '1.6'
          }}>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.chatGptStep1')}
            </li>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.chatGptStep2')}
            </li>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.chatGptStep3')}
            </li>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.chatGptStep4')}
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                {mcpUrl}
              </div>
            </li>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.chatGptStep5')}
            </li>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.chatGptStep6')}
            </li>
            {needsToken && (
              <li style={{ marginBottom: '8px' }}>
                {t('mcp.chatGptStepToken')}
              </li>
            )}
            <li>
              {t('mcp.chatGptStepDone')}
            </li>
          </ol>

          {!needsToken && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#0050b3'
            }}>
              {t('mcp.publicServiceNote')}
            </div>
          )}
        </div>
      </div>

      {/* Claude Desktop Instructions */}
      <div>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f1f1f'
        }}>
          {t('mcp.forClaudeDesktop')}
        </h4>

        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e8e8e8',
          borderRadius: '6px',
          padding: '16px'
        }}>
          <ol style={{
            margin: '0 0 12px 0',
            paddingLeft: '20px',
            fontSize: '14px',
            color: '#1f1f1f',
            lineHeight: '1.6'
          }}>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.claudeStep1')}
            </li>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.claudeStep2')}
              <ul style={{ marginTop: '4px', paddingLeft: '20px', fontSize: '12px' }}>
                <li>macOS: <code style={{
                  backgroundColor: '#fff',
                  padding: '2px 4px',
                  borderRadius: '6px',
                  fontFamily: 'monospace'
                }}>~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                <li>Windows: <code style={{
                  backgroundColor: '#fff',
                  padding: '2px 4px',
                  borderRadius: '6px',
                  fontFamily: 'monospace'
                }}>%APPDATA%\Claude\claude_desktop_config.json</code></li>
              </ul>
            </li>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.claudeStep3')}
            </li>
          </ol>

          <div style={{ position: 'relative' }}>
            <pre style={{
              margin: '0 0 8px 0',
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: '300px',
              lineHeight: '1.5'
            }}>
              {claudeConfigJson}
            </pre>
            <button
              onClick={() => copyToClipboard(claudeConfigJson, 'claude-config')}
              style={{
                padding: '6px 12px',
                backgroundColor: copiedItem === 'claude-config' ? '#52c41a' : '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {copiedItem === 'claude-config' ? t('mcp.copiedConfig') : t('mcp.copyConfig')}
            </button>
          </div>

          {needsToken && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#ad6800'
            }}>
              {t('mcp.replaceTokenWarning')}
            </div>
          )}

          <ol start={4} style={{
            margin: '12px 0 0 0',
            paddingLeft: '20px',
            fontSize: '14px',
            color: '#1f1f1f',
            lineHeight: '1.6'
          }}>
            <li style={{ marginBottom: '8px' }}>
              {t('mcp.claudeStep4')}
            </li>
            <li>
              {t('mcp.claudeStep5')}
            </li>
          </ol>
        </div>
      </div>

      {/* Example Prompts */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f0f5ff',
        border: '1px solid #adc6ff',
        borderRadius: '6px'
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#1f1f1f'
        }}>
          {t('mcp.examplePromptsTitle')}
        </h5>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '13px',
          color: '#666'
        }}>
          {t('mcp.examplePromptsDescription')}
        </p>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: '#1f1f1f',
          lineHeight: '1.6'
        }}>
          <li>{t('mcp.examplePrompt1', { serviceName })}</li>
          <li>{t('mcp.examplePrompt2', { serviceName })}</li>
          <li>{t('mcp.examplePrompt3', { serviceName })}</li>
        </ul>
      </div>
    </div>
  );
}
