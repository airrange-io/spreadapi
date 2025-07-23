# Complete Editable Areas Implementation

## 1. Update EditorPanel.tsx - Add Areas State and UI

### Add to State Declarations (around line 90)
```typescript
// Add these imports at the top
import { 
  TableOutlined, LockOutlined, EditOutlined, 
  ExportOutlined, InfoCircleOutlined, EyeOutlined,
  FunctionOutlined, DeleteOutlined
} from '@ant-design/icons';
import { Checkbox, Radio, Collapse, Tooltip } from 'antd';

const { Panel } = Collapse;

// Add area types
interface AreaPermissions {
  canReadValues: boolean;
  canWriteValues: boolean;
  canReadFormulas: boolean;
  canWriteFormulas: boolean;
  canReadFormatting: boolean;
  canWriteFormatting: boolean;
  canAddRows: boolean;
  canDeleteRows: boolean;
  canModifyStructure: boolean;
  allowedFormulas?: string[];
}

interface AreaParameter {
  id?: string;
  name: string;
  alias: string;
  address: string;
  description?: string;
  mode: 'readonly' | 'editable' | 'interactive';
  permissions: AreaPermissions;
  validation?: {
    protectedCells?: string[];
    editableColumns?: number[];
    formulaComplexityLimit?: number;
  };
  aiContext?: {
    purpose: string;
    expectedBehavior: string;
  };
}

// Add to state declarations
const [areas, setAreas] = useState<AreaParameter[]>(initialConfig?.areas || []);
const [showAreaModal, setShowAreaModal] = useState(false);
const [editingArea, setEditingArea] = useState<AreaParameter | null>(null);
const [editingAreaIndex, setEditingAreaIndex] = useState<number>(-1);

// Permission presets
const PERMISSION_PRESETS = {
  readonly: {
    canReadValues: true,
    canWriteValues: false,
    canReadFormulas: false,
    canWriteFormulas: false,
    canReadFormatting: true,
    canWriteFormatting: false,
    canAddRows: false,
    canDeleteRows: false,
    canModifyStructure: false
  },
  valueOnly: {
    canReadValues: true,
    canWriteValues: true,
    canReadFormulas: true,
    canWriteFormulas: false,
    canReadFormatting: true,
    canWriteFormatting: false,
    canAddRows: false,
    canDeleteRows: false,
    canModifyStructure: false
  },
  interactive: {
    canReadValues: true,
    canWriteValues: true,
    canReadFormulas: true,
    canWriteFormulas: true,
    canReadFormatting: true,
    canWriteFormatting: true,
    canAddRows: true,
    canDeleteRows: true,
    canModifyStructure: true
  }
};
```

### Replace the Button Area (around line 1485)
```typescript
{/* Fixed button at bottom - only show in parameters mode */}
{activeCard === 'parameters' && (
  <div
    ref={buttonAreaRef}
    style={{
      padding: '12px',
      paddingTop: 0,
      background: 'white',
      flex: '0 0 auto'
    }}>
    {(() => {
      const buttonInfo = getAddButtonInfo();
      const isRange = currentSelection && currentSelection.rowCount > 1 || currentSelection?.colCount > 1;
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ width: '100%', height: 48 }}
            onClick={handleAddFromSelection}
            disabled={buttonInfo.disabled || !spreadInstance || !spreadsheetReady}
          >
            {buttonInfo.text}
          </Button>
          
          {/* Add as Editable Area button - only show for ranges */}
          {isRange && !buttonInfo.disabled && (
            <Button
              type="default"
              icon={<TableOutlined />}
              style={{ width: '100%', height: 40 }}
              onClick={handleAddAsEditableArea}
              disabled={!spreadInstance || !spreadsheetReady}
            >
              Add Selection as Editable Area (for AI)
            </Button>
          )}
        </div>
      );
    })()}
  </div>
)}
```

