'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Splitter, Alert, Form, Row, Col, App } from 'antd';
import { CaretRightOutlined, CopyOutlined } from '@ant-design/icons';
import { useServicePrewarm } from '@/hooks/useServicePrewarm';
import { InputRenderer } from '@/components/InputRenderer';
import { useTranslation } from '@/lib/i18n';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

// Custom JSON viewer styles matching app color scheme
const jsonViewStyles: typeof defaultStyles = {
  ...defaultStyles,
  stringValue: 'json-view-string',
  numberValue: 'json-view-number',
  booleanValue: 'json-view-boolean',
  nullValue: 'json-view-null',
  label: 'json-view-label',
  punctuation: 'json-view-punctuation',
  collapseIcon: `${defaultStyles.collapseIcon} json-view-collapse`,
  expandIcon: `${defaultStyles.expandIcon} json-view-expand`,
};

const { TextArea } = Input;

// Available API endpoints — use current origin in dev to avoid CORS issues
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_ENDPOINTS = [
  { key: 'main', label: 'spreadapi.io', url: isLocalDev ? '/api/v1/services/{serviceId}/execute' : 'https://spreadapi.io/api/v1/services/{serviceId}/execute' },
  { key: 'run', label: 'spreadapi.run', url: isLocalDev ? '/api/v1/services/{serviceId}/execute' : 'https://spreadapi.run/{serviceId}' },
];

interface ServiceTesterProps {
  serviceId: string;
  serviceName?: string;
  isPublished: boolean;
  inputs: any[];
  outputs: any[];
  requireToken?: boolean;
  existingToken?: string;
  containerWidth?: number;
  onTestComplete?: () => void;
}

