import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { PERCENTAGE_CONVERSION_RULES, BOOLEAN_CONVERSION_RULES } from './mcp-ai-instructions.js';
import { detectPercentageFields, detectBooleanFields } from './fieldTypeDetection.js';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: process.env.OPENAI_ORGANIZATION_ID || undefined,
});

// Model for AI Assistant Info generation. One-shot and user-initiated, so we
// favour quality over speed.
// TODO: switch to GPT-5.6 Terra once it leaves limited preview — balanced tier,
// ~half the output cost of 5.5 at comparable quality (openai('gpt-5.6-terra')).
const GENERATION_MODEL = openai('gpt-5.5');

/**
 * Service-aware AI Helper
 *
 * This class provides AI-powered assistance for service configuration and management.
 * It can analyze service structure and generate intelligent suggestions.
 */
class ServiceAI {
  constructor(serviceDetails) {
    this.service = serviceDetails;
  }

  /**
   * Generate AI Assistant Info suggestions based on service parameters
   *
   * Can ask clarifying questions first if information is ambiguous.
   * Returns either questions or final suggestions.
   *
   * @param {Array} conversationHistory - Array of {role: 'user'|'assistant', content: string}
   * @returns {Object} { hasQuestions, questions?, suggestions? }
   */
  async generateAIInfo(conversationHistory = []) {
    // Build context about the service, then generate suggestions in one shot.
    const context = this._buildServiceContext();
    return await this._generateFinalSuggestions(context, conversationHistory);
  }

