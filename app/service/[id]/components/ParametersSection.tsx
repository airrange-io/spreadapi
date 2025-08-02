'use client';

import React from 'react';
import { Space, Tag, Button, Skeleton, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined, TableOutlined, LockOutlined, FunctionOutlined, EyeOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';

export interface InputDefinition {
  id: string;
  address: string;
  name: string;
  alias: string;
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
  percentageDecimals?: number;
}

export interface OutputDefinition {
  id: string;
  address: string;
  name: string;
  alias: string;
  title?: string;
  row: number;
  col: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'output';
  description?: string;
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
}) => {
  // Check if we can interact with parameters (requires workbook to be loaded)
  const canInteract = !!onNavigateToParameter;
  
  // Determine if cards should use compact layout
  const useCompactLayout = panelWidth && panelWidth < 380;
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
        <CollapsibleSection title={`Input Parameters ${panelWidth ? `(${panelWidth}px)` : ''}`} defaultOpen={true}>
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : inputs.length === 0 ? (
          <div style={{ color: '#999' }}>Select a spreadsheet cell and click "Add as Input Parameter"</div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {inputs.map((input) => (
              <div key={input.id} style={{
                padding: '8px 12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e8e8e8'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => onNavigateToParameter(input)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <Space direction="vertical" size={0}>
                      <Space direction='horizontal' style={{ flexWrap: 'wrap', fontSize: '14px' }}>
                        <strong>{input.name}</strong>
                      </Space>
                      <Space direction='horizontal' style={{ flexWrap: 'wrap' }}>
                        {useCompactLayout ? (
                          // In compact layout, show address instead of title
                          <div style={{ color: '#888', fontSize: '11px' }}>{input.address}</div>
                        ) : (
                          // In normal layout, show title if different from name
                          input.title && input.title !== input.name && (
                            <div style={{ color: '#888', fontSize: '11px' }}>{input.title}</div>
                          )
                        )}
                        {(input.min !== undefined || input.max !== undefined) && (
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                            {input.min !== undefined && `Min: ${input.min}`}
                            {input.min !== undefined && input.max !== undefined && ' • '}
                            {input.max !== undefined && `Max: ${input.max}`}
                          </div>
                        )}
                        {input.description && (
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            {input.description}
                          </div>
                        )}
                      </Space>
                    </Space>
                  </div>
                  <Space size="small">
                    {!useCompactLayout && (
                      <Tag color='purple' onClick={() => onNavigateToParameter(input)} style={{ cursor: 'pointer', padding: '4px 8px' }}>{input.address}</Tag>
                    )}
                    <Button
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => onEditParameter('input', input)}
                    />
                    {!isDemoMode && (
                      <Popconfirm
                        title="Delete this parameter?"
                        description="This action cannot be undone."
                        onConfirm={() => onDeleteParameter('input', input.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    )}
                  </Space>
                </div>
              </div>
            ))}
          </Space>
        )}
      </CollapsibleSection>

      {/* Output Parameters */}
      <CollapsibleSection title="Output Parameters" defaultOpen={true}>
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : outputs.length === 0 ? (
          <div style={{ color: '#999' }}>Select a spreadsheet cell or area and click "Add as Output Parameter"</div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {outputs.map((output) => (
              <div key={output.id} style={{
                padding: '8px 12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e8e8e8'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => onNavigateToParameter(output)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <Space direction="vertical" size={0}>
                      <Space direction='horizontal' style={{ flexWrap: 'wrap', fontSize: '14px' }}>
                        <strong>{output.name}</strong>
                      </Space>
                      <Space direction='horizontal' style={{ flexWrap: 'wrap' }}>
                        {useCompactLayout ? (
                          // In compact layout, show address instead of title
                          <div style={{ color: '#888', fontSize: '11px' }}>{output.address}</div>
                        ) : (
                          // In normal layout, show title if different from name
                          output.title && output.title !== output.name && (
                            <div style={{ color: '#888', fontSize: '11px' }}>{output.title}</div>
                          )
                        )}
                        {output.description && (
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            {output.description}
                          </div>
                        )}
                      </Space>
                    </Space>
                  </div>
                  <Space size="small">
                    {!useCompactLayout && (
                      <Tag onClick={() => onNavigateToParameter(output)} color='geekblue' style={{ cursor: 'pointer', padding: '4px 8px' }}>{output.address}</Tag>
                    )}
                    <Button
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => onEditParameter('output', output)}
                    />
                    {!isDemoMode && (
                      <Popconfirm
                        title="Delete this parameter?"
                        description="This action cannot be undone."
                        onConfirm={() => onDeleteParameter('output', output.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    )}
                  </Space>
                </div>
              </div>
            ))}
          </Space>
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
                      onEditArea(area, index);
                    }}
                  />
                  {!isDemoMode && (
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveArea(index);
                      }}
                    />
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