# SpreadAPI - API Enhancement Implementation Plan

## Overview
This plan covers Phase 1 (Documentation) and Phase 2 (Developer Experience) enhancements to transform SpreadAPI from a **B+ to an A-grade API** for enterprise adoption.

---

## PHASE 1: API Documentation & Discovery (2-3 weeks)

### Objectives
- Generate OpenAPI 3.1 specification from existing `/definition` endpoint
- Add interactive Swagger UI documentation
- Create comprehensive error code documentation
- Add "API Documentation" section in the UI

---

### 1.1 OpenAPI Specification Generation (Week 1)

#### Task 1.1.1: Create OpenAPI Generator Utility
**File:** `/lib/openapi/generator.ts`

**Implementation:**
```typescript
import { RedisServiceDefinition } from '@/types/service';

export function generateOpenAPISpec(
  serviceId: string,
  definition: RedisServiceDefinition,
  baseUrl: string = 'https://spreadapi.io'
) {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: definition.name || 'SpreadAPI Service',
      description: definition.description || '',
      version: '1.0.0',
      contact: {
        name: 'SpreadAPI Support',
        url: 'https://spreadapi.io/support'
      }
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production server'
      }
    ],
    security: definition.requiresToken ? [
      { bearerAuth: [] }
    ] : [],
    paths: {
      [`/api/v1/services/${serviceId}/execute`]: generateExecuteEndpoint(definition),
      [`/api/v1/services/${serviceId}/definition`]: generateDefinitionEndpoint(),
    },
    components: {
      schemas: generateSchemas(definition),
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'API token from Token Management'
        }
      },
      responses: generateCommonResponses()
    },
    tags: [
      { name: 'execution', description: 'Execute spreadsheet calculations' },
      { name: 'metadata', description: 'Service metadata and definition' }
    ]
  };

  return spec;
}

function generateExecuteEndpoint(definition: RedisServiceDefinition) {
  return {
    get: {
      tags: ['execution'],
      summary: 'Execute service (GET)',
      description: 'Execute spreadsheet calculation via GET request. Ideal for Excel integration, simple browser calls, and testing.',
      operationId: 'executeServiceGET',
      parameters: [
        ...definition.inputs.map(input => ({
          name: input.name,
          in: 'query',
          required: input.mandatory !== false,
          description: input.description || input.title,
          schema: mapTypeToSchema(input)
        })),
        {
          name: 'token',
          in: 'query',
          required: definition.requiresToken,
          schema: { type: 'string' },
          description: 'API authentication token (if required)'
        },
        {
          name: '_format',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['json', 'csv', 'plain'],
            default: 'json'
          },
          description: 'Response format'
        },
        {
          name: 'nocdn',
          in: 'query',
          schema: { type: 'boolean', default: false },
          description: 'Bypass HTTP/CDN cache (keeps Redis cache)'
        },
        {
          name: 'nocache',
          in: 'query',
          schema: { type: 'boolean', default: false },
          description: 'Bypass ALL caches (HTTP + Redis)'
        }
      ],
      responses: {
        '200': {
          description: 'Successful execution',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ExecutionResponse' }
            },
            'text/csv': {
              schema: { type: 'string' },
              example: 'total,interest\n10000,500'
            },
            'text/plain': {
              schema: { type: 'string' },
              example: 'total: 10000\ninterest: 500'
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
        '500': { $ref: '#/components/responses/InternalError' }
      }
    },
    post: {
      tags: ['execution'],
      summary: 'Execute service (POST)',
      description: 'Execute spreadsheet calculation via POST request. Recommended for production integrations.',
      operationId: 'executeServicePOST',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['inputs'],
              properties: {
                inputs: {
                  type: 'object',
                  description: 'Input parameters',
                  properties: definition.inputs.reduce((acc, input) => {
                    acc[input.name] = mapTypeToSchema(input);
                    return acc;
                  }, {} as any)
                },
                token: {
                  type: 'string',
                  description: 'API authentication token (if required)'
                },
                nocdn: {
                  type: 'boolean',
                  default: false,
                  description: 'Bypass HTTP/CDN cache'
                },
                nocache: {
                  type: 'boolean',
                  default: false,
                  description: 'Bypass ALL caches'
                }
              }
            },
            examples: {
              basic: generateExampleRequest(definition)
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successful execution',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ExecutionResponse' },
              examples: {
                success: generateExampleResponse(definition)
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
        '500': { $ref: '#/components/responses/InternalError' }
      }
    }
  };
}

function generateDefinitionEndpoint() {
  return {
    get: {
      tags: ['metadata'],
      summary: 'Get service definition',
      description: 'Retrieve complete API definition including validation rules, input/output schemas, and AI metadata',
      operationId: 'getServiceDefinition',
      responses: {
        '200': {
          description: 'Service definition',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceDefinition' }
            }
          }
        },
        '404': { $ref: '#/components/responses/NotFound' }
      }
    }
  };
}

function mapTypeToSchema(input: any) {
  const schema: any = {};

  // Map SpreadAPI types to OpenAPI types
  switch (input.type) {
    case 'number':
    case 'currency':
    case 'percentage':
      schema.type = 'number';
      if (input.min !== undefined) schema.minimum = input.min;
      if (input.max !== undefined) schema.maximum = input.max;
      break;
    case 'integer':
      schema.type = 'integer';
      if (input.min !== undefined) schema.minimum = input.min;
      if (input.max !== undefined) schema.maximum = input.max;
      break;
    case 'boolean':
      schema.type = 'boolean';
      break;
    case 'date':
      schema.type = 'string';
      schema.format = 'date';
      break;
    case 'string':
    default:
      schema.type = 'string';
      break;
  }

  // Add enums for allowed values
  if (input.allowedValues && input.allowedValues.length > 0) {
    schema.enum = input.allowedValues;
  }

  // Add default value
  if (input.defaultValue !== undefined) {
    schema.default = input.defaultValue;
  }

  // Add examples
  if (input.aiExamples && input.aiExamples.length > 0) {
    schema.examples = input.aiExamples;
  }

  schema.description = input.description || input.title;

  return schema;
}

function generateSchemas(definition: RedisServiceDefinition) {
  return {
    ExecutionResponse: {
      type: 'object',
      properties: {
        serviceId: { type: 'string' },
        serviceName: { type: 'string' },
        serviceDescription: { type: 'string' },
        inputs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              title: { type: 'string' },
              value: { type: 'any' }
            }
          }
        },
        outputs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              title: { type: 'string' },
              value: { type: 'any' },
              formatString: { type: 'string' }
            }
          }
        },
        metadata: {
          type: 'object',
          properties: {
            executionTime: { type: 'number', description: 'Execution time in ms' },
            totalTime: { type: 'number', description: 'Total time in ms' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            cached: { type: 'boolean' }
          }
        }
      }
    },
    ServiceDefinition: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        api: {
          type: 'object',
          properties: {
            inputs: { type: 'array' },
            outputs: { type: 'array' },
            areas: { type: 'array' }
          }
        },
        metadata: { type: 'object' },
        ai: { type: 'object' },
        endpoint: { type: 'object' }
      }
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        code: { type: 'string' },
        field: { type: 'string' },
        details: { type: 'object' }
      }
    }
  };
}

function generateCommonResponses() {
  return {
    BadRequest: {
      description: 'Invalid request parameters',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          examples: {
            invalidInput: {
              summary: 'Invalid input parameter',
              value: {
                error: 'INVALID_INPUT',
                message: 'Parameter "amount" must be a positive number',
                field: 'amount'
              }
            }
          }
        }
      }
    },
    Unauthorized: {
      description: 'Missing or invalid authentication token',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: {
            error: 'UNAUTHORIZED',
            message: 'Valid API token required'
          }
        }
      }
    },
    NotFound: {
      description: 'Service not found or not published',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: {
            error: 'NOT_FOUND',
            message: 'Service not found or not published'
          }
        }
      }
    },
    InternalError: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    }
  };
}

function generateExampleRequest(definition: RedisServiceDefinition) {
  const inputs: any = {};
  definition.inputs.forEach(input => {
    if (input.aiExamples && input.aiExamples.length > 0) {
      inputs[input.name] = input.aiExamples[0];
    } else if (input.defaultValue !== undefined) {
      inputs[input.name] = input.defaultValue;
    } else {
      // Generate example based on type
      switch (input.type) {
        case 'number': inputs[input.name] = 100; break;
        case 'currency': inputs[input.name] = 10000; break;
        case 'percentage': inputs[input.name] = 0.05; break;
        case 'boolean': inputs[input.name] = true; break;
        default: inputs[input.name] = 'example'; break;
      }
    }
  });

  return {
    summary: 'Example request',
    value: { inputs }
  };
}

function generateExampleResponse(definition: RedisServiceDefinition) {
  return {
    summary: 'Example response',
    value: {
      serviceId: 'example-service',
      serviceName: definition.name,
      inputs: definition.inputs.map(i => ({ name: i.name, title: i.title, value: 100 })),
      outputs: definition.outputs.map(o => ({ name: o.name, title: o.title, value: 1000 })),
      metadata: {
        executionTime: 45,
        totalTime: 52,
        timestamp: new Date().toISOString(),
        version: 'v1',
        cached: false
      }
    }
  };
}
```

