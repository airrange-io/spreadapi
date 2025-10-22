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
          description: 'Retrieve a paginated list of all published services available for execution',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of services to return',
              schema: { type: 'integer', default: 50, maximum: 100, minimum: 1 }
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of services to skip for pagination',
              schema: { type: 'integer', default: 0, minimum: 0 }
            },
            {
              name: 'sort',
              in: 'query',
              description: 'Field to sort by',
              schema: { type: 'string', enum: ['name', 'calls', 'updatedAt'], default: 'name' }
            },
            {
              name: 'order',
              in: 'query',
              description: 'Sort order',
              schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }
            }
          ],
          responses: {
            '200': {
              description: 'List of services',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      services: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            status: { type: 'string', enum: ['published', 'draft'] },
                            endpoint: { type: 'string', format: 'uri' },
                            calls: { type: 'number' },
                            inputs: { type: 'array', items: { type: 'string' } },
                            outputs: { type: 'array', items: { type: 'string' } }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          limit: { type: 'number' },
                          offset: { type: 'number' },
                          hasMore: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/services/{serviceId}/definition': {
        get: {
          summary: 'Get service definition',
          tags: ['metadata'],
          description: 'Retrieve complete API definition including validation rules, input/output schemas, and AI metadata',
          parameters: [
            {
              name: 'serviceId',
              in: 'path',
              required: true,
              description: 'Unique service identifier',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Complete service definition'
            },
            '404': {
              description: 'Service not found'
            }
          }
        }
      },
      '/api/v1/services/{serviceId}/openapi': {
        get: {
          summary: 'Get OpenAPI spec for specific service',
          tags: ['metadata'],
          description: 'Download the OpenAPI 3.1 specification for a specific service. Use this to generate client SDKs or import into API tools.',
          parameters: [
            {
              name: 'serviceId',
              in: 'path',
              required: true,
              description: 'Unique service identifier',
              schema: { type: 'string' }
            },
            {
              name: 'format',
              in: 'query',
              description: 'Output format for the specification',
              schema: { type: 'string', enum: ['json', 'yaml'], default: 'json' }
            }
          ],
          responses: {
            '200': {
              description: 'OpenAPI specification',
              content: {
                'application/json': {
                  schema: { type: 'object' }
                },
                'application/x-yaml': {
                  schema: { type: 'string' }
                }
              }
            },
            '404': {
              description: 'Service not found'
            }
          }
        }
      },
      '/api/v1/services/{serviceId}/execute': {
        get: {
          summary: 'Execute service via GET',
          tags: ['execution'],
          description: 'Execute service calculation with parameters in query string',
          parameters: [
            {
              name: 'serviceId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': { description: 'Execution successful' },
            '400': { description: 'Invalid parameters' },
            '401': { description: 'Authentication required' },
            '404': { description: 'Service not found' }
          }
        },
        post: {
          summary: 'Execute service via POST',
          tags: ['execution'],
          description: 'Execute service calculation with parameters in request body (recommended)',
          parameters: [
            {
              name: 'serviceId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
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
                      description: 'Input parameters (see service definition for details)'
                    },
                    token: {
                      type: 'string',
                      description: 'API token (if required by service)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Execution successful' },
            '400': { description: 'Invalid parameters' },
            '401': { description: 'Authentication required' },
            '404': { description: 'Service not found' }
          }
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
