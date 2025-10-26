'use client';

import React, { useState } from 'react';

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
          MCP Integration
        </h3>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#666'
        }}>
          Connect this service to AI assistants via the Model Context Protocol
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
          MCP Endpoint URL
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
              borderRadius: '4px',
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
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            {copiedItem === 'url' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '12px',
          color: '#999'
        }}>
          This is your service-specific MCP endpoint. Use this URL to connect ChatGPT or Claude Desktop to this service.
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
          For ChatGPT
        </h4>

        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
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
              Open ChatGPT Settings (click your profile icon)
            </li>
            <li style={{ marginBottom: '8px' }}>
              Navigate to <strong>Apps and Connectors</strong> (or "Apps und Konnektoren")
            </li>
            <li style={{ marginBottom: '8px' }}>
              Click <strong>Create</strong> button to add a new connector
            </li>
            <li style={{ marginBottom: '8px' }}>
              In the "MCP Server URL" field, paste:
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                {mcpUrl}
              </div>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Select <strong>OAuth</strong> as authentication method
            </li>
            <li style={{ marginBottom: '8px' }}>
              Click <strong>Create</strong> - ChatGPT will initiate the OAuth flow
            </li>
            {needsToken && (
              <li style={{ marginBottom: '8px' }}>
                When prompted during OAuth, enter your service token from the "API Tokens" section above
              </li>
            )}
            <li>
              Your service will appear in the connectors list - start using it in any chat!
            </li>
          </ol>

          {!needsToken && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#0050b3'
            }}>
              ℹ️ This is a public service - no token required for ChatGPT integration
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
          For Claude Desktop
        </h4>

        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
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
              Open Claude Desktop settings
            </li>
            <li style={{ marginBottom: '8px' }}>
              Navigate to the MCP configuration file:
              <ul style={{ marginTop: '4px', paddingLeft: '20px', fontSize: '12px' }}>
                <li>macOS: <code style={{
                  backgroundColor: '#fff',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}>~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                <li>Windows: <code style={{
                  backgroundColor: '#fff',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}>%APPDATA%\Claude\claude_desktop_config.json</code></li>
              </ul>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Add this configuration:
            </li>
          </ol>

          <div style={{ position: 'relative' }}>
            <pre style={{
              margin: '0 0 8px 0',
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
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
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {copiedItem === 'claude-config' ? '✓ Copied Configuration' : 'Copy Configuration'}
            </button>
          </div>

          {needsToken && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#ad6800'
            }}>
              ⚠️ Replace <code style={{
                backgroundColor: '#fff',
                padding: '2px 4px',
                borderRadius: '2px',
                fontFamily: 'monospace'
              }}>your_service_token_here</code> with your actual service token from the "API Tokens" section above
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
              Restart Claude Desktop
            </li>
            <li>
              Your service will appear in the MCP menu
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
        borderRadius: '4px'
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#1f1f1f'
        }}>
          💡 Example Prompts
        </h5>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '13px',
          color: '#666'
        }}>
          Once connected, try asking your AI assistant:
        </p>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: '#1f1f1f',
          lineHeight: '1.6'
        }}>
          <li>"What parameters does {serviceName} need?"</li>
          <li>"Calculate with {serviceName} using [your values]"</li>
          <li>"Compare 3 scenarios using {serviceName}"</li>
        </ul>
      </div>
    </div>
  );
}
