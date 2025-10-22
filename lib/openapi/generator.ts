interface ServiceDefinition {
  name: string;
  description: string;
  inputs: any[];
  outputs: any[];
  requiresToken: boolean;
}

export function generateOpenAPISpec(
  serviceId: string,
  definition: ServiceDefinition,
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
      [`/api/v1/services/${serviceId}/execute`]: generateExecuteEndpoint(serviceId, definition),
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

function generateExecuteEndpoint(serviceId: string, definition: ServiceDefinition) {
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
              schema: { $ref: '#/components/schemas/ExecutionResponse' },
              examples: {
                success: generateExampleResponse(serviceId, definition)
              }
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
                  properties: definition.inputs.reduce((acc: any, input: any) => {
                    acc[input.name] = mapTypeToSchema(input);
                    return acc;
                  }, {})
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
                success: generateExampleResponse(serviceId, definition)
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

function generateSchemas(definition: ServiceDefinition) {
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
              value: {}
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
              value: {},
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
                error: 'Invalid request',
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
            error: 'Unauthorized',
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
            error: 'Not found',
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

function generateExampleRequest(definition: ServiceDefinition) {
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

function generateExampleResponse(serviceId: string, definition: ServiceDefinition) {
  return {
    summary: 'Example response',
    value: {
      serviceId,
      serviceName: definition.name,
      inputs: definition.inputs.slice(0, 2).map(i => ({
        name: i.name,
        title: i.title,
        value: i.type === 'number' ? 100 : 'example'
      })),
      outputs: definition.outputs.slice(0, 2).map(o => ({
        name: o.name,
        title: o.title,
        value: o.type === 'number' ? 1000 : 'result'
      })),
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
