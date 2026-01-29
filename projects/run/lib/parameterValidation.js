/**
 * Parameter Validation - Stripped for performance
 */

/**
 * Special marker value indicating that a cell should be cleared to null.
 */
export const NULL_DEFAULT_VALUE = '__SPREADAPI_NULL__';

function coerceToBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (['true', 't', 'yes', 'y', 'wahr', 'ja', 'j', '1'].includes(lower)) return true;
    if (['false', 'f', 'no', 'n', 'falsch', 'nein', '0'].includes(lower)) return false;
  }
  return null;
}

function validateSingleParameter(value, definition) {
  const paramName = definition.title || definition.name;
  let coercedValue = value;

  if (definition.type === 'number') {
    let valueToConvert = value;
    const isPercentage = definition.format === 'percentage' || definition.formatString?.includes('%');
    const maxValue = Number(definition.max);
    const minValue = Number(definition.min);
    const hasDecimalBounds = !isNaN(maxValue) && maxValue <= 1 && !isNaN(minValue) && minValue >= 0;
    const isLikelyPercentage = isPercentage || hasDecimalBounds;

    if (isLikelyPercentage) {
      if (typeof value === 'string') {
        const percentMatch = value.trim().match(/^(-?[\d.]+)%$/);
        if (percentMatch) valueToConvert = parseFloat(percentMatch[1]) / 100;
      }
      const numCheck = Number(valueToConvert);
      const threshold = hasDecimalBounds ? maxValue : 1;
      if (!isNaN(numCheck) && Math.abs(numCheck) > threshold) valueToConvert = numCheck / 100;
    }

    const numValue = Number(valueToConvert);
    if (isNaN(numValue)) {
      return { valid: false, error: { parameter: paramName, error: `Expected number, got: ${value}`, type: 'type_mismatch' } };
    }
    coercedValue = numValue;

    if (definition.min !== undefined && numValue < definition.min) {
      return { valid: false, error: { parameter: paramName, error: `Value ${numValue} below minimum ${definition.min}`, type: 'below_minimum' } };
    }
    if (definition.max !== undefined && numValue > definition.max) {
      return { valid: false, error: { parameter: paramName, error: `Value ${numValue} above maximum ${definition.max}`, type: 'above_maximum' } };
    }
    if (definition.allowedValues?.length > 0) {
      const allowedNumbers = definition.allowedValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (allowedNumbers.length > 0 && !allowedNumbers.includes(numValue)) {
        return { valid: false, error: { parameter: paramName, error: `Value ${numValue} not allowed`, type: 'invalid_enum_value', allowedValues: definition.allowedValues } };
      }
    }
  } else if (definition.type === 'boolean') {
    const boolValue = coerceToBoolean(value);
    if (boolValue === null) {
      return { valid: false, error: { parameter: paramName, error: `Expected boolean, got: ${value}`, type: 'type_mismatch' } };
    }
    coercedValue = boolValue;
  } else {
    coercedValue = String(value).trim();
    if (definition.allowedValues?.length > 0) {
      const caseSensitive = definition.allowedValuesCaseSensitive === true;
      const valueToCheck = caseSensitive ? coercedValue : coercedValue.toLowerCase();
      const allowedSet = caseSensitive
        ? definition.allowedValues.map(v => String(v).trim())
        : definition.allowedValues.map(v => String(v).trim().toLowerCase());
      if (!allowedSet.includes(valueToCheck)) {
        return { valid: false, error: { parameter: paramName, error: `Value "${value}" not allowed`, type: 'invalid_enum_value', allowedValues: definition.allowedValues } };
      }
    }
  }

  return { valid: true, coercedValue };
}

