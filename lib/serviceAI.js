import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { PERCENTAGE_CONVERSION_RULES, BOOLEAN_CONVERSION_RULES } from './mcp-ai-instructions.js';
import { detectPercentageFields, detectBooleanFields } from './fieldTypeDetection.js';

// Create OpenAI instance
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: process.env.OPENAI_ORGANIZATION_ID || undefined,
});

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
    // Build context about the service
    const context = this._buildServiceContext();

    // Skip question-checking to avoid timeout on Vercel
    // Just generate suggestions directly (we can add questions back later if needed)
    return await this._generateFinalSuggestions(context, conversationHistory);
  }

  /**
   * Check if we need to ask clarifying questions
   */
  async _checkIfNeedsQuestions(context) {
    const questionSchema = z.object({
      hasQuestions: z.boolean().describe('Whether clarifying questions are needed'),
      questions: z.array(z.string()).optional().describe('1-3 clarifying questions to ask the user'),
      reasoning: z.string().describe('Why these questions are needed (or why not)')
    });

    try {
      const result = await generateObject({
        model: openai('gpt-4.1-nano'), // Use fast model for question detection
        schema: questionSchema,
        prompt: `You are analyzing an API service to determine if you need clarifying questions before generating AI assistant configuration.

## Service Information
${context}

## Task
Determine if you need to ask the user clarifying questions. Ask questions ONLY if:
1. The service purpose is unclear from parameter names/descriptions
2. The domain is ambiguous (e.g., could be healthcare, finance, or education)
3. Parameter relationships are unclear
4. Use cases are not obvious from the structure

If the service structure is clear and self-explanatory, don't ask questions - just indicate hasQuestions: false.

Keep questions focused and limit to 1-3 maximum.`,
        temperature: 0.3,
      });

      return result.object;
    } catch (error) {
      console.error('[ServiceAI] Error checking for questions:', error);
      // If error, proceed without questions
      return { hasQuestions: false, reasoning: 'Error occurred, proceeding with generation' };
    }
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
      criticalRules += '\n\n## CRITICAL RULES FROM CENTRALIZED AI INSTRUCTIONS:\n\n';
      criticalRules += PERCENTAGE_CONVERSION_RULES;
      criticalRules += '\n\n**YOU MUST INCLUDE THIS PERCENTAGE GUIDANCE in both aiDescription and aiUsageGuidance!**';
      criticalRules += '\nSpecifically mention that AI assistants should convert percentages to decimals (e.g., "5% becomes 0.05").';
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
        model: openai('gpt-4.1-mini'),
        schema: suggestionSchema,
        prompt: `You are an expert at analyzing API services and creating helpful AI assistant configurations.

Analyze this service and generate AI assistant configuration:

## Service Information
${context}
${conversationContext}
${criticalRules}

## Task
Generate intelligent suggestions for how AI assistants should understand and interact with this service.

Guidelines:
- AI Description: Should be clear, concise, and focused on user value
- AI Usage Guidance: Should help AI assistants understand how to properly use this service
- AI Usage Examples: Should be diverse, realistic, and demonstrate key capabilities
- AI Tags: Should cover domain, features, and use cases
- Category: Should be a broad, recognizable category

${conversationHistory.length > 0 ? 'Use the user\'s responses above to inform your suggestions.' : ''}

**CRITICAL**: If percentage fields are detected, you MUST include clear guidance about decimal format (5% → 0.05) in BOTH aiDescription and aiUsageGuidance. This is non-negotiable - use the exact wording from the CRITICAL RULES section above.

Focus on making this service easy for users to interact with through natural language.`,
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
      parts.push('\n**IMPORTANT FOR AI GUIDANCE:**');
      parts.push('- Users will often say "5%" but AI must convert to 0.05');
      parts.push('- This service expects decimals, NOT percentages (0.05, not 5)');
      parts.push('- The system has auto-conversion, but AI should use correct format');
      parts.push('- Always include this warning in aiDescription and aiUsageGuidance!');
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
