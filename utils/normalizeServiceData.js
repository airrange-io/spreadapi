/**
 * Normalize service data to handle inconsistencies between type/dataType fields
 * This centralizes the logic for handling the type vs dataType inconsistency
 * that exists throughout the codebase.
 */

/**
 * Get the type of an input/output/area, checking both type and dataType fields
 * @param {Object} item - Input, output, or area object
 * @returns {string} The type (defaults to 'string' if not found)
 */
export function getItemType(item) {
  return item?.dataType || item?.type || 'string';
}

/**
 * Check if an item is a number type
 * @param {Object} item - Input, output, or area object
 * @returns {boolean} True if the item is a number type
 */
export function isNumberType(item) {
  const type = getItemType(item);
  return type === 'number' || 
         item?.format === 'currency' || 
         item?.format === 'percentage' ||
         item?.format === 'decimal';
}

/**
 * Normalize a single input/output/area object
 * Ensures both type and dataType are set consistently
 * @param {Object} item - Input, output, or area object
 * @returns {Object} Normalized item with both type and dataType
 */
export function normalizeItem(item) {
  if (!item) return item;
  
  // Create a copy to avoid mutating the original
  const normalized = { ...item };
  
  // Ensure both fields exist and are consistent
  const actualType = getItemType(item);
  normalized.type = actualType;
  normalized.dataType = actualType;
  
  return normalized;
}

/**
 * Normalize all inputs in a service
 * @param {Array} inputs - Array of input objects
 * @returns {Array} Normalized inputs
 */
export function normalizeInputs(inputs) {
  if (!Array.isArray(inputs)) return [];
  return inputs.map(normalizeItem);
}

/**
 * Normalize all outputs in a service
 * @param {Array} outputs - Array of output objects
 * @returns {Array} Normalized outputs
 */
export function normalizeOutputs(outputs) {
  if (!Array.isArray(outputs)) return [];
  return outputs.map(normalizeItem);
}

/**
 * Normalize all areas in a service
 * @param {Array} areas - Array of area objects
 * @returns {Array} Normalized areas
 */
export function normalizeAreas(areas) {
  if (!Array.isArray(areas)) return [];
  return areas.map(normalizeItem);
}

/**
 * Normalize an entire service object
 * @param {Object} service - Service object with inputs, outputs, areas
 * @returns {Object} Normalized service
 */
export function normalizeService(service) {
  if (!service) return service;
  
  return {
    ...service,
    inputs: normalizeInputs(service.inputs),
    outputs: normalizeOutputs(service.outputs),
    areas: normalizeAreas(service.areas)
  };
}

/**
 * Get Zod schema type for an input/output
 * @param {Object} item - Input or output object
 * @returns {string} 'number' or 'string' for Zod schema
 */
export function getZodType(item) {
  return isNumberType(item) ? 'number' : 'string';
}