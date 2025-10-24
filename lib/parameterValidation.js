/**
 * Parameter Validation Module
 * Centralized validation logic for API input parameters
 */

/**
 * Flexible boolean coercion - supports multiple formats
 * @param {any} value - Value to convert to boolean
 * @returns {boolean|null} Boolean value or null if invalid
 */
function coerceToBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null; // Invalid number
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();

    // English
    if (lower === 'true' || lower === 't' || lower === 'yes' || lower === 'y') return true;
    if (lower === 'false' || lower === 'f' || lower === 'no' || lower === 'n') return false;

    // German
    if (lower === 'wahr' || lower === 'ja' || lower === 'j') return true;
    if (lower === 'falsch' || lower === 'nein') return false;

    // Numeric strings
    if (lower === '1') return true;
    if (lower === '0') return false;

    return null; // Invalid string
  }

  return null; // Invalid type
}

/**
 * Validate a single parameter value
 * @param {any} value - The value to validate
 * @param {object} definition - Parameter definition
 * @returns {object} { valid: boolean, error?: object, coercedValue?: any }
 */
function validateSingleParameter(value, definition) {
  const paramName = definition.title || definition.name;

  // Type validation and coercion
  let coercedValue = value;

  if (definition.type === 'number') {
    let valueToConvert = value;

    // Auto-convert percentage values for percentage-formatted fields
    const isPercentage = definition.format === 'percentage' || definition.formatString?.includes('%');

    // Smart heuristic: detect percentage fields by their bounds
    // If field has max of 1 or less, it's likely expecting decimal (0-1) not percentage (0-100)
    const maxValue = Number(definition.max);
    const minValue = Number(definition.min);
    const hasDecimalBounds = !isNaN(maxValue) && maxValue <= 1 && !isNaN(minValue) && minValue >= 0;
    const isLikelyPercentage = isPercentage || hasDecimalBounds;

    if (isLikelyPercentage) {
      // Handle percentage string format: "5%" -> 0.05
      if (typeof value === 'string') {
        const percentMatch = value.trim().match(/^(-?[\d.]+)%$/);
        if (percentMatch) {
          valueToConvert = parseFloat(percentMatch[1]) / 100;
          console.log(`[Validation] Converted percentage string "${value}" to decimal ${valueToConvert}`);
        }
      }

      // Smart detection: if value > max (when max <= 1), assume it's in percentage format
      // This handles: 42 -> 0.42, 5.5 -> 0.055, but preserves 0.42 -> 0.42
      const numCheck = Number(valueToConvert);
      const threshold = hasDecimalBounds ? maxValue : 1;
      if (!isNaN(numCheck) && Math.abs(numCheck) > threshold) {
        valueToConvert = numCheck / 100;
        console.log(`[Validation] Auto-detected percentage format (value ${value} > threshold ${threshold}): ${value} -> ${valueToConvert}`);
      }
    }

    const numValue = Number(valueToConvert);
    if (isNaN(numValue)) {
      return {
        valid: false,
        error: {
          parameter: paramName,
          error: `Expected a number, got: ${value}`,
          type: 'type_mismatch',
          expectedType: 'number',
          receivedValue: value
        }
      };
    }
    coercedValue = numValue;

    // Min/Max validation
    if (definition.min !== undefined && numValue < definition.min) {
      return {
        valid: false,
        error: {
          parameter: paramName,
          error: `Value ${numValue} is below minimum ${definition.min}`,
          type: 'below_minimum',
          min: definition.min,
          value: numValue
        }
      };
    }

    if (definition.max !== undefined && numValue > definition.max) {
      return {
        valid: false,
        error: {
          parameter: paramName,
          error: `Value ${numValue} is above maximum ${definition.max}`,
          type: 'above_maximum',
          max: definition.max,
          value: numValue
        }
      };
    }

    // Numeric enum validation
    if (definition.allowedValues && definition.allowedValues.length > 0) {
      // Convert allowed values to numbers for comparison
      const allowedNumbers = definition.allowedValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (allowedNumbers.length > 0 && !allowedNumbers.includes(numValue)) {
        return {
          valid: false,
          error: {
            parameter: paramName,
            error: `Value ${numValue} is not allowed. Allowed values: ${definition.allowedValues.join(', ')}`,
            type: 'invalid_enum_value',
            allowedValues: definition.allowedValues,
            receivedValue: value
          }
        };
      }
    }

  } else if (definition.type === 'boolean') {
    const boolValue = coerceToBoolean(value);
    if (boolValue === null) {
      return {
        valid: false,
        error: {
          parameter: paramName,
          error: `Expected a boolean, got: ${value}. Accepted values: true/false, yes/no, 1/0, wahr/falsch, ja/nein`,
          type: 'type_mismatch',
          expectedType: 'boolean',
          receivedValue: value
        }
      };
    }
    coercedValue = boolValue;

  } else if (definition.type === 'string' || !definition.type) {
    // String type (or no type specified)
    coercedValue = String(value).trim(); // Trim whitespace

    // String enum validation
    if (definition.allowedValues && definition.allowedValues.length > 0) {
      const caseSensitive = definition.allowedValuesCaseSensitive === true; // Default: case-insensitive
      const valueToCheck = caseSensitive ? coercedValue : coercedValue.toLowerCase();
      const allowedSet = caseSensitive
        ? definition.allowedValues.map(v => String(v).trim())
        : definition.allowedValues.map(v => String(v).trim().toLowerCase());

      console.log(`[Validation] String enum check for ${paramName}:`, {
        receivedValue: value,
        coercedValue,
        valueToCheck,
        allowedValues: definition.allowedValues,
        allowedSet,
        caseSensitive,
        includes: allowedSet.includes(valueToCheck)
      });

      if (!allowedSet.includes(valueToCheck)) {
        return {
          valid: false,
          error: {
            parameter: paramName,
            error: `Value "${value}" is not allowed. Allowed values: ${definition.allowedValues.join(', ')}`,
            type: 'invalid_enum_value',
            allowedValues: definition.allowedValues,
            receivedValue: value,
            caseSensitive: caseSensitive
          }
        };
      }
    }
  }

  return {
    valid: true,
    coercedValue: coercedValue
  };
}

