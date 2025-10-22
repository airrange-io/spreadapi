'use client';

import React from 'react';
import { Space, Typography } from 'antd';

const { Text, Paragraph, Title } = Typography;

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
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
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
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
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

export default ErrorCodesReference;