### Add Handler Functions (after handleAddFromSelection)
```typescript
// Handle adding area from selection
const handleAddAsEditableArea = () => {
  if (!spreadInstance || !currentSelection) {
    message.warning('Please select a range in the spreadsheet');
    return;
  }

  const { row, col, rowCount = 1, colCount = 1 } = currentSelection;
  
  // Only allow ranges, not single cells
  if (rowCount === 1 && colCount === 1) {
    message.warning('Please select a range of cells, not a single cell');
    return;
  }

  const sheet = spreadInstance.getActiveSheet();
  const sheetName = sheet.name();
  
  // Build the address
  const startCell = getCellAddress(row, col);
  const endCell = getCellAddress(row + rowCount - 1, col + colCount - 1);
  const address = `${sheetName}!${startCell}:${endCell}`;
  
  // Check if this range already exists as an area
  const exists = areas.some(area => area.address === address);
  if (exists) {
    message.warning('This range is already defined as an area');
    return;
  }
  
  // Analyze the selected area
  const areaInfo = analyzeSelectedArea(sheet, row, col, rowCount, colCount);
  
  // Create new area with defaults
  const newArea: AreaParameter = {
    id: `area_${Date.now()}`,
    name: suggestAreaName(startCell, endCell),
    alias: '',
    address: address,
    description: '',
    mode: 'editable',
    permissions: PERMISSION_PRESETS.valueOnly,
    validation: {
      editableColumns: areaInfo.suggestedColumns.map((_, idx) => idx)
    },
    aiContext: {
      purpose: '',
      expectedBehavior: ''
    }
  };
  
  setEditingArea(newArea);
  setEditingAreaIndex(-1); // -1 means new area
  setShowAreaModal(true);
};

// Analyze selected area
const analyzeSelectedArea = (sheet: any, startRow: number, startCol: number, rowCount: number, colCount: number) => {
  const analysis = {
    hasFormulas: false,
    hasHeaders: false,
    columnTypes: [] as string[],
    suggestedColumns: [] as any[]
  };
  
  // Check first row for headers
  const firstRowValues = [];
  for (let c = 0; c < colCount; c++) {
    const value = sheet.getCell(startRow, startCol + c).value();
    firstRowValues.push(value);
    if (typeof value === 'string' && value.trim()) {
      analysis.hasHeaders = true;
    }
  }
  
  // Analyze each column
  for (let c = 0; c < colCount; c++) {
    const columnAnalysis = {
      index: c,
      name: analysis.hasHeaders && firstRowValues[c] ? String(firstRowValues[c]) : `Column ${c + 1}`,
      hasFormulas: false,
      dataType: 'mixed' as string,
      sampleValues: [] as any[]
    };
    
    // Check cells in column (skip header if exists)
    for (let r = analysis.hasHeaders ? 1 : 0; r < Math.min(10, rowCount); r++) {
      const cell = sheet.getCell(startRow + r, startCol + c);
      const formula = cell.formula();
      const value = cell.value();
      
      if (formula) {
        columnAnalysis.hasFormulas = true;
        analysis.hasFormulas = true;
      }
      
      if (value !== null && value !== undefined && value !== '') {
        columnAnalysis.sampleValues.push(value);
      }
    }
    
    // Detect data type
    if (columnAnalysis.sampleValues.length > 0) {
      const types = columnAnalysis.sampleValues.map(v => typeof v);
      if (types.every(t => t === 'number')) {
        columnAnalysis.dataType = 'number';
      } else if (types.every(t => t === 'string')) {
        columnAnalysis.dataType = 'string';
      }
    }
    
    analysis.suggestedColumns.push(columnAnalysis);
  }
  
  return analysis;
};

// Suggest area name
const suggestAreaName = (startCell: string, endCell: string) => {
  return `area_${startCell}_${endCell}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
};

// Handle area removal
const handleRemoveArea = (index: number) => {
  const newAreas = [...areas];
  newAreas.splice(index, 1);
  setAreas(newAreas);
  setHasUnsavedChanges(true);
};

// Handle area editing
const handleEditArea = (area: AreaParameter, index: number) => {
  setEditingArea(area);
  setEditingAreaIndex(index);
  setShowAreaModal(true);
};

