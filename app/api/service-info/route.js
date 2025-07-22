import { NextResponse } from 'next/server';
import { getApiDefinition } from '../../../utils/helperApi';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiId = searchParams.get('api');
    const apiToken = searchParams.get('token');
    
    if (!apiId) {
      return NextResponse.json({ error: "Missing API ID" }, { status: 400 });
    }
    
    // Get the API definition
    const apiDefinition = await getApiDefinition(apiId, apiToken);
    
    if (!apiDefinition || apiDefinition.error) {
      return NextResponse.json({ 
        error: apiDefinition?.error || "API not found" 
      }, { status: 404 });
    }
    
    // Extract input and output configurations
    const apiJson = apiDefinition.apiJson || {};
    // Handle both plural (new) and singular (old) formats
    const inputs = apiJson.inputs || apiJson.input || [];
    const outputs = apiJson.outputs || apiJson.output || [];
    
    // Format the response
    const serviceInfo = {
      apiId,
      name: apiJson.name || apiId,
      description: apiJson.description || "No description available",
      inputs: inputs.map(input => ({
        name: input.name,
        alias: input.alias || input.name,
        type: input.type || "number",
        mandatory: input.mandatory || false,
        min: input.min,
        max: input.max,
        default: input.default,
        description: input.description,
        address: input.address
      })),
      outputs: outputs.map(output => ({
        name: output.name,
        alias: output.alias || output.name,
        type: output.type || "number",
        description: output.description,
        address: output.address
      }))
    };
    
    return NextResponse.json(serviceInfo);
    
  } catch (error) {
    console.error('Error in service-info:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}