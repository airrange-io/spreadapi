'use client';

import React, { useState } from 'react';
import { Card, Tabs, Typography, Button, message, Space, Alert, Tag, Input } from 'antd';
import { CopyOutlined, CheckOutlined, ApiOutlined, RobotOutlined } from '@ant-design/icons';

const { Paragraph, Text, Title } = Typography;
const { TabPane } = Tabs;

interface MCPIntegrationProps {
  serviceId: string;
  serviceName?: string;
  isPublished?: boolean;
  requireToken?: boolean;
  availableTokens?: any[];
}

const MCPIntegration: React.FC<MCPIntegrationProps> = ({
  serviceId,
  serviceName = 'Service',
  isPublished = false,
  requireToken = false,
  availableTokens = []
}) => {
  const [copiedClaude, setCopiedClaude] = useState(false);
  const [copiedChatGPT, setCopiedChatGPT] = useState(false);

  // Get first available token or placeholder
  const exampleToken = availableTokens.length > 0 ? availableTokens[0].id : 'YOUR_SERVICE_TOKEN_HERE';
  const hasToken = availableTokens.length > 0;

  // Generate base URL (adjust for production)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io';
  const mcpEndpoint = `${baseUrl}/api/mcp/services/${serviceId}`;

  // Claude Desktop Configuration (npx with env vars - production approach)
  const claudeConfig = {
    mcpServers: {
      [serviceName.toLowerCase().replace(/\s+/g, '-')]: {
        command: 'npx',
        args: ['spreadapi-mcp'],
        env: {
          SPREADAPI_SERVICE_ID: serviceId,
          SPREADAPI_URL: baseUrl,
          ...(requireToken ? { SPREADAPI_TOKEN: exampleToken } : {})
        }
      }
    }
  };

  // ChatGPT Configuration (direct HTTP)
  const chatgptConfig = {
    endpoint: mcpEndpoint,
    authentication: requireToken ? {
      type: 'bearer',
      token: exampleToken
    } : null
  };

  // Copy to clipboard handler
  const copyToClipboard = async (text: string, type: 'claude' | 'chatgpt') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'claude') {
        setCopiedClaude(true);
        setTimeout(() => setCopiedClaude(false), 2000);
      } else {
        setCopiedChatGPT(true);
        setTimeout(() => setCopiedChatGPT(false), 2000);
      }
      message.success('Copied to clipboard!');
    } catch (error) {
      message.error('Failed to copy');
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        <RobotOutlined /> MCP Integration
      </Title>

      <Paragraph type="secondary">
        Connect this service to AI assistants via Model Context Protocol (MCP).
        AI assistants can directly call your service to perform calculations.
      </Paragraph>

      {!isPublished && (
        <Alert
          message="Service must be published"
          description="Publish your service before integrating with AI assistants."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {requireToken && !hasToken && (
        <Alert
          message="Service token required"
          description={
            <>
              This is a private service. Create an API token in the{' '}
              <Text strong>API Tokens</Text> section above.
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs defaultActiveKey="claude">
        {/* Claude Desktop Tab */}
        <TabPane
          tab={
            <span>
              <ApiOutlined /> Claude Desktop
            </span>
          }
          key="claude"
        >
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>1. Locate Configuration File</Text>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  macOS: <Text code>~/Library/Application Support/Claude/claude_desktop_config.json</Text>
                  <br />
                  Windows: <Text code>%APPDATA%\Claude\claude_desktop_config.json</Text>
                </Paragraph>
              </div>

              <div>
                <Text strong>2. Add This Configuration</Text>
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                      overflow: 'auto',
                      fontSize: 13,
                      lineHeight: 1.5
                    }}
                  >
                    {JSON.stringify(claudeConfig, null, 2)}
                  </pre>
                  <Button
                    type="primary"
                    icon={copiedClaude ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => copyToClipboard(JSON.stringify(claudeConfig, null, 2), 'claude')}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8
                    }}
                  >
                    {copiedClaude ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                {!hasToken && requireToken && (
                  <Alert
                    message="Replace YOUR_SERVICE_TOKEN_HERE with your actual token"
                    type="warning"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>

              <div>
                <Text strong>3. Automatic Installation</Text>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  The <Text code>spreadapi-mcp</Text> package will be automatically installed via npx when Claude Desktop starts.
                  No manual installation needed.
                </Paragraph>
              </div>

              <div>
                <Text strong>4. Restart Claude Desktop</Text>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  Close and restart Claude Desktop. The tool should appear in Claude's available tools.
                </Paragraph>
              </div>

              <div>
                <Tag color="blue">NPX Package</Tag>
                <Tag color="green">Production Ready</Tag>
              </div>
            </Space>
          </Card>
        </TabPane>

        {/* ChatGPT Tab */}
        <TabPane
          tab={
            <span>
              <RobotOutlined /> ChatGPT
            </span>
          }
          key="chatgpt"
        >
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="Single-Service MCP Connection"
                description="ChatGPT connects directly to this service via OAuth authentication."
                type="info"
                showIcon
              />

              <div>
                <Text strong>1. MCP Endpoint URL</Text>
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                      overflow: 'auto',
                      fontSize: 13
                    }}
                  >
                    {mcpEndpoint}
                  </pre>
                  <Button
                    type="primary"
                    icon={copiedChatGPT ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => copyToClipboard(mcpEndpoint, 'chatgpt')}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8
                    }}
                  >
                    {copiedChatGPT ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                  This endpoint is dedicated to this service only.
                </Paragraph>
              </div>

              {requireToken && hasToken && (
                <div>
                  <Text strong>2. Service Token (Private Service)</Text>
                  <Paragraph type="secondary" style={{ marginTop: 8 }}>
                    You'll need this token when ChatGPT prompts for authorization:
                  </Paragraph>
                  <Input.Password
                    value={exampleToken}
                    readOnly
                    addonAfter={
                      <Button
                        type="link"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(exampleToken, 'chatgpt')}
                      >
                        Copy
                      </Button>
                    }
                  />
                </div>
              )}

              {requireToken && !hasToken && (
                <Alert
                  message="Service Token Required"
                  description="This is a private service. Create a service token in the API Tokens section above before connecting to ChatGPT."
                  type="warning"
                  showIcon
                />
              )}

              <div>
                <Text strong>{requireToken && hasToken ? '3' : '2'}. Connect in ChatGPT Developer Mode</Text>
                <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                  <li>
                    <Text type="secondary">Open ChatGPT → Settings → Apps & Connectors</Text>
                  </li>
                  <li>
                    <Text type="secondary">Enable "Developer Mode" (Advanced settings)</Text>
                  </li>
                  <li>
                    <Text type="secondary">Click "Create Connector"</Text>
                  </li>
                  <li>
                    <Text type="secondary">Enter connector name: <Text strong>{serviceName}</Text></Text>
                  </li>
                  <li>
                    <Text type="secondary">Paste the MCP endpoint URL from step 1</Text>
                  </li>
                  <li>
                    <Text type="secondary">Select "OAuth" as authentication type</Text>
                  </li>
                  <li>
                    <Text type="secondary">ChatGPT will redirect to authorization page</Text>
                  </li>
                  {requireToken && (
                    <li>
                      <Text type="secondary">Paste your service token when prompted</Text>
                    </li>
                  )}
                  {!requireToken && (
                    <li>
                      <Text type="secondary">Click "Authorize" (no token needed for public services)</Text>
                    </li>
                  )}
                  <li>
                    <Text type="secondary">Connector ready! Use it in your chats</Text>
                  </li>
                </ol>
              </div>

              <div>
                <Text strong>OAuth Discovery</Text>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  ChatGPT auto-discovers OAuth settings from:
                  <br />
                  <Text code>{baseUrl}/.well-known/oauth-authorization-server</Text>
                </Paragraph>
              </div>

              <div>
                <Tag color="purple">OAuth 2.1</Tag>
                <Tag color="blue">Single-Service</Tag>
                {!requireToken && <Tag color="green">Public</Tag>}
                {requireToken && <Tag color="orange">Private</Tag>}
              </div>
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <Card style={{ marginTop: 16, background: '#fafafa' }} size="small">
        <Text strong>💡 What is MCP?</Text>
        <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
          Model Context Protocol (MCP) allows AI assistants like Claude and ChatGPT to directly
          call your calculation service. The AI can understand your service parameters,
          execute calculations, and present formatted results to users - all automatically.
        </Paragraph>
      </Card>
    </div>
  );
};

export default MCPIntegration;
