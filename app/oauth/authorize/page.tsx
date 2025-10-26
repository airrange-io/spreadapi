'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Input, Alert, Space, Typography, Spin } from 'antd';
import { LockOutlined, CheckCircleOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * OAuth Authorization Content Component
 * Simplified token-based authorization (no login required)
 */
function OAuthAuthorizeContent() {
  const searchParams = useSearchParams();

  // OAuth parameters from ChatGPT
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope') || 'mcp:read mcp:write';
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const responseType = searchParams.get('response_type');

  // Extract service_id from state (ChatGPT passes it)
  let serviceId = null;
  let serviceName = null;
  let requiresToken = false;
  try {
    const stateData = state ? JSON.parse(decodeURIComponent(state)) : {};
    serviceId = stateData.service_id;
    serviceName = stateData.service_name || 'Service';
    requiresToken = stateData.requires_token || false;
  } catch (e) {
    // State might not be JSON, that's ok
  }

  // UI state
  const [serviceToken, setServiceToken] = useState('');
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate OAuth parameters
  if (!clientId || !redirectUri || !codeChallenge || responseType !== 'code') {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: 20 }}>
        <Alert
          message="Invalid Authorization Request"
          description="Missing or invalid OAuth parameters"
          type="error"
          showIcon
        />
      </div>
    );
  }

  async function handleAuthorize() {
    // Validate service token if required
    if (requiresToken && !serviceToken) {
      setError('This service requires a service token');
      return;
    }

    setAuthorizing(true);
    setError(null);

    try {
      // Call backend to generate authorization code
      const response = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          service_id: serviceId,
          service_token: serviceToken || null, // Optional for public services
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Authorization failed');
      }

      const { code } = await response.json();

      // Redirect back to ChatGPT with authorization code
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('code', code);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }

      console.log('[OAuth] Redirecting back to ChatGPT:', {
        redirectUri,
        code: code.substring(0, 20) + '...',
        state,
        fullUrl: redirectUrl.toString()
      });

      window.location.href = redirectUrl.toString();
    } catch (err: any) {
      console.error('Authorization error:', err);
      setError(err.message || 'Failed to authorize');
      setAuthorizing(false);
    }
  }

  function handleDeny() {
    // Redirect back to ChatGPT with error
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('error_description', 'User denied authorization');
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    window.location.href = redirectUrl.toString();
  }

  return (
    <div style={{ maxWidth: 700, margin: '80px auto', padding: 20 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <ApiOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={3}>Connect to SpreadAPI Service</Title>
            <Paragraph>
              ChatGPT wants to access: <Text strong>{serviceName}</Text>
            </Paragraph>
          </div>

          {/* Client Info */}
          <Alert
            message="Connection Details"
            description={
              <div>
                <Text strong>Client: </Text>
                <Text>ChatGPT (OpenAI)</Text>
                <br />
                <Text strong>Service: </Text>
                <Text>{serviceName}</Text>
                <br />
                <Text strong>Permissions: </Text>
                <Text>{scope}</Text>
              </div>
            }
            type="info"
          />

          {/* Token Input Section */}
          {requiresToken ? (
            <div>
              <Title level={5}>
                <LockOutlined style={{ marginRight: 8 }} />
                Enter Service Token
              </Title>
              <Paragraph type="secondary">
                This is a private service. Enter the service token provided by the service owner.
              </Paragraph>

              <Input
                size="large"
                placeholder="Service token..."
                value={serviceToken}
                onChange={(e) => setServiceToken(e.target.value.trim())}
                prefix={<LockOutlined />}
                disabled={authorizing}
              />
            </div>
          ) : (
            <Alert
              message="Public Service"
              description="This is a public service. No token required."
              type="success"
              showIcon
            />
          )}

          {error && (
            <Alert message="Authorization Error" description={error} type="error" showIcon />
          )}

          {/* Actions */}
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleDeny} disabled={authorizing}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleAuthorize}
              loading={authorizing}
              disabled={requiresToken && !serviceToken}
              icon={<CheckCircleOutlined />}
              size="large"
            >
              Authorize
            </Button>
          </Space>

          {requiresToken && (
            <Alert
              message="Where to get the service token?"
              description="The service owner provides the service token. If you created this service, generate a token in the service's API settings."
              type="info"
            />
          )}

          <Alert
            message="Privacy & Security"
            description={
              <div style={{ fontSize: 12 }}>
                <p style={{ marginBottom: 8 }}>
                  • ChatGPT will only access this specific service
                </p>
                <p style={{ marginBottom: 8 }}>
                  • Your service token is securely stored and never shared with ChatGPT
                </p>
                <p style={{ marginBottom: 8 }}>
                  • Connection expires automatically after 12 hours
                </p>
                <p style={{ marginBottom: 0 }}>
                  • You can revoke access anytime by disconnecting in ChatGPT settings
                </p>
              </div>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
}

/**
 * OAuth Authorization Page with Suspense boundary
 */
export default function OAuthAuthorizePage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', marginTop: 200 }}>
          <Spin size="large" />
          <div style={{ marginTop: 20 }}>
            <Typography.Text>Loading authorization...</Typography.Text>
          </div>
        </div>
      }
    >
      <OAuthAuthorizeContent />
    </Suspense>
  );
}