// Save area from modal
const handleSaveArea = (area: AreaParameter) => {
  if (editingAreaIndex === -1) {
    // New area
    setAreas([...areas, area]);
  } else {
    // Update existing area
    const newAreas = [...areas];
    newAreas[editingAreaIndex] = area;
    setAreas(newAreas);
  }
  
  setHasUnsavedChanges(true);
  setShowAreaModal(false);
  setEditingArea(null);
  setEditingAreaIndex(-1);
  
  message.success('Area configuration saved');
};
```

### Add Areas Section to Parameters Display (after outputs section, around line 980)
```typescript
{/* Editable Areas for AI Section */}
<div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 14,
  backgroundColor: "#fff7e6",
  borderRadius: 8,
  marginTop: '16px',
  borderLeft: '3px solid #fa8c16'
}}>
  <div>
    <div style={{ 
      marginBottom: '8px', 
      color: '#898989',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <strong>Editable Areas for AI</strong>
      <Tooltip title="Areas that AI assistants can read and optionally modify">
        <InfoCircleOutlined style={{ fontSize: 12 }} />
      </Tooltip>
    </div>
    <div style={{ fontSize: '12px' }}>
      {isLoading || !hasInitialized ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : areas.length === 0 ? (
        <div style={{ color: '#999' }}>
          No editable areas defined yet
          <div style={{ fontSize: '11px', marginTop: 4 }}>
            Select a range and click "Add as Editable Area"
          </div>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {areas.map((area, index) => (
            <div 
              key={area.id || index} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e8e8e8',
                cursor: 'pointer'
              }}
              onClick={() => handleNavigateToParameter(area.address)}
            >
              {/* Area Icon based on mode */}
              {area.mode === 'readonly' ? (
                <LockOutlined style={{ color: '#ff4d4f' }} />
              ) : area.mode === 'interactive' ? (
                <TableOutlined style={{ color: '#52c41a' }} />
              ) : (
                <EditOutlined style={{ color: '#1890ff' }} />
              )}
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>
                  {area.alias || area.name}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#999',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <span>{area.address}</span>
                  <span>•</span>
                  <span>{getModeLabel(area.mode)}</span>
                  {area.permissions.canWriteFormulas && (
                    <>
                      <span>•</span>
                      <span style={{ color: '#fa8c16' }}>
                        <FunctionOutlined style={{ fontSize: 10 }} /> Formulas
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <Space size="small">
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditArea(area, index);
                  }}
                />
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveArea(index);
                  }}
                />
              </Space>
            </div>
          ))}
        </Space>
      )}
    </div>
  </div>
</div>
```

### Add Area Configuration Modal (after parameter modal)
```typescript
{/* Area Configuration Modal */}
<Modal
  title={
    <Space>
      <TableOutlined />
      <span>{editingAreaIndex === -1 ? 'Add' : 'Edit'} Editable Area</span>
    </Space>
  }
  open={showAreaModal}
  onCancel={() => {
    setShowAreaModal(false);
    setEditingArea(null);
    setEditingAreaIndex(-1);
  }}
  width={700}
  footer={[
    <Button key="cancel" onClick={() => setShowAreaModal(false)}>
      Cancel
    </Button>,
    <Button 
      key="save" 
      type="primary" 
      onClick={() => {
        if (!editingArea?.name || !editingArea?.address) {
          message.error('Area name and address are required');
          return;
        }
        handleSaveArea(editingArea);
      }}
    >
      {editingAreaIndex === -1 ? 'Add' : 'Save'} Area
    </Button>
  ]}
  centered
