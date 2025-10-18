# Editable Area UI Implementation

## UI Flow for Adding Editable Areas

### 1. Update Selection UI with Two Buttons

When a user selects a range in the spreadsheet, show two buttons:

```typescript
// In EditorPanel.tsx, modify the selection UI section

{/* Selection Actions */}
{currentSelection && (
  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
    {/* Existing Output Button */}
    <Button
      type="primary"
      icon={<ExportOutlined />}
      style={{ width: '100%', height: 40 }}
      onClick={() => handleAddAsOutput()}
      disabled={buttonInfo.disabled || !spreadInstance || !spreadsheetReady}
    >
      {buttonInfo.text}
    </Button>
    
    {/* New Editable Area Button - Only show for ranges */}
    {isRange && (
      <Button
        type="default"
        icon={<EditOutlined />}
        style={{ width: '100%', height: 40 }}
        onClick={() => handleAddAsEditableArea()}
        disabled={!spreadInstance || !spreadsheetReady}
      >
        Add {cellRef}:{endCellRef} as Editable Area
      </Button>
    )}
  </div>
)}
```

### 2. Add Handler Function

```typescript
const handleAddAsEditableArea = () => {
  if (!currentSelection || !spreadInstance) return;
  
  const { row, col, rowCount = 1, colCount = 1 } = currentSelection;
  const sheet = spreadInstance.getActiveSheet();
  const sheetName = sheet.name();
  
  // Build the address
  const startCell = getCellAddress(row, col);
  const endCell = getCellAddress(row + rowCount - 1, col + colCount - 1);
  const address = `${sheetName}!${startCell}:${endCell}`;
  
  // Analyze the selected area
  const areaInfo = analyzeSelectedArea(sheet, row, col, rowCount, colCount);
  
  // Show the area configuration modal
  setAreaToEdit({
    name: suggestAreaName(startCell, endCell),
    alias: '',
    address: address,
    mode: 'editable',
    permissions: PERMISSION_PRESETS.valueOnly, // Default to value editing
    metadata: areaInfo
  });
  setShowAreaModal(true);
};
```

### 3. Area Analysis Function

```typescript
function analyzeSelectedArea(sheet, startRow, startCol, rowCount, colCount) {
  const analysis = {
    hasFormulas: false,
    hasHeaders: false,
    columnTypes: [],
    sampleData: [],
    suggestedColumns: []
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
      name: analysis.hasHeaders ? firstRowValues[c] : `Column ${c + 1}`,
      hasFormulas: false,
      dataType: 'mixed',
      sampleValues: []
    };
    
    // Check cells in column
    for (let r = analysis.hasHeaders ? 1 : 0; r < Math.min(10, rowCount); r++) {
      const cell = sheet.getCell(startRow + r, startCol + c);
      const formula = cell.formula();
      const value = cell.value();
      
      if (formula) {
        columnAnalysis.hasFormulas = true;
        analysis.hasFormulas = true;
      }
      
      if (value !== null && value !== undefined) {
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
}
```

### 4. Area Configuration Modal

