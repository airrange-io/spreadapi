import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * GET /api/v1/services/{id}/definition - Get complete API definition with all validation rules
 *
 * This endpoint returns the FULL published API definition including:
 * - Input/output parameter definitions
 * - Validation rules (min, max, allowedValues, etc.)
 * - Default values
 * - AI metadata
 * - Editable areas
 *
 * Public access - no authentication required for published services
 */
export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;

    // Check if service is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);

    if (!isPublished) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found or not published'
      }, { status: 404 });
    }

    // Get published service data
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);

    if (!publishedData || Object.keys(publishedData).length === 0) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service definition not found'
      }, { status: 404 });
    }

    // Parse API definition
    let inputs = [];
    let outputs = [];
    let areas = [];
    let aiUsageExamples = [];
    let aiTags = [];

    try {
      inputs = publishedData.inputs ? JSON.parse(publishedData.inputs) : [];
    } catch (e) {
      console.error('Error parsing inputs:', e);
    }

    try {
      outputs = publishedData.outputs ? JSON.parse(publishedData.outputs) : [];
    } catch (e) {
      console.error('Error parsing outputs:', e);
    }

    try {
      areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    } catch (e) {
      console.error('Error parsing areas:', e);
    }

    try {
      aiUsageExamples = publishedData.aiUsageExamples ? JSON.parse(publishedData.aiUsageExamples) : [];
    } catch (e) {
      aiUsageExamples = [];
    }

    try {
      aiTags = publishedData.aiTags ? JSON.parse(publishedData.aiTags) : [];
    } catch (e) {
      aiTags = [];
    }

    // Build complete definition response
    const response = {
      id: serviceId,
      name: publishedData.title || 'Untitled Service',
      description: publishedData.description || '',

      // API Definition
      api: {
        // Complete input definitions with ALL validation rules
        inputs: inputs.map(input => ({
          name: input.name,
          alias: input.alias,
          title: input.title,
          type: input.type || 'string',
          mandatory: input.mandatory !== false,
          description: input.description || '',

          // Validation rules
          ...(input.min !== undefined && { min: input.min }),
          ...(input.max !== undefined && { max: input.max }),
          ...(input.allowedValues && input.allowedValues.length > 0 && {
            allowedValues: input.allowedValues
          }),
          ...(input.allowedValuesRange && {
            allowedValuesRange: input.allowedValuesRange
          }),
          ...(input.allowedValuesCaseSensitive !== undefined && {
            allowedValuesCaseSensitive: input.allowedValuesCaseSensitive
          }),
          ...(input.defaultValue !== undefined && input.defaultValue !== null && {
            defaultValue: input.defaultValue
          }),

          // Formatting hints
          ...(input.format && { format: input.format }),
          ...(input.percentageDecimals !== undefined && {
            percentageDecimals: input.percentageDecimals
          }),

          // AI hints
          ...(input.aiExamples && input.aiExamples.length > 0 && {
            aiExamples: input.aiExamples
          })
        })),

        // Complete output definitions
        outputs: outputs.map(output => ({
          name: output.name,
          alias: output.alias,
          title: output.title,
          type: output.type || 'string',
          description: output.description || '',

          // Format information (for proper display of percentages, currency, dates, etc.)
          ...(output.format && { format: output.format }),
          ...(output.formatter && { formatter: output.formatter }),

          // JavaScript-friendly formatting metadata
          ...(output.currencySymbol && { currencySymbol: output.currencySymbol }),
          ...(output.decimals !== undefined && { decimals: output.decimals }),
          ...(output.thousandsSeparator !== undefined && { thousandsSeparator: output.thousandsSeparator }),

          // AI presentation hints
          ...(output.aiPresentationHint && {
            aiPresentationHint: output.aiPresentationHint
          })
        })),

        // Editable areas (if any)
        ...(areas.length > 0 && { areas })
      },

      // Metadata
      metadata: {
        requiresToken: publishedData.needsToken === 'true',
        cachingEnabled: publishedData.useCaching === 'true',
        publishedAt: publishedData.created,
        lastModified: publishedData.modified,
        totalCalls: parseInt(publishedData.calls || '0'),
        category: publishedData.category || 'general'
      },

      // AI Metadata (for AI assistants)
      ai: {
        description: publishedData.aiDescription || '',
        usageGuidance: publishedData.aiUsageGuidance || '',
        examples: aiUsageExamples,
        tags: aiTags
      },

      // Endpoint information
      endpoint: {
        execute: `https://spreadapi.io/api/v1/services/${serviceId}/execute`,
        documentation: `https://spreadapi.io/docs/api/services/${serviceId}`
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error fetching service definition:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// OPTIONS for CORS
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
