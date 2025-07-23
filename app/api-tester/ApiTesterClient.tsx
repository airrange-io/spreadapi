'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Space, Typography, Alert, Spin, message, Statistic, Row, Col, Divider, Tag, App, Layout, Breadcrumb, Tabs, Tooltip } from 'antd';
import { SendOutlined, ClearOutlined, ThunderboltOutlined, DatabaseOutlined, ClockCircleOutlined, CopyOutlined, CodeOutlined, ApiOutlined, KeyOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function ApiTesterClient() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'test' | 'docs'>('test');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { message: messageApi } = App.useApp();

  // Default demo data
  const demoData = {
    apiId: "test1234_mdejqoua8ptor", // Warming service
    token: "hiqelc-b-o",
    inputs: {
      "interest": 0.06,
      "payment": 10000,
      "periods": 5
    }
  };

  // Read query parameters
  const serviceId = searchParams.get('service');
  const serviceName = searchParams.get('name');

  // Load service info when serviceId is provided
  useEffect(() => {
    if (serviceId) {
      loadServiceInfo();
    }
  }, [serviceId]);

  const loadServiceInfo = async () => {
    if (!serviceId) return;
    
    setServiceLoading(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok && response.status !== 204) {
        const data = await response.json();
        setServiceInfo(data);
        
        // Set initial form values based on service info
        const initialValues: any = {
          apiId: serviceId,
          inputs: {}
        };
        
        // Add input fields based on service definition
        if (data.inputs && Array.isArray(data.inputs)) {
          data.inputs.forEach((input: any) => {
            // Set a default value based on type
            let defaultValue: any = '';
            if (input.type === 'number') {
              defaultValue = input.min || 0;
            } else if (input.type === 'boolean') {
              defaultValue = false;
            }
            initialValues.inputs[input.alias || input.name] = defaultValue;
          });
        }
        
        form.setFieldsValue(initialValues);
      }
    } catch (error) {
      console.error('Error loading service info:', error);
      messageApi.error('Failed to load service information');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Handle both 'api' and 'service' parameter names
      if (values.apiId) {
        params.append('api', values.apiId);
      }
      
      if (values.token) {
        params.append('token', values.token);
      }

      // Add input parameters
      if (values.inputs) {
        Object.entries(values.inputs).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      // Add nocache if specified
      if (values.nocache) {
        params.append('nocache', 'true');
      }

      const url = `/api/getresults?${params.toString()}`;
      const startTime = Date.now();
      
      const res = await fetch(url);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}: ${res.statusText}`);
      } else {
        // Add response time to the data
        setResponse({ ...data, responseTime });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    form.resetFields();
    setResponse(null);
    setError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    messageApi.success('Copied to clipboard');
  };

  const getCodeExample = (language: string) => {
    const apiId = form.getFieldValue('apiId') || demoData.apiId;
    const token = form.getFieldValue('token') || '';
    const inputs = form.getFieldValue('inputs') || {};
    
    const params = new URLSearchParams();
    params.append('api', apiId);
    if (token) params.append('token', token);
    Object.entries(inputs).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io';
    const fullUrl = `${baseUrl}/api/getresults?${params.toString()}`;

    switch (language) {
      case 'javascript':
        return `// JavaScript Fetch API
const response = await fetch('${fullUrl}');
const data = await response.json();
console.log(data);`;

      case 'python':
        return `# Python with requests
import requests

response = requests.get('${fullUrl}')
data = response.json()
print(data)`;

      case 'curl':
        return `# cURL command
curl "${fullUrl}"`;

      case 'nodejs':
        return `// Node.js with axios
const axios = require('axios');

const response = await axios.get('${fullUrl}');
console.log(response.data);`;

      case 'postman':
        return `// Postman Configuration
// 1. Create a new GET request
// 2. Set URL: ${fullUrl}
// 3. No headers required unless using authentication
// 4. Click "Send" to execute

// For authenticated requests:
// Add header: Authorization: Bearer YOUR_TOKEN
// Or use query parameter: ?token=YOUR_TOKEN`;

      case 'excel':
        return `// Excel WEBSERVICE Function (Windows only)
// In any cell, enter:
=WEBSERVICE("${fullUrl}")

// For German Excel:
=WEBDIENST("${fullUrl}")

// For French Excel:
=SERVICEWEB("${fullUrl}")

// Note: This function is only available in Excel for Windows with an internet connection`;

      default:
        return '';
    }
  };

  // Build preview URL based on current form values
  const buildPreviewUrl = () => {
    const values = form.getFieldsValue();
    const params = new URLSearchParams();
    
    if (values.apiId) {
      params.append('api', values.apiId);
    }
    
    if (values.token) {
      params.append('token', values.token);
    }

    if (values.inputs) {
      Object.entries(values.inputs).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    if (values.nocache) {
      params.append('nocache', 'true');
    }

    return `/api/getresults?${params.toString()}`;
  };

  const previewUrl = buildPreviewUrl();
  const displayUrl = previewUrl;
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${previewUrl}` : previewUrl;

  const ApiDocumentation = () => (
    <div>
      <Card title="Integration Examples" style={{ marginBottom: 16 }}>
        <Tabs
          items={[
            {
              key: 'javascript',
              label: 'JavaScript',
              children: (
                <div style={{ position: 'relative' }}>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => copyToClipboard(getCodeExample('javascript'))}
                    style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                  >
                    Copy
                  </Button>
                  <div style={{ paddingTop: 32 }}>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
                      {getCodeExample('javascript')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            },
            {
              key: 'python',
              label: 'Python',
              children: (
                <div style={{ position: 'relative' }}>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => copyToClipboard(getCodeExample('python'))}
                    style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                  >
                    Copy
                  </Button>
                  <div style={{ paddingTop: 32 }}>
                    <SyntaxHighlighter language="python" style={vscDarkPlus}>
                      {getCodeExample('python')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            },
            {
              key: 'curl',
              label: 'cURL',
              children: (
                <div style={{ position: 'relative' }}>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => copyToClipboard(getCodeExample('curl'))}
                    style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                  >
                    Copy
                  </Button>
                  <div style={{ paddingTop: 32 }}>
                    <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                      {getCodeExample('curl')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            },
            {
              key: 'nodejs',
              label: 'Node.js',
              children: (
                <div style={{ position: 'relative' }}>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => copyToClipboard(getCodeExample('nodejs'))}
                    style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                  >
                    Copy
                  </Button>
                  <div style={{ paddingTop: 32 }}>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
                      {getCodeExample('nodejs')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            },
            {
              key: 'postman',
              label: 'Postman',
              children: (
                <div style={{ position: 'relative' }}>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => copyToClipboard(getCodeExample('postman'))}
                    style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                  >
                    Copy
                  </Button>
                  <div style={{ paddingTop: 32 }}>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
                      {getCodeExample('postman')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            },
            {
              key: 'excel',
              label: 'Excel',
              children: (
                <div style={{ position: 'relative' }}>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => copyToClipboard(getCodeExample('excel'))}
                    style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                  >
                    Copy
                  </Button>
                  <div style={{ paddingTop: 32 }}>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
                      {getCodeExample('excel')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <div style={{
        background: 'white', 
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        {(!searchParams.get('service') || !serviceLoading) && (
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                if (serviceInfo) {
                  router.push(`/service/${serviceInfo.id}`);
                } else {
                  router.push('/');
                }
              }}
              style={{ padding: '4px 8px' }}
            />
            <Breadcrumb items={[
              { title: <a onClick={() => router.push('/')}>Services</a> },
              ...(serviceInfo ? [{ title: <a onClick={() => router.push(`/service/${serviceInfo.id}`)}>{serviceInfo.name}</a> }] : []),
              { title: 'API Tester' }
            ]} />
          </Space>
        )}

      </div>

      <div style={{ padding: 24, paddingTop: 8 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'test' | 'docs')}
          style={{ marginBottom: 0 }}
          items={[
            {
              key: 'test',
              label: 'Test API',
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card title={
                      <Space>
                        <ApiOutlined />
                        API Configuration
                      </Space>
                    }>
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={serviceId ? {} : demoData}
                      >
                        <Form.Item
                          name="apiId"
                          label="API ID"
                          rules={[{ required: true, message: 'Please enter an API ID' }]}
                        >
                          <Input 
                            placeholder="Enter your API ID" 
                            disabled={!!serviceId}
                            prefix={<ApiOutlined />}
                          />
                        </Form.Item>

                        <Form.Item
                          name="token"
                          label={
                            <Space>
                              Token
                              <Tag color="orange">Optional</Tag>
                            </Space>
                          }
                        >
                          <Input.Password 
                            placeholder="Enter authentication token (if required)" 
                            prefix={<KeyOutlined />}
                          />
                        </Form.Item>

                        {serviceLoading ? (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin />
                          </div>
                        ) : serviceInfo ? (
                          <>
                            <Divider orientation="left">Input Parameters</Divider>
                            <Form.Item name="inputs">
                              {serviceInfo.inputs && serviceInfo.inputs.length > 0 ? (
                                serviceInfo.inputs.map((input: any) => (
                                  <Form.Item
                                    key={input.id}
                                    name={['inputs', input.alias || input.name]}
                                    label={
                                      <Space>
                                        {input.name}
                                        {input.mandatory !== false && <Tag color="red">Required</Tag>}
                                        {input.type && <Tag>{input.type}</Tag>}
                                      </Space>
                                    }
                                    rules={[
                                      { 
                                        required: input.mandatory !== false, 
                                        message: `Please enter ${input.name}` 
                                      },
                                      ...(input.type === 'number' ? [{
                                        type: 'number' as const,
                                        transform: (value: any) => value ? Number(value) : value,
                                        message: 'Please enter a valid number'
                                      }] : [])
                                    ]}
                                    help={input.description}
                                  >
                                    <Input 
                                      type={input.type === 'number' ? 'number' : 'text'}
                                      placeholder={`Enter ${input.name}`}
                                    />
                                  </Form.Item>
                                ))
                              ) : (
                                <Alert 
                                  type="info" 
                                  message="No input parameters defined"
                                  description="This API doesn't require any input parameters"
                                />
                              )}
                            </Form.Item>
                          </>
                        ) : (
                          <>
                            <Divider orientation="left">Input Parameters</Divider>
                            <Form.Item
                              label="Parameters (JSON format)"
                              extra="Enter the input parameters as JSON"
                            >
                              <Form.Item
                                name="inputs"
                                noStyle
                              >
                                <TextArea
                                  rows={6}
                                  placeholder='{"key": "value"}'
                                  style={{ fontFamily: 'monospace' }}
                                />
                              </Form.Item>
                            </Form.Item>
                          </>
                        )}

                        <Form.Item
                          name="nocache"
                          valuePropName="checked"
                        >
                          <Space>
                            <input type="checkbox" />
                            <span>Bypass cache (force fresh calculation)</span>
                          </Space>
                        </Form.Item>

                        <Divider />

                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary">Preview URL:</Text>
                          <div style={{ 
                            marginTop: 8, 
                            padding: '8px 12px', 
                            background: '#f5f5f5', 
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <Text code style={{ flex: 1, wordBreak: 'break-all' }}>{displayUrl}</Text>
                            <Tooltip title="Copy full URL">
                              <Button
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => copyToClipboard(fullUrl)}
                              />
                            </Tooltip>
                          </div>
                        </div>

                        <Form.Item>
                          <Space>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={loading}
                              icon={<SendOutlined />}
                            >
                              Test API
                            </Button>
                            <Button
                              onClick={handleClear}
                              icon={<ClearOutlined />}
                            >
                              Clear
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    {error && (
                      <Alert
                        message="API Error"
                        description={error}
                        type="error"
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    {response && (
                      <Card 
                        title={
                          <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            API Response
                          </Space>
                        }
                        extra={
                          <Space>
                            <Tag color="green">{response.responseTime}ms</Tag>
                            <Button
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                            >
                              Copy
                            </Button>
                          </Space>
                        }
                      >
                        {response.serviceInfo && (
                          <Alert
                            message={
                              <Space>
                                <ApiOutlined />
                                {response.serviceInfo.name}
                              </Space>
                            }
                            description={response.serviceInfo.description}
                            type="info"
                            style={{ marginBottom: 16 }}
                          />
                        )}

                        {response.inputs && (
                          <div style={{ marginBottom: 16 }}>
                            <Title level={5}>Inputs</Title>
                            <pre style={{
                              background: '#f5f5f5',
                              padding: 12,
                              borderRadius: 4,
                              overflow: 'auto',
                              maxHeight: 150
                            }}>
                              {JSON.stringify(response.inputs, null, 2)}
                            </pre>
                          </div>
                        )}

                        {(response.outputs || response.result) && (
                          <div style={{ marginBottom: 16 }}>
                            <Title level={5}>Outputs</Title>
                            <pre style={{
                              background: '#f5f5f5',
                              padding: 12,
                              borderRadius: 4,
                              overflow: 'auto',
                              maxHeight: 300
                            }}>
                              {JSON.stringify(response.outputs || response.result, null, 2)}
                            </pre>
                          </div>
                        )}

                        {(response.info || response.meta) && (
                          <Row gutter={[16, 16]}>
                            <Col span={8}>
                              <Statistic
                                title="Calculation Time"
                                value={response.info?.timeCalculation || response.meta?.executionTime || 0}
                                suffix="ms"
                                prefix={<ThunderboltOutlined />}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic
                                title="API Data Time"
                                value={response.info?.timeApiData || 0}
                                suffix="ms"
                                prefix={<DatabaseOutlined />}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic
                                title="Total Time"
                                value={response.responseTime}
                                suffix="ms"
                                prefix={<ClockCircleOutlined />}
                              />
                            </Col>
                          </Row>
                        )}

                        {response.debug && (
                          <div style={{ marginTop: 16 }}>
                            <Title level={5}>Debug Information</Title>
                            <pre style={{
                              background: '#f5f5f5',
                              padding: 12,
                              borderRadius: 4,
                              overflow: 'auto',
                              fontSize: 12
                            }}>
                              {JSON.stringify(response.debug, null, 2)}
                            </pre>
                          </div>
                        )}
                      </Card>
                    )}
                  </Col>
                </Row>
              )
            },
            {
              key: 'docs',
              label: 'Documentation',
              children: <ApiDocumentation />
            }
          ]}
        />
      </div>
    </Layout>
  );
}