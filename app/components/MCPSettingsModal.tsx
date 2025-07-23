'use client';

import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Input, Card, Alert, Typography, Space, 
  Tag, Divider, Tooltip, List, Spin, App, Checkbox
} from 'antd';
import { 
  CopyOutlined, CheckCircleOutlined, ApiOutlined, PlusOutlined, 
  LockOutlined, DeleteOutlined, CalendarOutlined, BarChartOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';

const { Title, Text, Paragraph } = Typography;

interface MCPSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const MCPSettingsModal: React.FC<MCPSettingsModalProps> = observer(({ visible, onClose }) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingTokens, setExistingTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  
  const { message: messageApi } = App.useApp();

  useEffect(() => {
    if (visible) {
      loadTokens();
      loadServices();
    }
  }, [visible]);

  const loadTokens = async () => {
    setLoadingTokens(true);
    try {
      const res = await fetch('/api/mcp/tokens');
      if (res.ok) {
        const data = await res.json();
        setExistingTokens(data.tokens || []);
      }
    } catch (error) {
      messageApi.error('Failed to load tokens');
    } finally {
      setLoadingTokens(false);
    }
  };

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        console.log('Loaded services:', data.services);
        const publishedServices = (data.services || []).filter(s => s.status === 'published');
        console.log('Published services:', publishedServices);
        setAvailableServices(publishedServices);
        setSelectedServiceIds(publishedServices.map(s => s.id));
      }
    } catch (error) {
      console.error('Error loading services:', error);
      messageApi.error('Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const generateToken = async () => {
    if (!tokenName.trim()) {
      messageApi.warning('Please enter a token name');
      return;
    }

    if (selectedServiceIds.length === 0) {
      messageApi.warning('Please select at least one service');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/mcp/tokens/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tokenName,
          description: tokenDescription,
          serviceIds: selectedServiceIds
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedToken(data.token);
        setTokenName('');
        setTokenDescription('');
        messageApi.success('Token generated successfully');
        await loadTokens();
      } else {
        throw new Error('Failed to generate token');
      }
    } catch (err: any) {
      messageApi.error(err.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const deleteToken = async (token: string) => {
    try {
      const res = await fetch(`/api/mcp/tokens/${token}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        messageApi.success('Token revoked successfully');
        await loadTokens();
      } else {
        throw new Error('Failed to revoke token');
      }
    } catch (error) {
      messageApi.error('Failed to revoke token');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    messageApi.success('Copied to clipboard');
  };

  const [mcpUrl, setMcpUrl] = useState('/api/mcp');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMcpUrl(`${window.location.origin}/api/mcp`);
    }
  }, [visible]);

  return (
    <Modal
      title={
        <Space>
          <ApiOutlined />
          <span>MCP Integration</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      centered
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' }
      }}
    >
      <Paragraph>
        Create secure tokens for AI assistants like Claude to access your spreadsheet calculations.
      </Paragraph>

      {/* Token Generation */}
      <Card 
        title={
          <Space>
            <LockOutlined />
            <span>Generate API Token</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Token Name</Text>
            <Input
              placeholder="e.g., Claude Desktop"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>Description (Optional)</Text>
            <Input.TextArea
              placeholder="What is this token used for?"
              value={tokenDescription}
              onChange={(e) => setTokenDescription(e.target.value)}
              rows={2}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>Service Access</Text>
            <div style={{ marginTop: 8 }}>
              {loadingServices ? (
                <Spin size="small" />
              ) : availableServices.length === 0 ? (
                <Alert
                  message="No published services"
                  description="Publish a service first to create MCP tokens"
                  type="info"
                />
              ) : (
                <Checkbox.Group
                  value={selectedServiceIds}
                  onChange={setSelectedServiceIds}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {availableServices.map(service => (
                      <Checkbox key={service.id} value={service.id}>
                        <Space>
                          <Text strong>{service.name}</Text>
                          {service.description && (
                            <Text type="secondary">- {service.description}</Text>
                          )}
                        </Space>
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
            </div>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={generateToken}
            loading={loading}
            disabled={!tokenName || selectedServiceIds.length === 0}
            block
          >
            Generate Token
          </Button>

          {generatedToken && (
            <Alert
              message="Token Generated Successfully!"
              description={
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <Text strong>Your API Token:</Text>
                    <Input.Search
                      value={generatedToken}
                      readOnly
                      enterButton={<CopyOutlined />}
                      onSearch={() => copyToClipboard(generatedToken)}
                      style={{ marginTop: 8 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                      Save this token - it won't be shown again!
                    </Text>
                  </div>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <div>
                    <Text strong>Quick Setup for Claude Desktop:</Text>
                    <Text style={{ display: 'block', marginTop: 8, marginBottom: 8 }}>
                      Add this to your Claude Desktop config file:
                    </Text>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: 12, 
                      borderRadius: 4,
                      overflow: 'auto',
                      position: 'relative'
                    }}>
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(JSON.stringify({
                          mcpServers: {
                            spreadapi: {
                              command: "npx",
                              args: ["spreadapi-mcp"],
                              env: {
                                SPREADAPI_URL: `${mcpUrl}/v1`,
                                SPREADAPI_TOKEN: generatedToken
                              }
                            }
                          }
                        }, null, 2))}
                        style={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        Copy
                      </Button>
{`{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "${mcpUrl}/v1",
        "SPREADAPI_TOKEN": "${generatedToken}"
      }
    }
  }
}`}
                    </pre>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Config location: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
                    </Text>
                  </div>
                </Space>
              }
              type="success"
              showIcon
              closable
              onClose={() => setGeneratedToken(null)}
              style={{ marginTop: 16 }}
            />
          )}
        </Space>
      </Card>

      {/* Existing Tokens */}
      <Card 
        title="Your API Tokens"
        style={{ marginBottom: 24 }}
        extra={
          <Button onClick={loadTokens} size="small" loading={loadingTokens}>
            Refresh
          </Button>
        }
      >
        {loadingTokens ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : existingTokens.length === 0 ? (
          <Alert
            message="No tokens yet"
            description="Generate your first token above to get started"
            type="info"
          />
        ) : (
          <List
            dataSource={existingTokens}
            renderItem={(token) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setShowDeleteConfirm(token.id)}
                  >
                    Revoke
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{token.name}</Text>
                      <Tag color="green">Active</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      {token.description && <Text>{token.description}</Text>}
                      <Space size="small" style={{ fontSize: 12 }}>
                        <CalendarOutlined />
                        <Text type="secondary">Created {new Date(token.createdAt).toLocaleDateString()}</Text>
                        {token.lastUsedAt && (
                          <>
                            <Divider type="vertical" />
                            <Text type="secondary">Last used {new Date(token.lastUsedAt).toLocaleDateString()}</Text>
                          </>
                        )}
                      </Space>
                      {token.serviceIds && token.serviceIds.length > 0 && (
                        <Space size="small" wrap>
                          <Text type="secondary" style={{ fontSize: 12 }}>Services:</Text>
                          {token.serviceIds.map(serviceId => {
                            const service = availableServices.find(s => s.id === serviceId);
                            return service ? (
                              <Tag key={serviceId} style={{ fontSize: 11 }}>
                                {service.name}
                              </Tag>
                            ) : null;
                          })}
                        </Space>
                      )}
                    </Space>
                  }
                />
                <Modal
                  title="Confirm Token Revocation"
                  open={showDeleteConfirm === token.id}
                  onOk={() => deleteToken(token.id)}
                  onCancel={() => setShowDeleteConfirm(null)}
                  okText="Revoke"
                  okButtonProps={{ danger: true }}
                >
                  <p>Are you sure you want to revoke the token "{token.name}"?</p>
                  <p>This action cannot be undone and any applications using this token will stop working.</p>
                </Modal>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Configuration Guide */}
      <Card 
        title="How to Connect Claude Desktop"
        extra={
          <Button
            size="small"
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? 'Hide' : 'Show'} Instructions
          </Button>
        }
      >
        {showConfig && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Step 1 */}
            <div>
              <Title level={5}>Step 1: Generate an API Token</Title>
              <Text>Create a token above with access to your published services.</Text>
            </div>

            {/* Step 2 */}
            <div>
              <Title level={5}>Step 2: Configure Claude Desktop</Title>
              <Text>Choose one of the following methods:</Text>
            </div>

            {/* Method 1: Bridge/stdio */}
            <div style={{ marginTop: 16 }}>
              <Title level={5} style={{ marginBottom: 8 }}>Method 1: Bridge Package (Recommended)</Title>
              <Text>Install and configure the SpreadAPI MCP bridge:</Text>
              
              <Text strong style={{ display: 'block', marginTop: 12 }}>First, install the bridge package:</Text>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4,
                marginTop: 8,
                overflow: 'auto'
              }}>
{`npm install -g spreadapi-mcp`}
              </pre>
              
              <Text strong style={{ display: 'block', marginTop: 16 }}>Then add this to your Claude Desktop config:</Text>
              
              <Alert
                style={{ marginTop: 12, marginBottom: 12 }}
                message="Config file location"
                description={
                  <Space direction="vertical" size="small">
                    <Text><strong>macOS:</strong> ~/Library/Application Support/Claude/claude_desktop_config.json</Text>
                    <Text><strong>Windows:</strong> %APPDATA%\Claude\claude_desktop_config.json</Text>
                    <Text><strong>Linux:</strong> ~/.config/Claude/claude_desktop_config.json</Text>
                  </Space>
                }
                type="info"
              />

              <Text>Add this to your config file (merge with existing mcpServers if any):</Text>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4,
                overflow: 'auto',
                marginTop: 12 
              }}>
{`{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "${mcpUrl}/v1",
        "SPREADAPI_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}`}
              </pre>
              
              <Space style={{ marginTop: 12 }} wrap>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(JSON.stringify({
                    mcpServers: {
                      spreadapi: {
                        command: "npx",
                        args: ["spreadapi-mcp"],
                        env: {
                          SPREADAPI_URL: `${mcpUrl}/v1`,
                          SPREADAPI_TOKEN: "YOUR_TOKEN_HERE"
                        }
                      }
                    }
                  }, null, 2))}
                >
                  Copy Config
                </Button>
              </Space>
              
              <Alert
                style={{ marginTop: 12 }}
                message="Important"
                description="Replace YOUR_TOKEN_HERE with the actual token you generated in Step 1"
                type="warning"
              />
            </div>

            {/* Method 2: Direct HTTP (Currently not supported) */}
            <div style={{ marginTop: 24 }}>
              <Title level={5} style={{ marginBottom: 8 }}>Method 2: Direct HTTP Connection</Title>
              <Alert
                message="Not Currently Supported"
                description="Direct HTTP connections require server-side CORS and MCP protocol support. Please use the bridge method above."
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
              />
            </div>

            {/* Step 3 */}
            <div>
              <Title level={5}>Step 3: Restart Claude Desktop</Title>
              <Text>After configuring, restart Claude Desktop for the changes to take effect.</Text>
            </div>

            {/* Step 4 */}
            <div>
              <Title level={5}>Step 4: Verify Connection</Title>
              <Text>In Claude Desktop, you should now be able to:</Text>
              <ul style={{ marginTop: 8 }}>
                <li>Ask Claude to list available SpreadAPI tools</li>
                <li>Use your spreadsheet calculations by referencing your service names</li>
                <li>Example: "Calculate mortgage payment using my mortgage calculator"</li>
              </ul>
            </div>

            {/* Troubleshooting */}
            <Divider />
            <div>
              <Title level={5}>Troubleshooting</Title>
              <Space direction="vertical" size="small">
                <Text>• <strong>No tools showing:</strong> Check that your services are published and the token has access to them</Text>
                <Text>• <strong>Authentication errors:</strong> Verify your token is correctly copied in the config</Text>
                <Text>• <strong>Connection issues:</strong> Ensure Claude Desktop has internet access and can reach {new URL(mcpUrl).hostname}</Text>
              </Space>
            </div>
          </Space>
        )}
      </Card>
    </Modal>
  );
});

export default MCPSettingsModal;