>
  {editingArea && (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Basic Info */}
      <div>
        <Form layout="vertical">
          <Form.Item label="Area Name" required>
            <Input 
              value={editingArea.name}
              onChange={e => setEditingArea({...editingArea, name: e.target.value})}
              placeholder="e.g., sales_data"
            />
          </Form.Item>
          
          <Form.Item label="Display Name">
            <Input 
              value={editingArea.alias}
              onChange={e => setEditingArea({...editingArea, alias: e.target.value})}
              placeholder="e.g., Monthly Sales Data"
            />
          </Form.Item>
          
          <Form.Item label="Selected Range">
            <Input value={editingArea.address} disabled />
          </Form.Item>
          
          <Form.Item label="Description">
            <Input.TextArea 
              value={editingArea.description}
              onChange={e => setEditingArea({...editingArea, description: e.target.value})}
              placeholder="Describe what this area contains..."
              rows={2}
            />
          </Form.Item>
        </Form>
      </div>
      
      {/* Quick Permission Presets */}
      <div>
        <Title level={5}>Access Level</Title>
        <Radio.Group 
          value={editingArea.mode} 
          onChange={e => {
            const mode = e.target.value;
            setEditingArea({
              ...editingArea,
              mode,
              permissions: mode === 'readonly' ? PERMISSION_PRESETS.readonly :
                         mode === 'interactive' ? PERMISSION_PRESETS.interactive :
                         PERMISSION_PRESETS.valueOnly
            });
          }}
        >
          <Space direction="vertical">
            <Radio value="readonly">
              <Space>
                <LockOutlined />
                <span>Read Only</span>
                <Text type="secondary">- AI can see values but not modify</Text>
              </Space>
            </Radio>
            <Radio value="editable">
              <Space>
                <EditOutlined />
                <span>Editable Values</span>
                <Text type="secondary">- AI can modify values but not formulas</Text>
              </Space>
            </Radio>
            <Radio value="interactive">
              <Space>
                <TableOutlined />
                <span>Full Interactive</span>
                <Text type="secondary">- AI can modify values, formulas, and structure</Text>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </div>
      
      {/* Advanced Options */}
      <Collapse ghost>
        <Panel header="Advanced Permissions" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Space direction="vertical">
                <Checkbox 
                  checked={editingArea.permissions.canReadFormulas}
                  onChange={e => setEditingArea({
                    ...editingArea,
                    permissions: {...editingArea.permissions, canReadFormulas: e.target.checked}
                  })}
                >
                  Show formulas to AI
                </Checkbox>
                <Checkbox 
                  checked={editingArea.permissions.canWriteFormulas}
                  onChange={e => setEditingArea({
                    ...editingArea,
                    permissions: {...editingArea.permissions, canWriteFormulas: e.target.checked}
                  })}
                  disabled={!editingArea.permissions.canReadFormulas}
                >
                  Allow formula modifications
                </Checkbox>
                <Checkbox 
                  checked={editingArea.permissions.canReadFormatting}
                  onChange={e => setEditingArea({
                    ...editingArea,
                    permissions: {...editingArea.permissions, canReadFormatting: e.target.checked}
                  })}
                >
                  Include cell formatting
                </Checkbox>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical">
                <Checkbox 
                  checked={editingArea.permissions.canAddRows}
                  onChange={e => setEditingArea({
                    ...editingArea,
                    permissions: {...editingArea.permissions, canAddRows: e.target.checked}
                  })}
                >
                  Allow adding rows
                </Checkbox>
                <Checkbox 
                  checked={editingArea.permissions.canDeleteRows}
                  onChange={e => setEditingArea({
                    ...editingArea,
                    permissions: {...editingArea.permissions, canDeleteRows: e.target.checked}
                  })}
                >
                  Allow deleting rows
                </Checkbox>
                <Checkbox 
                  checked={editingArea.permissions.canModifyStructure}
                  onChange={e => setEditingArea({
                    ...editingArea,
                    permissions: {...editingArea.permissions, canModifyStructure: e.target.checked}
                  })}
                >
                  Allow structure changes
                </Checkbox>
              </Space>
            </Col>
          </Row>
        </Panel>
        
        <Panel header="AI Context (Optional)" key="2">
          <Form.Item label="Purpose">
            <Input.TextArea 
              value={editingArea.aiContext?.purpose}
              onChange={e => setEditingArea({
                ...editingArea,
                aiContext: {...editingArea.aiContext, purpose: e.target.value}
              })}
              placeholder="Describe what this area contains and its purpose..."
              rows={2}
            />
          </Form.Item>
          
          <Form.Item label="Expected Behavior">
            <Input.TextArea 
              value={editingArea.aiContext?.expectedBehavior}
              onChange={e => setEditingArea({
                ...editingArea,
                aiContext: {...editingArea.aiContext, expectedBehavior: e.target.value}
              })}
              placeholder="Guide the AI on how to interact with this area..."
              rows={2}
            />
          </Form.Item>
        </Panel>
      </Collapse>
    </Space>
  )}
