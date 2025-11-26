'use client';

import React, { useEffect, useState } from 'react';
import { Space, Typography, Spin } from 'antd';

const { Text, Paragraph, Title } = Typography;

interface QuickStartGuideProps {
  serviceId: string;
  isPublished?: boolean;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ serviceId, isPublished = true }) => {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPublished) {
      setLoading(false);
      return;
    }

    fetchOpenAPISpec();
  }, [serviceId, isPublished]);

  const fetchOpenAPISpec = async () => {
    try {
      const response = await fetch(`/api/v1/services/${serviceId}/openapi`);
      if (response.ok) {
        const data = await response.json();
        setSpec(data);
      }
    } catch (err) {
      console.error('Error loading spec:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

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

export default QuickStartGuide;
