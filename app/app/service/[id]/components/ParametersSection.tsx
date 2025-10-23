'use client';

import React from 'react';
import { Space, Tag, Button, Skeleton, Tooltip, Dropdown, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined, TableOutlined, LockOutlined, FunctionOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableParameterItem } from './SortableParameterItem';

// Drag & Drop Configuration
const DRAG_ACTIVATION_DISTANCE_PX = 8; // Pixels of movement required before drag starts (prevents accidental drags)
export const COMPACT_LAYOUT_BREAKPOINT_PX = 380; // Panel width below which compact layout is used

export interface InputDefinition {
  id: string;
  address: string;
  name: string;
  title?: string;
  row: number;
  col: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'input';
  mandatory?: boolean;
  min?: number;
  max?: number;
  description?: string;
  format?: 'percentage';
  formatString?: string; // Display format string (e.g., "€#,##0.00", "#,##0.0 kg", "0.0%")
  aiExamples?: string[];
  allowedValues?: string[];
  allowedValuesRange?: string;
  allowedValuesCaseSensitive?: boolean;
  defaultValue?: any;
}

export interface OutputDefinition {
  id: string;
  address: string;
  name: string;
  title?: string;
  row: number;
  col: number;
  rowCount?: number; // For cell ranges
  colCount?: number; // For cell ranges
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'output';
  description?: string;
  aiPresentationHint?: string;
  formatString?: string; // Simple, editable format string (e.g., "€#,##0.00", "#,##0.0 kg", "0.00%")
}

export interface AreaPermissions {
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

export interface AreaParameter {
  id?: string;
  name: string;
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

interface ParametersSectionProps {
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  areas: AreaParameter[];
  isLoading: boolean;
  hasInitialized: boolean;
  isDemoMode?: boolean;
  panelWidth?: number;
  onNavigateToParameter: (param: InputDefinition | OutputDefinition) => void;
  onEditParameter: (type: 'input' | 'output', parameter: InputDefinition | OutputDefinition) => void;
  onDeleteParameter: (type: 'input' | 'output', id: string) => void;
  onEditArea: (area: AreaParameter, index: number) => void;
  onRemoveArea: (index: number) => void;
  onNavigateToArea: (area: AreaParameter) => void;
  onShowHowItWorks: () => void;
  onReorderInputs?: (newOrder: InputDefinition[]) => void;
  onReorderOutputs?: (newOrder: OutputDefinition[]) => void;
}

const ParametersSection: React.FC<ParametersSectionProps> = ({
  inputs,
  outputs,
  areas,
  isLoading,
  hasInitialized,
  isDemoMode,
  panelWidth,
  onNavigateToParameter,
  onEditParameter,
  onDeleteParameter,
  onEditArea,
  onRemoveArea,
  onNavigateToArea,
  onShowHowItWorks,
  onReorderInputs,
  onReorderOutputs,
}) => {
  // Check if we can interact with parameters (requires workbook to be loaded)
  const canInteract = !!onNavigateToParameter;

  // Determine if cards should use compact layout
  const useCompactLayout = panelWidth && panelWidth < COMPACT_LAYOUT_BREAKPOINT_PX;

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE_PX,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for inputs
  const handleInputDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = inputs.findIndex((item) => item.id === active.id);
      const newIndex = inputs.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(inputs, oldIndex, newIndex);
      onReorderInputs?.(newOrder);
    }
  };