/**
 * Validate all parameters
 * @param {object} inputs - Key-value pairs of input parameters
 * @param {array} inputDefinitions - Array of parameter definitions
 * @returns {object} { valid: boolean, errors?: array, message?: string }
 */
export function validateParameters(inputs, inputDefinitions) {
  const validationErrors = [];
  const missingRequired = [];

  // Step 1: Check mandatory parameters
  for (const inputDef of inputDefinitions) {
    const isMandatory = inputDef.mandatory !== false; // Default to true if not specified

    // Check all possible parameter name variations (case-insensitive, with/without underscores)
    const paramName = inputDef.name;
    const paramNameLower = paramName?.toLowerCase();
    const paramNameNoUnderscore = paramNameLower?.replace(/_/g, '');

    let providedValue = inputs[paramName];

    // Try variations if not found
    if (providedValue === undefined || providedValue === null || providedValue === '') {
      // Try lowercase exact match
      for (const [key, value] of Object.entries(inputs)) {
        const keyLower = key.toLowerCase();
        const keyNoUnderscore = keyLower.replace(/_/g, '');

        if (keyLower === paramNameLower || keyNoUnderscore === paramNameNoUnderscore) {
          providedValue = value;
          break;
        }
      }
    }

    if (isMandatory && (providedValue === undefined || providedValue === null || providedValue === '')) {
      missingRequired.push({
        name: inputDef.name,
        title: inputDef.title || inputDef.name
      });
    }
  }

  if (missingRequired.length > 0) {
    return {
      valid: false,
      error: 'Missing required parameters',
      message: `The following required parameters are missing: ${missingRequired.map(p => p.title || p.name).join(', ')}`,
      details: {
        required: missingRequired
      }
    };
  }

  // Step 2: Validate types, bounds, and enums for provided inputs
  for (const [key, value] of Object.entries(inputs)) {
    const inputKey = key.toLowerCase();
    const inputKeyNoUnderscore = inputKey.replace(/_/g, '');
    const inputDef = inputDefinitions.find(
      (apiInput) => {
        const apiName = apiInput.name?.toLowerCase();
        const apiAddress = apiInput.address?.toLowerCase();
        const apiNameNoUnderscore = apiName?.replace(/_/g, '');

        return apiName === inputKey ||
               apiAddress === inputKey ||
               apiNameNoUnderscore === inputKeyNoUnderscore;
      }
    );

    if (!inputDef) {
      // Input not defined in API - skip validation (could be extra param or system param)
      continue;
    }

    const validation = validateSingleParameter(value, inputDef);
    if (!validation.valid) {
      validationErrors.push(validation.error);
    }
  }

  // Step 3: Check if there were any validation errors
  if (validationErrors.length > 0) {
    return {
      valid: false,
      error: 'Parameter validation failed',
      message: `${validationErrors.length} parameter(s) failed validation`,
      details: {
        errors: validationErrors
      }
    };
  }

  return {
    valid: true
  };
}

