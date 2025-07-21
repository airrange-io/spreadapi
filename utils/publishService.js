// Client-safe publish service utilities
// NOTE: This file must not import any server-side modules like Redis

// Helper function to get object size in bytes
function getObjectSize(obj) {
  const jsonString = JSON.stringify(obj);
  return new Blob([jsonString]).size;
}

// Helper function for deep copy
function jsonCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Optimize workbook data for API service (remove unnecessary data)
function optimizeForService(fileData) {
  if (!fileData) return null;
  
  const data = jsonCopy(fileData);
  let sizeAfter;

  try {
    const sizeBefore = getObjectSize(data);
    console.log("Size before optimization:", sizeBefore);

    // Remove named styles (not needed for calculations)
    if (data.namedStyles) {
      data.namedStyles = {};
    }

    // Get sheets object
    const sheets = data.sheets || {};

    // Remove internal sheets
    if (sheets.hasOwnProperty("AR_INFO")) delete sheets["AR_INFO"];
    if (sheets.hasOwnProperty("AR_LOGS")) delete sheets["AR_LOGS"];

    // Clean each sheet
    Object.keys(sheets).forEach((sheetName) => {
      const sheet = sheets[sheetName];
      
      // Remove visual elements not needed for calculations
      if (sheet.shapes) sheet.shapes = [];
      if (sheet.charts) sheet.charts = [];
      if (sheet.pictures) sheet.pictures = [];
      if (sheet.floatingObjects) sheet.floatingObjects = [];
      
      // Remove print settings
      if (sheet.printInfo) sheet.printInfo = {};
      
      // Remove conditional formatting (keep for calculations but remove if not needed)
      // if (sheet.conditionalFormats) sheet.conditionalFormats = {};
      
      // Clean cell styles from dataTable (keep values and formulas)
      const dataTable = sheet.data?.dataTable || {};
      Object.keys(dataTable).forEach((row) => {
        const rowData = dataTable[row];
        if (rowData && typeof rowData === 'object') {
          Object.keys(rowData).forEach((col) => {
            const cell = rowData[col];
            if (cell && typeof cell === 'object') {
              // Keep only essential properties for calculations
              const essentialProps = ['value', 'formula'];
              Object.keys(cell).forEach(prop => {
                if (!essentialProps.includes(prop)) {
                  delete cell[prop];
                }
              });
            }
          });
        }
      });

      // Remove row/column styles
      if (sheet.rowHeaderData) sheet.rowHeaderData = {};
      if (sheet.colHeaderData) sheet.colHeaderData = {};
    });

    sizeAfter = getObjectSize(data);
    console.log("Size after optimization:", sizeAfter);
    console.log("Size reduction:", ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1) + "%");

    return { data, dataSize: sizeAfter };
  } catch (error) {
    console.error("Error optimizing for service:", error);
    return { data: fileData, dataSize: getObjectSize(fileData) };
  }
}

// Transform UI service data to manageapi format
export async function prepareServiceForPublish(spreadInstance, service, flags = {}) {
  if (!spreadInstance || !spreadInstance.toJSON) {
    throw new Error('Invalid spread instance - missing toJSON method');
  }

  // Get the workbook data in JSON format
  const workbookJSON = spreadInstance.toJSON({
    includeBindingSource: true,
    saveAsView: false
  });

  // Optimize the workbook data for API service
  const optimized = optimizeForService(workbookJSON);
  const optimizedWorkbook = optimized.data;

  // Transform input definitions to match manageapi format
  const transformedInputs = service.inputs.map(input => {
    // Parse the address to get sheet name and cell reference
    const addressParts = input.address.split('!');
    const sheetName = addressParts[0];
    const cellRef = addressParts[1];
    
    return {
      id: input.id,
      address: input.address,
      name: input.name,
      alias: input.alias,
      row: input.row,
      col: input.col,
      type: input.type,
      value: input.value || '',
      direction: 'input',
      mandatory: input.mandatory !== false,
      ...(input.min !== undefined && { min: input.min }),
      ...(input.max !== undefined && { max: input.max }),
      ...(input.description && { description: input.description })
    };
  });

  // Transform output definitions
  const transformedOutputs = service.outputs.map(output => {
    // Parse the address to get sheet name and cell reference
    const addressParts = output.address.split('!');
    const sheetName = addressParts[0];
    const cellRef = addressParts[1];
    
    return {
      id: output.id,
      address: output.address,
      name: output.name,
      alias: output.alias,
      row: output.row,
      col: output.col,
      type: output.type,
      value: output.value || '',
      direction: 'output',
      ...(output.description && { description: output.description })
    };
  });

  // Prepare the data structure for manageapi
  const publishData = {
    apiJson: {
      title: service.name || "Untitled Service",
      description: service.description || "",
      input: transformedInputs,
      output: transformedOutputs,
      tokens: flags.tokens || [],
      flags: {
        useCaching: flags.enableCaching !== false ? "true" : "false",
        needsToken: flags.requireToken === true ? "true" : "false"
      }
    },
    fileJson: optimizedWorkbook // The optimized spreadsheet data
  };

  console.log(`Prepared service for publishing: ${service.inputs.length} inputs, ${service.outputs.length} outputs`);
  console.log(`Workbook size: ${(optimized.dataSize / 1024).toFixed(1)}KB`);

  return publishData;
}

// Call service management via API route (client-safe)
export async function publishService(serviceId, publishData, tenant = 'test1234') {
  try {
    // Use API route instead of direct function call
    const response = await fetch('/api/services/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceId,
        publishData,
        tenant
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to publish service');
    }
    
    const result = await response.json();
    
    console.log(`Service ${result.status} successfully:`, {
      apiId: result.apiId,
      size: result.fileSize,
      url: result.fileUrl
    });
    
    return result;
  } catch (error) {
    console.error('Error publishing service:', error);
    throw error;
  }
}