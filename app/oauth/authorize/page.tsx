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

  // OAuth parameters from ChatGPT/Claude
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope') || 'mcp:read mcp:write';
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const responseType = searchParams.get('response_type');
  const resource = searchParams.get('resource'); // RFC 8707: Resource indicator

  // Extract service_id from resource parameter (RFC 8707)
  // ChatGPT sends: resource=https://spreadapi.io/api/mcp/service/{serviceId}
  let serviceId = searchParams.get('service_id'); // Legacy support
  if (!serviceId && resource) {
    // Parse service ID from resource URL
    const match = resource.match(/\/api\/mcp\/service\/([^/?#]+)/);
    if (match) {
      serviceId = match[1];
    }
  }

  // UI state
  const [serviceToken, setServiceToken] = useState(''); // Single service token
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

  if (!serviceId) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: 20 }}>
        <Alert
          message="Missing Service ID"
          description={
            <div>
              <p>Could not determine which service to authorize.</p>
              {resource ? (
                <p style={{ marginTop: 8, fontSize: 12 }}>
                  Received resource: <code>{resource}</code><br />
                  Expected format: <code>https://spreadapi.io/api/mcp/service/{'<serviceId>'}</code>
                </p>
              ) : (
                <p style={{ marginTop: 8, fontSize: 12 }}>
                  The authorization request is missing the 'resource' parameter (RFC 8707).
                </p>
              )}
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  async function handleAuthorize() {
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
          service_token: serviceToken || null,
          service_id: serviceId,
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
            <ApiOutlined style={{ fontSize: 48, color: '#502D81', marginBottom: 16 }} />
            <Title level={3}>Connect to SpreadAPI Service</Title>
            <Paragraph>
              Authorize access to this specific calculation service
            </Paragraph>
          </div>

          {/* Client Info */}
          <Alert
            message="Connection Details"
            description={
              <div>
                <Text strong>Client: </Text>
                <Text>{clientId}</Text>
                <br />
                <Text strong>Permissions: </Text>
                <Text>{scope}</Text>
              </div>
            }
            type="info"
          />

          {/* Service Info */}
          <Alert
            message="Connecting to Service"
            description={
              <div>
                <Text strong>Service ID: </Text>
                <Text code>{serviceId}</Text>
              </div>
            }
            type="info"
          />

          {/* Token Input Section */}
          <div>
            <Title level={5}>
              <LockOutlined style={{ marginRight: 8 }} />
              Service Token (Optional)
            </Title>
            <Paragraph type="secondary">
              If this service requires authentication, enter your service token.
              You can find it in the service's API settings on SpreadAPI.
            </Paragraph>

            <Input
              size="large"
              placeholder="Enter service token (if required)"
              value={serviceToken}
              onChange={(e) => setServiceToken(e.target.value.trim())}
              prefix={<LockOutlined />}
              disabled={authorizing}
            />

            <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
              For public services, you can leave this empty and click Authorize.
            </Paragraph>
          </div>

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
              icon={<CheckCircleOutlined />}
              size="large"
            >
              Authorize
            </Button>
          </Space>

          <Alert
            message="Where to get service token?"
            description={
              <div style={{ fontSize: 12 }}>
                <p style={{ marginBottom: 0 }}>
                  • Create your own services and generate service tokens at{' '}
                  <a href="https://spreadapi.io/dashboard" target="_blank" rel="noopener noreferrer">
                    your dashboard
                  </a>
                </p>
              </div>
            }
            type="info"
            style={{ marginTop: 16 }}
          />
          {/* Privacy Notice */}
          {/* <Alert
            message="Privacy & Security"
            description={
              <div style={{ fontSize: 12 }}>
                <p style={{ marginBottom: 8 }}>
                  • ChatGPT will only access services included in your token(s)
                </p>
                <p style={{ marginBottom: 8 }}>
                  • Your tokens are never shared with ChatGPT
                </p>
                <p style={{ marginBottom: 8 }}>
                  • Tokens expire automatically with your session (up to 12 hours)
                </p>
                <p style={{ marginBottom: 0 }}>
                  • You can revoke access at any time by disconnecting in ChatGPT settings
                </p>
              </div>
            }
            type="info"
            showIcon
          /> */}
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