**Dependencies to install:**
```bash
npm install openapi-types yaml
npm install --save-dev @types/openapi-types
```

---

#### Task 1.1.2: Create OpenAPI Endpoint
**File:** `/app/api/v1/services/[id]/openapi/route.ts`

```typescript
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateOpenAPISpec } from '@/lib/openapi/generator';
import yaml from 'yaml';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json or yaml

    // Check if service is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'NOT_FOUND',
        message: 'Service not found or not published'
      }, { status: 404 });
    }

    // Get service definition
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);

    const definition = {
      name: publishedData.title || 'Untitled Service',
      description: publishedData.description || '',
      inputs: JSON.parse(publishedData.inputs || '[]'),
      outputs: JSON.parse(publishedData.outputs || '[]'),
      requiresToken: publishedData.needsToken === 'true'
    };

    // Generate OpenAPI spec
    const spec = generateOpenAPISpec(serviceId, definition);

    // Return in requested format
    if (format === 'yaml') {
      const yamlSpec = yaml.stringify(spec);
      return new NextResponse(yamlSpec, {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    return NextResponse.json(spec, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate OpenAPI specification'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
```

---

#### Task 1.1.3: Add Global OpenAPI Discovery Endpoint
**File:** `/app/api/v1/openapi/route.ts`