export function validateParameters(inputs, inputDefinitions) {
  const validationErrors = [];
  const missingRequired = [];

  for (const inputDef of inputDefinitions) {
    const isMandatory = inputDef.mandatory !== false;
    const paramName = inputDef.name;
    const paramTitle = inputDef.title;
    const paramNameLower = paramName?.toLowerCase();
    const paramNameNoUnderscore = paramNameLower?.replace(/_/g, '');
    const paramTitleLower = paramTitle?.toLowerCase();
    const paramTitleNoUnderscore = paramTitleLower?.replace(/[\s_-]/g, '');

    let providedValue = inputs[paramName];

    if (providedValue === undefined || providedValue === null || providedValue === '') {
      for (const [key, value] of Object.entries(inputs)) {
        const keyLower = key.toLowerCase();
        const keyNoUnderscore = keyLower.replace(/[\s_-]/g, '');
        if (keyLower === paramNameLower || keyNoUnderscore === paramNameNoUnderscore ||
            (paramTitleLower && (keyLower === paramTitleLower || keyNoUnderscore === paramTitleNoUnderscore))) {
          providedValue = value;
          break;
        }
      }
    }

    if (isMandatory && (providedValue === undefined || providedValue === null || providedValue === '')) {
      missingRequired.push({ name: inputDef.name, title: inputDef.title || inputDef.name });
    }
  }

  if (missingRequired.length > 0) {
    return {
      valid: false,
      error: 'Missing required parameters',
      message: `Missing: ${missingRequired.map(p => p.title || p.name).join(', ')}`,
      details: { required: missingRequired }
    };
  }

  for (const [key, value] of Object.entries(inputs)) {
    const inputKey = key.toLowerCase();
    const inputKeyNoUnderscore = inputKey.replace(/[\s_-]/g, '');
    const inputDef = inputDefinitions.find(apiInput => {
      const apiName = apiInput.name?.toLowerCase();
      const apiTitle = apiInput.title?.toLowerCase();
      const apiNameNoUnderscore = apiName?.replace(/[\s_-]/g, '');
      const apiTitleNoUnderscore = apiTitle?.replace(/[\s_-]/g, '');
      return apiName === inputKey || apiTitle === inputKey || apiNameNoUnderscore === inputKeyNoUnderscore || apiTitleNoUnderscore === inputKeyNoUnderscore;
    });

    if (!inputDef) continue;

    const validation = validateSingleParameter(value, inputDef);
    if (!validation.valid) validationErrors.push(validation.error);
  }

  if (validationErrors.length > 0) {
    return { valid: false, error: 'Parameter validation failed', message: `${validationErrors.length} parameter(s) failed`, details: { errors: validationErrors } };
  }

  return { valid: true };
}

export function applyDefaults(inputs, inputDefinitions) {
  const result = { ...inputs };

  for (const inputDef of inputDefinitions) {
    const isMandatory = inputDef.mandatory !== false;
    const hasDefaultValue = inputDef.defaultValue !== undefined && inputDef.defaultValue !== null;

    if (!isMandatory && hasDefaultValue) {
      const paramName = inputDef.name;
      const paramNameLower = paramName?.toLowerCase();
      const paramNameNoUnderscore = paramNameLower?.replace(/_/g, '');

      let providedValue = inputs[paramName];

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
        // Special case: NULL_DEFAULT_VALUE marker means "clear the cell"
        if (inputDef.defaultValue === NULL_DEFAULT_VALUE) {
          result[paramName] = NULL_DEFAULT_VALUE;
        } else {
          const validation = validateSingleParameter(inputDef.defaultValue, inputDef);
          if (validation.valid) result[paramName] = validation.coercedValue;
        }
      }
    }
  }

  return result;
}

export function coerceTypes(inputs, inputDefinitions) {
  const result = {};

  for (const [key, value] of Object.entries(inputs)) {
    const inputKey = key.toLowerCase();
    const inputKeyNoUnderscore = inputKey.replace(/[\s_-]/g, '');
    const inputDef = inputDefinitions.find(apiInput => {
      const apiName = apiInput.name?.toLowerCase();
      const apiTitle = apiInput.title?.toLowerCase();
      const apiNameNoUnderscore = apiName?.replace(/[\s_-]/g, '');
      const apiTitleNoUnderscore = apiTitle?.replace(/[\s_-]/g, '');
      return apiName === inputKey || apiTitle === inputKey || apiNameNoUnderscore === inputKeyNoUnderscore || apiTitleNoUnderscore === inputKeyNoUnderscore;
    });

    if (!inputDef) { result[key] = value; continue; }

    if (inputDef.type === 'number') {
      let valueToConvert = value;
      const isPercentage = inputDef.format === 'percentage' || inputDef.formatString?.includes('%');
      const maxValue = Number(inputDef.max);
      const minValue = Number(inputDef.min);
      const hasDecimalBounds = !isNaN(maxValue) && maxValue <= 1 && !isNaN(minValue) && minValue >= 0;
      const isLikelyPercentage = isPercentage || hasDecimalBounds;

      if (isLikelyPercentage) {
        if (typeof value === 'string') {
          const percentMatch = value.trim().match(/^(-?[\d.]+)%$/);
          if (percentMatch) valueToConvert = parseFloat(percentMatch[1]) / 100;
        }
        const numCheck = Number(valueToConvert);
        const threshold = hasDecimalBounds ? maxValue : 1;
        if (!isNaN(numCheck) && Math.abs(numCheck) > threshold) valueToConvert = numCheck / 100;
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

export default { validateParameters, applyDefaults, coerceTypes };
