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
      input: transformedInputs,
      output: transformedOutputs,
      tokens: flags.tokens || [],
      flags: {
        useCaching: flags.enableCaching !== false ? "true" : "false",
        needsToken: flags.requireToken === true ? "true" : "false"
      }
    },
    fileJson: workbookJSON // The spreadsheet data in JSON format
  };

  return publishData;
}

// Call manageapi to publish the service
export async function publishService(serviceId, publishData, tenant = 'default') {
  try {
    // Convert to FormData as manageapi expects
    const jsonString = JSON.stringify(publishData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], `${serviceId}.json`, { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('file', file);

    // Check if service exists
    const checkResponse = await fetch(`/api/manageapi?type=check&api=${serviceId}`, {
      method: 'GET'
    });
    
    const checkResult = await checkResponse.json();
    const type = checkResult.status === 'active' ? 'update' : 'create';

    // Create or update the service
    const response = await fetch(`/api/manageapi?type=${type}&api=${serviceId}&tenant=${tenant}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to publish service');
    }

    return await response.json();
  } catch (error) {
    console.error('Error publishing service:', error);
    throw error;
  }
}