```typescript
import { NextResponse } from 'next/server';

/**
 * Global OpenAPI discovery endpoint
 * Returns the base OpenAPI spec for the SpreadAPI platform
 */
export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'SpreadAPI Platform',
      version: '1.0.0',
      description: 'Convert spreadsheets into powerful APIs. Execute complex calculations, validations, and business logic through RESTful endpoints.',
      contact: {
        name: 'SpreadAPI Support',
        email: 'support@spreadapi.io',
        url: 'https://spreadapi.io/support'
      },
      license: {
        name: 'Proprietary',
        url: 'https://spreadapi.io/terms'
      }
    },
    servers: [
      {
        url: 'https://spreadapi.io',
        description: 'Production server'
      }
    ],
    paths: {
      '/api/v1/services': {
        get: {
          summary: 'List all published services',
          tags: ['discovery'],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 50, maximum: 100 }
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 }
            },
            {
              name: 'sort',
              in: 'query',
              schema: { type: 'string', enum: ['name', 'calls', 'updatedAt'], default: 'name' }
            }
          ],
          responses: {
            '200': {
              description: 'List of services'
            }
          }
        }
      },
      '/api/v1/services/{serviceId}/definition': {
        get: {
          summary: 'Get service definition',
          tags: ['metadata'],
          parameters: [
            {
              name: 'serviceId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ]
        }
      },
      '/api/v1/services/{serviceId}/openapi': {
        get: {
          summary: 'Get OpenAPI spec for specific service',
          tags: ['metadata'],
          parameters: [
            {
              name: 'serviceId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'format',
              in: 'query',
              schema: { type: 'string', enum: ['json', 'yaml'], default: 'json' }
            }
          ]
        }
      }
    },
    tags: [
      { name: 'discovery', description: 'Discover available services' },
      { name: 'execution', description: 'Execute service calculations' },
      { name: 'metadata', description: 'Service metadata and definitions' }
    ]
  };

  return NextResponse.json(spec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
```

---

### 1.2 Swagger UI Integration (Week 1-2)

#### Task 1.2.1: Create Swagger UI Component
**File:** `/app/app/service/[id]/components/ApiDocumentation.tsx`

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, Spin, Alert, Button, Space, Typography, message } from 'antd';
import { DownloadOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>
});

const { Text, Paragraph } = Typography;

interface ApiDocumentationProps {
  serviceId: string;
  isPublished: boolean;
}

