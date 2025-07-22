'use client';

import { useState, useEffect } from 'react';
import { 
  Button, Input, Card, Alert, Typography, Space, message, 
  Tag, Divider, Tooltip, List, Modal, Spin, App
} from 'antd';
import { 
  CopyOutlined, CheckCircleOutlined, ApiOutlined, PlusOutlined, 
  LockOutlined, DeleteOutlined, CalendarOutlined, BarChartOutlined,
  InfoCircleOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { observer } from 'mobx-react-lite';

const { Title, Text, Paragraph } = Typography;

const MCPSettingsPage = observer(() => {
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [newToken, setNewToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingTokens, setExistingTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const router = useRouter();
  const appStore = useAppStore();
  const { message: messageApi } = App.useApp();

  useEffect(() => {
    if (appStore.authChecked && appStore.user.isRegistered) {
      loadTokens();
    }
  }, [appStore.authChecked, appStore.user.isRegistered]);

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

  const generateToken = async () => {
    if (!tokenName.trim()) {
      messageApi.warning('Please enter a token name');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/mcp/tokens/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: tokenName.trim(),
          description: tokenDescription.trim()
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate token');
      }
      
      const data = await res.json();
      setNewToken(data.token);
      setTokenName('');
      setTokenDescription('');
      messageApi.success('Token generated successfully');
      
      // Refresh token list
      await loadTokens();
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

  // Use state to avoid hydration mismatch
  const [mcpUrl, setMcpUrl] = useState('/api/mcp/v1');
  
  useEffect(() => {
    // Update URL after component mounts (client-side only)
    setMcpUrl(`${window.location.origin}/api/mcp/v1`);
  }, []);

  // For now, we'll skip authentication check since Hanko will be added later
  // if (!appStore.authChecked || !appStore.user.isRegistered) {
  //   return (
  //     <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
  //       <Alert
  //         message="Authentication Required"
  //         description="Please sign in to manage MCP tokens"
  //         type="warning"
  //         showIcon
  //       />
  //     </div>
  //   );
  // }

  return (
    <App>
      <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/')}
            style={{ marginBottom: 16 }}
          >
            Back to Services
          </Button>
          
          <Title level={2}>
            <ApiOutlined /> MCP Integration
          </Title>
          <Paragraph>
            Create secure tokens for AI assistants like Claude to access your spreadsheet calculations.
          </Paragraph>
        </div>

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
          {!newToken ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Token Name *</Text>
                <Input
                  placeholder="e.g., Claude Assistant, My AI Bot"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  maxLength={100}
                  style={{ marginBottom: 16 }}
                />
                
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Description (optional)</Text>
                <Input.TextArea
                  placeholder="What will this token be used for?"
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  rows={2}
                  maxLength={500}
                />
              </div>

              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={generateToken}
                loading={loading}
                block
                size="large"
              >
                Generate Token
              </Button>
            </Space>
          ) : (
            <Alert
              message="Token Generated Successfully!"
              description={
                <div>
                  <Paragraph>
                    <strong>Important:</strong> Copy this token now. For security reasons, it won't be shown again.
                  </Paragraph>
                  <div style={{ 
                    padding: 12, 
                    background: '#f5f5f5', 
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    wordBreak: 'break-all',
                    marginBottom: 16
                  }}>
                    {newToken}
                  </div>
                  <Space>
                    <Button 
                      type="primary"
                      icon={<CopyOutlined />} 
                      onClick={() => copyToClipboard(newToken)}
                    >
                      Copy Token
                    </Button>
                    <Button 
                      onClick={() => setNewToken('')}
                    >
                      Create Another
                    </Button>
                  </Space>
                </div>
              }
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          )}
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
                    <Tooltip title="Revoke this token">
                      <Button 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => setShowDeleteConfirm(token.fullToken)}
                      >
                        Revoke
                      </Button>
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{token.name}</Text>
                        <Tag color="blue">{token.token}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        {token.description && (
                          <Text type="secondary">{token.description}</Text>
                        )}
                        <Space split={<Divider type="vertical" />}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <CalendarOutlined /> Created: {new Date(token.created).toLocaleDateString()}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Last used: {token.lastUsed ? new Date(token.lastUsed).toLocaleDateString() : 'Never'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <BarChartOutlined /> {token.requests} requests
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Integration Instructions */}
        <Card title="How to Connect Claude Desktop" style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>1. Install the Bridge</Title>
              <Paragraph>
                First, install the SpreadAPI MCP bridge on your computer:
              </Paragraph>
              <pre style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 13
              }}>
                npm install -g spreadapi-mcp
              </pre>
            </div>

            <div>
              <Title level={5}>2. Configure Claude Desktop</Title>
              <Paragraph>
                Add this configuration to your Claude Desktop config file:
              </Paragraph>
              
              <Alert
                message={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text>
                      <strong>Mac:</strong> <Text code>~/Library/Application Support/Claude/claude_desktop_config.json</Text>
                    </Text>
                    <Text>
                      <strong>Windows:</strong> <Text code>%APPDATA%\Claude\claude_desktop_config.json</Text>
                    </Text>
                  </Space>
                }
                type="info"
                style={{ marginBottom: 16 }}
              />
              
              <div style={{ position: 'relative' }}>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(JSON.stringify({
                    mcpServers: {
                      spreadapi: {
                        command: "npx",
                        args: ["spreadapi-mcp"],
                        env: {
                          SPREADAPI_URL: mcpUrl,
                          SPREADAPI_TOKEN: newToken || "YOUR_TOKEN_HERE"
                        }
                      }
                    }
                  }, null, 2))}
                  style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                >
                  Copy
                </Button>
                <pre style={{
                  background: '#f5f5f5',
                  padding: 12,
                  paddingTop: 40,
                  borderRadius: 4,
                  fontSize: 12,
                  overflow: 'auto'
                }}>
{`{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "${mcpUrl}",
        "SPREADAPI_TOKEN": "${newToken || 'YOUR_TOKEN_HERE'}"
      }
    }
  }
}`}
                </pre>
              </div>
            </div>

            <div>
              <Title level={5}>3. Restart Claude Desktop</Title>
              <Paragraph>
                After saving the configuration, restart Claude Desktop. You should now be able to use SpreadAPI calculations in your conversations!
              </Paragraph>
            </div>
          </Space>
        </Card>

        {/* Available Services Info */}
        <Card title="What Can Claude Access?">
          <Paragraph>
            With a valid token, AI assistants can:
          </Paragraph>
          <ul>
            <li>Browse all your published spreadsheet services</li>
            <li>See parameter descriptions and constraints</li>
            <li>Execute calculations with provided inputs</li>
            <li>Get formatted results with explanations</li>
          </ul>
          <Paragraph type="secondary">
            <InfoCircleOutlined /> AI assistants cannot modify, delete, or create services. They have read-only access to execute calculations.
          </Paragraph>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Revoke Token"
          open={!!showDeleteConfirm}
          onOk={() => showDeleteConfirm && deleteToken(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          okText="Revoke"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to revoke this token? This action cannot be undone.</p>
          <p>Any applications using this token will immediately lose access.</p>
        </Modal>
      </div>
    </App>
  );
});

export default MCPSettingsPage;