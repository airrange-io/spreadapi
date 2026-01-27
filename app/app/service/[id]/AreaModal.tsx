'use client';

import React from 'react';
import { Modal, Button, Space, Input, Form, Radio, Collapse, Row, Col, Checkbox, Typography, App } from 'antd';
import { TableOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
  const { notification } = App.useApp();

  const handleSave = () => {
    if (!editingArea?.name || !editingArea?.address) {
      notification.error({ message: t('areaModal.nameAndAddressRequired') });
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
          <span>{editingAreaIndex === -1 ? t('areaModal.addArea') : t('areaModal.editArea')}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
        >
          {editingAreaIndex === -1 ? t('areaModal.addAreaBtn') : t('areaModal.saveAreaBtn')}
        </Button>
      ]}
      centered
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        {/* Basic Info */}
        <div>
          <Form layout="vertical">
            <Form.Item label={t('areaModal.areaName')} required>
              <Input
                value={editingArea.name}
                onChange={e => onAreaChange({ ...editingArea, name: e.target.value })}
                placeholder={t('areaModal.areaNamePlaceholder')}
              />
            </Form.Item>

            <Form.Item label={t('areaModal.selectedRange')}>
              <Input value={editingArea.address} disabled />
            </Form.Item>

            <Form.Item label={t('areaModal.description')}>
              <Input.TextArea
                value={editingArea.description}
                onChange={e => onAreaChange({ ...editingArea, description: e.target.value })}
                placeholder={t('areaModal.descriptionPlaceholder')}
                rows={2}
              />
            </Form.Item>
          </Form>
        </div>

        {/* Quick Permission Presets */}
        <div>
          <Title level={5}>{t('areaModal.accessLevel')}</Title>
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
            <Space orientation="vertical">
              <Radio value="readonly">
                <Space>
                  <LockOutlined />
                  <span>{t('areaModal.readOnly')}</span>
                  <Text type="secondary">{t('areaModal.readOnlyDesc')}</Text>
                </Space>
              </Radio>
              <Radio value="editable">
                <Space>
                  <EditOutlined />
                  <span>{t('areaModal.editableValues')}</span>
                  <Text type="secondary">{t('areaModal.editableValuesDesc')}</Text>
                </Space>
              </Radio>
              <Radio value="interactive" disabled>
                <Space>
                  <TableOutlined />
                  <span>{t('areaModal.fullInteractive')}</span>
                  <Text type="secondary">{t('areaModal.fullInteractiveDesc')}</Text>
                  <Text type="warning" style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
                    {t('areaModal.interactiveDisabledWarning')}
                  </Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* Advanced Options */}
        <Collapse ghost>
          <Panel header={t('areaModal.advancedPermissions')} key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Space orientation="vertical">
                  <Checkbox
                    checked={editingArea.permissions.canReadFormulas}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canReadFormulas: e.target.checked }
                    })}
                  >
                    {t('areaModal.showFormulasToAi')}
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canWriteFormulas}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canWriteFormulas: e.target.checked }
                    })}
                    disabled={true}
                  >
                    <span style={{ opacity: 0.5 }}>
                      {t('areaModal.allowFormulaModifications')}
                      <Text type="secondary" style={{ display: 'block', fontSize: '11px' }}>
                        {t('areaModal.disabledForSafety')}
                      </Text>
                    </span>
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canReadFormatting}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canReadFormatting: e.target.checked }
                    })}
                  >
                    {t('areaModal.includeCellFormatting')}
                  </Checkbox>
                </Space>
              </Col>
              <Col span={12}>
                <Space orientation="vertical">
                  <Checkbox
                    checked={editingArea.permissions.canAddRows}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canAddRows: e.target.checked }
                    })}
                  >
                    {t('areaModal.allowAddingRows')}
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canDeleteRows}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canDeleteRows: e.target.checked }
                    })}
                  >
                    {t('areaModal.allowDeletingRows')}
                  </Checkbox>
                  <Checkbox
                    checked={editingArea.permissions.canModifyStructure}
                    onChange={e => onAreaChange({
                      ...editingArea,
                      permissions: { ...editingArea.permissions, canModifyStructure: e.target.checked }
                    })}
                  >
                    {t('areaModal.allowStructureChanges')}
                  </Checkbox>
                </Space>
              </Col>
            </Row>
          </Panel>

          <Panel header={t('areaModal.aiContext')} key="2">
            <Form.Item label={t('areaModal.purpose')}>
              <Input.TextArea
                value={editingArea.aiContext?.purpose}
                onChange={e => onAreaChange({
                  ...editingArea,
                  aiContext: { ...editingArea.aiContext, purpose: e.target.value }
                })}
                placeholder={t('areaModal.purposePlaceholder')}
                rows={2}
              />
            </Form.Item>

            <Form.Item label={t('areaModal.expectedBehavior')}>
              <Input.TextArea
                value={editingArea.aiContext?.expectedBehavior}
                onChange={e => onAreaChange({
                  ...editingArea,
                  aiContext: { ...editingArea.aiContext, expectedBehavior: e.target.value }
                })}
                placeholder={t('areaModal.expectedBehaviorPlaceholder')}
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