const ApiDocumentation: React.FC<ApiDocumentationProps> = ({ serviceId, isPublished }) => {
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
    message.success(`Downloaded OpenAPI spec as ${format.toUpperCase()}`);
  };

  const copySpecUrl = (format: 'json' | 'yaml') => {
    const url = `${window.location.origin}/api/v1/services/${serviceId}/openapi?format=${format}`;
    navigator.clipboard.writeText(url);
    message.success('Copied OpenAPI URL to clipboard');
  };

  if (!isPublished) {
    return (
      <Alert
        message="Service Not Published"
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
        message="Error Loading Documentation"
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
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
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
        defaultActiveKey="interactive"
        items={[
          {
            key: 'interactive',
            label: 'Interactive Docs',
            children: (
              <div style={{
                '& .swagger-ui': {
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
                }
              }}>
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
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4}>Getting Started</Typography.Title>
        <Paragraph>
          This service can be called using GET or POST requests. Here's a quick guide:
        </Paragraph>
      </div>

      <div>
        <Typography.Title level={5}>1. GET Request (Simple)</Typography.Title>
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
        <Typography.Title level={5}>2. POST Request (Recommended)</Typography.Title>
        <Paragraph>Best for production integrations:</Paragraph>
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 6,
          overflow: 'auto'
        }}>
{`curl -X POST "https://spreadapi.io/api/v1/services/${serviceId}/execute" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(exampleInput?.value || { inputs: {} }, null, 2)}'`}
        </pre>
      </div>

      <div>
        <Typography.Title level={5}>3. Response Format Options</Typography.Title>
        <Paragraph>You can request different response formats:</Paragraph>
        <ul>
          <li><code>?_format=json</code> - JSON (default)</li>
          <li><code>?_format=csv</code> - CSV for Excel import</li>
          <li><code>?_format=plain</code> - Plain text</li>
        </ul>
      </div>

      <div>
        <Typography.Title level={5}>4. Client SDKs</Typography.Title>
        <Paragraph>Generate client libraries using the OpenAPI spec:</Paragraph>
        <ul>
          <li><a href="https://github.com/OpenAPITools/openapi-generator" target="_blank">OpenAPI Generator</a> - Supports 50+ languages</li>
          <li><a href="https://swagger.io/tools/swagger-codegen/" target="_blank">Swagger Codegen</a> - Alternative generator</li>
        </ul>
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
      resolution: 'Reduce request frequency or upgrade plan'
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
        <Typography.Title level={4}>Error Code Reference</Typography.Title>
        <Paragraph>
          All errors follow a consistent format with error codes for programmatic handling:
        </Paragraph>
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 6
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

export default ApiDocumentation;
```

**Dependencies to install:**
```bash
npm install swagger-ui-react
npm install --save-dev @types/swagger-ui-react
```

---

#### Task 1.2.2: Add Documentation Section to API View
**File:** `/app/app/service/[id]/views/ApiTestView.tsx`

Add the import and component:

```typescript
// Add to imports
const ApiDocumentation = dynamic(() => import('../components/ApiDocumentation'), {
  loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  ssr: false
});

// Add before Integration Examples section (around line 174)
        {/* API Documentation Section */}
        <CollapsibleSection
          title="API Documentation"
          defaultOpen={false}
          style={{ marginTop: 0 }}
        >
          <ApiDocumentation
            serviceId={serviceId}
            isPublished={serviceStatus?.published || false}
          />
        </CollapsibleSection>
```

---

### 1.3 Testing & Documentation (Week 2)

#### Task 1.3.1: Create Test Suite for OpenAPI
**File:** `/tests/openapi.test.ts`

```typescript
import { generateOpenAPISpec } from '@/lib/openapi/generator';

describe('OpenAPI Specification Generation', () => {
  const mockDefinition = {
    name: 'Test Calculator',
    description: 'A test service',
    inputs: [
      {
        name: 'amount',
        title: 'Amount',
        type: 'number',
        mandatory: true,
        min: 0,
        max: 1000000,
        description: 'Principal amount'
      },
      {
        name: 'rate',
        title: 'Interest Rate',
        type: 'percentage',
        mandatory: true,
        description: 'Annual interest rate'
      }
    ],
    outputs: [
      {
        name: 'total',
        title: 'Total Amount',
        type: 'currency',
        formatString: '€#,##0.00'
      }
    ],
    requiresToken: true
  };

  test('generates valid OpenAPI 3.1 spec', () => {
    const spec = generateOpenAPISpec('test-service', mockDefinition);

    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info.title).toBe('Test Calculator');
    expect(spec.security).toHaveLength(1);
  });

  test('includes GET and POST endpoints', () => {
    const spec = generateOpenAPISpec('test-service', mockDefinition);

    const executePath = spec.paths['/api/v1/services/test-service/execute'];
    expect(executePath.get).toBeDefined();
    expect(executePath.post).toBeDefined();
  });

  test('maps input validation rules correctly', () => {
    const spec = generateOpenAPISpec('test-service', mockDefinition);

    const getParams = spec.paths['/api/v1/services/test-service/execute'].get.parameters;
    const amountParam = getParams.find((p: any) => p.name === 'amount');

    expect(amountParam.required).toBe(true);
    expect(amountParam.schema.type).toBe('number');
    expect(amountParam.schema.minimum).toBe(0);
    expect(amountParam.schema.maximum).toBe(1000000);
  });

  test('includes authentication when required', () => {
    const spec = generateOpenAPISpec('test-service', mockDefinition);

    expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
    expect(spec.security[0]).toHaveProperty('bearerAuth');
  });
});
```

---

#### Task 1.3.2: Update Documentation
**File:** `/docs/api/openapi.md` (new file)

```markdown
# OpenAPI Specification

SpreadAPI provides full OpenAPI 3.1 specifications for all published services, enabling:

- **Automatic client SDK generation** (JavaScript, Python, Java, Go, etc.)
- **Import into API testing tools** (Postman, Insomnia, Paw)
- **Interactive documentation** with Swagger UI
- **API validation and testing**

## Accessing OpenAPI Specs

### Individual Service Spec
```
GET /api/v1/services/{serviceId}/openapi
GET /api/v1/services/{serviceId}/openapi?format=yaml
```

### Platform Discovery
```
GET /api/v1/openapi
```

## Using with Tools

### Postman
1. Open Postman
2. Click "Import"
3. Select "Link" tab
4. Enter: `https://spreadapi.io/api/v1/services/{serviceId}/openapi`

### Swagger Editor
1. Go to https://editor.swagger.io
2. File → Import URL
3. Enter the OpenAPI URL

### Generate TypeScript Client
```bash
npx @openapitools/openapi-generator-cli generate \
  -i https://spreadapi.io/api/v1/services/{serviceId}/openapi \
  -g typescript-fetch \
  -o ./src/generated
```

### Generate Python Client
```bash
openapi-generator-cli generate \
  -i https://spreadapi.io/api/v1/services/{serviceId}/openapi \
  -g python \
  -o ./api_client
```

## Specification Features

Our OpenAPI specs include:

- ✅ Complete request/response schemas
- ✅ Input validation rules (min/max, enums)
- ✅ Authentication requirements
- ✅ Response format options (JSON, CSV, plain)
- ✅ Caching control parameters
- ✅ Detailed error responses
- ✅ Request/response examples
- ✅ AI-friendly metadata
```

---

## PHASE 2: Developer Experience Enhancements (2-3 weeks)

### Objectives
- Add rate limiting with visibility headers
- Create input validation endpoint
- Standardize error responses with codes
- Implement batch execution

---

### 2.1 Rate Limiting Implementation (Week 3)

#### Task 2.1.1: Create Rate Limiter Utility
**File:** `/lib/rateLimit.ts`

```typescript
import redis from './redis';

interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix: string;   // Redis key prefix
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;      // Unix timestamp when window resets
  retryAfter?: number; // Seconds until next allowed request
}

export async function checkRateLimit(
  identifier: string, // service:token or ip:address
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Use Redis sorted set for sliding window
    const multi = redis.multi();

    // Remove old entries outside the window
    multi.zRemRangeByScore(key, 0, windowStart);

    // Count requests in current window
    multi.zCard(key);

    // Add current request
    multi.zAdd(key, { score: now, value: `${now}` });

    // Set expiry
    multi.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await multi.exec();
    const count = (results[1] as number) || 0;

    const allowed = count < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count - 1);
    const reset = now + config.windowMs;

    return {
      allowed,
      limit: config.maxRequests,
      remaining,
      reset: Math.floor(reset / 1000),
      retryAfter: allowed ? undefined : Math.ceil(config.windowMs / 1000)
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limiter fails
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Math.floor((now + config.windowMs) / 1000)
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString()
    })
  };
}

