# Adding "Editable Areas for AI" Section

## 1. Add State for Areas in EditorPanel.tsx

```typescript
// Add to existing state declarations
const [areas, setAreas] = useState<AreaParameter[]>([]);

// Add to the reset function
const resetAll = () => {
  setInputs([]);
  setOutputs([]);
  setAreas([]); // Reset areas too
  // ... rest of reset logic
};
```

## 2. Add the Third Section in the UI

Add this after the Output Parameters section:

```typescript
{/* Editable Areas for AI Section */}
<div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 14,
  backgroundColor: "#f8f8f8",
  borderRadius: 8,
  marginTop: '16px',
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
            <div key={area.id || index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px solid #e8e8e8'
            }}>
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
                      <span>Formulas</span>
                    </>
                  )}
                </div>
              </div>
              
              <Space size="small">
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditArea(area, index)}
                />
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveArea(index)}
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

## 3. Helper Functions

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

// Handle area removal
const handleRemoveArea = (index: number) => {
  const newAreas = [...areas];
  newAreas.splice(index, 1);
  setAreas(newAreas);
  setHasUnsavedChanges(true);
};

// Handle area editing
const handleEditArea = (area: AreaParameter, index: number) => {
  setEditingAreaIndex(index);
  setAreaToEdit(area);
  setShowAreaModal(true);
};
```

## 4. Update Save Function

```typescript
// In handleSaveParameters function, add areas to the payload
const dataToSave = {
  inputs: inputs,
  outputs: outputs,
  areas: areas, // NEW: Include areas
  apiUrl: publishUrl || `https://spreadapi.com/api/${id}`,
  fileData: fileData
};
```

## 5. Load Areas from Service

```typescript
// In loadServiceData function
useEffect(() => {
  const loadServiceData = async () => {
    try {
      const response = await fetch(`/api/services/${id}`);
      const data = await response.json();
      
      if (data.service) {
        // Load existing data
        setInputs(data.service.inputs || []);
        setOutputs(data.service.outputs || []);
        setAreas(data.service.areas || []); // NEW: Load areas
        
        // ... rest of loading logic
      }
    } catch (error) {
      console.error('Error loading service:', error);
    }
  };
  
  if (id) {
    loadServiceData();
  }
}, [id]);
```

## 6. Visual Distinction

To make the three sections visually distinct:

```typescript
// Define section styles
const sectionStyles = {
  inputs: {
    backgroundColor: "#f0f5ff", // Light blue
    borderLeft: "3px solid #1890ff"
  },
  outputs: {
    backgroundColor: "#f6ffed", // Light green
    borderLeft: "3px solid #52c41a"
  },
  areas: {
    backgroundColor: "#fff7e6", // Light orange
    borderLeft: "3px solid #fa8c16"
  }
};

// Apply to each section div
<div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 14,
  borderRadius: 8,
  marginTop: index > 0 ? '16px' : 0,
  ...sectionStyles.areas // or .inputs or .outputs
}}>
```

## 7. Summary Badge

Add a summary at the top of the parameters panel:

```typescript
{/* Parameter Summary */}
<div style={{ 
  marginBottom: 16, 
  padding: '8px 12px',
  backgroundColor: '#fafafa',
  borderRadius: 4,
  fontSize: 12
}}>
  <Space split={<span style={{ color: '#d9d9d9' }}>•</span>}>
    <span>{inputs.length} Inputs</span>
    <span>{outputs.length} Outputs</span>
    <span>{areas.length} AI Areas</span>
  </Space>
</div>
```

## Complete Integration Flow

1. User selects a range in spreadsheet
2. Sees two buttons: "Add as Output" and "Add as Editable Area"
3. Clicks "Add as Editable Area"
4. Configures permissions in modal
5. Area appears in third section with appropriate icon
6. Can edit or remove areas
7. Areas are saved with the service
8. MCP server exposes area tools to Claude

This creates a clean, intuitive interface for managing all three types of parameters in your spreadsheet service.