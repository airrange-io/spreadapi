import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { createErrorResponse } from '@/lib/errors';

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
      const { body: errorBody, status } = createErrorResponse(
        'INVALID_REQUEST',
        'Request body must contain "inputs" object'
      );
      return NextResponse.json(errorBody, { status });
    }

    // Check if service exists
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      const { body: errorBody, status } = createErrorResponse('NOT_FOUND');
      return NextResponse.json(errorBody, { status });
    }

    // Get input definitions
    const publishedDataRaw = await redis.hGetAll(`service:${serviceId}:published`);
    const publishedData: any = publishedDataRaw;
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
          : inputDef.allowedValues.map((v: string) => String(v).toLowerCase());
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

  } catch (error: any) {
    console.error('Validation error:', error);
    const { body: errorBody, status } = createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to validate inputs'
    );
    return NextResponse.json(errorBody, { status });
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
