'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Space, Typography, Alert, Spin, message, Statistic, Row, Col, Divider, Tag, App } from 'antd';
import { SubPageLayout } from '@/components/SubPageLayout';
import { SendOutlined, ClearOutlined, ThunderboltOutlined, DatabaseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function ApiTesterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const searchParams = useSearchParams();
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
    const apiId = serviceIdFromUrl || demoData.apiId;
    
    if (serviceIdFromUrl) {
      // Fetch service details to get input parameters
      fetchServiceDetails(serviceIdFromUrl);
    } else {
      // Use demo data
      setServiceInfo(null);
      form.setFieldsValue({
        apiId: apiId,
        token: demoData.token,
        inputs: JSON.stringify(demoData.inputs, null, 2)
      });
    }
  }, [searchParams]);

  const fetchServiceDetails = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const service = await response.json();
        setServiceInfo(service);
        
        // Build inputs object from service input definitions
        const inputsObj: Record<string, any> = {};
        if (service.inputs && Array.isArray(service.inputs)) {
          service.inputs.forEach((input: any) => {
            inputsObj[input.name] = input.value || (input.type === 'number' ? 0 : '');
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
      message.success('API request successful!');
    } catch (err: any) {
      setError(err.message);
      message.error('API request failed');
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
    <SubPageLayout
      title="API Service Tester"
      extra={
        <Space>
          <Button
            onClick={loadDemoData}
            disabled={loading}
          >
            Load Demo
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
            style={{ marginBottom: 16 }}
          />
        )}
        <Card>
          <Title level={4}>Test API Endpoint</Title>
          <Paragraph type="secondary">
            Test the SpreadAPI calculation endpoint with your API credentials and input parameters
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="API ID"
              name="apiId"
              rules={[{ required: true, message: 'Please enter your API ID' }]}
            >
              <Input placeholder="Enter your API ID" />
            </Form.Item>

            <Form.Item
              label="API Token"
              name="token"
              help="Optional: Add token for private APIs"
            >
              <Input placeholder="Enter your API token (optional)" />
            </Form.Item>

            <Form.Item
              label="Input Values (JSON)"
              name="inputs"
              help="Provide input values as a JSON object with parameter names as keys"
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
                rows={6}
                placeholder='{"interest": 0.06, "monthly": 512, "months": 240, "starting": 18000}'
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                size="large"
              >
                Calculate
              </Button>
            </Form.Item>
          </Form>
        </Card>

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
                    message.success('Copied to clipboard');
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
    </SubPageLayout>
  );
}