  /**
   * Generate final suggestions with conversation context
   */
  async _generateFinalSuggestions(context, conversationHistory) {
    // Define the schema for AI-generated suggestions
    const suggestionSchema = z.object({
      aiDescription: z.string().describe('A concise description (2-3 sentences) of what this service does and how AI assistants should help users with it. Focus on the purpose and value.'),
      aiUsageGuidance: z.string().describe('Detailed guidance (3-5 sentences) for AI assistants on how to interact with this service. Include tips about parameters, common use cases, and best practices.'),
      aiUsageExamples: z.array(z.string()).describe('3-5 concrete example queries that users might ask. Each should be a natural language question or request that demonstrates the service capabilities.'),
      aiTags: z.array(z.string()).describe('5-8 relevant tags/keywords that describe this service. Include domain, use case, and feature tags.'),
      category: z.string().describe('The primary category this service belongs to (e.g., Finance, Analytics, Utilities, Healthcare, etc.)'),
      reasoning: z.string().describe('Brief explanation of why these suggestions were made based on the service structure.')
    });

    // Build conversation context if exists
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\n## User Responses to Clarifying Questions:\n';
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          conversationContext += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          conversationContext += `Question: ${msg.content}\n`;
        }
      });
    }

    // Detect special field types that need specific AI guidance
    // Using shared detection utility for consistency across the codebase
    const percentageFields = detectPercentageFields(this.service.inputs);
    const booleanFields = detectBooleanFields(this.service.inputs);

    // Build critical AI rules section
    let criticalRules = '';
    if (percentageFields.length > 0) {
      criticalRules += '\n\n## Percentage parameter(s) detected\n\n';
      criticalRules += 'Background (do NOT copy this wording verbatim — restate it naturally):\n';
      criticalRules += PERCENTAGE_CONVERSION_RULES;
      criticalRules += '\n\n**Surface this ONCE**, woven into aiUsageGuidance as a plain-prose gotcha — e.g. "Pass percentages as decimals: 6% → 0.06." Do NOT shout it in ALL-CAPS and do NOT repeat the same block in aiDescription. Keep aiDescription clean prose; it may mention the decimal format briefly only if it reads naturally.';
    }

    if (booleanFields.length > 0) {
      if (!criticalRules) {
        criticalRules += '\n\n## CRITICAL RULES FROM CENTRALIZED AI INSTRUCTIONS:\n\n';
      }
      criticalRules += '\n\n' + BOOLEAN_CONVERSION_RULES;
      criticalRules += '\n\n**Include boolean format guidance** in aiUsageGuidance if boolean parameters exist.';
    }

    try {
      const result = await generateObject({
        model: GENERATION_MODEL,
        schema: suggestionSchema,
        prompt: `You write AI-facing documentation for an API service. The output is consumed by OTHER AI assistants (via MCP and a self-describing endpoint) that will CALL this service on a user's behalf.

Those assistants ALREADY receive the structured parameter schema separately — names, types, required flags, allowed values, ranges. So do NOT repeat the schema. Your job is to add what the schema CANNOT express and what genuinely makes the calling AI's job easier.

## Service Information
${context}
${conversationContext}
${criticalRules}

## What to write
- aiDescription (2-3 sentences): what the service is FOR (so the AI knows WHEN to reach for it) and what the outputs MEAN together. Concrete, no filler.
- aiUsageGuidance (3-5 sentences): ONLY the non-obvious, actionable things —
  • gotchas the schema can't show (units, sign/format conventions, encodings),
  • what each OUTPUT means: its scale or interpretation (e.g. "score 0-10, higher = worse"),
  • relationships or business rules between parameters.
  Do NOT write "provide all required parameters" or restate types/ranges/allowed values — the AI already has that.
- aiUsageExamples (3-5): realistic, diverse natural-language requests a user might make.
- aiTags (5-8) and category: for discovery.

${conversationHistory.length > 0 ? 'Use the user\'s responses above to inform your suggestions.' : ''}

If a "Real Computed Example" is provided above, use it to describe the outputs accurately and to make the examples realistic.

If percentage fields are detected, include the decimal-format gotcha (e.g. "6% → 0.06") ONCE in aiUsageGuidance, in your own plain prose — not in ALL-CAPS, not duplicated into aiDescription.`,
        temperature: 0.7,
      });

      return {
        hasQuestions: false,
        suggestions: result.object
      };
    } catch (error) {
      console.error('[ServiceAI] Error generating AI info:', error);
      throw new Error(`Failed to generate AI suggestions: ${error.message}`);
    }
  }

  /**
   * Detect if service has percentage fields that need special handling
   *
   * NOTE: Now uses shared detection utility from /lib/fieldTypeDetection.js
   * This was moved to ensure consistency across all AI instruction locations.
   */
  _detectPercentageFields() {
    return detectPercentageFields(this.service.inputs);
  }

  /**
   * Build comprehensive context about the service for AI analysis
   */
  _buildServiceContext() {
    const parts = [];

    // Service name and basic description
    parts.push(`**Name:** ${this.service.name || 'Unnamed Service'}`);
    if (this.service.description) {
      parts.push(`**Current Description:** ${this.service.description}`);
    }

    // Existing AI info (if any)
    if (this.service.aiDescription) {
      parts.push(`**Existing AI Description:** ${this.service.aiDescription}`);
    }

    // Detect and highlight percentage fields
    const percentageFields = this._detectPercentageFields();
    if (percentageFields.length > 0) {
      parts.push('\n### ⚠️ CRITICAL - Percentage Fields Detected:');
      percentageFields.forEach(field => {
        parts.push(`- **${field.name}** (${field.title}): Expects DECIMAL format (0.05 for 5%, NOT 5)`);
        if (field.min !== undefined && field.max !== undefined) {
          parts.push(`  Valid range: ${field.min} to ${field.max} (decimal format)`);
        }
      });
      parts.push('  Users often say "5%" — the calling AI must pass 0.05, not 5.');
    }

    // Input parameters
    if (this.service.inputs && this.service.inputs.length > 0) {
      parts.push('\n### Input Parameters:');
      this.service.inputs.forEach(input => {
        let inputDesc = `- **${input.name}** (${input.type || 'unknown'})`;
        if (input.title) inputDesc += ` - ${input.title}`;
        if (input.description) inputDesc += `: ${input.description}`;
        if (input.format) inputDesc += ` [Format: ${input.format}]`;
        if (input.mandatory !== false) inputDesc += ' [Required]';
        if (input.min !== undefined || input.max !== undefined) {
          inputDesc += ` [Range: ${input.min ?? 'any'} to ${input.max ?? 'any'}]`;
        }
        parts.push(inputDesc);
      });
    }

    // Output parameters
    if (this.service.outputs && this.service.outputs.length > 0) {
      parts.push('\n### Output Parameters:');
      this.service.outputs.forEach(output => {
        let outputDesc = `- **${output.name}** (${output.type || 'unknown'})`;
        if (output.title) outputDesc += ` - ${output.title}`;
        if (output.description) outputDesc += `: ${output.description}`;
        if (output.format) outputDesc += ` [Format: ${output.format}]`;
        parts.push(outputDesc);
      });
    }

    // Real computed example — grounds the model in actual behaviour (what the
    // outputs really look like), not just declared types. Input values are the
    // current spreadsheet inputs; output values are captured at publish time.
    const exampleInputs = (this.service.inputs || []).filter(i => i.value !== undefined && i.value !== null && i.value !== '');
    const exampleOutputs = (this.service.outputs || []).filter(o => o.value !== undefined && o.value !== null && o.value !== '');
    if (exampleInputs.length > 0 && exampleOutputs.length > 0) {
      parts.push('\n### Real Computed Example:');
      parts.push('Inputs: ' + exampleInputs.map(i => `${i.name}=${JSON.stringify(i.value)}`).join(', '));
      parts.push('Outputs: ' + exampleOutputs.map(o => `${o.name}=${JSON.stringify(o.value)}`).join(', '));
    }

    // Areas (if any)
    if (this.service.areas && this.service.areas.length > 0) {
      let areas = this.service.areas;
      if (typeof areas === 'string') {
        try {
          areas = JSON.parse(areas);
        } catch (e) {
          areas = [];
        }
      }

      if (areas.length > 0) {
        parts.push('\n### Editable Areas (Spreadsheet Regions):');
        areas.forEach(area => {
          let areaDesc = `- **${area.name}** (${area.mode || 'read/write'})`;
          if (area.description) areaDesc += `: ${area.description}`;
          if (area.aiContext) {
            if (area.aiContext.purpose) areaDesc += `\n  Purpose: ${area.aiContext.purpose}`;
            if (area.aiContext.expectedBehavior) areaDesc += `\n  Expected Behavior: ${area.aiContext.expectedBehavior}`;
          }
          parts.push(areaDesc);
        });
      }
    }

    // Existing AI configuration (if any)
    if (this.service.aiUsageGuidance) {
      parts.push(`\n**Existing Usage Guidance:** ${this.service.aiUsageGuidance}`);
    }

    if (this.service.aiUsageExamples && this.service.aiUsageExamples.length > 0) {
      parts.push('\n**Existing Examples:**');
      this.service.aiUsageExamples.forEach(ex => {
        parts.push(`- ${ex}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Future methods can be added here:
   * - generateAreaAIContext(areaName) - Generate AI context for specific area
   * - suggestParameterDescriptions() - Suggest better parameter descriptions
   * - generateTestCases() - Generate test cases for the service
   * - analyzeServiceQuality() - Analyze and suggest improvements
   */
}

/**
 * Factory function to create a ServiceAI instance
 */
export function createServiceAI(serviceDetails) {
  return new ServiceAI(serviceDetails);
}

export default ServiceAI;
