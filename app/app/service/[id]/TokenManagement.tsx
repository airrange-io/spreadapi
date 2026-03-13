import React, { useState, useEffect } from 'react';
import {
  Space,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Typography,
  Tooltip,
  Popconfirm,
  Empty,
  Spin,
  Alert,
  App
} from 'antd';
import {
  PlusOutlined,
  LockOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from '@/lib/i18n';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

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
      const response = await fetch(`/api/services/${serviceId}/tokens`);

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

        // Note: We no longer auto-enable requireToken here to avoid
        // creating a false dirty state. The setting is managed explicitly by the user.
      } else {
        if (response.status !== 401 && response.status !== 404 && !(response.status === 403 && isDemoMode)) {
          notification.error({ title: t('tokens.failedToLoad') });
        }
        if (onTokenCountChange) {
          onTokenCountChange(0);
        }
      }
    } catch (error: any) {
      if (error?.status !== 401 && error?.code !== 'unauthorized') {
        notification.error({ title: t('tokens.errorLoading') });
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
          notification.info({ title: t('tokens.authAutoEnabled') });
        }
      } else {
        const error = await response.json();
        notification.error({ title: error.error || t('tokens.failedToCreate') });
      }
    } catch (error) {
      notification.error({ title: t('tokens.failedToCreate') });
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
        notification.success({ title: t('tokens.revokedSuccess') });
        await loadTokens();

        // Auto-disable token requirement when last token is deleted
        if (tokens.length === 1 && requireToken) {
          onRequireTokenChange(false);
          notification.info({ title: t('tokens.authAutoDisabled') });
        }
      } else {
        const error = await response.json();
        notification.error({ title: error.error || t('tokens.failedToRevoke') });
      }
    } catch (error) {
      notification.error({ title: t('tokens.failedToRevoke') });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notification.success({ title: t('tokens.copiedToClipboard') });
  };

  const formatDate = (date: string) => {
    return dayjs(date).format(locale === 'de' ? 'D. MMMM YYYY' : 'MMMM D, YYYY');
  };

  return (
    <>
      <div style={{ width: '100%' }}>
        {/* Header with create button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{t('tokens.apiTokens')}</Typography.Title>
          <Tooltip title={isDemoMode ? t('tokens.creationDisabledDemo') : t('tokens.createNewToken')}>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                if (!isDemoMode) {
                  setShowCreateModal(true);
                }
              }}
              disabled={isDemoMode}
              style={{ borderRadius: 8 }}
            >
              {t('tokens.createToken')}
            </Button>
          </Tooltip>
        </div>

        {/* Tokens list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '10% 20px 20px 20px' }}>
            <Spin size="medium" />
          </div>
        ) : tokens.length === 0 ? (
          <Empty
            description={t('tokens.noTokensYet')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '20px 0' }}
          />
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              padding: '0 16px 10px',
              borderBottom: '1px solid #f0f0f0',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#aaa', textTransform: 'uppercase' }}>
                {t('tokens.name')}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#aaa', textTransform: 'uppercase' }}>
                {t('tokens.usage')}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#aaa', textTransform: 'uppercase' }}>
                {t('tokens.created')}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#aaa', textTransform: 'uppercase' }}>
                {t('tokens.expires')}
              </span>
            </div>

            {/* Token rows */}
            {tokens.map((token) => (
              <div
                key={token.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  padding: '14px 16px',
                  alignItems: 'center',
                  borderBottom: '1px solid #f8f8f8',
                }}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LockOutlined style={{ color: '#c4b5d9', fontSize: 14 }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{token.name}</span>
                </div>

                {/* Usage */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: token.usageCount > 0 ? '#9133E8' : '#aaa',
                  }} />
                  <span style={{ fontSize: 14, color: '#666' }}>
                    {token.usageCount.toLocaleString()} {t('tokens.calls')}
                  </span>
                </div>

                {/* Created */}
                <span style={{ fontSize: 14, color: '#666' }}>
                  {formatDate(token.createdAt)}
                </span>

                {/* Expiry */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: token.expiresAt && dayjs(token.expiresAt).isBefore(dayjs()) ? '#ff4d4f' : '#aaa', fontStyle: !token.expiresAt ? 'italic' : 'normal' }}>
                    {token.expiresAt
                      ? (dayjs(token.expiresAt).isBefore(dayjs())
                        ? t('tokens.expired')
                        : formatDate(token.expiresAt))
                      : t('tokens.never')
                    }
                  </span>
                  {!isDemoMode && (
                    <Popconfirm
                      title={t('tokens.revokeConfirmTitle')}
                      description={t('tokens.revokeConfirmDesc')}
                      onConfirm={() => handleDeleteToken(token.id)}
                      okText={t('tokens.revoke')}
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        style={{ opacity: 0.5 }}
                      />
                    </Popconfirm>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info text */}
        <div style={{
          marginTop: 24,
          padding: '14px 16px',
          background: '#fafafa',
          borderRadius: 10,
          border: '1px solid #f0f0f0',
        }}>
          <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: '#c4b5d9' }} />
            {tokens.length > 0 ? (
              ({
                en: <>Add <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>token=YOUR_TOKEN_VALUE</span> to your request URL. Replace the placeholder with the token you copied when creating it. Requests are limited to <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>1,000 / minute</span>.</>,
                de: <>Fügen Sie <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>token=YOUR_TOKEN_VALUE</span> zu Ihrer Anfrage-URL hinzu. Ersetzen Sie den Platzhalter durch den Token, den Sie beim Erstellen kopiert haben. Anfragen sind auf <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>1.000 / Minute</span> begrenzt.</>
              } as Record<string, React.ReactNode>)[locale] ?? <>Add <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>token=YOUR_TOKEN_VALUE</span> to your request URL. Replace the placeholder with the token you copied when creating it. Requests are limited to <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>1,000 / minute</span>.</>
            ) : (
              ({
                en: <>When you create API tokens, add <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>token=YOUR_TOKEN_VALUE</span> to your request URL to authenticate. Requests are limited to <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>1,000 / minute</span>.</>,
                de: <>Wenn Sie API-Tokens erstellen, fügen Sie <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>token=YOUR_TOKEN_VALUE</span> zu Ihrer Anfrage-URL hinzu. Anfragen sind auf <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>1.000 / Minute</span> begrenzt.</>
              } as Record<string, React.ReactNode>)[locale] ?? <>When you create API tokens, add <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>token=YOUR_TOKEN_VALUE</span> to your request URL to authenticate. Requests are limited to <span style={{ background: '#F0EEFF', color: '#7B3AED', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>1,000 / minute</span>.</>
            )}
          </Text>
        </div>
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