const ServiceTester: React.FC<ServiceTesterProps> = ({
  serviceId,
  serviceName,
  isPublished,
  inputs,
  outputs,
  requireToken,
  existingToken,
  containerWidth: propsContainerWidth,
  onTestComplete
}) => {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [wizardTesting, setWizardTesting] = useState(false);
  const [wizardResult, setWizardResult] = useState<any>(null);
  const [wizardError, setWizardError] = useState<string>('');
  const [wizardResponseTime, setWizardResponseTime] = useState<number>(0);
  const [totalCalls, setTotalCalls] = useState<number>(0);
  const [responseBoxHeight, setResponseBoxHeight] = useState<number>(200);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('main');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>('GET');
  const [urlManuallyEdited, setUrlManuallyEdited] = useState<boolean>(false);
  const [postBodyEdited, setPostBodyEdited] = useState<boolean>(false);
  const [postBody, setPostBody] = useState<string>('{}');
  const [tokenValue, setTokenValue] = useState<string>('');
  const containerWidth = propsContainerWidth || 0;
  const isMounted = useRef(false);
  const responseBoxRef = useRef<HTMLDivElement>(null);

  // Prewarm the service when component mounts
  useServicePrewarm(serviceId, isPublished);

  // Initialize parameter values from inputs
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    inputs.forEach(input => {
      const key = input.name;
      // Use the provided value, or set appropriate defaults
      if (input.value !== undefined && input.value !== null) {
        initialValues[key] = input.value;
      } else if (input.type === 'number') {
        // For numbers, use min value or 0 as default
        initialValues[key] = input.min || 0;
      } else if (input.type === 'boolean') {
        initialValues[key] = false;
      } else {
        initialValues[key] = '';
      }
    });
    setParameterValues(initialValues);
    // Update form fields with initial values
    form.setFieldsValue(initialValues);
  }, [inputs, form]);


  const handleWizardTest = async () => {
    setWizardTesting(true);
    setWizardError('');
    // Don't clear wizardResult - keep previous results visible while loading

    // Validate form before testing (only if URL wasn't manually edited)
    if (!urlManuallyEdited) {
      try {
        await form.validateFields();
      } catch (error) {
        setWizardError(t('tester.fillRequiredFields'));
        setWizardTesting(false);
        return;
      }
    }

    // Use the current wizardUrl (respects manual edits)
    const testUrl = wizardUrl;

    const startTime = Date.now();

    try {
      const fetchOptions: RequestInit = {};
      if (httpMethod === 'POST') {
        fetchOptions.method = 'POST';
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = postBody;
      }
      const response = await fetch(testUrl, fetchOptions);
      const responseTime = Date.now() - startTime;
      // We'll update this after we get the actual calculation time from the response
      setWizardResponseTime(responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        // Check if it's a missing parameters error
        if (errorData.error === 'Missing required parameters' && errorData.details) {
          const requiredParams = errorData.details.required.map((p: any) => p.name).join(', ');
          throw new Error(`Missing required parameters: ${requiredParams}`);
        }
        throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setWizardResult(data);
      setTotalCalls(prev => prev + 1);
      
      // Use the actual calculation time from the response if available
      if (data.metadata && data.metadata.executionTime !== undefined) {
        setWizardResponseTime(data.metadata.executionTime);
      } else if (data.metadata && data.metadata.totalTime !== undefined) {
        setWizardResponseTime(data.metadata.totalTime);
      }
      
      // Trigger callback to refresh tokens if test was successful
      if (onTestComplete && requireToken) {
        onTestComplete();
      }
    } catch (error: any) {
      setWizardError(error.message || 'Failed to test API');
    } finally {
      setWizardTesting(false);
    }
  };

  // Build wizard test URL dynamically
  const buildWizardUrl = (params: Record<string, any>, endpoint: string = selectedEndpoint, method: 'GET' | 'POST' = httpMethod) => {
    const endpointConfig = API_ENDPOINTS.find(e => e.key === endpoint) || API_ENDPOINTS[0];
    const baseUrl = endpointConfig.url.replace('{serviceId}', serviceId);

    // POST mode: no query params in URL
    if (method === 'POST') {
      if (isLocalDev && baseUrl.startsWith('/')) {
        return `${window.location.origin}${baseUrl}`;
      }
      return baseUrl;
    }

    // GET mode: params as query string
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.append(key, String(value));
      }
    });

    if (requireToken) {
      urlParams.append('token', tokenValue || 'REPLACE_WITH_YOUR_TOKEN');
    }

    const queryString = urlParams.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    if (isLocalDev && finalUrl.startsWith('/')) {
      return `${window.location.origin}${finalUrl}`;
    }
    return finalUrl;
  };

  // Build POST body from parameters
  const buildPostBody = (params: Record<string, any>) => {
    const inputs: Record<string, any> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        inputs[key] = value;
      }
    });
    const body: Record<string, any> = { inputs };
    if (requireToken) {
      body.token = tokenValue || 'REPLACE_WITH_YOUR_TOKEN';
    }
    return JSON.stringify(body, null, 2);
  };

  const [wizardUrl, setWizardUrl] = useState('');

  // Update wizard URL and POST body when parameters, endpoint, or method change
  useEffect(() => {
    if (!urlManuallyEdited) {
      setWizardUrl(buildWizardUrl(parameterValues, selectedEndpoint, httpMethod));
    }
    if (!postBodyEdited) {
      setPostBody(buildPostBody(parameterValues));
    }
  }, [parameterValues, serviceId, requireToken, tokenValue, selectedEndpoint, urlManuallyEdited, httpMethod, postBodyEdited]);

  // Track mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Calculate dynamic height for API Response box
  useEffect(() => {
    const calculateHeight = () => {
      if (responseBoxRef.current && wizardResult) {
        const rect = responseBoxRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const bottomMargin = 60;
        const minHeight = 200;

        // Calculate available space: viewport height - element top position - bottom margin
        const availableHeight = viewportHeight - rect.top - bottomMargin;

        // Use the larger of minHeight or availableHeight
        const dynamicHeight = Math.max(minHeight, availableHeight);

        setResponseBoxHeight(dynamicHeight);
      }
    };

    // Calculate on mount and when result changes
    calculateHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [wizardResult, wizardError]);

  // Sync form values when parameterValues change
  // No need for this effect since we're using initialValues on the Form
  // and onValuesChange to keep parameterValues in sync


  // Get column span based on container width
  const getColumnSpan = () => {
    // Fallback to a reasonable default if width measurement fails
    const effectiveWidth = containerWidth || 800;
    
    if (effectiveWidth < 400) return 24; // 1 column for small containers
    return 12; // 2 columns
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: '#bfbfbf',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 8,
  };

  return (
    <Splitter style={{ width: '100%', height: '100%' }}>
      <Splitter.Panel defaultSize="50%" min="30%" max="70%" style={{ paddingRight: 16, paddingLeft: 16, paddingTop: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Input Parameters Form */}
          {inputs.length > 0 && (
            <div>
              <div style={sectionHeaderStyle}>
                {t('tester.inputParameters')}
              </div>
              <Form
                form={form}
                layout="vertical"
                initialValues={parameterValues}
                style={{ width: '100%' }}
                onValuesChange={(changedValues, allValues) => {
                  setParameterValues(allValues);
                  setWizardUrl(buildWizardUrl(allValues));
                }}
              >
                <Row gutter={[16, 4]}>
                  {inputs.map((input) => (
                    <Col key={input.id} span={getColumnSpan()}>
                      <InputRenderer
                        input={input}
                        fieldName={input.name}
                        showLabel={true}
                        marginBottom={8}
                        hideAiDescriptions={true}
                      />
                    </Col>
                  ))}
                </Row>
              </Form>
            </div>
          )}

          {/* Token input */}
          {requireToken && (
            <div>
              <div style={sectionHeaderStyle}>Token</div>
              <Input
                value={tokenValue}
                onChange={(e) => {
                  setTokenValue(e.target.value);
                  setUrlManuallyEdited(false);
                  setPostBodyEdited(false);
                }}
                placeholder="REPLACE_WITH_YOUR_TOKEN"
                style={{ fontFamily: 'SF Mono, Fira Code, Fira Mono, Menlo, monospace', fontSize: 12 }}
              />
            </div>
          )}

          {/* Method & Domain selectors */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div>
              <div style={sectionHeaderStyle}>{t('tester.method')}</div>
              <div style={{ display: 'inline-flex', borderRadius: 6, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                {(['GET', 'POST'] as const).map((method) => {
                  const isActive = httpMethod === method;
                  const activeColor = method === 'GET' ? '#1AA24A' : '#d4880f';
                  return (
                    <div
                      key={method}
                      onClick={() => {
                        setHttpMethod(method);
                        setUrlManuallyEdited(false);
                        setPostBodyEdited(false);
                      }}
                      style={{
                        padding: '6px 16px',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        color: isActive ? activeColor : '#8c8c8c',
                        background: isActive ? (method === 'GET' ? '#f0fff0' : '#fff8f0') : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      {method}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div style={sectionHeaderStyle}>{t('tester.domain')}</div>
              <div style={{ display: 'inline-flex', borderRadius: 6, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                {API_ENDPOINTS.map((ep) => {
                  const isActive = selectedEndpoint === ep.key;
                  return (
                    <div
                      key={ep.key}
                      onClick={() => {
                        setSelectedEndpoint(ep.key);
                        setUrlManuallyEdited(false);
                      }}
                      style={{
                        padding: '6px 16px',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        color: isActive ? '#7B3AED' : '#8c8c8c',
                        background: isActive ? '#F0EEFF' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      {ep.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* POST Request Body */}
          {httpMethod === 'POST' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={sectionHeaderStyle}>{t('tester.requestBody') || 'Request Body'}</span>
                <span style={{ fontSize: 10, color: '#d9d9d9' }}>application/json</span>
              </div>
              <TextArea
                value={postBody}
                onChange={(e) => {
                  setPostBody(e.target.value);
                  setPostBodyEdited(true);
                }}
                rows={8}
                style={{
                  fontFamily: 'SF Mono, Fira Code, Fira Mono, Menlo, monospace',
                  fontSize: 12,
                  background: '#fafafa',
                  border: '1px solid #e8e8e8'
                }}
                disabled={!isPublished}
              />
              {postBodyEdited && (
                <div style={{ marginTop: 4, fontSize: 11, color: '#8c8c8c' }}>
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, height: 'auto', fontSize: 11 }}
                    onClick={() => {
                      setPostBodyEdited(false);
                      setPostBody(buildPostBody(parameterValues));
                    }}
                  >
                    {t('tester.resetBody') || 'Reset'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Request URL */}
          <div>
            <div style={sectionHeaderStyle}>
              {t('tester.requestUrl') || 'Anfrage-URL'}
            </div>
            <div style={{
              background: '#fafafa',
              borderRadius: 6,
              border: '1px solid #e8e8e8',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #e8e8e8' }}>
                <span style={{
                  background: httpMethod === 'GET' ? '#1AA24A' : '#d4880f',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                }}>{httpMethod}</span>
                <span style={{ flex: 1 }} />
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(wizardUrl);
                    notification.success({ title: t('tester.urlCopied') });
                  }}
                  style={{ color: '#8c8c8c', fontSize: 12 }}
                >
                  {t('tester.copy') || 'Kopieren'}
                </Button>
              </div>
              <TextArea
                value={wizardUrl}
                onChange={(e) => {
                  setWizardUrl(e.target.value);
                  setUrlManuallyEdited(true);
                }}
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{
                  fontFamily: 'SF Mono, Fira Code, Fira Mono, Menlo, monospace',
                  fontSize: 12,
                  background: 'white',
                  border: 'none',
                  borderRadius: 0,
                  resize: 'none'
                }}
                disabled={!isPublished}
              />
            </div>
            {urlManuallyEdited && (
              <div style={{ marginTop: 4, fontSize: 11, color: '#8c8c8c' }}>
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0, height: 'auto', fontSize: 11 }}
                  onClick={() => {
                    setUrlManuallyEdited(false);
                    setWizardUrl(buildWizardUrl(parameterValues, selectedEndpoint, httpMethod));
                  }}
                >
                  {t('tester.resetUrl')}
                </Button>
              </div>
            )}
          </div>

          {/* Test Button */}
          <Button
            type="primary"
            icon={<CaretRightOutlined />}
            onClick={handleWizardTest}
            loading={wizardTesting}
            disabled={!isPublished}
            block
            style={{ boxShadow: 'none', background: '#9133E8', borderColor: '#9133E8', height: 40 }}
          >
            {t('tester.runTest')}
          </Button>
        </div>
      </Splitter.Panel>

      <Splitter.Panel style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        {/* Response header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={sectionHeaderStyle}>
            {t('tester.response')}
          </div>
          {wizardResult && !wizardError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: '#f6ffed',
                color: '#52c41a',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a', display: 'inline-block' }} />
                200 OK
              </span>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>{wizardResponseTime} ms</span>
            </div>
          )}
          {wizardError && (
            <span style={{
              background: '#fff2f0',
              color: '#ff4d4f',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600
            }}>
              Error
            </span>
          )}
        </div>

        {/* Response body */}
        {wizardError && (
          <Alert
            title={wizardError}
            type="error"
            showIcon
            style={{ marginBottom: 8 }}
          />
        )}

        {wizardResult && (
          <div
            ref={responseBoxRef}
            className="json-viewer-container"
            style={{
              flex: 1,
              overflow: 'auto',
              maxHeight: responseBoxHeight,
              opacity: wizardTesting ? 0.5 : 1,
              transition: 'opacity 0.15s ease-in-out',
            }}
          >
            <JsonView
              data={wizardResult}
              shouldExpandNode={(level, _value, field) => {
                if (field === 'metadata' || field === 'service') return false;
                return level < 4;
              }}
              style={jsonViewStyles}
            />
          </div>
        )}

        {!wizardResult && !wizardError && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bfbfbf',
            fontSize: 13,
            borderRadius: 6,
            minHeight: 200
          }}>
            {t('tester.runTestToSeeResults')}
          </div>
        )}
      </Splitter.Panel>
    </Splitter>
  );
};

export default ServiceTester;