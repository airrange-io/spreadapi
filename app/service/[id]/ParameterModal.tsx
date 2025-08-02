'use client';

import React from 'react';
import { Modal, Form, Input, Select, Button, Space, Alert, Checkbox } from 'antd';

interface InputDefinition {
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

interface OutputDefinition {
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

interface SelectedCellInfo {
  address: string;
  row: number;
  col: number;
  rowCount: number;
  colCount: number;
  hasFormula: boolean;
  value: any;
  isSingleCell: boolean;
  detectedDataType: string;
  suggestedName: string;
  suggestedTitle: string;
  format?: {
    isPercentage: boolean;
    percentageDecimals: number;
  };
}

interface ParameterModalProps {
  open: boolean;
  parameterType: 'input' | 'output';
  editingParameter: InputDefinition | OutputDefinition | null;
  selectedCellInfo: SelectedCellInfo | null;
  suggestedParamName: string;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const ParameterModal: React.FC<ParameterModalProps> = ({
  open,
  parameterType,
  editingParameter,
  selectedCellInfo,
  suggestedParamName,
  onClose,
  onSubmit
}) => {
  // Debug logging
  React.useEffect(() => {
    if (open && editingParameter) {
      console.log('ParameterModal - editingParameter:', editingParameter);
      console.log('ParameterModal - type:', editingParameter.type);
    }
  }, [open, editingParameter]);

  return (
    <Modal
      title={`${editingParameter ? 'Edit' : 'Add'} ${parameterType === 'input' ? 'Input' : 'Output'} Parameter`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form
        key={`${editingParameter?.id || 'new'}-${Date.now()}`}
        layout="vertical"
        variant={'filled'}
        onFinish={onSubmit}
        initialValues={{
          name: editingParameter ? editingParameter.name : (suggestedParamName || ''),
          title: editingParameter ? editingParameter.title : (selectedCellInfo?.suggestedTitle || ''),
          dataType: editingParameter?.dataType || editingParameter?.type || selectedCellInfo?.detectedDataType || 'string',
          description: editingParameter?.description || '',
          mandatory: editingParameter ? (editingParameter as InputDefinition).mandatory !== false : true,
          min: editingParameter && 'min' in editingParameter ? editingParameter.min : undefined,
          max: editingParameter && 'max' in editingParameter ? editingParameter.max : undefined
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            label="Parameter Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a parameter name' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., amount, rate, result" />
          </Form.Item>

          <Form.Item
            label="Data Type"
            name="dataType"
            style={{ width: '150px' }}
          >
            <Select>
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="boolean">Boolean</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Original Title"
          name="title"
        >
          <Input placeholder="e.g., Interest Rate, Total Amount" />
        </Form.Item>

        {selectedCellInfo?.format?.isPercentage && (
          <Alert
            message="Percentage Format Detected"
            description="This cell is formatted as a percentage in Excel. Users should enter decimal values (e.g., 0.05 for 5%)."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label="Description (for AI assistants)"
          name="description"
        >
          <Input.TextArea
            rows={2}
            placeholder="Describe what this parameter represents and how it should be used..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        {parameterType === 'input' && (
          <>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.dataType !== currentValues.dataType}
            >
              {({ getFieldValue }) =>
                getFieldValue('dataType') === 'number' ? (
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                      label="Min Value"
                      name="min"
                      style={{ flex: 1 }}
                    >
                      <Input type="number" placeholder="Optional" />
                    </Form.Item>
                    <Form.Item
                      label="Max Value"
                      name="max"
                      style={{ flex: 1 }}
                    >
                      <Input type="number" placeholder="Optional" />
                    </Form.Item>
                  </div>
                ) : null
              }
            </Form.Item>
          </>
        )}

        <Form.Item style={{ marginBottom: 8 }}>
          <div style={{
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <strong>Selected Cell:</strong> {selectedCellInfo?.address}
            {selectedCellInfo?.hasFormula && (
              <div style={{ marginTop: '4px', color: '#52c41a' }}>
                ✓ Contains formula (recommended as output)
              </div>
            )}
            {selectedCellInfo?.value !== null && selectedCellInfo?.value !== undefined && (
              <div style={{ marginTop: '4px' }}>
                Current value: {selectedCellInfo.value}
              </div>
            )}
          </div>
        </Form.Item>
        
        {parameterType === 'input' && (
          <Form.Item
            name="mandatory"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Mandatory parameter</Checkbox>
          </Form.Item>
        )}
        
        <Form.Item style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit">
              {editingParameter ? 'Update' : 'Add'} Parameter
            </Button>
            <Button onClick={onClose}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ParameterModal;