import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import crypto from 'crypto';
import { getApiDefinition } from '@/utils/helperApi';

// Import server-side SpreadJS utilities
const { createWorkbook, getCachedWorkbook } = require('@/lib/spreadjs-server');

export async function POST(request) {
  try {
    const { serviceId, inputs, spreadJSON } = await request.json();
    
    console.log('PDF Prepare Request:', { serviceId, inputs, hasSpreadJSON: !!spreadJSON });
    
    if (!serviceId || !inputs) {
      return NextResponse.json(
        { error: 'Missing serviceId or inputs' },
        { status: 400 }
      );
    }
    
    // Get the API definition (spreadsheet template)
    const api = await getApiDefinition(serviceId);
    
    console.log('API Definition result:', api ? 'Found' : 'Not found', serviceId);
    
    if (!api) {
      console.error('Service not found:', serviceId);
      return NextResponse.json(
        { error: 'Service not found', serviceId },
        { status: 404 }
      );
    }
    
    let finalSpreadJSON;
    
    // If we received spreadJSON from the client (with calculated results), use it
    if (spreadJSON) {
      console.log('Using provided spreadJSON with calculated results');
      finalSpreadJSON = spreadJSON;
    } else {
      // Fallback to server-side calculation (may not work properly)
      console.log('No spreadJSON provided, attempting server-side calculation');
      
      // Create a fresh workbook for PDF generation
      const workbook = createWorkbook();
      workbook.fromJSON(api.definition);
      
      // Apply input values to the workbook (same logic as getresults)
      if (api.inputs && Array.isArray(api.inputs)) {
        for (const inputDef of api.inputs) {
          const inputValue = inputs[inputDef.name] || inputs[inputDef.alias];
          
          if (inputValue !== undefined && inputDef.address) {
            // Parse the address (e.g., "Sheet1!A1" or "A1")
            const addressParts = inputDef.address.split('!');
            const sheetName = addressParts.length > 1 ? addressParts[0] : null;
            const cellAddress = addressParts.length > 1 ? addressParts[1] : addressParts[0];
            
            // Get the correct sheet
            const sheet = sheetName ? workbook.getSheetFromName(sheetName) : workbook.getActiveSheet();
            
            if (sheet) {
              // Convert Excel-style address to row/col indexes
              const colMatch = cellAddress.match(/[A-Z]+/);
              const rowMatch = cellAddress.match(/\d+/);
              
              if (colMatch && rowMatch) {
                const col = colMatch[0];
                const row = parseInt(rowMatch[0]) - 1; // 0-based
                
                // Convert column letters to index (A=0, B=1, Z=25, AA=26, etc.)
                let colIndex = 0;
                for (let i = 0; i < col.length; i++) {
                  colIndex = colIndex * 26 + (col.charCodeAt(i) - 65 + 1);
                }
                colIndex--; // 0-based
                
                // Set the value
                sheet.setValue(row, colIndex, inputValue);
              }
            }
          }
        }
      }
      
      finalSpreadJSON = workbook.toJSON();
    }
    
    // Generate a unique ID for this PDF
    const pdfId = crypto.randomBytes(8).toString('hex');
    
    // Store the complete workbook JSON in Redis with 10-minute TTL
    const pdfData = {
      spreadJSON: finalSpreadJSON,
      serviceId: serviceId,
      serviceName: api.name || 'Calculation',
      inputs: inputs,
      timestamp: Date.now()
    };
    
    await redis.setEx(
      `pdf:${pdfId}`,
      600, // 10 minutes
      JSON.stringify(pdfData)
    );
    
    return NextResponse.json({
      success: true,
      pdfId: pdfId,
      expiresIn: 600
    });
    
  } catch (error) {
    console.error('Error preparing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to prepare PDF', details: error.message },
      { status: 500 }
    );
  }
}