```typescript
// New modal component
const AreaConfigurationModal = ({ 
  visible, 
  onClose, 
  initialArea, 
  onSave,
  metadata 
}) => {
  const [area, setArea] = useState(initialArea);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <Modal
      title={
        <Space>
          <TableOutlined />
          <span>Configure Editable Area</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={() => onSave(area)}
        >
          Add Area
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Basic Info */}
        <div>
          <Form layout="vertical">
            <Form.Item label="Area Name" required>
              <Input 
                value={area.name}
                onChange={e => setArea({...area, name: e.target.value})}
                placeholder="e.g., sales_data"
              />
            </Form.Item>
            
            <Form.Item label="Display Name">
              <Input 
                value={area.alias}
                onChange={e => setArea({...area, alias: e.target.value})}
                placeholder="e.g., Monthly Sales Data"
              />
            </Form.Item>
            
            <Form.Item label="Selected Range">
              <Input value={area.address} disabled />
            </Form.Item>
          </Form>
        </div>
        
        {/* Quick Permission Presets */}
        <div>
          <Title level={5}>Access Level</Title>
          <Radio.Group 
            value={area.mode} 
            onChange={e => {
              const mode = e.target.value;
              setArea({
                ...area,
                mode,
                permissions: mode === 'readonly' ? PERMISSION_PRESETS.readonly :
                           mode === 'interactive' ? PERMISSION_PRESETS.fullAccess :
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
        
        {/* Detected Information */}
        {metadata && (
          <Alert
            message="Area Analysis"
            description={
              <Space direction="vertical">
                {metadata.hasHeaders && (
                  <div>✓ Headers detected: {metadata.suggestedColumns.map(c => c.name).join(', ')}</div>
                )}
                {metadata.hasFormulas && (
                  <div>⚡ Contains formulas - consider if AI should modify these</div>
                )}
                <div>📊 {metadata.suggestedColumns.length} columns detected</div>
              </Space>
            }
            type="info"
          />
        )}
        
        {/* Advanced Options */}
        <Collapse ghost>
          <Panel header="Advanced Permissions" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical">
                  <Checkbox 
                    checked={area.permissions.canReadFormulas}
                    onChange={e => setArea({
                      ...area,
                      permissions: {...area.permissions, canReadFormulas: e.target.checked}
                    })}
                  >
                    Show formulas to AI
                  </Checkbox>
                  <Checkbox 
                    checked={area.permissions.canWriteFormulas}
                    onChange={e => setArea({
                      ...area,
                      permissions: {...area.permissions, canWriteFormulas: e.target.checked}
                    })}
                    disabled={!area.permissions.canReadFormulas}
                  >
                    Allow formula modifications
                  </Checkbox>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical">
                  <Checkbox 
                    checked={area.permissions.canAddRows}
                    onChange={e => setArea({
                      ...area,
                      permissions: {...area.permissions, canAddRows: e.target.checked}
                    })}
                  >
                    Allow adding rows
                  </Checkbox>
                  <Checkbox 
                    checked={area.permissions.canDeleteRows}
                    onChange={e => setArea({
                      ...area,
                      permissions: {...area.permissions, canDeleteRows: e.target.checked}
                    })}
                  >
                    Allow deleting rows
                  </Checkbox>
                </Space>
              </Col>
            </Row>
          </Panel>
          
          <Panel header="AI Context (Optional)" key="2">
            <Form.Item label="Purpose">
              <TextArea 
                value={area.aiContext?.purpose}
                onChange={e => setArea({
                  ...area,
                  aiContext: {...area.aiContext, purpose: e.target.value}
                })}
                placeholder="Describe what this area contains and its purpose..."
                rows={2}
              />
            </Form.Item>
          </Panel>
        </Collapse>
      </Space>
    </Modal>
  );
};
```

### 5. Visual Indicators in Spreadsheet

Add visual highlighting for defined areas:

```typescript
// Add area highlighting when spreadsheet loads
useEffect(() => {
  if (!spreadInstance || !areas?.length) return;
  
  const sheet = spreadInstance.getActiveSheet();
  
  areas.forEach(area => {
    const range = getRangeFromAddress(area.address);
    if (!range) return;
    
    // Add border to show area bounds
    const borderStyle = {
      color: area.mode === 'readonly' ? '#ff4d4f' : 
             area.mode === 'interactive' ? '#52c41a' : '#1890ff',
      lineStyle: 2, // dashed
    };
    
    sheet.getRange(range.row, range.col, range.rowCount, range.colCount)
      .setBorder(borderStyle, { all: true });
    
    // Add comment to first cell
    sheet.getCell(range.row, range.col).comment({
      text: `AI Area: ${area.alias || area.name}\nMode: ${area.mode}`,
      displayMode: 1 // always show
    });
  });
}, [spreadInstance, areas]);
```

## Benefits of This Approach

1. **Intuitive**: Users see both options when selecting a range
2. **Context-Aware**: Only shows "Editable Area" for ranges, not single cells
3. **Smart Defaults**: Analyzes selection to suggest appropriate settings
4. **Progressive Disclosure**: Simple presets with advanced options available
5. **Visual Feedback**: Areas are highlighted in the spreadsheet

This design makes it easy for users to define areas for AI interaction while maintaining the existing output parameter workflow.