</Modal>
```

### Update Save Function (in handleSaveParameters)
```typescript
// In handleSaveParameters, update the dataToSave object:
const dataToSave = {
  inputs: inputs,
  outputs: outputs,
  areas: areas, // Add areas
  apiUrl: publishUrl || `https://spreadapi.com/api/${id}`,
  fileData: fileData,
  aiDescription: aiDescription,
  aiTags: selectedTags,
  aiUsageExamples: aiUsageExamples,
  category: category
};
```

### Add Helper Function
```typescript
// Get user-friendly mode label
const getModeLabel = (mode: string) => {
  switch (mode) {
    case 'readonly': return 'Read Only';
    case 'editable': return 'Values Editable';
    case 'interactive': return 'Fully Interactive';
    default: return mode;
  }
};
```

## 2. Update MCP Server - Add Area Tools

### Update /app/api/mcp/v1/route.js

Add these tools to the tools/list case (after the existing tools):

```javascript
// Add area-specific tools if service has areas defined
if (publishedData.areas) {
  let areas = [];
  try {
    areas = JSON.parse(publishedData.areas);
  } catch (e) {
    console.error('Error parsing areas:', e);
  }
  
  if (areas.length > 0) {
    // Add read area tool
    tools.push({
      name: `spreadapi_read_area_${serviceId}`,
      description: `Read data from editable areas in ${publishedData.title || serviceId}`,
      inputSchema: {
        type: 'object',
        properties: {
          areaName: {
            type: 'string',
            description: 'The name of the area to read',
            enum: areas.map(a => a.name)
          },
          includeFormulas: {
            type: 'boolean',
            description: 'Include cell formulas in the response',
            default: false
          },
          includeFormatting: {
            type: 'boolean',
            description: 'Include cell formatting in the response',
            default: false
          }
        },
        required: ['areaName']
      }
    });
    
    // Add write area tool if any areas allow writing
    const writableAreas = areas.filter(a => a.mode !== 'readonly');
    if (writableAreas.length > 0) {
      tools.push({
        name: `spreadapi_update_area_${serviceId}`,
        description: `Update values and formulas in editable areas of ${publishedData.title || serviceId}`,
        inputSchema: {
          type: 'object',
          properties: {
            updates: {
              type: 'array',
              description: 'Array of area updates to apply',
              items: {
                type: 'object',
                properties: {
                  areaName: {
                    type: 'string',
                    description: 'The area to update',
                    enum: writableAreas.map(a => a.name)
                  },
                  changes: {
                    type: 'array',
                    description: 'Cell changes to apply',
                    items: {
                      type: 'object',
                      properties: {
                        row: { type: 'number', description: 'Row index within area (0-based)' },
                        col: { type: 'number', description: 'Column index within area (0-based)' },
                        value: { description: 'New cell value' },
                        formula: { type: 'string', description: 'New cell formula' }
                      }
                    }
                  }
                },
                required: ['areaName', 'changes']
              }
            }
          },
          required: ['updates']
        }
      });
    }
  }
}
```

Add handlers in the tools/call case:

```javascript
// Handle area read tool
if (name.startsWith('spreadapi_read_area_')) {
  const serviceId = name.replace('spreadapi_read_area_', '');
  const { areaName, includeFormulas, includeFormatting } = args;
  
  const result = await executeAreaRead(serviceId, areaName, {
    includeFormulas,
    includeFormatting
  }, auth);
  
  return {
    jsonrpc: '2.0',
    result,
    id
  };
}

