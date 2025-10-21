import { NextResponse } from 'next/server';
import { getError } from '../../../utils/helper';
import { getApiDefinition } from '../../../utils/helperApi';

//===============================================
// Function
//===============================================

function buildExecuteTool(apiId, apiDefinition) {
  let tool = {
    name: "execute",
    url: `https://services.airrange.io/api/v1/services/${apiId}/execute`,
    method: "GET",
    description:
      "Calculate the results of a spreadsheet model. Call the service with inputParameter-name and inputParameter-value as url parameters and get the results as JSON response.",
    version: "1.0",
    authentication: apiDefinition.apiJson.needsToken ? {
      type: "query",
      parameterName: "token",
      required: true,
      description: "API token for authentication"
    } : null,
    exampleRequest: `https://services.airrange.io/api/v1/services/${apiId}/execute?${(apiDefinition.apiJson.inputs || apiDefinition.apiJson.input)?.[0]?.name || "param1"}=value1`,
    errorCodes: [
      { code: 400, message: "Bad request", description: "Invalid parameters or missing required parameters" },
      { code: 401, message: "Unauthorized", description: "Authentication required or invalid token" },
      { code: 404, message: "Not found", description: "Service not found" },
      { code: 500, message: "Server error", description: "Internal server error" }
    ],
    responseSchema: {
      type: "object",
      properties: {
        apiId: { type: "string", description: "The ID of the API service" },
        info: { 
          type: "object", 
          description: "Performance metrics for the calculation",
          properties: {
            timeApiData: { type: "number", description: "Time in ms to retrieve API data" },
            timeCalculation: { type: "number", description: "Time in ms for calculation" },
            timeAll: { type: "number", description: "Total processing time in ms" },
            useCaching: { type: "boolean", description: "Whether caching was used" }
          }
        },
        inputs: {
          type: "array",
          description: "Input parameters used for calculation",
          items: {
            type: "object",
            properties: {
              type: { type: "string", description: "Parameter type (input)" },
              name: { type: "string", description: "Parameter name" },
              title: { type: "string", description: "Parameter display title" },
              value: { description: "Parameter value" }
            }
          }
        },
        outputs: {
          type: "array",
          description: "Output results from calculation",
          items: {
            type: "object",
            properties: {
              type: { type: "string", description: "Parameter type (output)" },
              name: { type: "string", description: "Parameter name" },
              title: { type: "string", description: "Parameter display title" },
              value: { description: "Calculated result value" }
            }
          }
        }
      }
    }
  };
  
  // =====================================
  // optimize input parameters
  // =====================================
  const inputs = apiDefinition.apiJson.inputs || apiDefinition.apiJson.input || [];
  for (const input of inputs) {
    if (input?.hasOwnProperty("row")) delete input.row;
    if (input?.hasOwnProperty("col")) delete input.col;
    if (!input.title) input.title = input.name;

    // Add additional metadata for AI understanding
    input.type = input.datatype || "string";
    input.description = input.description || `Parameter for ${input.name}`;
    input.required = input.mandatory || false;

    if (input.hasOwnProperty("min") || input.hasOwnProperty("max")) {
      input.constraints = {};
      if (input.hasOwnProperty("min")) input.constraints.minimum = input.min;
      if (input.hasOwnProperty("max")) input.constraints.maximum = input.max;
    }
    if (input?.hasOwnProperty("direction")) delete input.direction;
  }
  tool.inputParameters = inputs;
  
  // =====================================
  // optimize output parameters
  // =====================================
  const outputs = apiDefinition.apiJson.outputs || apiDefinition.apiJson.output || [];
  for (const output of outputs) {
    if (output?.hasOwnProperty("row")) delete output.row;
    if (output?.hasOwnProperty("col")) delete output.col;
    if (!output.title) output.title = output.name;  // Preserve title for outputs

    // Add additional metadata for AI understanding
    output.type = output.datatype || "string";
    output.description = output.description || `Output result for ${output.title || output.name}`;
    if (output?.hasOwnProperty("direction")) delete output.direction;
  }
  tool.outputParameters = outputs;

  // Add example response based on output parameters
  tool.exampleResponse = {
    apiId: apiId,
    info: {
      timeApiData: 120,
      timeCalculation: 85,
      timeAll: 205,
      useCaching: false
    },
    inputs: inputs.slice(0, 2).map(input => ({
      type: "input",
      name: input.name,
      value: input.type === "number" ? 100 : "example"
    })),
    outputs: outputs.slice(0, 2).map(output => ({
      type: "output",
      name: output.name,
      value: output.type === "number" ? 150 : "result"
    }))
  };

  return tool;
}

