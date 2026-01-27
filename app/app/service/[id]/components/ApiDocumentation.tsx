'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, Spin, Alert, Button, Space, Typography, App } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic<any>(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>
});

const { Text, Paragraph, Title } = Typography;

interface ApiDocumentationProps {
  serviceId: string;
  isPublished: boolean;
}

const ApiDocumentation: React.FC<ApiDocumentationProps> = ({ serviceId, isPublished }) => {
  const { notification } = App.useApp();
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swaggerLoaded, setSwaggerLoaded] = useState(false);

  useEffect(() => {
    if (!isPublished) {
      setLoading(false);
      return;
    }

    fetchOpenAPISpec();
  }, [serviceId, isPublished]);

  const fetchOpenAPISpec = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/v1/services/${serviceId}/openapi`);

      if (!response.ok) {
        throw new Error('Failed to load API specification');
      }

      const data = await response.json();
      setSpec(data);
    } catch (err: any) {
      console.error('Error loading OpenAPI spec:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSpec = (format: 'json' | 'yaml') => {
    const url = `/api/v1/services/${serviceId}/openapi?format=${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${serviceId}-openapi.${format}`;
    link.click();
    notification.success({ message: `Downloaded OpenAPI spec as ${format.toUpperCase()}` });
  };

  const copySpecUrl = (format: 'json' | 'yaml') => {
    const url = `${window.location.origin}/api/v1/services/${serviceId}/openapi?format=${format}`;
    navigator.clipboard.writeText(url);
    notification.success({ message: 'Copied OpenAPI URL to clipboard' });
  };

  if (!isPublished) {
    return (
      <Alert
        title="Service Not Published"
        description="API documentation is only available for published services. Publish your service first to view the interactive documentation."
        type="info"
        showIcon
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin size="default" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading API documentation...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        title="Error Loading Documentation"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchOpenAPISpec}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ background: '#fff' }}>
      {/* Header with download options */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 15 }}>Interactive API Documentation</Text>
            <Space>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => downloadSpec('json')}
              >
                JSON
              </Button>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => downloadSpec('yaml')}
              >
                YAML
              </Button>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copySpecUrl('json')}
              >
                Copy Spec URL
              </Button>
            </Space>
          </div>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
            Use this OpenAPI specification to generate client SDKs, import into Postman/Insomnia,
            or integrate with API testing tools.
          </Paragraph>
        </Space>
      </div>

      {/* Tabs for different views */}
      <Tabs
        defaultActiveKey="quickstart"
        onChange={(key) => {
          if (key === 'interactive' && !swaggerLoaded) {
            setSwaggerLoaded(true);
          }
        }}
        items={[
          {
            key: 'interactive',
            label: 'Interactive Docs',
            children: spec && swaggerLoaded ? (
              <div className="swagger-wrapper" style={{ padding: 0 }}>
                <style jsx global>{`
                  .swagger-wrapper .swagger-ui {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  }
                  .swagger-wrapper .swagger-ui .topbar {
                    display: none;
                  }
                  .swagger-wrapper .swagger-ui .information-container {
                    padding: 20px;
                  }
                  .swagger-wrapper .swagger-ui .scheme-container {
                    padding: 20px;
                    background: #fafafa;
                  }
                `}</style>
                <SwaggerUI
                  spec={spec}
                  docExpansion="list"
                  defaultModelsExpandDepth={1}
                  displayRequestDuration={true}
                  filter={true}
                  showExtensions={true}
                  showCommonExtensions={true}
                />
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Text type="secondary">Click to load interactive API documentation</Text>
              </div>
            )
          },
          {
            key: 'quickstart',
            label: 'Quick Start',
            children: (
              <div style={{ padding: 24 }}>
                <QuickStartGuide serviceId={serviceId} spec={spec} />
              </div>
            )
          },
          {
            key: 'errors',
            label: 'Error Codes',
            children: (
              <div style={{ padding: 24 }}>
                <ErrorCodesReference />
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

// Quick Start Guide Component
const QuickStartGuide: React.FC<{ serviceId: string; spec: any }> = ({ serviceId, spec }) => {
  const exampleInput = spec?.paths?.[`/api/v1/services/${serviceId}/execute`]?.post?.requestBody?.content?.['application/json']?.examples?.basic;

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Title level={4}>Getting Started</Title>
        <Paragraph>
          This service can be called using GET or POST requests. Here's a quick guide:
        </Paragraph>
      </div>

      <div>
        <Title level={5}>1. GET Request (Simple)</Title>
        <Paragraph>Best for testing, Excel integration, and simple browser calls:</Paragraph>
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 6,
          overflow: 'auto'
        }}>
{`curl "https://spreadapi.io/api/v1/services/${serviceId}/execute?param1=value1&param2=value2"`}
        </pre>
      </div>

      <div>
        <Title level={5}>2. POST Request (Recommended)</Title>
        <Paragraph>Best for production integrations:</Paragraph>
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 6,
          overflow: 'auto',
          fontSize: 13
        }}>
{`curl -X POST "https://spreadapi.io/api/v1/services/${serviceId}/execute" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(exampleInput?.value || { inputs: {} }, null, 2)}'`}
        </pre>
      </div>

      <div>
        <Title level={5}>3. Response Format Options</Title>
        <Paragraph>You can request different response formats:</Paragraph>
        <ul style={{ marginLeft: 20 }}>
          <li><code>?_format=json</code> - JSON (default)</li>
          <li><code>?_format=csv</code> - CSV for Excel import</li>
          <li><code>?_format=plain</code> - Plain text</li>
        </ul>
      </div>

      <div>
        <Title level={5}>4. Importing into Postman</Title>
        <Paragraph>
          <ol style={{ marginLeft: 20 }}>
            <li>Open Postman and click "Import"</li>
            <li>Select "Link" tab</li>
            <li>Enter: <code>{`https://spreadapi.io/api/v1/services/${serviceId}/openapi`}</code></li>
            <li>Click "Continue" to import</li>
          </ol>
        </Paragraph>
      </div>

      <div>
        <Title level={5}>5. Generate Client SDKs</Title>
        <Paragraph>Use the OpenAPI spec to generate client libraries:</Paragraph>
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 6,
          overflow: 'auto',
          fontSize: 12
        }}>
{`# TypeScript
npx @openapitools/openapi-generator-cli generate \\
  -i https://spreadapi.io/api/v1/services/${serviceId}/openapi \\
  -g typescript-fetch \\
  -o ./src/generated

# Python
openapi-generator-cli generate \\
  -i https://spreadapi.io/api/v1/services/${serviceId}/openapi \\
  -g python \\
  -o ./api_client`}
        </pre>
      </div>
    </Space>
  );
};