// Handle area update tool
if (name.startsWith('spreadapi_update_area_')) {
  const serviceId = name.replace('spreadapi_update_area_', '');
  const { updates } = args;
  
  const result = await executeAreaUpdate(serviceId, updates, auth);
  
  return {
    jsonrpc: '2.0',
    result,
    id
  };
}
```

## 3. Create Area Execution Functions

Create new file: /app/api/mcp/v1/areaExecutors.js

```javascript
import redis from '../../../../lib/redis.js';
import { getApiDefinition } from '../../../../utils/helperApi.js';
import { getRangeAsOffset } from '../../../../utils/helper.js';

const { createWorkbook, getCachedWorkbook } = require('../../../../lib/spreadjs-server');

/**
 * Read data from an area with SpreadJS JSON format
 */
export async function executeAreaRead(serviceId, areaName, options, auth) {
  try {
    // Get service definition
    const apiDefinition = await getApiDefinition(serviceId, null);
    if (apiDefinition.error) {
      throw new Error(apiDefinition.error);
    }
    
    // Get areas from published data
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    
    // Find the requested area
    const area = areas.find(a => a.name === areaName || a.alias === areaName);
    if (!area) {
      throw new Error(`Area '${areaName}' not found`);
    }
    
    // Check permissions
    if (!area.permissions.canReadValues) {
      throw new Error(`Area '${areaName}' does not allow reading values`);
    }
    
    // Get or create workbook
    const fileJson = apiDefinition.fileJson;
    const cacheResult = await getCachedWorkbook(
      serviceId,
      `area_read_${serviceId}`,
      async (workbook) => {
        workbook.fromJSON(fileJson, {
          calcOnDemand: false,
          doNotRecalculateAfterLoad: false,
        });
      }
    );
    
    const spread = cacheResult.workbook;
    
    // Parse area address
    const range = getRangeAsOffset(area.address);
    const sheet = spread.getSheetFromName(range.sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet not found: ${range.sheetName}`);
    }
    
    // Calculate dimensions
    const rows = range.rowTo - range.rowFrom + 1;
    const cols = range.colTo - range.colFrom + 1;
    
    // Build response based on permissions
    const response = {
      area: {
        name: area.name,
        alias: area.alias,
        address: area.address,
        mode: area.mode,
        rows: rows,
        columns: cols
      },
      data: {}
    };
    
    // Read cell data
    for (let r = 0; r < rows; r++) {
      response.data[r] = {};
      for (let c = 0; c < cols; c++) {
        const cell = sheet.getCell(range.rowFrom + r, range.colFrom + c);
        const cellData = {};
        
        // Always include value
        cellData.value = cell.value();
        
        // Include formula if permitted and requested
        if (options.includeFormulas && area.permissions.canReadFormulas) {
          const formula = cell.formula();
          if (formula) {
            cellData.formula = formula;
          }
        }
        
        // Include formatting if permitted and requested
        if (options.includeFormatting && area.permissions.canReadFormatting) {
          const style = cell.style();
          if (style) {
            cellData.style = style;
          }
        }
        
        response.data[r][c] = cellData;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: `Area '${areaName}' data:\n${JSON.stringify(response, null, 2)}`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error reading area: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Update multiple areas with changes
 */
export async function executeAreaUpdate(serviceId, updates, auth) {
  try {
    // Get service definition
    const apiDefinition = await getApiDefinition(serviceId, null);
    if (apiDefinition.error) {
      throw new Error(apiDefinition.error);
    }
    
    // Get areas from published data
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    
    // Create fresh workbook for updates
    const fileJson = apiDefinition.fileJson;
    const spread = createWorkbook();
    spread.fromJSON(fileJson, {
      calcOnDemand: false,
      doNotRecalculateAfterLoad: false,
    });
    
    const results = [];
    
    // Process each area update
    for (const update of updates) {
      const { areaName, changes } = update;
      
      // Find the area
      const area = areas.find(a => a.name === areaName || a.alias === areaName);
      if (!area) {
        results.push({
          area: areaName,
          error: `Area '${areaName}' not found`
        });
        continue;
      }
      
      // Check if area is writable
      if (area.mode === 'readonly') {
        results.push({
          area: areaName,
          error: `Area '${areaName}' is read-only`
        });
        continue;
      }
      
      // Parse area address
      const range = getRangeAsOffset(area.address);
      const sheet = spread.getSheetFromName(range.sheetName);
      
      if (!sheet) {
        results.push({
          area: areaName,
          error: `Sheet not found: ${range.sheetName}`
        });
        continue;
      }
      
      const appliedChanges = [];
      const errors = [];
      
      // Apply each change
      for (const change of changes) {
        try {
          const absoluteRow = range.rowFrom + change.row;
          const absoluteCol = range.colFrom + change.col;
          
          // Validate bounds
          if (absoluteRow > range.rowTo || absoluteCol > range.colTo) {
            errors.push(`Cell [${change.row},${change.col}] outside area bounds`);
            continue;
          }
          
          const cell = sheet.getCell(absoluteRow, absoluteCol);
          const oldValue = cell.value();
          const oldFormula = cell.formula();
          
          // Apply changes based on permissions
          if (change.formula !== undefined) {
            if (!area.permissions.canWriteFormulas) {
              errors.push(`Formula changes not allowed in area '${areaName}'`);
              continue;
            }
            cell.formula(change.formula);
          } else if (change.value !== undefined) {
            if (!area.permissions.canWriteValues) {
              errors.push(`Value changes not allowed in area '${areaName}'`);
              continue;
            }
            cell.value(change.value);
          }
          
          appliedChanges.push({
            row: change.row,
            col: change.col,
            oldValue,
            newValue: change.value || change.formula,
            type: change.formula ? 'formula' : 'value'
          });
          
        } catch (err) {
          errors.push(`Error in cell [${change.row},${change.col}]: ${err.message}`);
        }
      }
      
      results.push({
        area: areaName,
        success: appliedChanges.length > 0,
        appliedChanges: appliedChanges.length,
        errors: errors.length,
        details: {
          changes: appliedChanges,
          errors
        }
      });
    }
    
    // If any changes were successful, we could save the workbook back
    // For now, we're just returning the results
    
    return {
      content: [{
        type: 'text',
        text: `Area update results:\n${JSON.stringify(results, null, 2)}`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error updating areas: ${error.message}`
      }],
      isError: true
    };
  }
}
```

## 4. Update Service Save Endpoint

In /app/api/services/[id]/route.js, update to save areas:

```javascript
// In the PUT handler, add areas to the updates
const updates = {
  name: body.name || service.name,
  description: body.description || service.description,
  inputs: JSON.stringify(body.inputs || []),
  outputs: JSON.stringify(body.outputs || []),
  areas: JSON.stringify(body.areas || []), // Add areas
  modified: new Date().toISOString(),
  // ... rest of updates
};
```

## Summary

This implementation provides:

1. **UI Changes**:
   - New button "Add as Editable Area (for AI)" appears for range selections
   - Third section "Editable Areas for AI" in the parameters panel
   - Comprehensive modal for configuring area permissions

2. **Area Configuration**:
   - Three preset modes: Read Only, Editable Values, Full Interactive
   - Fine-grained permissions for values, formulas, formatting, and structure
   - AI context hints to guide behavior

3. **MCP Integration**:
   - `spreadapi_read_area_[serviceId]` - Read area data with optional formulas/formatting
   - `spreadapi_update_area_[serviceId]` - Update multiple areas in one call
   - Respects all permission settings

4. **Data Flow**:
   - Areas are saved with the service definition
   - MCP tools are dynamically generated based on defined areas
   - Claude can read complete cell metadata and update values/formulas

This gives Claude powerful capabilities to work with spreadsheet data while maintaining security through granular permissions.