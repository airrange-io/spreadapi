'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Form, InputNumber, Input, Switch, Select, Slider, Row, Col, Typography, Space } from 'antd';
import {
  getEditorConfig,
  detectLocale,
  createFormatters,
  createLocaleParser,
  isAiDescription,
  toDisplayValue,
  toStoredValue,
  type InputParameter
} from '@/lib/editorTypes';

const { Text } = Typography;

interface InputRendererProps {
  input: InputParameter;
  fieldName: string;
  showLabel?: boolean;
  marginBottom?: number;
  hideAiDescriptions?: boolean;
  locale?: string;  // Optional locale override
}

export const InputRenderer: React.FC<InputRendererProps> = ({
  input,
  fieldName,
  showLabel = true,
  marginBottom = 12,
  hideAiDescriptions = false,
  locale
}) => {
  // Detect locale client-side only to avoid SSR hydration mismatch
  // Start with 'en-US' (same as SSR default), then update to browser locale
  const [clientLocale, setClientLocale] = useState('en-US');
  useEffect(() => {
    setClientLocale(detectLocale());
  }, []);

  const effectiveLocale = locale || clientLocale;
  const formatters = useMemo(() => createFormatters(effectiveLocale), [effectiveLocale]);
  const parseLocaleNumber = useMemo(() => createLocaleParser(effectiveLocale), [effectiveLocale]);

  // Get editor configuration
  const config = getEditorConfig(input);

  // Determine if we should show the description
  const shouldShowDescription = !!(
    input.description && (!hideAiDescriptions || !isAiDescription(input.description))
  );

  const displayTitle = input.title || input.name;

  const label = showLabel ? (
    <div>
      <div style={{ fontWeight: 400, marginBottom: 2, fontSize: 13, color: '#666' }}>
        {displayTitle}
        {!input.mandatory && (
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>(optional)</Text>
        )}
      </div>
      {shouldShowDescription && (
        <div style={{ fontSize: 11, color: '#999', fontWeight: 400, marginBottom: 4 }}>
          {input.description}
        </div>
      )}
    </div>
  ) : undefined;

  // ============================================================================
  // 1. Dropdown for allowedValues
  // ============================================================================
  if (config.editorType === 'select' && config.allowedValues) {
    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please select ${displayTitle}` }]}
        style={{ marginBottom }}
      >
        <Select
          placeholder={`Select ${displayTitle}`}
          size="middle"
          showSearch
          optionFilterProp="children"
          filterOption={(inputValue, option) =>
            String(option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
          }
          options={config.allowedValues.map((value) => ({
            value: value,
            label: value
          }))}
        />
      </Form.Item>
    );
  }

  // ============================================================================
  // 2. Number with slider
  // ============================================================================
  if (config.hasSlider && (config.editorType === 'number' || config.editorType === 'percentage')) {
    const SliderWithInput = ({ value, onChange }: { value?: number; onChange?: (val: number) => void }) => {
      const displayValue = toDisplayValue(value, config.isPercentage);
      const min = config.isPercentage ? config.displayMin : config.min;
      const max = config.isPercentage ? config.displayMax : config.max;
      const step = config.isPercentage ? config.displayStep : config.step;

      return (
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Slider
              value={displayValue}
              onChange={(val) => onChange?.(toStoredValue(val, config.isPercentage) ?? 0)}
              min={min}
              max={max}
              step={step}
              tooltip={{
                formatter: (val) => {
                  if (val === null || val === undefined) return '';
                  const num = typeof val === 'number' ? val : parseFloat(String(val));
                  if (isNaN(num)) return '';
                  const formatted = Number.isInteger(num)
                    ? formatters.integer.format(num)
                    : formatters.decimal.format(num);
                  return config.isPercentage ? `${formatted}%` : formatted;
                }
              }}
            />
          </Col>
          <Col flex="120px">
            {config.isPercentage ? (
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  value={displayValue}
                  onChange={(val) => onChange?.(toStoredValue(val, config.isPercentage) ?? 0)}
                  style={{ width: '100%' }}
                  min={min}
                  max={max}
                  step={step}
                  size="middle"
                  keyboard={true}
                  formatter={(val) => {
                    if (!val) return '';
                    const num = parseFloat(val.toString());
                    if (isNaN(num)) return val.toString();
                    return Number.isInteger(num)
                      ? formatters.integer.format(num)
                      : formatters.decimal.format(num);
                  }}
                  parser={parseLocaleNumber}
                />
                <Input
                  style={{ width: 40, textAlign: 'center', pointerEvents: 'none' }}
                  value="%"
                  readOnly
                  tabIndex={-1}
                />
              </Space.Compact>
            ) : (
              <InputNumber
                value={displayValue}
                onChange={(val) => onChange?.(toStoredValue(val, config.isPercentage) ?? 0)}
                style={{ width: '100%' }}
                min={min}
                max={max}
                step={step}
                size="middle"
                keyboard={true}
                formatter={(val) => {
                  if (!val) return '';
                  const num = parseFloat(val.toString());
                  if (isNaN(num)) return val.toString();
                  return Number.isInteger(num)
                    ? formatters.integer.format(num)
                    : formatters.decimal.format(num);
                }}
                parser={parseLocaleNumber}
              />
            )}
          </Col>
        </Row>
      );
    };

    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please enter ${displayTitle}` }]}
        style={{ marginBottom }}
      >
        <SliderWithInput />
      </Form.Item>
    );
  }

  // ============================================================================
  // 3. Percentage input (without slider)
  // ============================================================================
  if (config.editorType === 'percentage') {
    const PercentageInput = ({ value, onChange }: { value?: number; onChange?: (val: number | null) => void }) => (
      <Space.Compact style={{ width: '100%' }}>
        <InputNumber
          value={toDisplayValue(value, true)}
          onChange={(val) => onChange?.(toStoredValue(val, true))}
          style={{ width: '100%' }}
          min={config.displayMin}
          max={config.displayMax}
          step={config.displayStep ?? config.step}
          placeholder={`Enter ${displayTitle}`}
          size="middle"
          keyboard={true}
          formatter={(val) => {
            if (!val) return '';
            const num = parseFloat(val.toString());
            if (isNaN(num)) return val.toString();
            return Number.isInteger(num)
              ? formatters.integer.format(num)
              : formatters.decimal.format(num);
          }}
          parser={parseLocaleNumber}
        />
        <Input
          style={{ width: 50, textAlign: 'center', pointerEvents: 'none' }}
          value="%"
          readOnly
          tabIndex={-1}
        />
      </Space.Compact>
    );

    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please enter ${displayTitle}` }]}
        style={{ marginBottom }}
      >
        <PercentageInput />
      </Form.Item>
    );
  }

  // ============================================================================
  // 4. Regular number input
  // ============================================================================
  if (config.editorType === 'number') {
    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please enter ${displayTitle}` }]}
        style={{ marginBottom }}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={config.min}
          max={config.max}
          step={config.step}
          placeholder={`Enter ${displayTitle}`}
          size="middle"
          keyboard={true}
          formatter={(val) => {
            if (!val) return '';
            const num = parseFloat(val.toString());
            if (isNaN(num)) return val.toString();
            return Number.isInteger(num)
              ? formatters.integer.format(num)
              : formatters.decimal.format(num);
          }}
          parser={parseLocaleNumber}
        />
      </Form.Item>
    );
  }

  // ============================================================================
  // 5. Boolean switch
  // ============================================================================
  if (config.editorType === 'boolean') {
    const SwitchWithLabel = ({ checked, onChange }: { checked?: boolean; onChange?: (val: boolean) => void }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Switch checked={checked} onChange={onChange} />
        <div>
          <div style={{ fontWeight: 400, fontSize: 13, color: '#666' }}>
            {displayTitle}
            {!input.mandatory && (
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>(optional)</Text>
            )}
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

  // ============================================================================
  // 6. Default to text input
  // ============================================================================
  return (
    <Form.Item
      key={fieldName}
      name={fieldName}
      label={label}
      rules={[{ required: input.mandatory !== false, message: `Please enter ${displayTitle}` }]}
      style={{ marginBottom }}
    >
      <Input
        placeholder={`Enter ${displayTitle}`}
        size="middle"
      />
    </Form.Item>
  );
};

export default InputRenderer;
