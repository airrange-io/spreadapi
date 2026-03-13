'use client';

import React, { useState } from 'react';
import { Space, Button, Skeleton, Tooltip, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined, TableOutlined, LockOutlined, FunctionOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';
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
const DRAG_ACTIVATION_DISTANCE_PX = 8;
export const COMPACT_LAYOUT_BREAKPOINT_PX = 380;

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
  formatString?: string;
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
  rowCount?: number;
  colCount?: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'output';
  description?: string;
  aiPresentationHint?: string;
  formatString?: string;
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
  activeTab?: string;
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

// Section header with count badge
const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 8px 8px',
  }}>
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1.5,
      color: '#aaa',
      textTransform: 'uppercase',
    }}>
      {title}
    </span>
    {count > 0 && (
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: '#CFC8F9',
        background: '#F0EEFF',
        borderRadius: 6,
        padding: '2px 8px',
        minWidth: 22,
        textAlign: 'center',
      }}>
        {count}
      </span>
    )}
  </div>
);

const ParametersSection: React.FC<ParametersSectionProps> = ({
  inputs,
  outputs,
  areas,
  isLoading,
  hasInitialized,
  isDemoMode,
  panelWidth,
  activeTab = 'parameters',
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
  const { t } = useTranslation();

  const useCompactLayout = panelWidth && panelWidth < COMPACT_LAYOUT_BREAKPOINT_PX;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = inputs.findIndex((item) => item.id === active.id);
      const newIndex = inputs.findIndex((item) => item.id === over.id);
      onReorderInputs?.(arrayMove(inputs, oldIndex, newIndex));
    }
  };

  const handleOutputDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = outputs.findIndex((item) => item.id === active.id);
      const newIndex = outputs.findIndex((item) => item.id === over.id);
      onReorderOutputs?.(arrayMove(outputs, oldIndex, newIndex));
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'readonly': return t('params.modeReadonly');
      case 'editable': return t('params.modeEditable');
      case 'interactive': return t('params.modeInteractive');
      default: return mode;
    }
  };

  if (activeTab === 'areas') {
    // KI-Bereiche tab
    return (
      <div style={{ padding: '8px 4px' }}>
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : (
          <>
            {/* Info box with dashed border */}
            {areas.length === 0 && (
              <div style={{
                margin: '8px 0 16px',
                padding: '14px 16px',
                border: '1.5px dashed #d9d9d9',
                borderRadius: 10,
                background: '#fafafa',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>
                  {t('params.aiAreasInfoTitle')}
                </div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                  {t('params.aiAreasInfoDesc')}
                </div>
              </div>
            )}

            {/* Area cards */}
            {areas.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {areas.map((area, index) => {
                  const [areaHovered, setAreaHovered] = useState(false);
                  return (
                    <div
                      key={area.id || index}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: areaHovered ? '#faf8ff' : '#f8f7fa',
                        border: '1px solid #eee',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => onNavigateToArea(area)}
                      onMouseEnter={() => setAreaHovered(true)}
                      onMouseLeave={() => setAreaHovered(false)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Lightning icon */}
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: '#fff8e6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <ThunderboltOutlined style={{ color: '#faad14', fontSize: 16 }} />
                        </div>

                        {/* Name and address */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{area.name}</div>
                          <div style={{ fontSize: 12, color: '#aaa' }}>{area.address}</div>
                        </div>

                        {/* Delete button */}
                        {!isDemoMode && (
                          <Button
                            size="small"
                            type="text"
                            icon={<DeleteOutlined style={{ color: areaHovered ? '#888' : '#ccc' }} />}
                            style={{ opacity: areaHovered ? 1 : 0, transition: 'opacity 0.15s' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: t('params.deleteArea'),
                                content: t('params.cannotUndo'),
                                okText: t('common.yes'),
                                cancelText: t('common.no'),
                                okButtonProps: { danger: true },
                                onOk: () => onRemoveArea(index),
                              });
                            }}
                          />
                        )}
                      </div>

                      {/* Description */}
                      {area.description && (
                        <div style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: '#888',
                          lineHeight: 1.5,
                          paddingLeft: 42,
                        }}>
                          {area.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Parameters tab (default)
  return (
    <div style={{ padding: '0 4px' }}>
      {/* Input Parameters */}
      <SectionHeader title={t('params.inputParameters')} count={inputs.length} />
      {isLoading || !hasInitialized ? (
        <Skeleton active paragraph={{ rows: 2 }} style={{ padding: '0 8px' }} />
      ) : inputs.length === 0 ? (
        <div style={{ color: '#aaa', padding: '8px 8px 16px', fontSize: 13 }}>
          {t('params.emptyInputHint')}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInputDragEnd}>
          <SortableContext items={inputs.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {inputs.map((input) => (
                <SortableParameterItem
                  key={input.id}
                  parameter={input}
                  type="input"
                  isDemoMode={isDemoMode}
                  useCompactLayout={useCompactLayout}
                  onNavigate={() => onNavigateToParameter(input)}
                  onEdit={() => onEditParameter('input', input)}
                  onDelete={() => onDeleteParameter('input', input.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Output Parameters */}
      <SectionHeader title={t('params.outputParameters')} count={outputs.length} />
      {isLoading || !hasInitialized ? (
        <Skeleton active paragraph={{ rows: 2 }} style={{ padding: '0 8px' }} />
      ) : outputs.length === 0 ? (
        <div style={{ color: '#aaa', padding: '8px 8px 16px', fontSize: 13 }}>
          {t('params.emptyOutputHint')}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOutputDragEnd}>
          <SortableContext items={outputs.map(o => o.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {outputs.map((output) => (
                <SortableParameterItem
                  key={output.id}
                  parameter={output}
                  type="output"
                  isDemoMode={isDemoMode}
                  useCompactLayout={useCompactLayout}
                  onNavigate={() => onNavigateToParameter(output)}
                  onEdit={() => onEditParameter('output', output)}
                  onDelete={() => onDeleteParameter('output', output.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div style={{ padding: '8px 8px 16px' }}>
        <Button
          type="link"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={onShowHowItWorks}
          style={{ padding: 0, fontSize: 12, color: '#9233E9' }}
        >
          {t('params.howItWorks')}
        </Button>
      </div>
    </div>
  );
};

export default ParametersSection;
