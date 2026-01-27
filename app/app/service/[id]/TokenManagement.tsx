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
  Empty,
  Spin,
  Card,
  Alert,
  App
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
import { useTranslation } from '@/lib/i18n';

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

interface Token {
  id: string;
  name: string;
  description?: string;
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
  const { notification } = App.useApp();
  const { t, locale } = useTranslation();
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
          notification.error({ message: t('tokens.failedToLoad') });
        }
        // Still update count to 0 on error
        if (onTokenCountChange) {
          onTokenCountChange(0);
        }
      }
    } catch (error: any) {
      // Only log unexpected errors (not 401/unauthorized)
      if (error?.status !== 401 && error?.code !== 'unauthorized') {
        notification.error({ message: t('tokens.errorLoading') });
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
          notification.info({ message: t('tokens.authAutoEnabled') });
        }
      } else {
        const error = await response.json();
        notification.error({ message: error.error || t('tokens.failedToCreate') });
      }
    } catch (error) {
      notification.error({ message: t('tokens.failedToCreate') });
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
        notification.success({ message: t('tokens.revokedSuccess') });
        await loadTokens();

        // Auto-disable token requirement when last token is deleted
        if (tokens.length === 1 && requireToken) {
          onRequireTokenChange(false);
          notification.info({ message: t('tokens.authAutoDisabled') });
        }
      } else {
        const error = await response.json();
        notification.error({ message: error.error || t('tokens.failedToRevoke') });
      }
    } catch (error) {
      notification.error({ message: t('tokens.failedToRevoke') });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notification.success({ message: t('tokens.copiedToClipboard') });
  };

  const columns = [
    {
      title: t('tokens.name'),
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
      title: t('tokens.usage'),
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number, record: Token) => {
        const lastUsedText = record.lastUsedAt
          ? t('tokens.lastUsed', { date: dayjs(record.lastUsedAt).format('YYYY-MM-DD HH:mm:ss'), ago: dayjs(record.lastUsedAt).fromNow() })
          : t('tokens.neverUsed');

        return (
          <Tooltip title={lastUsedText}>
            <Text>{t('tokens.callCount', { count: count.toLocaleString() })}</Text>
          </Tooltip>
        );
      }
    },
    {
      title: t('tokens.expires'),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => {
        if (!date) return <Text type="secondary">{t('tokens.never')}</Text>;
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
            <Text type={isExpired ? 'danger' : 'warning'}>
              {isExpired ? t('tokens.expired') : dayjs(date).fromNow()}
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
            title={t('tokens.revokeConfirmTitle')}
            description={t('tokens.revokeConfirmDesc')}
            onConfirm={() => handleDeleteToken(record.id)}
            okText={t('tokens.revoke')}
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
          <Typography.Title level={4} style={{ margin: 0 }}>{t('tokens.apiTokens')}</Typography.Title>
          <Tooltip title={isDemoMode ? t('tokens.creationDisabledDemo') : t('tokens.createNewToken')}>
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
              {t('tokens.createToken')}
            </Button>
          </Tooltip>
        </div>

        <Space orientation="vertical" style={{ width: '100%' }} size={12}>
          {/* Tokens list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '10% 20px 20px 20px' }}>
              <Spin size="default" />
            </div>
          ) : tokens.length === 0 ? (
            <Empty
              description={t('tokens.noTokensYet')}
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
                ({ en: <>To use the API with authentication, add <Text code>token=YOUR_TOKEN_VALUE</Text> to your request URL.
                    Replace YOUR_TOKEN_VALUE with the actual token you copied when creating it.
                    The test URL includes a placeholder <Text code>token</Text> parameter that you need to update with your token.</>,
                  de: <>Um die API mit Authentifizierung zu nutzen, fügen Sie <Text code>token=YOUR_TOKEN_VALUE</Text> zu Ihrer Anfrage-URL hinzu.
                    Ersetzen Sie YOUR_TOKEN_VALUE durch den tatsächlichen Token, den Sie beim Erstellen kopiert haben.
                    Die Test-URL enthält einen Platzhalter-<Text code>token</Text>-Parameter, den Sie mit Ihrem Token aktualisieren müssen.</>
                } as Record<string, React.ReactNode>)[locale] ?? <>To use the API with authentication, add <Text code>token=YOUR_TOKEN_VALUE</Text> to your request URL.
                    Replace YOUR_TOKEN_VALUE with the actual token you copied when creating it.
                    The test URL includes a placeholder <Text code>token</Text> parameter that you need to update with your token.</>
              ) : (
                ({ en: <>When you create API tokens, you&apos;ll need to add <Text code>token=YOUR_TOKEN_VALUE</Text> to your request URL
                    to authenticate your API calls. The test will automatically include the token parameter placeholder. All service requests are rate limited to 1,000 requests per minute.</>,
                  de: <>Wenn Sie API-Tokens erstellen, müssen Sie <Text code>token=YOUR_TOKEN_VALUE</Text> zu Ihrer Anfrage-URL hinzufügen,
                    um Ihre API-Aufrufe zu authentifizieren. Der Test wird automatisch den Token-Parameter-Platzhalter enthalten. Alle Service-Anfragen sind auf 1.000 Anfragen pro Minute begrenzt.</>
                } as Record<string, React.ReactNode>)[locale] ?? <>When you create API tokens, you&apos;ll need to add <Text code>token=YOUR_TOKEN_VALUE</Text> to your request URL
                    to authenticate your API calls. The test will automatically include the token parameter placeholder. All service requests are rate limited to 1,000 requests per minute.</>
              )}
            </Text>
          </div>
        </Space>
      </div>

      {/* Create token modal */}
      <Modal
        title={t('tokens.createApiToken')}
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
            label={t('tokens.tokenName')}
            rules={[{ required: true, message: t('tokens.enterTokenName') }]}
          >
            <Input
              placeholder={t('tokens.tokenNamePlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('tokens.description')}
          >
            <Input.TextArea
              placeholder={t('tokens.descriptionPlaceholder')}
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label={t('tokens.expirationOptional')}
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
              {t('tokens.createToken')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* New token display modal */}
      <Modal
        title={t('tokens.tokenCreatedSuccess')}
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
            {t('tokens.done')}
          </Button>
        ]}
      >
        {newToken && (
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Alert
              title={t('tokens.saveTokenSecurely')}
              description={t('tokens.tokenNotShownAgain')}
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
                <InfoCircleOutlined /> {t('tokens.useTokenInRequests')}
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