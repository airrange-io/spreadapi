import React, { useState, useEffect } from 'react';
import {
  Space,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Empty,
  Spin,
  Card,
  Alert
} from 'antd';
import {
  PlusOutlined,
  KeyOutlined,
  CopyOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

interface Token {
  id: string;
  name: string;
  description?: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  usageCount: number;
  token?: string; // Only present when first created
}

interface TokenManagementProps {
  serviceId: string;
  requireToken: boolean;
  isDemoMode?: boolean;
  onRequireTokenChange: (require: boolean) => void;
  onTokenCountChange?: (count: number) => void;
  onTokensChange?: (tokens: Token[]) => void;
}

const TokenManagement = React.forwardRef<{ refreshTokens: () => Promise<void> }, TokenManagementProps>(function TokenManagement({ serviceId, requireToken, isDemoMode, onRequireTokenChange, onTokenCountChange, onTokensChange }, ref) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newToken, setNewToken] = useState<Token | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Expose refresh method to parent components
  React.useImperativeHandle(ref, () => ({
    refreshTokens: loadTokens
  }), [serviceId]);

  // Load tokens on mount and when component becomes visible
  useEffect(() => {
    // Only load if we haven't loaded before or if serviceId changes
    if (!hasLoadedOnce || !tokens.length) {
      loadTokens();
    }
  }, [serviceId]);

  // Refresh token stats periodically when visible
  useEffect(() => {
    if (!hasLoadedOnce) return;

    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(() => {
      loadTokens();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [hasLoadedOnce, serviceId]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const startTime = performance.now();
      const response = await fetch(`/api/services/${serviceId}/tokens`);
      const endTime = performance.now();

      if (response.ok) {
        const data = await response.json();
        const tokenList = data.tokens || [];
        setTokens(tokenList);
        setHasLoadedOnce(true);
        if (onTokensChange) {
          onTokensChange(tokenList);
        }

        // Update token count
        if (onTokenCountChange) {
          onTokenCountChange(tokenList.length);
        }

        // Auto-enable token requirement if tokens exist
        if (tokenList.length > 0 && !requireToken) {
          onRequireTokenChange(true);
        }
      } else {
        // Handle 401 as expected - user not authenticated
        // Handle 403 for demo mode as expected
        // Handle 404 for new services that don't exist yet
        if (response.status !== 401 && response.status !== 404 && !(response.status === 403 && isDemoMode)) {
          message.error('Failed to load tokens');
        }
        // Still update count to 0 on error
        if (onTokenCountChange) {
          onTokenCountChange(0);
        }
      }
    } catch (error: any) {
      // Only log unexpected errors (not 401/unauthorized)
      if (error?.status !== 401 && error?.code !== 'unauthorized') {
        message.error('Error loading tokens');
      }
      if (onTokenCountChange) {
        onTokenCountChange(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async (values: any) => {
    setCreating(true);
    try {
      const response = await fetch(`/api/services/${serviceId}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          scopes: values.scopes || ['read'],
          expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNewToken(data);
        setShowCreateModal(false);
        setShowTokenModal(true);
        form.resetFields();
        await loadTokens();

        // Auto-enable token requirement when first token is created
        if (tokens.length === 0 && !requireToken) {
          onRequireTokenChange(true);
          message.info('Token authentication has been automatically enabled');
        }
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to create token');
      }
    } catch (error) {
      message.error('Failed to create token');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}/tokens/${tokenId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('Token revoked successfully');
        await loadTokens();

        // Auto-disable token requirement when last token is deleted
        if (tokens.length === 1 && requireToken) {
          onRequireTokenChange(false);
          message.info('Token authentication has been automatically disabled as no tokens remain');
        }
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to revoke token');
      }
    } catch (error) {
      message.error('Failed to revoke token');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (name: string) => (
        <Space>
          <KeyOutlined style={{ color: '#1890ff' }} />
          <Text strong>{name}</Text>
        </Space>
      )
    },
    {
      title: 'Scopes',
      dataIndex: 'scopes',
      key: 'scopes',
      render: (scopes: string[]) => {
        const scopeLabels: Record<string, { label: string; color: string }> = {
          execute: { label: 'Execute API', color: 'green' },
          mcp: { label: 'MCP Access', color: 'purple' },
          '*': { label: 'All Permissions', color: 'red' }
        };

        return (
          <Space>
            {scopes.map(scope => {
              const scopeInfo = scopeLabels[scope] || { label: scope, color: 'default' };
              return (
                <Tag key={scope} color={scopeInfo.color}>
                  {scopeInfo.label}
                </Tag>
              );
            })}
          </Space>
        );
      }
    },
    {
      title: 'Usage',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number, record: Token) => {
        const lastUsedText = record.lastUsedAt 
          ? `Last used: ${dayjs(record.lastUsedAt).format('YYYY-MM-DD HH:mm:ss')} (${dayjs(record.lastUsedAt).fromNow()})`
          : 'Never used';
        
        return (
          <Tooltip title={lastUsedText}>
            <Text>{count.toLocaleString()} calls</Text>
          </Tooltip>
        );
      }
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => {
        if (!date) return <Text type="secondary">Never</Text>;
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
            <Text type={isExpired ? 'danger' : 'warning'}>
              {isExpired ? 'Expired' : dayjs(date).fromNow()}
            </Text>
          </Tooltip>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: Token) => (
        isDemoMode ? null : (
          <Popconfirm
            title="Revoke this token?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteToken(record.id)}
            okText="Revoke"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        )
      )
    }
  ];

  return (
    <>
      <div style={{ width: '100%' }}>
        {/* Header with create button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Typography.Title level={4} style={{ margin: 0 }}>API Tokens</Typography.Title>
          <Tooltip title={isDemoMode ? "Token creation is disabled in demo mode" : "Create new API token"}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                if (!isDemoMode) {
                  setShowCreateModal(true);
                }
              }}
              disabled={isDemoMode}
            >
              Create Token
            </Button>
          </Tooltip>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          {/* Tokens list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', paddingTop: '10%' }}>
              <Spin size="default" />
            </div>
          ) : tokens.length === 0 ? (
            <Empty
              description="No tokens created yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '20px 0' }}
            />
          ) : (
            <div style={{
              maxHeight: '300px',
              overflow: 'auto',
              border: '1px solid #e8e8e8',
              borderRadius: 4
            }}>
              <Table
                columns={columns}
                dataSource={tokens}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: 250 }}
              />
            </div>
          )}

          {/* Info text about token usage */}
          <div style={{
            marginTop: 16,
            padding: '12px',
            // background: '#f5f5f5', 
            borderRadius: 4
          }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              {tokens.length > 0 ? (
                <>To use the API with authentication, add <Text code>token=YOUR_TOKEN_VALUE</Text> to your request URL.
                  Replace YOUR_TOKEN_VALUE with the actual token you copied when creating it.
                  The test URL includes a placeholder <Text code>token</Text> parameter that you need to update with your token.</>
              ) : (
                <>When you create API tokens, you'll need to add <Text code>token=YOUR_TOKEN_VALUE</Text> to your request URL
                  to authenticate your API calls. The test will automatically include the token parameter placeholder.</>
              )}
            </Text>
          </div>
        </Space>
      </div>

      {/* Create token modal */}
      <Modal
        title="Create API Token"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateToken}
        >
          <Form.Item
            name="name"
            label="Token Name"
            rules={[{ required: true, message: 'Please enter a token name' }]}
          >
            <Input
              placeholder="e.g., Production API Key"
              prefix={<KeyOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              placeholder="Optional description for this token"
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="scopes"
            label="Permissions"
            initialValue={['execute']}
          >
            <Select
              mode="multiple"
              placeholder="Select token permissions"
              options={[
                { label: 'Execute API', value: 'execute', description: 'Can call the service and get results' },
                { label: 'MCP Access', value: 'mcp', description: 'For MCP client connections (future)' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="Expiration (Optional)"
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              block
            >
              Create Token
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* New token display modal */}
      <Modal
        title="Token Created Successfully"
        open={showTokenModal}
        onCancel={() => {
          setShowTokenModal(false);
          setNewToken(null);
        }}
        centered
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setShowTokenModal(false);
              setNewToken(null);
            }}
          >
            Done
          </Button>
        ]}
      >
        {newToken && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Save this token securely"
              description="This token will not be shown again. Copy it now and store it in a safe place."
              type="warning"
              showIcon
            />

            <div style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontFamily: 'monospace'
            }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text code copyable>{newToken.token}</Text>
              </Space>
            </div>

            <div>
              <Text type="secondary">
                <InfoCircleOutlined /> Use this token in your API requests:
              </Text>
              <Paragraph
                code
                copyable
                style={{ marginTop: 8 }}
              >
                {`curl -H "Authorization: Bearer ${newToken.token}" https://spreadapi.io/api/v1/services/${serviceId}/execute`}
              </Paragraph>
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
});

export default React.memo(TokenManagement);