// Different rate limit tiers
export const RATE_LIMITS = {
  FREE: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,          // 100 requests/minute
    keyPrefix: 'ratelimit:free'
  },
  PRO: {
    windowMs: 60 * 1000,
    maxRequests: 1000,         // 1000 requests/minute
    keyPrefix: 'ratelimit:pro'
  },
  ENTERPRISE: {
    windowMs: 60 * 1000,
    maxRequests: 10000,        // 10000 requests/minute
    keyPrefix: 'ratelimit:enterprise'
  },
  // Per-IP rate limit (fallback for unauthenticated requests)
  IP_LIMIT: {
    windowMs: 60 * 1000,
    maxRequests: 60,           // 60 requests/minute per IP
    keyPrefix: 'ratelimit:ip'
  }
};
```

---

#### Task 2.1.2: Add Rate Limiting to Execute Endpoint
**File:** `/app/api/v1/services/[id]/execute/route.js`

Add rate limiting before execution:

```javascript
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request, { params}) {
  const totalStart = Date.now();

  try {
    const { id: serviceId } = await params;
    const body = await request.json();

    // Rate limiting check
    const token = body.token;
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Determine rate limit tier (simplified - expand with actual user tier lookup)
    const rateLimitConfig = token ? RATE_LIMITS.PRO : RATE_LIMITS.IP_LIMIT;
    const rateLimitKey = token ? `service:${serviceId}:token:${token}` : `ip:${clientIp}`;

    const rateLimitResult = await checkRateLimit(rateLimitKey, rateLimitConfig);

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Maximum ${rateLimitConfig.maxRequests} requests per minute.`,
        limit: rateLimitResult.limit,
        reset: rateLimitResult.reset
      }, {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult)
      });
    }

    // ... existing validation and execution code ...

    // Add rate limit headers to successful response
    const headers = {
      'Access-Control-Allow-Origin': '*',
      ...getRateLimitHeaders(rateLimitResult),
      // ... existing cache headers ...
    };

    return NextResponse.json({
      // ... existing response ...
    }, { headers });

  } catch (error) {
    // ... existing error handling ...
  }
}

// Similar changes for GET method
```

---

### 2.2 Input Validation Endpoint (Week 3)

#### Task 2.2.1: Create Validation Endpoint
**File:** `/app/api/v1/services/[id]/validate/route.ts`

```typescript
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * POST /api/v1/services/{id}/validate
 *
 * Validate inputs without executing or counting against quotas
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;
    const body = await request.json();

    if (!body.inputs || typeof body.inputs !== 'object') {
      return NextResponse.json({
        error: 'INVALID_REQUEST',
        message: 'Request body must contain "inputs" object'
      }, { status: 400 });
    }

    // Check if service exists
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'NOT_FOUND',
        message: 'Service not found or not published'
      }, { status: 404 });
    }

    // Get input definitions
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const inputDefs = JSON.parse(publishedData.inputs || '[]');

    // Validate each input
    const errors: any[] = [];
    const warnings: any[] = [];

    for (const inputDef of inputDefs) {
      const value = body.inputs[inputDef.name];

      // Check mandatory
      if (inputDef.mandatory !== false && (value === undefined || value === null || value === '')) {
        errors.push({
          code: 'MISSING_PARAMETER',
          field: inputDef.name,
          message: `Required parameter "${inputDef.name}" is missing`
        });
        continue;
      }

      // Skip validation if optional and not provided
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      const typeError = validateType(inputDef, value);
      if (typeError) {
        errors.push({
          code: 'INVALID_TYPE',
          field: inputDef.name,
          message: typeError,
          expected: inputDef.type,
          received: typeof value
        });
        continue;
      }

      // Range validation
      if (inputDef.type === 'number' || inputDef.type === 'integer' || inputDef.type === 'currency' || inputDef.type === 'percentage') {
        if (inputDef.min !== undefined && value < inputDef.min) {
          errors.push({
            code: 'VALUE_TOO_LOW',
            field: inputDef.name,
            message: `Value ${value} is below minimum allowed value of ${inputDef.min}`,
            min: inputDef.min,
            value
          });
        }
        if (inputDef.max !== undefined && value > inputDef.max) {
          errors.push({
            code: 'VALUE_TOO_HIGH',
            field: inputDef.name,
            message: `Value ${value} exceeds maximum allowed value of ${inputDef.max}`,
            max: inputDef.max,
            value
          });
        }
      }

      // Allowed values validation
      if (inputDef.allowedValues && inputDef.allowedValues.length > 0) {
        const caseSensitive = inputDef.allowedValuesCaseSensitive !== false;
        const allowedList = caseSensitive
          ? inputDef.allowedValues
          : inputDef.allowedValues.map((v: string) => v.toLowerCase());
        const checkValue = caseSensitive ? value : String(value).toLowerCase();

        if (!allowedList.includes(checkValue)) {
          errors.push({
            code: 'INVALID_VALUE',
            field: inputDef.name,
            message: `Value "${value}" is not in the list of allowed values`,
            allowedValues: inputDef.allowedValues,
            value
          });
        }
      }

      // Default value usage (warning, not error)
      if (inputDef.defaultValue !== undefined && value === inputDef.defaultValue) {
        warnings.push({
          code: 'USING_DEFAULT',
          field: inputDef.name,
          message: `Using default value for "${inputDef.name}"`
        });
      }
    }

    const valid = errors.length === 0;

    return NextResponse.json({
      valid,
      ...(errors.length > 0 && { errors }),
      ...(warnings.length > 0 && { warnings }),
      summary: {
        totalInputs: inputDefs.length,
        providedInputs: Object.keys(body.inputs).length,
        validInputs: inputDefs.length - errors.length,
        errors: errors.length,
        warnings: warnings.length
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store' // Don't cache validation results
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to validate inputs'
    }, { status: 500 });
  }
}

function validateType(inputDef: any, value: any): string | null {
  switch (inputDef.type) {
    case 'number':
    case 'currency':
    case 'percentage':
      if (typeof value !== 'number' || isNaN(value)) {
        return `Expected number, got ${typeof value}`;
      }
      break;
    case 'integer':
      if (!Number.isInteger(value)) {
        return `Expected integer, got ${typeof value === 'number' ? 'decimal' : typeof value}`;
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        return `Expected boolean, got ${typeof value}`;
      }
      break;
    case 'string':
      if (typeof value !== 'string') {
        return `Expected string, got ${typeof value}`;
      }
      break;
    case 'date':
      // Accept ISO date strings or Date objects
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `Invalid date format`;
      }
      break;
  }
  return null;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
```

---

### 2.3 Standardized Error Responses (Week 4)

#### Task 2.3.1: Create Error Utilities
**File:** `/lib/errors.ts`

```typescript
export const ERROR_CODES = {
  // 4xx Client Errors
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    status: 400,
    message: 'One or more input parameters are invalid'
  },
  MISSING_PARAMETER: {
    code: 'MISSING_PARAMETER',
    status: 400,
    message: 'A required parameter is missing'
  },
  INVALID_TYPE: {
    code: 'INVALID_TYPE',
    status: 400,
    message: 'Parameter has wrong data type'
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
    message: 'Parameter value fails validation rules'
  },
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    status: 400,
    message: 'Request format is invalid'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Authentication required'
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    status: 401,
    message: 'Invalid authentication token'
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    status: 401,
    message: 'Authentication token has expired'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: 404,
    message: 'Resource not found'
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    status: 429,
    message: 'Rate limit exceeded'
  },

  // 5xx Server Errors
  CALCULATION_ERROR: {
    code: 'CALCULATION_ERROR',
    status: 500,
    message: 'Error during calculation'
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    status: 500,
    message: 'Internal server error'
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    status: 503,
    message: 'Service temporarily unavailable'
  }
} as const;

export interface ApiError {
  error: string;      // Error code
  message: string;    // Human-readable message
  field?: string;     // Field name (for validation errors)
  details?: any;      // Additional context
  timestamp?: string; // ISO timestamp
  requestId?: string; // For tracking/debugging
}

export function createErrorResponse(
  errorCode: keyof typeof ERROR_CODES,
  customMessage?: string,
  additionalData?: Partial<ApiError>
): { body: ApiError; status: number } {
  const errorDef = ERROR_CODES[errorCode];

  const error: ApiError = {
    error: errorDef.code,
    message: customMessage || errorDef.message,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  return {
    body: error,
    status: errorDef.status
  };
}
```

---

#### Task 2.3.2: Update Execute Endpoint with Standardized Errors
**File:** `/app/api/v1/services/[id]/execute/route.js`

Replace all error responses with standardized format:

```javascript
import { createErrorResponse, ERROR_CODES } from '@/lib/errors';

export async function POST(request, { params}) {
  try {
    // ... existing code ...

    // Replace this:
    // return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    // With this:
    const { body, status } = createErrorResponse(
      'INVALID_REQUEST',
      'Request body must contain "inputs" object'
    );
    return NextResponse.json(body, { status });

    // For field-specific validation errors:
    const { body, status } = createErrorResponse(
      'INVALID_INPUT',
      'Parameter "amount" must be a positive number',
      { field: 'amount', details: { min: 0, provided: -100 } }
    );
    return NextResponse.json(body, { status });

  } catch (error) {
    const { body, status } = createErrorResponse(
      'INTERNAL_ERROR',
      error.message
    );
    return NextResponse.json(body, { status });
  }
}
```

---

### 2.4 Batch Execution (Week 4)

#### Task 2.4.1: Create Batch Execution Endpoint
**File:** `/app/api/v1/services/[id]/batch/route.ts`

```typescript
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { calculateDirect } from '../execute/calculateDirect';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { createErrorResponse } from '@/lib/errors';

/**
 * POST /api/v1/services/{id}/batch
 *
 * Execute multiple calculations in a single request
 * Maximum 100 requests per batch
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const batchStart = Date.now();

  try {
    const { id: serviceId } = await params;
    const body = await request.json();

    // Validate batch request
    if (!body.requests || !Array.isArray(body.requests)) {
      const { body: errorBody, status } = createErrorResponse(
        'INVALID_REQUEST',
        'Request body must contain "requests" array'
      );
      return NextResponse.json(errorBody, { status });
    }

    // Limit batch size
    const maxBatchSize = 100;
    if (body.requests.length > maxBatchSize) {
      const { body: errorBody, status } = createErrorResponse(
        'INVALID_REQUEST',
        `Batch size exceeds maximum of ${maxBatchSize} requests`,
        { details: { max: maxBatchSize, provided: body.requests.length } }
      );
      return NextResponse.json(errorBody, { status });
    }

    if (body.requests.length === 0) {
      const { body: errorBody, status } = createErrorResponse(
        'INVALID_REQUEST',
        'Requests array cannot be empty'
      );
      return NextResponse.json(errorBody, { status });
    }

    // Check service exists
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      const { body: errorBody, status } = createErrorResponse('NOT_FOUND');
      return NextResponse.json(errorBody, { status });
    }

    // Rate limiting (count as batch.length requests)
    const token = body.token;
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitConfig = token ? RATE_LIMITS.PRO : RATE_LIMITS.IP_LIMIT;
    const rateLimitKey = token ? `service:${serviceId}:token:${token}` : `ip:${clientIp}`;

    // Check if batch fits within rate limit
    const rateLimitResult = await checkRateLimit(rateLimitKey, {
      ...rateLimitConfig,
      maxRequests: rateLimitConfig.maxRequests - body.requests.length + 1
    });

    if (!rateLimitResult.allowed) {
      const { body: errorBody, status } = createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        `Batch size ${body.requests.length} would exceed rate limit`,
        {
          details: {
            batchSize: body.requests.length,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining
          }
        }
      );
      return NextResponse.json(errorBody, {
        status,
        headers: getRateLimitHeaders(rateLimitResult)
      });
    }

    // Execute all requests
    const results = await Promise.allSettled(
      body.requests.map(async (req: any, index: number) => {
        try {
          if (!req.inputs || typeof req.inputs !== 'object') {
            throw new Error(`Request ${index}: inputs must be an object`);
          }

          const result = await calculateDirect(
            serviceId,
            req.inputs,
            token,
            {
              nocdn: body.nocdn || req.nocdn,
              nocache: body.nocache || req.nocache
            }
          );

          return {
            index,
            success: !result.error,
            ...(result.error ? {
              error: result.error,
              message: result.message
            } : {
              outputs: result.outputs,
              metadata: result.metadata
            })
          };
        } catch (error: any) {
          return {
            index,
            success: false,
            error: 'CALCULATION_ERROR',
            message: error.message
          };
        }
      })
    );

    // Format results
    const responses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          index,
          success: false,
          error: 'INTERNAL_ERROR',
          message: result.reason?.message || 'Unknown error'
        };
      }
    });

    const successCount = responses.filter(r => r.success).length;
    const errorCount = responses.length - successCount;

    const batchTime = Date.now() - batchStart;

    return NextResponse.json({
      serviceId,
      batch: {
        total: body.requests.length,
        successful: successCount,
        failed: errorCount,
        executionTime: batchTime
      },
      results: responses,
      metadata: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        ...getRateLimitHeaders(rateLimitResult),
        'Cache-Control': 'no-store' // Batch results should not be cached
      }
    });

  } catch (error: any) {
    console.error('Batch execution error:', error);
    const { body: errorBody, status } = createErrorResponse(
      'INTERNAL_ERROR',
      error.message
    );
    return NextResponse.json(errorBody, { status });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
```

---

## Summary

### Phase 1 Deliverables (Weeks 1-2):
1. ✅ OpenAPI 3.1 spec generator
2. ✅ Per-service OpenAPI endpoint (`/api/v1/services/{id}/openapi`)
3. ✅ Platform OpenAPI endpoint (`/api/v1/openapi`)
4. ✅ Swagger UI component with interactive docs
5. ✅ "API Documentation" collapsible section in UI
6. ✅ Quick Start guide
7. ✅ Error codes reference
8. ✅ Tests for OpenAPI generation

### Phase 2 Deliverables (Weeks 3-4):
1. ✅ Rate limiting with headers (X-RateLimit-*)
2. ✅ Input validation endpoint (`/validate`)
3. ✅ Standardized error codes and responses
4. ✅ Batch execution endpoint (`/batch`)

### Dependencies to Install:
```bash
npm install openapi-types yaml swagger-ui-react
npm install --save-dev @types/openapi-types @types/swagger-ui-react
```

### Testing Checklist:
- [ ] OpenAPI spec validates with Swagger Editor
- [ ] Can import spec into Postman
- [ ] Swagger UI renders correctly
- [ ] Rate limiting headers appear in responses
- [ ] Validation endpoint returns correct errors
- [ ] Batch execution handles 100 requests
- [ ] Error codes are consistent across all endpoints

---

**Estimated Total Time:** 4-5 weeks (1 developer)
**Grade Improvement:** B+ → A
**Enterprise Readiness:** Significantly improved
