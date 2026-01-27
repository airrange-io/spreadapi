'use client';

import React, { useEffect, useState } from 'react';
import { Spin, Alert, Button, Space, Typography, App } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic<any>(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>
});

const { Text, Paragraph } = Typography;

interface SwaggerUIWrapperProps {
  serviceId: string;
  isPublished: boolean;
}

const SwaggerUIWrapper: React.FC<SwaggerUIWrapperProps> = ({ serviceId, isPublished }) => {
  const { notification } = App.useApp();
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div style={{ padding: '20% 40px 40px 40px', textAlign: 'center' }}>
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
        marginBottom: 16,
        borderRadius: 8,
        background: '#fafafa',
        border: '1px solid #f0f0f0'
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

      {/* Swagger UI */}
      {spec && (
        <div className="swagger-wrapper" style={{ padding: 0 }}>
          <style jsx global>{`
            .swagger-wrapper .swagger-ui {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 13px;
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

            /* Reduce font sizes throughout */
            .swagger-wrapper .swagger-ui h1 {
              font-size: 24px;
            }
            .swagger-wrapper .swagger-ui h2 {
              font-size: 20px;
            }
            .swagger-wrapper .swagger-ui h3 {
              font-size: 16px;
            }
            .swagger-wrapper .swagger-ui h4 {
              font-size: 14px;
            }
            .swagger-wrapper .swagger-ui h5 {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .info .title {
              font-size: 24px;
            }
            .swagger-wrapper .swagger-ui .info .description {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .opblock-tag {
              font-size: 16px;
            }
            .swagger-wrapper .swagger-ui .opblock .opblock-summary-description {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .opblock .opblock-summary-path {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .parameter__name {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .parameter__type {
              font-size: 12px;
            }
            .swagger-wrapper .swagger-ui .response-col_status {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .response-col_description {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui table thead tr th {
              font-size: 12px;
            }
            .swagger-wrapper .swagger-ui table tbody tr td {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .btn {
              font-size: 13px;
            }
            .swagger-wrapper .swagger-ui .model-title {
              font-size: 14px;
            }
            .swagger-wrapper .swagger-ui .model {
              font-size: 12px;
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
      )}
    </div>
  );
};

export default SwaggerUIWrapper;