async function getServiceSchema(apiId, apiToken) {
  if (!apiId) return getError("serviceId is required");
  
  try {
    // =====================================
    // get the api definition
    // =====================================
    const apiDefinition = await getApiDefinition(apiId, apiToken);

    if (!apiDefinition) {
      return getError("no service found");
    }
    
    // =====================================
    // build AI-friendly service description
    // =====================================
    const result = {
      serviceId: apiId,
      serviceName: apiDefinition.apiJson.serviceName || apiId,
      serviceDescription: apiDefinition.apiJson.description || "Spreadsheet calculation service",
      version: "1.0",
      documentation: `https://services.airrange.io/docs/service/${apiId}`,
      lastUpdated: new Date().toISOString(),
      apiBase: "https://services.airrange.io/api",
      
      // Authentication information
      authentication: apiDefinition.apiJson.needsToken ? {
        type: "query",
        parameterName: "token",
        required: true,
        description: "API token for authentication"
      } : null,
      
      // Service capabilities
      capabilities: {
        caching: true,
        throttling: apiDefinition.apiJson.rateLimit ? true : false,
        requiresAuthentication: apiDefinition.apiJson.needsToken || false
      }
    };
    
    // =====================================
    // add the tools
    // =====================================
    let tools = [];
    const executeTool = buildExecuteTool(apiId, apiDefinition);
    tools.push(executeTool);
    
    // Add example workflows for AI agents
    const exampleWorkflows = [
      {
        name: "Basic Calculation",
        description: "Simple workflow to calculate results using default parameters",
        steps: [
          {
            action: "Make GET request to V1 execute endpoint",
            url: `https://services.airrange.io/api/v1/services/${apiId}/execute`,
            parameters: ["Default parameters"]
          }
        ]
      },
      {
        name: "Custom Calculation",
        description: "Workflow to calculate results with custom parameters",
        steps: [
          {
            action: "Make GET request to V1 execute endpoint with custom parameters",
            url: `https://services.airrange.io/api/v1/services/${apiId}/execute?${(apiDefinition.apiJson.inputs || apiDefinition.apiJson.input)?.[0]?.name || "param1"}=value1`,
            parameters: ["Custom parameters as needed"]
          }
        ]
      }
    ];
    
    result.tools = tools;
    result.exampleWorkflows = exampleWorkflows;
    
    // Add OpenAPI-compatible schema format for AI tools
    result.openApiSchema = {
      openapi: "3.0.0",
      info: {
        title: apiDefinition.apiJson.serviceName || apiId,
        description: apiDefinition.apiJson.description || "Spreadsheet calculation service",
        version: "1.0"
      },
      paths: {
        [`/api/v1/services/${apiId}/execute`]: {
          get: {
            summary: "Calculate results from spreadsheet model",
            description: "Calculates the results based on input parameters",
            parameters: [
              ...(apiDefinition.apiJson.inputs || apiDefinition.apiJson.input || []).map(input => ({
                name: input.name,
                in: "query",
                required: input.mandatory || false,
                description: input.description || `Input parameter: ${input.name}`,
                schema: { 
                  type: input.datatype || "string",
                  ...(input.hasOwnProperty("min") ? { minimum: input.min } : {}),
                  ...(input.hasOwnProperty("max") ? { maximum: input.max } : {})
                }
              }))
            ],
            responses: {
              "200": {
                description: "Successful calculation",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        apiId: { type: "string" },
                        info: { type: "object" },
                        inputs: { type: "array" },
                        outputs: { type: "array" }
                      }
                    }
                  }
                }
              },
              "400": { description: "Bad request or invalid parameters" },
              "401": { description: "Authentication required" },
              "404": { description: "Service not found" },
              "500": { description: "Server error" }
            }
          }
        }
      }
    };
    
    return result;
  } catch (error) {
    console.error("Error in getApiDefinition:", error);
    return getError("service not found");
  }
}

//===============================================
// Route Handlers
//===============================================

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  let apiId = searchParams.get('api');
  if (!apiId) apiId = searchParams.get('service');
  if (!apiId) apiId = searchParams.get('id');
  const tenantId = searchParams.get('tenant');
  let parameters = [];

  // get the parameters from the query string
  for (const [key, value] of searchParams.entries()) {
    if (key === "id" || key === "token") continue; // skip id and key parameters
    parameters.push({ name: key, value: value });
  }

  // get the schema
  let result = await getServiceSchema(apiId);

  // are there any errors?
  if (!result || result.error) {
    return NextResponse.json(result ? result : { error: "unknown error" }, { status: 400 });
  }
  // get the item & source type
  return NextResponse.json(result);
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}