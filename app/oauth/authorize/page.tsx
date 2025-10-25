'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Input, Alert, Space, Typography, Spin } from 'antd';
import { LockOutlined, CheckCircleOutlined, ApiOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

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

  // UI state
  const [tokens, setTokens] = useState(['']); // Array of token inputs
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

  function addTokenField() {
    setTokens([...tokens, '']);
  }

  function removeTokenField(index: number) {
    if (tokens.length > 1) {
      const newTokens = tokens.filter((_, i) => i !== index);
      setTokens(newTokens);
    }
  }

  function updateToken(index: number, value: string) {
    const newTokens = [...tokens];
    newTokens[index] = value.trim();
    setTokens(newTokens);
  }

  async function handleAuthorize() {
    // Filter out empty tokens
    const validTokens = tokens.filter(t => t.length > 0);

    if (validTokens.length === 0) {
      setError('Please enter at least one access token');
      return;
    }

    // Validate token format
    const invalidTokens = validTokens.filter(t => !t.startsWith('spapi_live_'));
    if (invalidTokens.length > 0) {
      setError('Invalid token format. Tokens must start with "spapi_live_"');
      return;
    }

    setAuthorizing(true);
    setError(null);

    try {
      // Call backend to generate authorization code
      const response = await fetch('/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          mcp_tokens: validTokens, // Send MCP tokens instead of user_id/service_ids
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
            <Title level={3}>Connect to SpreadAPI</Title>
            <Paragraph>
              ChatGPT wants to access your spreadsheet calculation services
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
                <Text strong>Permissions: </Text>
                <Text>{scope}</Text>
              </div>
            }
            type="info"
          />

          {/* Token Input Section */}
          <div>
            <Title level={5}>
              <LockOutlined style={{ marginRight: 8 }} />
              Enter Your Access Token(s)
            </Title>
            <Paragraph type="secondary">
              Enter the MCP access token(s) you received from service creators.
              You can add multiple tokens to access services from different creators.
            </Paragraph>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {tokens.map((token, index) => (
                <Space.Compact key={index} style={{ width: '100%' }}>
                  <Input
                    size="large"
                    placeholder="spapi_live_..."
                    value={token}
                    onChange={(e) => updateToken(index, e.target.value)}
                    prefix={<LockOutlined />}
                    disabled={authorizing}
                    status={token && !token.startsWith('spapi_live_') ? 'error' : undefined}
                  />
                  {tokens.length > 1 && (
                    <Button
                      size="large"
                      icon={<DeleteOutlined />}
                      onClick={() => removeTokenField(index)}
                      disabled={authorizing}
                      danger
                    />
                  )}
                </Space.Compact>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addTokenField}
                disabled={authorizing}
                block
              >
                Add another token
              </Button>
            </Space>

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
              disabled={tokens.filter(t => t.length > 0).length === 0}
              icon={<CheckCircleOutlined />}
              size="large"
            >
              Authorize
            </Button>
          </Space>

          <Alert
            message="Where to get tokens?"
            description={
              <div style={{ fontSize: 12 }}>
                <p style={{ marginBottom: 0 }}>
                  • Create your own services and generate tokens at{' '}
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