  // Handle drag end for outputs
  const handleOutputDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = outputs.findIndex((item) => item.id === active.id);
      const newIndex = outputs.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(outputs, oldIndex, newIndex);
      onReorderOutputs?.(newOrder);
    }
  };
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'readonly': return 'Read Only';
      case 'editable': return 'Values Editable';
      case 'interactive': return 'Fully Interactive';
      default: return mode;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginTop: '8px',
    }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* Input Parameters */}
        <CollapsibleSection title="Input Parameters" defaultOpen={true}>
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : inputs.length === 0 ? (
          <div style={{ color: '#999' }}>Select a spreadsheet cell and click "Add as Input Parameter"</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleInputDragEnd}
          >
            <SortableContext
              items={inputs.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {inputs.map((input) => (
                  <SortableParameterItem
                    key={input.id}
                    parameter={input}
                    type="input"
                    isDemoMode={isDemoMode}
                    useCompactLayout={useCompactLayout}
                    onNavigate={() => onNavigateToParameter(input)}
                    onEdit={() => onEditParameter('input', input)}
                    onDelete={() => {
                      Modal.confirm({
                        title: 'Delete this parameter?',
                        content: 'This action cannot be undone.',
                        okText: 'Yes',
                        cancelText: 'No',
                        okButtonProps: { danger: true },
                        onOk: () => onDeleteParameter('input', input.id),
                      });
                    }}
                  />
                ))}
              </Space>
            </SortableContext>
          </DndContext>
        )}
      </CollapsibleSection>

      {/* Output Parameters */}
      <CollapsibleSection title="Output Parameters" defaultOpen={true}>
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : outputs.length === 0 ? (
          <div style={{ color: '#999' }}>Select a spreadsheet cell or area and click "Add as Output Parameter"</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleOutputDragEnd}
          >
            <SortableContext
              items={outputs.map(o => o.id)}
              strategy={verticalListSortingStrategy}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {outputs.map((output) => (
                  <SortableParameterItem
                    key={output.id}
                    parameter={output}
                    type="output"
                    isDemoMode={isDemoMode}
                    useCompactLayout={useCompactLayout}
                    onNavigate={() => onNavigateToParameter(output)}
                    onEdit={() => onEditParameter('output', output)}
                    onDelete={() => {
                      Modal.confirm({
                        title: 'Delete this parameter?',
                        content: 'This action cannot be undone.',
                        okText: 'Yes',
                        cancelText: 'No',
                        okButtonProps: { danger: true },
                        onOk: () => onDeleteParameter('output', output.id),
                      });
                    }}
                  />
                ))}
              </Space>
            </SortableContext>
          </DndContext>
        )}
      </CollapsibleSection>

      {/* Editable Areas for AI */}
      <CollapsibleSection 
        title="Editable Areas for AI" 
        defaultOpen={false}
        extra={
          <Tooltip title="Areas that AI assistants can read and optionally modify">
            <InfoCircleOutlined style={{ fontSize: 12 }} />
          </Tooltip>
        }
      >
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : areas.length === 0 ? (
          <div style={{ color: '#999' }}>
            Select a range and click "Add as Editable Area"
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
                onClick={() => onNavigateToArea(area)}
              >
                {area.mode === 'readonly' ? (
                  <LockOutlined style={{ color: '#ff4d4f' }} />
                ) : area.mode === 'interactive' ? (
                  <TableOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <EditOutlined style={{ color: '#1890ff' }} />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>
                    {area.name}
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
                      onEditArea(area, index);
                    }}
                  />
                  {!isDemoMode && (
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'delete',
                            label: 'Delete',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => {
                              Modal.confirm({
                                title: 'Delete this area?',
                                content: 'This action cannot be undone.',
                                okText: 'Yes',
                                cancelText: 'No',
                                okButtonProps: { danger: true },
                                onOk: () => onRemoveArea(index),
                              });
                            },
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        size="small"
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  )}
                </Space>
              </div>
            ))}
          </Space>
        )}
      </CollapsibleSection>
      </Space>

      <div style={{ marginLeft: '4px', marginTop: '8px', marginBottom: '20px', fontSize: '12px', color: '#666' }}>
        <Button
          type="link"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={onShowHowItWorks}
          style={{ padding: 0, fontSize: '12px', color: '#4F2D7F' }}
        >
          How it works
        </Button>
      </div>
    </div>
  );
};

export default ParametersSection;