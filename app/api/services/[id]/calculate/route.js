import { NextResponse } from 'next/server';
import { executeEnhancedCalc } from '@/app/api/mcp/v1/executeEnhancedCalc';

/**
 * POST /api/services/[id]/calculate
 * Enhanced calculation with optional area updates
 */
export async function POST(request, { params }) {
  try {
    const { id: serviceId } = params;
    const body = await request.json();
    const { inputs = {}, areaUpdates = [] } = body;
    
    // Execute enhanced calculation with area updates
    const result = await executeEnhancedCalc(
      serviceId,
      inputs,
      areaUpdates,
      {
        includeOutputs: true,
        includeAreaValues: false,
        includeAreaFormulas: false,
        includeAreaFormatting: false
      },
      { userId: 'chat-user' } // Auth context for chat
    );
    
    // Return the result
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Enhanced calculation error:', error);
    return NextResponse.json(
      { error: 'Calculation failed', message: error.message },
      { status: 500 }
    );
  }
}