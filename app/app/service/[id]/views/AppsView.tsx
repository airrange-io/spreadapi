'use client';

import React, { useRef, useState, useLayoutEffect, Suspense, useEffect, useCallback } from 'react';
import { Skeleton, Menu, Button, Input, Alert, Modal, Tooltip, Space, Typography, Tabs, QRCode, Select, Card, Row, Col } from 'antd';
import { InfoCircleOutlined, CopyOutlined, ReloadOutlined, DeleteOutlined, FolderOutlined, FileTextOutlined, AppstoreOutlined, QrcodeOutlined, DownloadOutlined, BgColorsOutlined } from '@ant-design/icons';
import { useContainerWidth } from '@/hooks/useContainerWidth';
import { SYSTEM_TEMPLATES } from '@/lib/systemTemplates';
import { VIEW_THEMES } from '@/lib/viewThemes';

const { TextArea } = Input;
const { Text } = Typography;

// Debounce delay for validation (milliseconds)
const VALIDATION_DEBOUNCE_DELAY = 300;

interface AppsViewProps {
  serviceId: string;
  apiConfig: {
    name?: string;
    inputs: any[];
    outputs: any[];
    requireToken?: boolean;
    webAppEnabled?: boolean;
    webAppToken?: string;
    webAppConfig?: string;
    webAppTheme?: string;
    customThemeParams?: string;
  };
  serviceStatus?: {
    published?: boolean;
  };
  isDemoMode?: boolean;
  configLoaded?: boolean;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  onConfigChange?: (updates: any) => void;
}

