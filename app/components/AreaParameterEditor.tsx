'use client';

import React, { useState } from 'react';
import { 
  Card, Form, Input, Select, Switch, Space, Button, 
  Collapse, Tag, Tooltip, Row, Col, Divider, Alert 
} from 'antd';
import { 
  LockOutlined, UnlockOutlined, EditOutlined, 
  EyeOutlined, EyeInvisibleOutlined, FunctionOutlined,
  FormatPainterOutlined, TableOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

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

interface Props {
  area: AreaParameter;
  onChange: (area: AreaParameter) => void;
  onRemove: () => void;
}

const COMMON_FUNCTIONS = [
  'SUM', 'AVERAGE', 'COUNT', 'IF', 'VLOOKUP', 'INDEX', 
  'MATCH', 'MIN', 'MAX', 'ROUND', 'TODAY', 'NOW'
];

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
  formulaEnabled: {
    canReadValues: true,
    canWriteValues: true,
    canReadFormulas: true,
    canWriteFormulas: true,
    canReadFormatting: true,
    canWriteFormatting: true,
    canAddRows: false,
    canDeleteRows: false,
    canModifyStructure: false
  },
  fullAccess: {
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

export default function AreaParameterEditor({ area, onChange, onRemove }: Props) {
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['basic']);

  const updateArea = (updates: Partial<AreaParameter>) => {
    onChange({ ...area, ...updates });
  };

  const updatePermissions = (updates: Partial<AreaPermissions>) => {
    onChange({ 
      ...area, 
      permissions: { ...area.permissions, ...updates } 
    });
  };

  const applyPreset = (presetName: keyof typeof PERMISSION_PRESETS) => {
    updateArea({ 
      permissions: { ...PERMISSION_PRESETS[presetName] },
      mode: presetName === 'readonly' ? 'readonly' : 
            presetName === 'fullAccess' ? 'interactive' : 'editable'
    });
  };

  const getModeIcon = () => {
    switch (area.mode) {
      case 'readonly': return <LockOutlined />;
      case 'editable': return <EditOutlined />;
      case 'interactive': return <TableOutlined />;
    }
  };

  const getModeColor = () => {
    switch (area.mode) {
      case 'readonly': return 'default';
      case 'editable': return 'blue';
      case 'interactive': return 'green';
    }
  };

  return (
    <Card 
      size="small"
      title={
        <Space>
          {getModeIcon()}
          <span>{area.alias || area.name || 'New Area'}</span>
          <Tag color={getModeColor()}>{area.mode}</Tag>
        </Space>
      }
      extra={
        <Button 
          danger 
          size="small" 
          onClick={onRemove}
        >
          Remove
        </Button>
      }
    >
      <Collapse 
        activeKey={expandedPanels}
        onChange={setExpandedPanels}
        ghost
      >
        {/* Basic Settings */}
        <Panel header="Basic Settings" key="basic">
          <Form layout="vertical" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Internal Name">
                  <Input 
                    value={area.name}
                    onChange={e => updateArea({ name: e.target.value })}
                    placeholder="e.g., sales_data"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Display Name">
                  <Input 
                    value={area.alias}
                    onChange={e => updateArea({ alias: e.target.value })}
                    placeholder="e.g., Monthly Sales Table"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item label="Cell Range">
              <Input 
                value={area.address}
                onChange={e => updateArea({ address: e.target.value })}
                placeholder="e.g., Sheet1!A1:D20"
              />
            </Form.Item>
            
            <Form.Item label="Description">
              <TextArea 
                value={area.description}
                onChange={e => updateArea({ description: e.target.value })}
                placeholder="Describe what this area contains and how it should be used..."
                rows={2}
              />
            </Form.Item>
          </Form>
        </Panel>

        {/* Access Mode */}
        <Panel header="Access Mode & Permissions" key="permissions">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Preset Buttons */}
            <div>
              <Space wrap>
                <span>Quick presets:</span>
                <Button size="small" onClick={() => applyPreset('readonly')}>
                  Read Only
                </Button>
                <Button size="small" onClick={() => applyPreset('valueOnly')}>
                  Values Only
                </Button>
                <Button size="small" onClick={() => applyPreset('formulaEnabled')}>
                  With Formulas
                </Button>
                <Button size="small" onClick={() => applyPreset('fullAccess')}>
                  Full Access
                </Button>
              </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Detailed Permissions */}
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" title={<><EyeOutlined /> Values</>}>
                  <Space direction="vertical">
                    <Switch 
                      checked={area.permissions.canReadValues}
                      onChange={v => updatePermissions({ canReadValues: v })}
                      checkedChildren="Read" 
                      unCheckedChildren="Hide"
                    />
                    <Switch 
                      checked={area.permissions.canWriteValues}
                      onChange={v => updatePermissions({ canWriteValues: v })}
                      checkedChildren="Write" 
                      unCheckedChildren="Lock"
                      disabled={!area.permissions.canReadValues}
                    />
                  </Space>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" title={<><FunctionOutlined /> Formulas</>}>
                  <Space direction="vertical">
                    <Switch 
                      checked={area.permissions.canReadFormulas}
                      onChange={v => updatePermissions({ canReadFormulas: v })}
                      checkedChildren="Show" 
                      unCheckedChildren="Hide"
                    />
                    <Switch 
                      checked={area.permissions.canWriteFormulas}
                      onChange={v => updatePermissions({ canWriteFormulas: v })}
                      checkedChildren="Edit" 
                      unCheckedChildren="Lock"
                      disabled={!area.permissions.canReadFormulas}
                    />
                  </Space>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" title={<><FormatPainterOutlined /> Format</>}>
                  <Space direction="vertical">
                    <Switch 
                      checked={area.permissions.canReadFormatting}
                      onChange={v => updatePermissions({ canReadFormatting: v })}
                      checkedChildren="Show" 
                      unCheckedChildren="Hide"
                    />
                    <Switch 
                      checked={area.permissions.canWriteFormatting}
                      onChange={v => updatePermissions({ canWriteFormatting: v })}
                      checkedChildren="Edit" 
                      unCheckedChildren="Lock"
                      disabled={!area.permissions.canReadFormatting}
                    />
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Structure Permissions */}
            {area.mode === 'interactive' && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <Card size="small" title="Structure Modifications">
                  <Space wrap>
                    <Switch 
                      checked={area.permissions.canAddRows}
                      onChange={v => updatePermissions({ canAddRows: v })}
                      checkedChildren="Add Rows" 
                      unCheckedChildren="No Add"
                    />
                    <Switch 
                      checked={area.permissions.canDeleteRows}
                      onChange={v => updatePermissions({ canDeleteRows: v })}
                      checkedChildren="Delete Rows" 
                      unCheckedChildren="No Delete"
                    />
                    <Switch 
                      checked={area.permissions.canModifyStructure}
                      onChange={v => updatePermissions({ canModifyStructure: v })}
                      checkedChildren="Modify Structure" 
                      unCheckedChildren="Fixed Structure"
                    />
                  </Space>
                </Card>
              </>
            )}
          </Space>
        </Panel>

        {/* Advanced Settings */}
        {area.permissions.canWriteFormulas && (
          <Panel header="Formula Settings" key="formulas">
            <Form.Item label="Allowed Functions">
              <Select
                mode="multiple"
                value={area.permissions.allowedFormulas || []}
                onChange={v => updatePermissions({ allowedFormulas: v })}
                placeholder="Select allowed functions (empty = all allowed)"
                style={{ width: '100%' }}
              >
                {COMMON_FUNCTIONS.map(fn => (
                  <Option key={fn} value={fn}>{fn}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Alert
              message="Formula Security"
              description="Limiting allowed functions helps prevent potentially dangerous operations."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </Panel>
        )}

        {/* AI Context */}
        <Panel header="AI Assistant Context" key="ai">
          <Form layout="vertical" size="small">
            <Form.Item 
              label="Purpose" 
              tooltip="Help the AI understand what this area is for"
            >
              <TextArea 
                value={area.aiContext?.purpose}
                onChange={e => updateArea({ 
                  aiContext: { 
                    ...area.aiContext, 
                    purpose: e.target.value 
                  } 
                })}
                placeholder="e.g., This table contains monthly sales data that should be analyzed for trends"
                rows={2}
              />
            </Form.Item>
            
            <Form.Item 
              label="Expected Behavior" 
              tooltip="Guide the AI on how to interact with this area"
            >
              <TextArea 
                value={area.aiContext?.expectedBehavior}
                onChange={e => updateArea({ 
                  aiContext: { 
                    ...area.aiContext, 
                    expectedBehavior: e.target.value 
                  } 
                })}
                placeholder="e.g., Update sales figures but never modify the month names or formulas"
                rows={2}
              />
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </Card>
  );
}