/**
 * Apply default values to inputs (for optional parameters only)
 * @param {object} inputs - Current input values
 * @param {array} inputDefinitions - Parameter definitions
 * @returns {object} Inputs with defaults applied
 */
export function applyDefaults(inputs, inputDefinitions) {
  const result = { ...inputs };

  for (const inputDef of inputDefinitions) {
    const isMandatory = inputDef.mandatory !== false;
    const hasDefaultValue = inputDef.defaultValue !== undefined && inputDef.defaultValue !== null;

    // Only apply defaults for optional parameters
    if (!isMandatory && hasDefaultValue) {
      // Check if value was provided (flexible matching)
      const paramName = inputDef.name;
      const paramNameLower = paramName?.toLowerCase();
      const paramNameNoUnderscore = paramNameLower?.replace(/_/g, '');

      let providedValue = inputs[paramName];

      // Try variations if not found
      if (providedValue === undefined || providedValue === null || providedValue === '') {
        for (const [key, value] of Object.entries(inputs)) {
          const keyLower = key.toLowerCase();
          const keyNoUnderscore = keyLower.replace(/_/g, '');

          if (keyLower === paramNameLower || keyNoUnderscore === paramNameNoUnderscore) {
            providedValue = value;
            break;
          }
        }
      }

      if (providedValue === undefined || providedValue === null || providedValue === '') {
        // Value not provided - apply default
        const key = paramName;

        // Validate that default value is valid (respects allowedValues, min/max, etc.)
        const validation = validateSingleParameter(inputDef.defaultValue, inputDef);

        if (validation.valid) {
          result[key] = validation.coercedValue;
          console.log(`[Validation] Applied default value for ${key}: ${validation.coercedValue}`);
        } else {
          console.warn(`[Validation] Invalid default value for ${key}:`, validation.error);
          // Don't apply invalid default - let it remain missing
        }
      }
    }
  }

  return result;
}

/**
 * Coerce input values to their correct types
 * @param {object} inputs - Input values
 * @param {array} inputDefinitions - Parameter definitions
 * @returns {object} Inputs with coerced types
 */
export function coerceTypes(inputs, inputDefinitions) {
  const result = {};

  for (const [key, value] of Object.entries(inputs)) {
    const inputKey = key.toLowerCase();
    const inputKeyNoUnderscore = inputKey.replace(/_/g, '');
    const inputDef = inputDefinitions.find(
      (apiInput) => {
        const apiName = apiInput.name?.toLowerCase();
        const apiAddress = apiInput.address?.toLowerCase();
        const apiNameNoUnderscore = apiName?.replace(/_/g, '');

        return apiName === inputKey ||
               apiAddress === inputKey ||
               apiNameNoUnderscore === inputKeyNoUnderscore;
      }
    );

    if (!inputDef) {
      // Unknown parameter - keep as-is
      result[key] = value;
      continue;
    }

    // Coerce to correct type
    if (inputDef.type === 'number') {
      let valueToConvert = value;

      // Auto-convert percentage values for percentage-formatted fields
      const isPercentage = inputDef.format === 'percentage' || inputDef.formatString?.includes('%');

      // Smart heuristic: detect percentage fields by their bounds
      // If field has max of 1 or less, it's likely expecting decimal (0-1) not percentage (0-100)
      const maxValue = Number(inputDef.max);
      const minValue = Number(inputDef.min);
      const hasDecimalBounds = !isNaN(maxValue) && maxValue <= 1 && !isNaN(minValue) && minValue >= 0;
      const isLikelyPercentage = isPercentage || hasDecimalBounds;

      if (isLikelyPercentage) {
        // Handle percentage string format: "5%" -> 0.05
        if (typeof value === 'string') {
          const percentMatch = value.trim().match(/^(-?[\d.]+)%$/);
          if (percentMatch) {
            valueToConvert = parseFloat(percentMatch[1]) / 100;
          }
        }

        // Smart detection: if value > max (when max <= 1), assume it's in percentage format
        const numCheck = Number(valueToConvert);
        const threshold = hasDecimalBounds ? maxValue : 1;
        if (!isNaN(numCheck) && Math.abs(numCheck) > threshold) {
          valueToConvert = numCheck / 100;
        }
      }

      result[key] = Number(valueToConvert);
    } else if (inputDef.type === 'boolean') {
      result[key] = coerceToBoolean(value);
    } else {
      result[key] = String(value);
    }
  }

  return result;
}

export default {
  validateParameters,
  applyDefaults,
  coerceTypes,
  validateSingleParameter,
  coerceToBoolean
};
