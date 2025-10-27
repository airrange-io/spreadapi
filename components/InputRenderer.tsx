'use client';

import React from 'react';
import { Form, InputNumber, Input, Switch, Select, Slider, Row, Col, Typography } from 'antd';

const { Text } = Typography;

interface InputRendererProps {
  input: any;
  fieldName: string;
  showLabel?: boolean;
  marginBottom?: number;
  hideAiDescriptions?: boolean; // Hide descriptions that are meant for AI (start with "CRITICAL:", etc.)
}

// Helper function to determine smart step size
const getSmartStep = (value: number | undefined, min: number | undefined, max: number | undefined) => {
  // If we have min and max, calculate step based on range
  if (min !== undefined && max !== undefined) {
    const range = max - min;
    if (range <= 1) return 0.01;
    if (range <= 10) return 0.1;
    if (range <= 100) return 1;
    if (range <= 1000) return 10;
    return 100;
  }

  // Otherwise, base step on current value
  const currentValue = value || 0;
  const absValue = Math.abs(currentValue);

  if (absValue === 0) return 1;
  if (absValue < 1) return 0.01;
  if (absValue < 10) return 0.1;
  if (absValue < 100) return 1;
  if (absValue < 1000) return 10;
  return 100;
};

// Parse locale number (handle both . and , as decimal separator)
const parseLocaleNumber = (value: string | undefined): number => {
  if (!value) return NaN;
  const parsed = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  return isNaN(parsed) ? NaN : parsed;
};

// Format numbers for display
const formatters = {
  integer: new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }),
  decimal: new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
};

export const InputRenderer: React.FC<InputRendererProps> = ({
  input,
  fieldName,
  showLabel = true,
  marginBottom = 12,
  hideAiDescriptions = false
}) => {
  // Helper to check if description is AI-specific
  const isAiDescription = (desc: string) => {
    if (!desc) return false;
    const aiPatterns = [
      /^CRITICAL:/i,
      /you MUST pass/i,
      /Never pass the whole number/i,
      /Pass actual boolean value/i,
      /Accept multiple formats.*yes\/no.*true\/false/i
    ];
    return aiPatterns.some(pattern => pattern.test(desc));
  };

  // Determine if we should show the description
  const shouldShowDescription = input.description &&
    (!hideAiDescriptions || !isAiDescription(input.description));

  const label = showLabel ? (
    <div>
      <div style={{ fontWeight: 400, marginBottom: 2, fontSize: 13, color: '#666' }}>
        {input.title || input.name}
        {!input.mandatory && <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>(optional)</Text>}
      </div>
      {shouldShowDescription && (
        <div style={{ fontSize: 11, color: '#999', fontWeight: 400, marginBottom: 4 }}>
          {input.description}
        </div>
      )}
    </div>
  ) : undefined;

  // If input has allowedValues, render a dropdown
  if (input.allowedValues && input.allowedValues.length > 0) {
    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please select ${input.title || input.name}` }]}
        style={{ marginBottom }}
      >
        <Select
          placeholder={`Select ${input.title || input.name}`}
          size="middle"
          showSearch
          optionFilterProp="children"
          filterOption={(inputValue, option) =>
            String(option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
          }
          options={input.allowedValues.map((value: any) => ({
            value: value,
            label: value
          }))}
        />
      </Form.Item>
    );
  }

  if (input.type === 'number') {
    // Ensure min/max are numbers
    const minValue = input.min !== undefined ? Number(input.min) : undefined;
    const maxValue = input.max !== undefined ? Number(input.max) : undefined;

    const hasRange = minValue !== undefined && maxValue !== undefined && !isNaN(minValue) && !isNaN(maxValue);
    const rangeSize = hasRange ? maxValue! - minValue! : 0;
    const useSlider = hasRange && rangeSize > 0 && rangeSize <= 10000; // Use slider for reasonable ranges

    if (useSlider) {
      // Combined Slider + InputNumber for best UX
      const SliderWithInput = ({ value, onChange }: { value?: number; onChange?: (val: number) => void }) => (
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Slider
              value={value}
              onChange={onChange}
              min={minValue}
              max={maxValue}
              step={getSmartStep(input.value, minValue, maxValue)}
              tooltip={{
                formatter: (val) => {
                  if (val === null || val === undefined) return '';
                  const num = typeof val === 'number' ? val : parseFloat(String(val));
                  if (isNaN(num)) return '';
                  if (Number.isInteger(num)) {
                    return formatters.integer.format(num);
                  }
                  return formatters.decimal.format(num);
                }
              }}
            />
          </Col>
          <Col flex="120px">
            <InputNumber
              value={value}
              onChange={onChange}
              style={{ width: '100%' }}
              min={minValue}
              max={maxValue}
              step={getSmartStep(input.value, minValue, maxValue)}
              size="middle"
              keyboard={true}
              formatter={(val) => {
                if (!val) return '';
                const num = parseFloat(val.toString());
                if (isNaN(num)) return val.toString();
                if (Number.isInteger(num)) {
                  return formatters.integer.format(num);
                }
                return formatters.decimal.format(num);
              }}
              parser={parseLocaleNumber}
            />
          </Col>
        </Row>
      );

      return (
        <Form.Item
          key={fieldName}
          name={fieldName}
          label={label}
          rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
          style={{ marginBottom }}
        >
          <SliderWithInput />
        </Form.Item>
      );
    }

    // Regular InputNumber without slider
    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
        style={{ marginBottom }}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={minValue}
          max={maxValue}
          step={getSmartStep(input.value, minValue, maxValue)}
          placeholder={`Enter ${input.title || input.name}`}
          size="middle"
          keyboard={true}
          formatter={(value) => {
            if (!value) return '';
            const num = parseFloat(value.toString());
            if (isNaN(num)) return value.toString();
            if (Number.isInteger(num)) {
              return formatters.integer.format(num);
            }
            return formatters.decimal.format(num);
          }}
          parser={parseLocaleNumber}
        />
      </Form.Item>
    );
  }

  if (input.type === 'boolean') {
    // Custom component to properly receive checked prop from Form.Item
    const SwitchWithLabel = ({ checked, onChange }: { checked?: boolean; onChange?: (val: boolean) => void }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Switch checked={checked} onChange={onChange} />
        <div>
          <div style={{ fontWeight: 400, fontSize: 13, color: '#666' }}>
            {input.title || input.name}
            {!input.mandatory && <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>(optional)</Text>}
          </div>
          {shouldShowDescription && (
            <div style={{ fontSize: 11, color: '#999', fontWeight: 400, marginTop: 2 }}>
              {input.description}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        valuePropName="checked"
        style={{ marginBottom }}
      >
        <SwitchWithLabel />
      </Form.Item>
    );
  }

  // Default to string/text
  return (
    <Form.Item
      key={fieldName}
      name={fieldName}
      label={label}
      rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
      style={{ marginBottom }}
    >
      <Input
        placeholder={`Enter ${input.title || input.name}`}
        size="middle"
      />
    </Form.Item>
  );
};

export default InputRenderer;