// Error Codes Reference Component
const ErrorCodesReference: React.FC = () => {
  const errorCodes = [
    {
      code: 'INVALID_INPUT',
      status: 400,
      description: 'One or more input parameters are invalid',
      example: 'Parameter "amount" must be a positive number',
      resolution: 'Check parameter types, ranges, and allowed values in the API definition'
    },
    {
      code: 'MISSING_PARAMETER',
      status: 400,
      description: 'A required parameter is missing',
      example: 'Required parameter "amount" is missing',
      resolution: 'Include all mandatory parameters marked in the definition'
    },
    {
      code: 'VALIDATION_ERROR',
      status: 400,
      description: 'Parameter value fails validation rules',
      example: 'Value 150 exceeds maximum allowed value of 100',
      resolution: 'Check min/max constraints and allowed value lists'
    },
    {
      code: 'UNAUTHORIZED',
      status: 401,
      description: 'Missing or invalid authentication token',
      example: 'Valid API token required',
      resolution: 'Include valid token in query parameter or request body'
    },
    {
      code: 'TOKEN_EXPIRED',
      status: 401,
      description: 'The provided token has expired',
      example: 'API token has expired',
      resolution: 'Generate a new token in Token Management'
    },
    {
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
      description: 'Too many requests in a given time period',
      example: 'Rate limit of 100 requests/minute exceeded',
      resolution: 'Reduce request frequency or check rate limit headers'
    },
    {
      code: 'NOT_FOUND',
      status: 404,
      description: 'Service not found or not published',
      example: 'Service not found or not published',
      resolution: 'Verify service ID and ensure service is published'
    },
    {
      code: 'CALCULATION_ERROR',
      status: 500,
      description: 'Error during spreadsheet calculation',
      example: 'Division by zero in cell B5',
      resolution: 'Check spreadsheet formulas and input values'
    },
    {
      code: 'INTERNAL_ERROR',
      status: 500,
      description: 'Unexpected server error',
      example: 'An unexpected error occurred',
      resolution: 'Contact support if the issue persists'
    }
  ];

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Title level={4}>Error Code Reference</Title>
        <Paragraph>
          All errors follow a consistent format with error codes for programmatic handling:
        </Paragraph>
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 6,
          fontSize: 13
        }}>
{`{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "field": "parameterName",  // For validation errors
  "details": { ... }          // Additional context
}`}
        </pre>
      </div>

      {errorCodes.map(error => (
        <div key={error.code} style={{
          border: '1px solid #f0f0f0',
          borderRadius: 6,
          padding: 16
        }}>
          <Space orientation="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <code style={{
                background: '#fff1f0',
                color: '#cf1322',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 600
              }}>
                {error.code}
              </code>
              <Text type="secondary">HTTP {error.status}</Text>
            </div>
            <Paragraph style={{ margin: 0 }}>{error.description}</Paragraph>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Example:</Text>
              <div style={{
                background: '#fafafa',
                padding: 8,
                borderRadius: 4,
                marginTop: 4,
                fontFamily: 'monospace',
                fontSize: 12
              }}>
                {error.example}
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Resolution:</Text>
              <div style={{ marginTop: 4, fontSize: 13 }}>
                {error.resolution}
              </div>
            </div>
          </Space>
        </div>
      ))}
    </Space>
  );
};

export default ApiDocumentation;
