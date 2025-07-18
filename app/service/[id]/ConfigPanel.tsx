'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, Select, InputNumber, Typography, Empty, Divider, Tag, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface InputDefinition {
  id: string;
  name: string;
  cell: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue?: any;
  min?: number;
  max?: number;
  description?: string;
}

interface OutputDefinition {
  id: string;
  name: string;
  cell: string;
  type: 'number' | 'string' | 'boolean';
  description?: string;
}

interface ConfigPanelProps {
  spreadInstance: any;
  onConfigChange?: (config: any) => void;
  initialConfig?: {
    name: string;
    description: string;
    inputs: InputDefinition[];
    outputs: OutputDefinition[];
  };
}

export default function ConfigPanel({ spreadInstance, onConfigChange, initialConfig }: ConfigPanelProps) {
  const [inputs, setInputs] = useState<InputDefinition[]>(initialConfig?.inputs || []);
  const [outputs, setOutputs] = useState<OutputDefinition[]>(initialConfig?.outputs || []);
  const [apiName, setApiName] = useState(initialConfig?.name || '');
  const [apiDescription, setApiDescription] = useState(initialConfig?.description || '');

  // Update state when initialConfig changes (e.g., when loading saved data)
  useEffect(() => {
    if (initialConfig) {
      setApiName(initialConfig.name || '');
      setApiDescription(initialConfig.description || '');
      setInputs(initialConfig.inputs || []);
      setOutputs(initialConfig.outputs || []);
    }
  }, [initialConfig?.name, initialConfig?.description]); // Only watch name/description to avoid issues with array references

  // Notify parent of changes - using a timeout to debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onConfigChange) {
        onConfigChange({
          name: apiName,
          description: apiDescription,
          inputs,
          outputs
        });
      }
    }, 300); // Debounce by 300ms

    return () => clearTimeout(timer);
  }, [apiName, apiDescription, inputs, outputs]); // Removed onConfigChange from dependencies

  const addInput = () => {
    const newInput: InputDefinition = {
      id: Date.now().toString(),
      name: '',
      cell: '',
      type: 'number',
    };
    setInputs([...inputs, newInput]);
  };

  const updateInput = (id: string, field: keyof InputDefinition, value: any) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, [field]: value } : input
    ));
  };

  const removeInput = (id: string) => {
    setInputs(inputs.filter(input => input.id !== id));
  };

  const addOutput = () => {
    const newOutput: OutputDefinition = {
      id: Date.now().toString(),
      name: '',
      cell: '',
      type: 'number',
    };
    setOutputs([...outputs, newOutput]);
  };

  const updateOutput = (id: string, field: keyof OutputDefinition, value: any) => {
    setOutputs(outputs.map(output => 
      output.id === id ? { ...output, [field]: value } : output
    ));
  };

  const removeOutput = (id: string) => {
    setOutputs(outputs.filter(output => output.id !== id));
  };

  const renderInputForm = (input: InputDefinition) => (
    <Card 
      key={input.id}
      size="small" 
      style={{ marginBottom: 12 }}
      extra={
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeInput(input.id)}
          size="small"
        />
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Input
          placeholder="Parameter name (e.g., interest_rate)"
          value={input.name}
          onChange={(e) => updateInput(input.id, 'name', e.target.value)}
        />
        
        <Space.Compact style={{ width: '100%' }}>
          <Input
            style={{ width: '60%' }}
            placeholder="Cell (e.g., B2)"
            value={input.cell}
            onChange={(e) => updateInput(input.id, 'cell', e.target.value.toUpperCase())}
          />
          <Select
            style={{ width: '40%' }}
            value={input.type}
            onChange={(value) => updateInput(input.id, 'type', value)}
          >
            <Option value="number">Number</Option>
            <Option value="string">String</Option>
            <Option value="boolean">Boolean</Option>
          </Select>
        </Space.Compact>

        {input.type === 'number' && (
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              style={{ width: '33%' }}
              placeholder="Default"
              value={input.defaultValue}
              onChange={(value) => updateInput(input.id, 'defaultValue', value)}
            />
            <InputNumber
              style={{ width: '33%' }}
              placeholder="Min"
              value={input.min}
              onChange={(value) => updateInput(input.id, 'min', value)}
            />
            <InputNumber
              style={{ width: '34%' }}
              placeholder="Max"
              value={input.max}
              onChange={(value) => updateInput(input.id, 'max', value)}
            />
          </Space.Compact>
        )}

        <Input
          placeholder="Description (optional)"
          value={input.description}
          onChange={(e) => updateInput(input.id, 'description', e.target.value)}
        />
      </Space>
    </Card>
  );

  const renderOutputForm = (output: OutputDefinition) => (
    <Card 
      key={output.id}
      size="small" 
      style={{ marginBottom: 12 }}
      extra={
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeOutput(output.id)}
          size="small"
        />
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Input
          placeholder="Output name (e.g., total_amount)"
          value={output.name}
          onChange={(e) => updateOutput(output.id, 'name', e.target.value)}
        />
        
        <Space.Compact style={{ width: '100%' }}>
          <Input
            style={{ width: '60%' }}
            placeholder="Cell (e.g., E10)"
            value={output.cell}
            onChange={(e) => updateOutput(output.id, 'cell', e.target.value.toUpperCase())}
          />
          <Select
            style={{ width: '40%' }}
            value={output.type}
            onChange={(value) => updateOutput(output.id, 'type', value)}
          >
            <Option value="number">Number</Option>
            <Option value="string">String</Option>
            <Option value="boolean">Boolean</Option>
          </Select>
        </Space.Compact>

        <Input
          placeholder="Description (optional)"
          value={output.description}
          onChange={(e) => updateOutput(output.id, 'description', e.target.value)}
        />
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* API Info */}
        <div>
          <Title level={5}>API Information</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="API Name"
              value={apiName}
              onChange={(e) => setApiName(e.target.value)}
            />
            <Input.TextArea
              placeholder="Description (optional)"
              value={apiDescription}
              onChange={(e) => setApiDescription(e.target.value)}
              rows={2}
            />
          </Space>
        </div>

        <Divider />

        {/* Inputs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0 }}>Input Parameters</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addInput}
              size="small"
            >
              Add Input
            </Button>
          </div>
          
          {inputs.length === 0 ? (
            <Empty 
              description="No inputs defined yet" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div>{inputs.map(renderInputForm)}</div>
          )}
        </div>

        <Divider />

        {/* Outputs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0 }}>Output Values</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addOutput}
              size="small"
            >
              Add Output
            </Button>
          </div>
          
          {outputs.length === 0 ? (
            <Empty 
              description="No outputs defined yet" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div>{outputs.map(renderOutputForm)}</div>
          )}
        </div>

        {/* Tips */}
        <Collapse ghost>
          <Panel header="Tips" key="1">
            <Space direction="vertical" size="small">
              <Text type="secondary">• Click on a cell in the spreadsheet to get its reference</Text>
              <Text type="secondary">• Use meaningful parameter names (no spaces)</Text>
              <Text type="secondary">• Set default values for optional inputs</Text>
              <Text type="secondary">• You can define ranges like A1:A10 for array inputs</Text>
            </Space>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
}