const AppsView: React.FC<AppsViewProps> = ({
  serviceId,
  apiConfig,
  serviceStatus,
  isDemoMode = false,
  configLoaded = false,
  isLoading = false,
  hasUnsavedChanges = false,
  onConfigChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>('intro');
  const [configError, setConfigError] = useState<string | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track fade-in effect separately
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup validation timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  // Validation function (extracted for debouncing)
  const validateConfig = useCallback((value: string) => {
    if (!value.trim()) {
      setConfigError(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);

      // Validate structure
      if (!parsed.rules || !Array.isArray(parsed.rules)) {
        setConfigError('Config must have a "rules" array');
        return;
      }

      // Validate each rule
      for (let i = 0; i < parsed.rules.length; i++) {
        const rule = parsed.rules[i];
        if (!rule.output && !rule.input) {
          setConfigError(`Rule ${i + 1}: Must have either "output" or "input" field`);
          return;
        }
        if (rule.output && rule.input) {
          setConfigError(`Rule ${i + 1}: Cannot have both "output" and "input" fields`);
          return;
        }
        if (!rule.visible) {
          setConfigError(`Rule ${i + 1}: Missing "visible" field`);
          return;
        }
      }

      setConfigError(null);
    } catch (e) {
      setConfigError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, []);

  // Handler for config change with debounced validation
  const handleConfigChange = useCallback((value: string) => {
    // Update config immediately
    onConfigChange?.({ webAppConfig: value });

    // Clear previous validation timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Debounce validation
    validationTimerRef.current = setTimeout(() => {
      validateConfig(value);
    }, VALIDATION_DEBOUNCE_DELAY);
  }, [onConfigChange, validateConfig]);

  // Helper to build theme parameter (includes base theme + custom overrides)
  const buildThemeParam = useCallback((hasExistingParams: boolean) => {
    const theme = apiConfig.webAppTheme || 'default';
    const customParams = apiConfig.customThemeParams?.trim() || '';

    let params = '';

    // Add base theme if not default
    if (theme !== 'default') {
      params = `theme=${theme}`;
    }

    // Add custom parameters
    if (customParams) {
      // Remove leading ? or & if user added it
      const cleanParams = customParams.replace(/^[?&]+/, '');
      if (cleanParams) {
        params = params ? `${params}&${cleanParams}` : cleanParams;
      }
    }

    if (!params) return '';

    return hasExistingParams ? `&${params}` : `?${params}`;
  }, [apiConfig.webAppTheme, apiConfig.customThemeParams]);

  // Show skeleton until config is loaded
  if (!configLoaded) {
    return (
      <div ref={containerRef} style={{ padding: '16px' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  const webAppToken = apiConfig.webAppToken || '';
  const webAppConfig = apiConfig.webAppConfig || '';

  // Handler for token generation
  const handleGenerateToken = () => {
    const token = crypto.randomUUID().replace(/-/g, '');
    onConfigChange?.({ webAppToken: token });
  };

  // Handler for token deletion
  const handleDeleteToken = () => {
    Modal.confirm({
      title: 'Disable Web App',
      content: 'This will disable the web app and invalidate the current link. Are you sure?',
      okText: 'Disable',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        onConfigChange?.({ webAppToken: '' });
      }
    });
  };

  // Handler for copying link
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  // Handler for showing QR code
  const handleShowQrCode = (url: string) => {
    setQrUrl(url);
    setQrModalVisible(true);
  };

  // Build query string with default values for snippets
  const getDefaultQueryString = () => {
    const params = new URLSearchParams();

    // Add input parameters with default values
    apiConfig.inputs?.forEach((input: any) => {
      if (input.value !== undefined && input.value !== null && input.value !== '') {
        params.append(input.name, String(input.value));
      }
    });

    // Add token placeholder if required
    if (apiConfig.requireToken) {
      params.append('token', 'YOUR_TOKEN_HERE');
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  // Get snippet embed URL
  const getSnippetEmbedUrl = (viewId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io';
    const baseUrl = `${origin}/app/v1/services/${serviceId}/view/${viewId}`;
    const queryString = getDefaultQueryString();
    const themeParam = buildThemeParam(!!queryString);

    return baseUrl + queryString + themeParam;
  };

  // Get interactive embed URL
  const getInteractiveEmbedUrl = (viewId: string) => {
    if (!webAppToken) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io';
    const baseUrl = `${origin}/app/v1/services/${serviceId}/view/${viewId}`;
    const queryString = getDefaultQueryString();
    const separator = queryString ? '&' : '?';
    const themeParam = buildThemeParam(true); // Always has params (token + interactive)

    return `${baseUrl}${queryString}${separator}token=${webAppToken}&interactive=true${themeParam}`;
  };

  // Get iframe code for snippet
  const getSnippetIframeCode = (viewId: string) => {
    const url = getSnippetEmbedUrl(viewId);
    return `<iframe src="${url}" width="100%" height="300" frameborder="0"></iframe>`;
  };

  // Get iframe code for interactive mode
  const getInteractiveIframeCode = (viewId: string) => {
    const url = getInteractiveEmbedUrl(viewId);
    return `<iframe src="${url}" width="100%" height="500" frameborder="0"></iframe>`;
  };

  // Render content based on selected menu item
  const renderContent = () => {
    // Intro & Token Management
    if (selectedKey === 'intro') {
      return (
        <div>
          <Alert
            message="Build Web Applications & Embeddable Snippets"
            description="Create shareable web applications and lightweight HTML snippets that display your API results. Perfect for embedding in websites, blogs, and documentation."
            type="info"
            style={{ marginTop: -2, marginBottom: 24 }}
          />

          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Token Management</h3>

          {!webAppToken ? (
            <div>
              <p style={{ color: '#666', marginBottom: 16 }}>
                Generate a token to enable your web app. This token will be used to authenticate access to your web application.
              </p>
              <Button
                type="primary"
                onClick={handleGenerateToken}
                disabled={isLoading}
              >
                Generate Token & Enable Web App
              </Button>
            </div>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div>
                <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500 }}>
                  Access Token
                </div>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={webAppToken}
                    readOnly
                    style={{ flex: 1 }}
                  />
                  <Tooltip title="Regenerate token">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleGenerateToken}
                    />
                  </Tooltip>
                  <Tooltip title="Disable web app">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteToken}
                    />
                  </Tooltip>
                </Space.Compact>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  Regenerate to revoke access to old links
                </div>
              </div>
            </Space>
          )}
        </div>
      );
    }

    // Theme Selection
    if (selectedKey === 'theme') {
      const selectedTheme = apiConfig.webAppTheme || 'default';

      return (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Visual Theme</h3>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
            Choose a visual theme for your embeddable snippets and web app. The theme will be applied to all views.
          </p>

          <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500 }}>
            Select Theme
          </div>
          <Select
            value={selectedTheme}
            onChange={(value) => onConfigChange?.({ webAppTheme: value })}
            style={{ width: '100%', marginBottom: 16 }}
            size="large"
            disabled={isLoading}
          >
            {Object.values(VIEW_THEMES).map((theme) => (
              <Select.Option key={theme.id} value={theme.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: theme.preview.primaryColor,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{theme.name}</span>
                  <span style={{ color: '#999', fontSize: 12 }}>- {theme.description}</span>
                </div>
              </Select.Option>
            ))}
          </Select>

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              Custom Theme Parameters (Optional)
              <Tooltip title={
                <div style={{ fontSize: 11 }}>
                  Override individual theme properties using URL parameter format.
                  <br /><br />
                  <strong>Example:</strong><br />
                  primaryColor=%23FF0000&resultValueFontSize=18px
                </div>
              }>
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 14, cursor: 'help' }} />
              </Tooltip>
            </div>
            <TextArea
              value={apiConfig.customThemeParams || ''}
              onChange={(e) => onConfigChange?.({ customThemeParams: e.target.value })}
              placeholder="primaryColor=%23502D80&resultValueFontSize=18px&contentBorderRadius=12px"
              rows={3}
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
              }}
              disabled={isLoading}
            />
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              Enter parameters in URL format (without leading ? or &). See available parameters below.
            </div>
          </div>

          {hasUnsavedChanges && (
            <Alert
              message="Remember to click the Save button at the top to save your theme settings"
              type="info"
              showIcon={false}
              style={{ fontSize: 12, padding: '8px 12px', marginBottom: 24 }}
            />
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500 }}>
              Theme Preview
            </div>
            <Row gutter={16}>
              {Object.values(VIEW_THEMES).filter(t => t.id === selectedTheme).map((theme) => (
                <Col span={24} key={theme.id}>
                  <Card
                    styles={{
                      body: {
                        padding: '24px',
                        minHeight: 220,
                        background: theme.styles.containerBg === 'transparent' ? 'white' : theme.styles.containerBg
                      }
                    }}
                    style={{
                      background: 'white',
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      overflow: 'visible'
                    }}
                  >
                    <div
                      style={{
                        background: theme.styles.contentBg,
                        border: theme.styles.contentBorder,
                        borderRadius: theme.styles.contentBorderRadius,
                        boxShadow: theme.styles.contentShadow,
                        padding: '20px',
                        minHeight: 180
                      }}
                    >
                      <div style={{ color: theme.styles.textColor, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                        {theme.name} Theme
                      </div>
                      <div style={{ color: theme.styles.labelColor, fontSize: 12, marginBottom: 8 }}>
                        Example Input
                      </div>
                      <input
                        type="text"
                        placeholder="Sample input field"
                        readOnly
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: theme.styles.inputBg,
                          border: theme.styles.inputBorder,
                          borderRadius: theme.styles.inputBorderRadius,
                          fontSize: 13,
                          marginBottom: 16,
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        style={{
                          padding: '8px 16px',
                          background: theme.styles.buttonBg,
                          color: theme.styles.buttonColor,
                          border: 'none',
                          borderRadius: theme.styles.buttonBorderRadius,
                          fontSize: 13,
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div style={{ marginTop: 24, padding: '16px', background: '#f9f9f9', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: '#666' }}>
              Advanced Customization
            </div>
            <div style={{ fontSize: 11, color: '#999', lineHeight: '1.6' }}>
              You can override individual theme properties by adding URL parameters:
              <br />
              <code style={{ fontSize: 10, background: 'white', padding: '2px 6px', borderRadius: 3, marginTop: 4, display: 'inline-block' }}>
                &primaryColor=%23502D80&contentBorderRadius=12px
              </code>
              <br />
              <div style={{ marginTop: 8, marginBottom: 4, fontWeight: 500, color: '#666' }}>
                Available parameters:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: 10, fontFamily: 'monospace' }}>
                <div><strong>Container:</strong> containerBg, containerPadding</div>
                <div><strong>Content:</strong> contentBg, contentBorder, contentBorderRadius, contentShadow, contentPadding</div>
                <div><strong>Typography:</strong> fontFamily, headingFontFamily</div>
                <div><strong>Colors:</strong> primaryColor, accentColor, textColor, labelColor</div>
                <div><strong>Headings:</strong> headingColor, headingFontSize, headingFontWeight</div>
                <div><strong>Result Labels:</strong> resultLabelColor, resultLabelFontSize, resultLabelFontWeight</div>
                <div><strong>Result Values:</strong> resultValueColor, resultValueFontSize, resultValueFontWeight</div>
                <div><strong>Result Dividers:</strong> resultDividerColor, resultRowPadding</div>
                <div><strong>Inputs:</strong> inputBg, inputBorder, inputBorderRadius, inputFocusBorder, inputFontSize</div>
                <div><strong>Input Labels:</strong> inputLabelColor, inputLabelFontSize, inputLabelFontWeight</div>
                <div><strong>Buttons:</strong> buttonBg, buttonColor, buttonBorderRadius, buttonHoverBg, buttonFontSize, buttonFontWeight, buttonPadding</div>
                <div><strong>Card Header:</strong> cardHeaderBg, cardHeaderColor, cardHeaderGradientStart, cardHeaderGradientEnd</div>
                <div><strong>Table:</strong> tableHeaderBg, tableHeaderColor, tableBorderColor, tableRowHoverBg</div>
                <div><strong>Sections:</strong> inputSectionBg, resultsSectionBg</div>
                <div><strong>Spacing:</strong> sectionSpacing, inputGroupSpacing, resultItemSpacing, headerPadding</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: '#999' }}>
                Total: 65 customizable properties
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Web App
    if (selectedKey === 'webapp') {
      if (!webAppToken) {
        return (
          <Alert
            message="No Web App Token"
            description="Please generate a token in 'Intro & Token Management' to enable your web app."
            type="warning"
            showIcon
          />
        );
      }

      const themeParam = buildThemeParam(true); // Always has params (token)
      const webAppUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/app/v1/services/${serviceId}?token=${webAppToken}${themeParam}`;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
          {/* Configuration Section */}
          <div>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500 }}>
              Web App URL
            </div>
            <Input
              value={webAppUrl}
              readOnly
              addonAfter={
                <CopyOutlined
                  onClick={() => handleCopyLink(webAppUrl)}
                  style={{ cursor: 'pointer' }}
                  title="Copy to clipboard"
                />
              }
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Share this{' '}
              <a
                href={webAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4F2D7F', fontWeight: 600, textDecoration: 'none' }}
              >
                link
              </a>
              {' '}with users to access your web application
            </div>
            <Button
              type="link"
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => handleShowQrCode(webAppUrl)}
              style={{ padding: '4px 0', height: 'auto', fontSize: 11, color: '#502D80' }}
            >
              Show Barcode
            </Button>
          </div>

          {hasUnsavedChanges && (
            <Alert
              message="Remember to click the Save button at the top to activate your web app settings"
              type="info"
              showIcon={false}
              style={{ fontSize: 12, padding: '8px 12px' }}
            />
          )}

          <div>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              App Rules (Advanced)
              <Tooltip title={
                <div>
                  <div style={{ marginBottom: 8 }}>Control which inputs/outputs are visible based on input values.</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre' }}>
{`{
  "rules": [
    {
      "input": "inputName",
      "visible": {
        "input": "otherInput",
        "equals": "value"
      }
    }
  ]
}`}
                  </div>
                </div>
              }>
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 14, cursor: 'help' }} />
              </Tooltip>
            </div>
            <TextArea
              value={webAppConfig}
              onChange={(e) => handleConfigChange(e.target.value)}
              placeholder='{"rules": []}'
              rows={6}
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                backgroundColor: '#f5f5f5'
              }}
              disabled={isLoading}
            />
            {configError && (
              <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>
                {configError}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              Leave empty for default behavior (show all outputs)
            </div>
          </div>

          {/* Preview Section */}
          <div style={{ flex: 1, minHeight: 400 }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500 }}>
              Live Preview
            </div>
            <div style={{
              width: '100%',
              height: '100%',
              minHeight: 400,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <iframe
                src={webAppUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="Web App Preview"
              />
            </div>
          </div>
        </div>
      );
    }

    // System Templates (Snippets/Views)
    const template = SYSTEM_TEMPLATES[selectedKey];
    if (template) {
      const snippetUrl = getSnippetEmbedUrl(template.id);
      const snippetIframe = getSnippetIframeCode(template.id);
      const interactiveUrl = getInteractiveEmbedUrl(template.id);
      const interactiveIframe = getInteractiveIframeCode(template.id);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
          {/* Header */}
          <div>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>{template.name}</h3>
            <p style={{ color: '#666', fontSize: 12, marginBottom: 0 }}>
              {template.description}
            </p>
          </div>

          {/* Tabs for Snippet vs Interactive Mode */}
          <Tabs
            defaultActiveKey="snippet"
            items={[
              {
                key: 'snippet',
                label: 'Snippet Mode',
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {apiConfig.requireToken && (
                      <Alert
                        message="Authentication Required"
                        description={
                          <>
                            This service requires a token. Replace <Text code>YOUR_TOKEN_HERE</Text> in the URL with your actual API token.
                          </>
                        }
                        type="warning"
                        showIcon
                      />
                    )}

                    {/* Embed URL */}
                    <div>
                      <div style={{ marginBottom: 4, fontSize: 11, color: '#888', fontWeight: 500 }}>
                        Embed URL:
                      </div>
                      <div style={{
                        background: '#f5f5f5',
                        padding: '8px 12px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        <Text copyable={{ text: snippetUrl }} style={{ fontSize: 11 }}>
                          {snippetUrl}
                        </Text>
                      </div>
                      <Button
                        type="link"
                        size="small"
                        icon={<QrcodeOutlined />}
                        onClick={() => handleShowQrCode(snippetUrl)}
                        style={{ padding: '4px 0', height: 'auto', fontSize: 11, color: '#502D80' }}
                      >
                        Show Barcode
                      </Button>
                    </div>

                    {/* iFrame Code */}
                    <div>
                      <div style={{ marginBottom: 4, fontSize: 11, color: '#888', fontWeight: 500 }}>
                        iFrame Code:
                      </div>
                      <div style={{
                        background: '#f5f5f5',
                        padding: '8px 12px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        <Text copyable={{ text: snippetIframe }} code style={{ fontSize: 11 }}>
                          {snippetIframe}
                        </Text>
                      </div>
                    </div>

                    {/* Preview */}
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500 }}>
                        Live Preview
                      </div>
                      <div style={{
                        width: '100%',
                        height: 'calc(100vh - 520px)',
                        minHeight: 300,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        overflow: 'hidden',
                        backgroundColor: '#fff'
                      }}>
                        <iframe
                          src={snippetUrl}
                          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                          title={`${template.name} Snippet Preview`}
                        />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                key: 'interactive',
                label: 'Interactive Mode',
                disabled: !webAppToken,
                children: webAppToken ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Embed URL */}
                    <div>
                      <div style={{ marginBottom: 4, fontSize: 11, color: '#888', fontWeight: 500 }}>
                        Embed URL:
                      </div>
                      <div style={{
                        background: '#f5f5f5',
                        padding: '8px 12px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        <Text copyable={{ text: interactiveUrl }} style={{ fontSize: 11 }}>
                          {interactiveUrl}
                        </Text>
                      </div>
                      <Button
                        type="link"
                        size="small"
                        icon={<QrcodeOutlined />}
                        onClick={() => handleShowQrCode(interactiveUrl)}
                        style={{ padding: '4px 0', height: 'auto', fontSize: 11, color: '#502D80' }}
                      >
                        Show Barcode
                      </Button>
                    </div>

                    {/* iFrame Code */}
                    <div>
                      <div style={{ marginBottom: 4, fontSize: 11, color: '#888', fontWeight: 500 }}>
                        iFrame Code:
                      </div>
                      <div style={{
                        background: '#f5f5f5',
                        padding: '8px 12px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        <Text copyable={{ text: interactiveIframe }} code style={{ fontSize: 11 }}>
                          {interactiveIframe}
                        </Text>
                      </div>
                    </div>

                    {/* Preview */}
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ marginBottom: 8, fontSize: 12, color: '#666', fontWeight: 500 }}>
                        Live Preview
                      </div>
                      <div style={{
                        width: '100%',
                        height: 'calc(100vh - 460px)',
                        minHeight: 400,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        overflow: 'hidden',
                        backgroundColor: '#fff'
                      }}>
                        <iframe
                          src={interactiveUrl}
                          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                          title={`${template.name} Interactive Preview`}
                        />
                      </div>
                    </div>
                  </div>
                ) : null
              }
            ]}
          />
        </div>
      );
    }

    return null;
  };

  // Build menu items
  const menuItems = [
    {
      key: 'intro',
      icon: <FileTextOutlined />,
      label: 'Intro'
    },
    {
      key: 'theme',
      icon: <BgColorsOutlined />,
      label: 'Theme'
    },
    {
      key: 'webapp-folder',
      icon: <AppstoreOutlined />,
      label: 'Web App',
      children: webAppToken ? [
        {
          key: 'webapp',
          label: 'My Web App'
        }
      ] : []
    },
    {
      key: 'templates-folder',
      icon: <FolderOutlined />,
      label: 'Templates',
      children: Object.values(SYSTEM_TEMPLATES).map(template => ({
        key: template.id,
        label: template.name
      }))
    }
  ];

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        display: 'flex',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {/* Left Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={[]}
        style={{
          width: 200,
          height: '100%',
          borderRight: '1px solid #f0f0f0',
          marginTop: 10,
          paddingRight: 10
        }}
        items={menuItems}
        onClick={({ key }) => setSelectedKey(key)}
      />

      {/* Right Content */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {renderContent()}
      </div>

      {/* QR Code Modal */}
      <Modal
        title="QR Code"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        centered
        width={400}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '20px 0'
        }}>
          <Suspense fallback={<Skeleton.Node active />}>
            <QRCode
              value={qrUrl}
              size={256}
              icon="/icons/icon-192x192.png"
              iconSize={48}
              errorLevel="H"
            />
          </Suspense>
          <div style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#666',
            wordBreak: 'break-all',
            maxWidth: '100%'
          }}>
            {qrUrl}
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'spreadapi-qrcode.png';
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                });
              }
            }}
          >
            Download QR Code
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AppsView;
