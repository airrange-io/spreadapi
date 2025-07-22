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
  onRequireTokenChange: (require: boolean) => void;
  onTokenCountChange?: (count: number) => void;
  onTokensChange?: (tokens: Token[]) => void;
}

const TokenManagement = React.memo(function TokenManagement({ serviceId, requireToken, onRequireTokenChange, onTokenCountChange, onTokensChange }: TokenManagementProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newToken, setNewToken] = useState<Token | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load tokens on mount and when component becomes visible
  useEffect(() => {
    // Only load if we haven't loaded before or if serviceId changes
    if (!hasLoadedOnce || !tokens.length) {
      loadTokens();
    }
  }, [serviceId]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const startTime = performance.now();
      const response = await fetch(`/api/services/${serviceId}/tokens`);
      const endTime = performance.now();
      console.log(`[TokenManagement] API call took ${endTime - startTime}ms`);
      
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
        console.error('Failed to load tokens');
        message.error('Failed to load tokens');
        // Still update count to 0 on error
        if (onTokenCountChange) {
          onTokenCountChange(0);
        }
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      message.error('Error loading tokens');
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
      console.error('Error creating token:', error);
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
      console.error('Error deleting token:', error);
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
      render: (count: number) => (
        <Text>{count.toLocaleString()} calls</Text>
      )
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (date: string) => date ? (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type="secondary">{dayjs(date).fromNow()}</Text>
        </Tooltip>
      ) : (
        <Text type="secondary">Never</Text>
      )
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Token) => (
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
          >
            Revoke
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      gap: '12px'
    }}>
      {/* Token requirement toggle */}
      {/* {tokens.length === 0 ? (
        <Alert
          description="Create your first API token to enable authentication. Token authentication will be automatically enabled when you create your first token."
          type="info"
          style={{ padding: '14px 18px', borderColor: "#ffffff" }}
        />
      ) : (
        <Alert
          message={
            <Space>
              <Text>Token authentication is</Text>
              <Text strong type="success">ENABLED</Text>
              <Text type="secondary">({tokens.length} active {tokens.length === 1 ? 'token' : 'tokens'})</Text>
            </Space>
          }
          description={requireToken ?
            "API calls must include a valid token. Authentication will be automatically disabled if all tokens are removed." :
            "Authentication is disabled but tokens exist. Enable it to require tokens for API access."
          }
          type={requireToken ? 'success' : 'warning'}
          showIcon
          action={!requireToken && tokens.length > 0 ? (
            <Button
              size="small"
              type="primary"
              onClick={() => onRequireTokenChange(true)}
            >
              Enable Authentication
            </Button>
          ) : undefined}
        />
      )} */}

      {/* Tokens table */}
      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
        styles={{
          body: {
            padding: 16,
            backgroundColor: '#f2f2f2',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }
        }}
      >
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0, color: '#898989' }}>API Tokens</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Token
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : tokens.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Empty
              description="No tokens created yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0
          }}>
            <Table
              columns={columns}
              dataSource={tokens}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 'calc(100vh - 450px)' }}
              sticky
            />
          </div>
        )}
      </Card>

      {/* Create token modal */}
      <Modal
        title="Create API Token"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        footer={null}
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
                {`curl -H "Authorization: Bearer ${newToken.token}" https://spreadapi.io/api/getresults?api=${serviceId}`}
              </Paragraph>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
});

export default TokenManagement;