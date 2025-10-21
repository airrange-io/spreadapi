'use client';

import React from 'react';
import { Modal, Button, Space, Input, Form, Radio, Collapse, Row, Col, Checkbox, Typography, App } from 'antd';
import { TableOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

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

// Permission presets for areas
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

interface AreaModalProps {
  open: boolean;
  editingArea: AreaParameter | null;
  editingAreaIndex: number;
  onClose: () => void;
  onSave: (area: AreaParameter) => void;
  onAreaChange: (area: AreaParameter) => void;
}

const AreaModal: React.FC<AreaModalProps> = ({
  open,
  editingArea,
  editingAreaIndex,
  onClose,
  onSave,
  onAreaChange
}) => {
  const { message } = App.useApp();

  const handleSave = () => {
    if (!editingArea?.name || !editingArea?.address) {
      message.error('Area name and address are required');
      return;
    }
    onSave(editingArea);
  };

  if (!editingArea) return null;

  return (
    <Modal
      title={
        <Space>
          <TableOutlined />
          <span>{editingAreaIndex === -1 ? 'Add' : 'Edit'} Editable Area</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
        >
          {editingAreaIndex === -1 ? 'Add' : 'Save'} Area
        </Button>
      ]}
      centered
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Basic Info */}
        <div>
          <Form layout="vertical">
            <Form.Item label="Area Name" required>
              <Input
                value={editingArea.name}
                onChange={e => onAreaChange({ ...editingArea, name: e.target.value })}
                placeholder="e.g., sales_data or Monthly Sales Data"
              />
            </Form.Item>

            <Form.Item label="Selected Range">
              <Input value={editingArea.address} disabled />
            </Form.Item>

            <Form.Item label="Description">
              <Input.TextArea
                value={editingArea.description}
                onChange={e => onAreaChange({ ...editingArea, description: e.target.value })}
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
              onAreaChange({
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
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canReadFormulas: e.target.checked }
                    })}
                  >
                    Show formulas to AI
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canWriteFormulas}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canWriteFormulas: e.target.checked }
                    })}
                    disabled={!editingArea.permissions.canReadFormulas}
                  >
                    Allow formula modifications
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canReadFormatting}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canReadFormatting: e.target.checked }
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
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canAddRows: e.target.checked }
                    })}
                  >
                    Allow adding rows
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canDeleteRows}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canDeleteRows: e.target.checked }
                    })}
                  >
                    Allow deleting rows
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canModifyStructure}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canModifyStructure: e.target.checked }
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
                onChange={e => onAreaChange({
                  ...editingArea,
                  aiContext: { ...editingArea.aiContext, purpose: e.target.value }
                })}
                placeholder="Describe what this area contains and its purpose..."
                rows={2}
              />
            </Form.Item>

            <Form.Item label="Expected Behavior">
              <Input.TextArea
                value={editingArea.aiContext?.expectedBehavior}
                onChange={e => onAreaChange({
                  ...editingArea,
                  aiContext: { ...editingArea.aiContext, expectedBehavior: e.target.value }
                })}
                placeholder="Guide the AI on how to interact with this area..."
                rows={2}
              />
            </Form.Item>
          </Panel>
        </Collapse>
      </Space>
    </Modal>
  );
};

export default AreaModal;