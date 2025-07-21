'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Space, Typography, Alert, Spin, message, Statistic, Row, Col, Divider, Tag, App, Layout, Breadcrumb, Tabs, Tooltip } from 'antd';
import { SendOutlined, ClearOutlined, ThunderboltOutlined, DatabaseOutlined, ClockCircleOutlined, CopyOutlined, CodeOutlined, ApiOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function ApiTesterPage() {
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
    apiId: "ab3202cb-d0af-41af-88ce-7e51f5f6b6d3",
    token: "hiqelc-b-o",
    inputs: {
      "interest": 0.06,
      "monthly": 512,
      "months": 240,
      "starting": 18000
    }
  };

  useEffect(() => {
    // Get service ID from URL parameter, fallback to demo
    const serviceIdFromUrl = searchParams.get('service');
    const serviceNameFromUrl = searchParams.get('name');
    const apiId = serviceIdFromUrl || demoData.apiId;

    if (serviceIdFromUrl) {
      // If we have the name from URL, use it immediately
      if (serviceNameFromUrl) {
        setServiceInfo({ id: serviceIdFromUrl, name: serviceNameFromUrl });
        setServiceLoading(false);
        // Still fetch full details for inputs, but don't block UI
        fetchServiceDetails(serviceIdFromUrl, false);
      } else {
        // Only set loading if we don't have the name
        setServiceLoading(true);
        fetchServiceDetails(serviceIdFromUrl, true);
      }
    } else {
      // Use demo data
      setServiceInfo(null);
      setServiceLoading(false);
      form.setFieldsValue({
        apiId: apiId,
        token: demoData.token,
        inputs: JSON.stringify(demoData.inputs, null, 2)
      });
    }
  }, [searchParams]);

  const fetchServiceDetails = async (serviceId: string, updateServiceInfo: boolean = true) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const service = await response.json();

        // Only update service info if requested (for cases where we already have name from URL)
        if (updateServiceInfo) {
          setServiceInfo(service);
        }

        // Build inputs object from service input definitions
        const inputsObj: Record<string, any> = {};
        if (service.inputs && Array.isArray(service.inputs)) {
          service.inputs.forEach((input: any) => {
            // Use alias if available, otherwise use name
            const paramName = input.alias || input.name;
            inputsObj[paramName] = input.value || (input.type === 'number' ? 0 : '');
          });
        }

        form.setFieldsValue({
          apiId: serviceId,
          token: '', // User needs to provide token
          inputs: JSON.stringify(inputsObj, null, 2)
        });
      }
    } catch (error) {
      console.error('Failed to fetch service details:', error);
      // Fallback to empty inputs
      form.setFieldsValue({
        apiId: serviceId,
        token: '',
        inputs: '{}'
      });
    } finally {
      if (updateServiceInfo) {
        setServiceLoading(false);
      }
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();

    try {
      // Build URL with query parameters (matching the original implementation)
      const params = new URLSearchParams();
      params.append('api', values.apiId);
      if (values.token) params.append('token', values.token);

      // Parse and add input values
      if (values.inputs) {
        const inputData = JSON.parse(values.inputs);
        Object.entries(inputData).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key.toLowerCase(), String(value));
          }
        });
      }

      // Use relative URL for API calls (works on both localhost and production)
      const res = await fetch(`/api/getresults?${params.toString()}`);
      const data = await res.json();

      const endTime = Date.now();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResponse({
        ...data,
        totalTime: endTime - startTime
      });
      messageApi.success('API request successful!');
    } catch (err: any) {
      setError(err.message);
      messageApi.error('API request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    form.resetFields();
    setResponse(null);
    setError(null);
  };

  const loadDemoData = () => {
    setServiceInfo(null);
    form.setFieldsValue({
      apiId: demoData.apiId,
      token: demoData.token,
      inputs: JSON.stringify(demoData.inputs, null, 2)
    });
    messageApi.info('Demo data loaded');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{
        background: 'white',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
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
              label: <span><ApiOutlined /> Test API</span>
            },
            {
              key: 'docs',
              label: <span><CodeOutlined /> API Documentation</span>
            }
          ]}
        />

        {activeTab === 'test' ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              title={<span><ApiOutlined /> Test Your API</span>}
              extra={
                serviceInfo && (
                  <Space>
                    <Tag color={serviceInfo.status === 'published' ? 'success' : 'warning'}>
                      {serviceInfo.status === 'published' ? 'Published' : 'Draft'}
                    </Tag>
                    {serviceInfo.requireToken && <Tag color="blue">Token Required</Tag>}
                  </Space>
                )
              }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Service ID"
                      name="apiId"
                      rules={[{ required: true, message: 'Please enter your Service ID' }]}
                      tooltip="The unique identifier for your API service"
                    >
                      <Input
                        placeholder="e.g., ab3202cb-d0af-41af-88ce-7e51f5f6b6d3"
                        size="large"
                        disabled={!!searchParams.get('service')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="API Token"
                      name="token"
                      tooltip="Required for private APIs. Get your token from the service settings."
                      extra={serviceInfo?.requireToken ? <Text type="danger">This service requires a token</Text> : <Text type="secondary">Optional for this service</Text>}
                    >
                      <Input.Password
                        placeholder={serviceInfo?.requireToken ? "Enter your API token (required)" : "Enter your API token (optional)"}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <Space>
                      <span>Input Parameters</span>
                      {serviceInfo?.inputs?.length > 0 && (
                        <Button
                          size="small"
                          type="link"
                          onClick={() => {
                            const exampleInputs: Record<string, any> = {};
                            serviceInfo.inputs.forEach((input: any) => {
                              const paramName = input.alias || input.name;
                              exampleInputs[paramName] = input.value ||
                                (input.type === 'number' ? (input.min || 1000) : 'example');
                            });
                            form.setFieldValue('inputs', JSON.stringify(exampleInputs, null, 2));
                          }}
                        >
                          Use Example Values
                        </Button>
                      )}
                    </Space>
                  }
                  name="inputs"
                  help={
                    serviceInfo?.inputs?.length > 0 ? (
                      <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
                        <Text type="secondary">Expected parameters:</Text>
                        {serviceInfo.inputs.map((input: any) => (
                          <Text key={input.id} type="secondary" style={{ fontSize: '12px' }}>
                            • <strong>{input.alias || input.name}</strong> ({input.type})
                            {input.mandatory === false && ' - optional'}
                            {input.min !== undefined && ` - min: ${input.min}`}
                            {input.max !== undefined && ` - max: ${input.max}`}
                          </Text>
                        ))}
                      </Space>
                    ) : "Provide input values as a JSON object"
                  }
                  rules={[
                    { required: true, message: 'Please provide input values' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        try {
                          JSON.parse(value);
                          return Promise.resolve();
                        } catch (error) {
                          return Promise.reject(new Error('Invalid JSON format'));
                        }
                      },
                    },
                  ]}
                >
                  <TextArea
                    rows={8}
                    placeholder='{\n  "interest": 0.06,\n  "monthly": 512,\n  "months": 240,\n  "starting": 18000\n}'
                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                  />
                </Form.Item>

                <Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate
                  >
                    {({ getFieldsValue }) => {
                      const values = getFieldsValue();
                      let previewUrl = `/api/getresults?service=${values.apiId || '{service-id}'}`;

                      if (values.token) {
                        previewUrl += `&token=${values.token}`;
                      }

                      try {
                        if (values.inputs) {
                          const inputData = JSON.parse(values.inputs);
                          Object.entries(inputData).forEach(([key, value]) => {
                            if (value !== undefined && value !== '') {
                              previewUrl += `&${key.toLowerCase()}=${encodeURIComponent(String(value))}`;
                            }
                          });
                        }
                      } catch (e) {
                        // Invalid JSON, ignore
                      }

                      // Use relative URL to avoid hydration mismatch
                      const displayUrl = previewUrl;
                      const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${previewUrl}` : previewUrl;

                      return (
                        <div style={{
                          marginTop: 16,
                          marginBottom: 16,
                          padding: '12px 16px',
                          background: '#f5f5f5',
                          borderRadius: '8px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ marginBottom: 4 }}>
                            <Text strong>Preview URL:</Text>
                          </div>
                          <Typography.Paragraph
                            copyable={{
                              text: fullUrl,
                              tooltips: ['Copy URL', 'Copied!'],
                              icon: <CopyOutlined />
                            }}
                            // code
                            style={{
                              fontSize: '12px',
                              wordBreak: 'break-all',
                              margin: 0
                            }}
                          >
                            {displayUrl}
                          </Typography.Paragraph>
                        </div>
                      );
                    }}
                  </Form.Item>

                  <Space size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SendOutlined />}
                      size="large"
                    >
                      Test API
                    </Button>
                    <Button
                      size="large"
                      onClick={() => setActiveTab('docs')}
                      icon={<CodeOutlined />}
                    >
                      View Documentation
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
            {serviceInfo && (
              <Alert
                message={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>{serviceInfo.name}</Text>
                    {serviceInfo.description && <Text type="secondary">{serviceInfo.description}</Text>}
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        <strong>Expected Outputs:</strong>
                      </Text>
                      {serviceInfo.outputs && serviceInfo.outputs.map((output: any) => (
                        <Text key={output.id} type="secondary" style={{ marginLeft: 16 }}>
                          • <strong>{output.name}</strong>: {output.type}
                          {output.value !== undefined && ` (example: ${output.value})`}
                        </Text>
                      ))}
                    </Space>
                  </Space>
                }
                type="info"
                closable
                style={{ marginBottom: 0, borderColor: '#E8E8E8' }}
              />
            )}

            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            )}

            {response && (
              <>
                {/* Performance Statistics */}
                <Card title="Performance Statistics">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Total Request Time"
                        value={response.totalTime || response.requestTimings?.totalRequestTime}
                        suffix="ms"
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="API Data Time"
                        value={response.info?.timeApiData}
                        suffix="ms"
                        prefix={<DatabaseOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Calculation Time"
                        value={response.info?.timeCalculation}
                        suffix="ms"
                        prefix={<ThunderboltOutlined />}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Text strong>Process Cache: </Text>
                      <Tag color={response.info?.fromProcessCache ? 'success' : 'default'}>
                        {response.info?.fromProcessCache ? 'Hit' : 'Miss'}
                      </Tag>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text strong>Memory Used: </Text>
                      <Text>{response.info?.memoryUsed}</Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text strong>Cache Size: </Text>
                      <Text>{response.info?.processCacheStats?.size}/{response.info?.processCacheStats?.maxSize}</Text>
                    </Col>
                  </Row>
                </Card>

                {/* Input/Output Values */}
                <Card title="Calculation Results">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {response.inputs && (
                      <div>
                        <Title level={5}>Input Values</Title>
                        <Row gutter={[16, 8]}>
                          {response.inputs.map((input: any, index: number) => (
                            <Col xs={24} sm={12} key={index}>
                              <Text strong>{input.alias || input.name}: </Text>
                              <Text code>{input.value}</Text>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}

                    {response.outputs && (
                      <div>
                        <Divider />
                        <Title level={5}>Output Values</Title>
                        <Row gutter={[16, 8]}>
                          {response.outputs.map((output: any, index: number) => (
                            <Col xs={24} sm={12} key={index}>
                              <Text strong>{output.alias || output.name}: </Text>
                              <Text code style={{ fontSize: '16px' }}>
                                {typeof output.value === 'number'
                                  ? output.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                  : output.value}
                              </Text>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Space>
                </Card>

                {/* Raw Response */}
                <Card
                  title="Raw Response"
                  extra={
                    <Button
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(response, null, 2));
                        messageApi.success('Copied to clipboard');
                      }}
                    >
                      Copy
                    </Button>
                  }
                >
                  <pre style={{
                    backgroundColor: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '400px',
                    fontSize: '12px',
                  }}>
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </Card>
              </>
            )}
          </Space>
        ) : (
          <ApiDocumentation
            serviceInfo={serviceInfo}
            serviceId={searchParams.get('service') || demoData.apiId}
            requireToken={serviceInfo?.requireToken || false}
          />
        )}
      </div>
    </Layout>
  );
}

function ApiDocumentation({ serviceInfo, serviceId, requireToken }: any) {
  const [activeCodeTab, setActiveCodeTab] = useState('javascript');
  const [testLoading, setTestLoading] = useState(false);
  const { message: messageApi } = App.useApp();
  const router = useRouter();

  // Use current origin for local development
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io';
  const endpoint = `${baseUrl}/api/getresults?service=${serviceId}`;

  // Generate parameter string for examples
  const getParamString = (separator = '&', prefix = '') => {
    if (!serviceInfo?.inputs) return '';
    return serviceInfo.inputs
      .map((input: any) => `${separator}${prefix}${input.alias || input.name}=${input.value || (input.type === 'number' ? '1000' : 'value')}`)
      .join('');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    messageApi.success(`${type} copied to clipboard`);
  };

  const codeExamples = {
    javascript: {
      label: 'JavaScript',
      code: `// JavaScript fetch example
const params = {
${requireToken ? '  "token": "your-api-token",\n' : ''}${serviceInfo?.inputs?.map((i: any) => `  "${i.alias || i.name}": ${i.type === 'number' ? (i.value || '1000') : `"${i.value || 'value'}"`}`).join(',\n') || '  // Add your parameters here'}
};

// Build URL with parameters
const url = new URL("${endpoint}");
Object.keys(params).forEach(key => {
  url.searchParams.append(key, params[key]);
});

fetch(url.toString(), {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`
    },
    python: {
      label: 'Python',
      code: `# Python requests example
import requests

params = {
${requireToken ? '    "token": "your-api-token",\n' : ''}${serviceInfo?.inputs?.map((i: any) => `    "${i.alias || i.name}": ${i.type === 'number' ? (i.value || '1000') : `"${i.value || 'value'}"`}`).join(',\n') || '    # Add your parameters here'}
}

response = requests.get("${endpoint}", params=params)
data = response.json()
print(data)`
    },
    curl: {
      label: 'cURL',
      code: `# cURL command
curl -X GET "${endpoint}${requireToken ? '&token=your-api-token' : ''}${getParamString()}"`
    },
    nodejs: {
      label: 'Node.js',
      code: `// Node.js with axios
const axios = require('axios');

const params = {
${requireToken ? '  token: "your-api-token",\n' : ''}${serviceInfo?.inputs?.map((i: any) => `  ${i.alias || i.name}: ${i.type === 'number' ? (i.value || '1000') : `"${i.value || 'value'}"`}`).join(',\n') || '  // Add your parameters here'}
};

axios.get('${endpoint}', { params })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`
    },
    postman: {
      label: 'Postman',
      code: `// Postman Instructions
// 1. Create a new GET request
// 2. Enter the URL:
${endpoint}

// 3. Go to the "Params" tab and add:
// KEY              VALUE
${requireToken ? 'token            your-api-token\n' : ''}${serviceInfo?.inputs?.map((i: any) => `${(i.alias || i.name).padEnd(16)} ${i.value || (i.type === 'number' ? '1000' : 'your-value')}`).join('\n') || '// Add your parameters'}

// 4. Click "Send" to execute the request

// Alternative: Import this complete URL
${endpoint}${requireToken ? '&token=your-api-token' : ''}${getParamString()}

// Pro tip: Use Postman variables
// {{base_url}}/api/getresults?service={{service_id}}${requireToken ? '&token={{api_token}}' : ''}${serviceInfo?.inputs?.map((i: any) => `&${i.alias || i.name}={{${i.alias || i.name}}}`).join('') || ''}

// To parse the response:
// - Go to "Tests" tab
// - Add: const jsonData = pm.response.json();
// - Access outputs: jsonData.outputs[0].value`
    },
    excel: {
      label: 'Excel',
      code: `' Excel WEBSERVICE Function (Windows only)
' The WEBSERVICE function fetches data from web APIs

' Basic formula with all parameters:
=WEBSERVICE("${endpoint}${requireToken ? '&token=your-api-token' : ''}${getParamString()}")

' With cell references (parameters in cells A2, B2, etc.):
=WEBSERVICE("${endpoint}${requireToken ? '&token=" & A2' : '"'}${serviceInfo?.inputs?.map((i: any, idx: number) => ' & "&' + (i.alias || i.name) + '=" & ' + String.fromCharCode(66 + idx) + '2').join('') || ''})

' To extract a specific value from JSON response:
=FILTERXML(WEBSERVICE("${endpoint}${requireToken ? '&token=your-api-token' : ''}${getParamString()}"), "//outputs/value[1]")

' Complete example with error handling:
=IFERROR(WEBSERVICE("${endpoint}${requireToken ? '&token=" & A2' : '"'}${serviceInfo?.inputs?.map((i: any, idx: number) => ' & "&' + (i.alias || i.name) + '=" & ' + String.fromCharCode(66 + idx) + '2').join('') || ''}),"API Error")

' Function names in other languages:
' 🇬🇧 English: WEBSERVICE()
' 🇩🇪 German: WEBDIENST()
' 🇫🇷 French: SERVICEWEB()
' 🇪🇸 Spanish: SERVICIOWEB()
' 🇮🇹 Italian: SERVIZIO.WEB()
' 🇵🇹 Portuguese: SERVIÇOWEB()

' Note: For complex JSON, use Power Query (Data > Get Data > From Web)`
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Service Status Alert */}
      {/* {serviceInfo && serviceInfo.status !== 'published' && (
        <Alert
          message="Service Not Published"
          description="This service must be published before it can be accessed via the API endpoint."
          type="warning"
          showIcon
        />
      )} */}

      {/* Endpoint Overview */}
      <Card
        title="API Endpoint"
        extra={
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              // Switch to test tab with example values
              router.push(`/api-tester?service=${serviceId}${serviceInfo?.name ? `&name=${encodeURIComponent(serviceInfo.name)}` : ''}`);
              window.location.reload();
            }}
          >
            Try It Now
          </Button>
        }
      >
        <div style={{
          background: serviceInfo?.status === 'published' ? '#f6ffed' : '#f5f5f5',
          border: `1px solid ${serviceInfo?.status === 'published' ? '#b7eb8f' : '#d9d9d9'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }} wrap>
              <Space>
                <Tag color={serviceInfo?.status === 'published' ? 'success' : 'orange'} style={{ fontSize: '14px' }}>
                  {serviceInfo?.status === 'published' ? 'LIVE' : 'DRAFT'}
                </Tag>
                <Text strong style={{ color: serviceInfo?.status === 'published' ? '#52c41a' : '#8c8c8c', fontSize: '16px' }}>GET</Text>
              </Space>
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(endpoint, 'Endpoint')}
              >
                Copy URL
              </Button>
            </Space>
            <Text style={{ fontSize: '14px', display: 'block', padding: '8px', background: 'white', borderRadius: '4px' }}>
              {endpoint}
            </Text>
            {requireToken && (
              <Alert
                message="Authentication Required"
                description="This API requires a valid token. Include it as a 'token' parameter in your request."
                type="info"
                showIcon
                icon={<KeyOutlined />}
                style={{ marginTop: '8px' }}
              />
            )}
          </Space>
        </div>

        <Title level={5}>Parameters</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          {serviceInfo?.inputs?.filter((i: any) => i.mandatory !== false).length > 0 && (
            <div>
              <Text strong>Required Parameters:</Text>
              <div style={{ marginTop: 8 }}>
                {serviceInfo.inputs.filter((i: any) => i.mandatory !== false).map((input: any) => (
                  <div key={input.id} style={{ marginBottom: 8 }}>
                    <Tag color="blue">{input.alias || input.name}</Tag>
                    <Text type="secondary">({input.type})</Text>
                    {input.description && <Text type="secondary" style={{ marginLeft: 8 }}>{input.description}</Text>}
                    {(input.min !== undefined || input.max !== undefined) && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {input.min !== undefined && `min: ${input.min}`}
                        {input.min !== undefined && input.max !== undefined && ', '}
                        {input.max !== undefined && `max: ${input.max}`}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {serviceInfo?.inputs?.filter((i: any) => i.mandatory === false).length > 0 && (
            <div>
              <Text strong>Optional Parameters:</Text>
              <div style={{ marginTop: 8 }}>
                {serviceInfo.inputs.filter((i: any) => i.mandatory === false).map((input: any) => (
                  <div key={input.id} style={{ marginBottom: 8 }}>
                    <Tag>{input.alias || input.name}</Tag>
                    <Text type="secondary">({input.type})</Text>
                    {input.description && <Text type="secondary" style={{ marginLeft: 8 }}>{input.description}</Text>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Text strong>System Parameters:</Text>
            <div style={{ marginTop: 8 }}>
              {requireToken && (
                <div style={{ marginBottom: 8 }}>
                  <Tag color="orange">token</Tag>
                  <Text type="secondary">(string) - API authentication token</Text>
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <Tag>nocache</Tag>
                <Text type="secondary">(boolean) - Set to "true" to bypass result caching</Text>
              </div>
            </div>
          </div>
        </Space>
      </Card>

      {/* Code Examples */}
      <Card
        title={
          <Space>
            <CodeOutlined />
            <span>Integration Examples</span>
          </Space>
        }
        extra={
          <Text type="secondary">Ready-to-use code with your parameters</Text>
        }
      >
        <Tabs
          activeKey={activeCodeTab}
          onChange={setActiveCodeTab}
          tabBarStyle={{ marginBottom: 0 }}
          items={Object.entries(codeExamples).map(([key, example]) => ({
            key,
            label: (
              <span style={{ padding: '0 8px' }}>
                {example.label}
                {key === 'excel' && <Tooltip title="Windows only"><Tag style={{ marginLeft: 4 }} color="orange">Win</Tag></Tooltip>}
              </span>
            ),
            children: (
              <div style={{ position: 'relative', paddingTop: '24px' }}>
                <div style={{
                  position: 'absolute',
                  top: 32,
                  right: 8,
                  zIndex: 1,
                  display: 'flex',
                  gap: 8
                }}>
                  {key === 'curl' && (
                    <Button
                      size="small"
                      onClick={() => {
                        const command = example.code.split('\n').find(line => line.startsWith('curl'));
                        if (command) {
                          navigator.clipboard.writeText(command);
                          messageApi.success('Command copied! Paste it in your terminal');
                        }
                      }}
                    >
                      Copy Command
                    </Button>
                  )}
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(example.code, `${example.label} code`)}
                  >
                    Copy All
                  </Button>
                </div>
                {key === 'excel' || key === 'postman' ? (
                  <pre style={{
                    backgroundColor: '#f5f5f5',
                    color: '#262626',
                    padding: '24px',
                    paddingTop: '16px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
                    border: '1px solid #e8e8e8'
                  }}>
                    {example.code}
                  </pre>
                ) : (
                  <SyntaxHighlighter
                    language={key === 'javascript' ? 'javascript' : key === 'python' ? 'python' : key === 'curl' ? 'bash' : 'javascript'}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: '8px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      padding: '24px',
                      paddingTop: '16px'
                    }}
                    showLineNumbers={false}
                  >
                    {example.code}
                  </SyntaxHighlighter>
                )}
              </div>
            )
          }))}
        />
      </Card>

      {/* Response Format */}
      <Card title="Response Format">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Success Response</Title>
            <Text type="secondary">Status Code: 200 OK</Text>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '8px'
            }}>
              {`{
  "apiId": "${serviceId}",
  "inputs": [${serviceInfo?.inputs?.map((i: any) => `
    {
      "type": "input",
      "name": "${i.name}",
      "alias": "${i.alias || i.name}",
      "value": ${i.type === 'number' ? '1000' : '"value"'}
    }`).join(',') || ''}
  ],
  "outputs": [${serviceInfo?.outputs?.map((o: any) => `
    {
      "type": "output",
      "name": "${o.name}",
      "alias": "${o.alias || o.name}",
      "value": ${o.type === 'number' ? '12345.67' : '"calculated_result"'}
    }`).join(',') || ''}
  ],
  "info": {
    "timeApiData": 45,
    "timeCalculation": 120,
    "timeAll": 165,
    "fromProcessCache": false
  }
}`}
            </pre>
          </div>

          <div>
            <Title level={5}>Error Response</Title>
            <Text type="secondary">Status Code: 400 Bad Request</Text>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '8px'
            }}>
              {`{
  "error": "Missing required parameter: amount",
  "message": "This API requires certain parameters to function.",
  "parameters": {
    "required": [...],
    "optional": [...]
  }
}`}
            </pre>
          </div>
        </Space>
      </Card>

      {/* Security Notice */}
      <Alert
        message="Security Notice"
        description={
          <Space direction="vertical">
            <Text>This API endpoint is publicly accessible. To secure your API:</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Enable token authentication in your service settings</li>
              <li>Keep your API tokens secure and rotate them regularly</li>
              <li>Monitor your API usage through the analytics dashboard</li>
              <li>Consider implementing rate limiting for production use</li>
            </ul>
          </Space>
        }
        type="info"
        showIcon
        icon={<KeyOutlined />}
      />
    </Space>
  );
}