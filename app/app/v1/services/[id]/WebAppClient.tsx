'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Alert, Typography, Slider, Row, Col, Switch } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Input {
  name: string;
  alias?: string;
  title?: string;
  description?: string;
  type: string;
  mandatory?: boolean;
  min?: number;
  max?: number;
  value?: any;
  allowedValues?: string[];
  defaultValue?: any;
}

interface Output {
  name: string;
  alias?: string;
  title?: string;
  description?: string;
  type: string;
  formatString?: string;
}

interface ServiceData {
  name: string;
  description: string;
  inputs: Input[];
  outputs: Output[];
  webAppConfig?: string;
}

interface AppRule {
  output?: string;
  input?: string;
  visible: {
    input: string;
    equals: string;
  };
}

interface Props {
  serviceId: string;
  serviceData: ServiceData;
  initialLanguage: 'de' | 'en';
}

export default function WebAppClient({ serviceId, serviceData, initialLanguage }: Props) {
  const [form] = Form.useForm();
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [lastCalculatedValues, setLastCalculatedValues] = useState<Record<string, any> | null>(null);

  // Watch all form values for rule evaluation
  const formValues = Form.useWatch([], form);

  // Check if current form values differ from last calculated values
  // Only compare visible fields since hidden fields can't be changed by the user
  const resultsAreStale = useMemo(() => {
    if (!results || !lastCalculatedValues || !formValues) return false;

    // Only check visible form fields (hidden fields use defaults and can't change)
    return Object.keys(formValues).some(key => {
      return String(formValues[key]) !== String(lastCalculatedValues[key]);
    });
  }, [results, lastCalculatedValues, formValues]);

  // Use language provided by server (from Accept-Language header) to avoid hydration mismatch
  const userLocale = initialLanguage === 'de' ? 'de-DE' : 'en-US';

  // Simple translations for German
  const translations = {
    en: {
      optional: 'Optional',
      pleaseSelect: 'Please select',
      pleaseEnter: 'Please enter',
      select: 'Select',
      enter: 'Enter',
      calculateResults: 'Calculate Results',
      calculating: 'Calculating...',
      results: 'Results',
      staleWarning: "Input values have changed. Click 'Calculate Results' to update.",
      error: 'Error',
      executionFailed: 'Failed to execute calculation',
      spreadapi: 'SpreadAPI'
    },
    de: {
      optional: 'Optional',
      pleaseSelect: 'Bitte wählen Sie',
      pleaseEnter: 'Bitte geben Sie ein',
      select: 'Auswählen',
      enter: 'Eingeben',
      calculateResults: 'Ergebnisse berechnen',
      calculating: 'Berechnung läuft...',
      results: 'Ergebnisse',
      staleWarning: 'Eingabewerte wurden geändert. Klicken Sie auf „Ergebnisse berechnen", um zu aktualisieren.',
      error: 'Fehler',
      executionFailed: 'Berechnung fehlgeschlagen',
      spreadapi: 'SpreadAPI'
    }
  };

  // Get translation helper
  const t = useCallback((key: keyof typeof translations.en): string => {
    const lang = userLocale.startsWith('de') ? 'de' : 'en';
    return translations[lang][key];
  }, [userLocale]);

  // Parse app rules from webAppConfig
  const appRules = useMemo<AppRule[]>(() => {
    if (!serviceData.webAppConfig || !serviceData.webAppConfig.trim()) {
      return [];
    }
    try {
      const config = JSON.parse(serviceData.webAppConfig);
      return config.rules || [];
    } catch (e) {
      console.error('Failed to parse webAppConfig:', e);
      return [];
    }
  }, [serviceData.webAppConfig]);

  // Create a mapping from input name/alias to form field key
  const inputNameToFieldKey = useMemo(() => {
    const mapping: Record<string, string> = {};
    serviceData.inputs.forEach(input => {
      const fieldKey = input.alias || input.name;
      // Map both name and alias to the field key
      mapping[input.name] = fieldKey;
      if (input.alias) {
        mapping[input.alias] = fieldKey;
      }
    });
    return mapping;
  }, [serviceData.inputs]);

  // Function to check if an output should be visible based on rules
  const isOutputVisible = useCallback((outputName: string): boolean => {
    // Find rule for this output
    const rule = appRules.find(r => r.output === outputName);

    // No rule means always visible
    if (!rule) return true;

    // Get the form field key for the input (handles aliases)
    const fieldKey = inputNameToFieldKey[rule.visible.input];
    if (!fieldKey) {
      console.warn(`Rule references unknown input: ${rule.visible.input}`);
      return true;
    }

    // Get current value - use formValues if available, otherwise get initial value from input definition
    let currentValue = formValues?.[fieldKey];

    // If formValues not ready yet, get initial value from input definition (prevents flicker)
    if (currentValue === undefined) {
      const inputDef = serviceData.inputs.find(i => (i.alias || i.name) === fieldKey);
      if (inputDef) {
        currentValue = inputDef.value !== undefined && inputDef.value !== null ? inputDef.value : inputDef.defaultValue;
      }
    }

    // Evaluate the rule
    return String(currentValue) === String(rule.visible.equals);
  }, [appRules, formValues, inputNameToFieldKey, serviceData.inputs]);

  // Function to check if an input should be visible based on rules
  const isInputVisible = useCallback((inputName: string): boolean => {
    // Find rule for this input
    const rule = appRules.find(r => r.input === inputName);

    // No rule means always visible
    if (!rule) return true;

    // Get the form field key for the condition input (handles aliases)
    const fieldKey = inputNameToFieldKey[rule.visible.input];
    if (!fieldKey) {
      console.warn(`Rule references unknown input: ${rule.visible.input}`);
      return true;
    }

    // Get current value - use formValues if available, otherwise get initial value from input definition
    let currentValue = formValues?.[fieldKey];

    // If formValues not ready yet, get initial value from input definition (prevents flicker)
    if (currentValue === undefined) {
      const inputDef = serviceData.inputs.find(i => (i.alias || i.name) === fieldKey);
      if (inputDef) {
        currentValue = inputDef.value !== undefined && inputDef.value !== null ? inputDef.value : inputDef.defaultValue;
      }
    }

    // Evaluate the rule
    return String(currentValue) === String(rule.visible.equals);
  }, [appRules, formValues, inputNameToFieldKey, serviceData.inputs]);

  // Initialize form with defaults
  const initialValues = useMemo(() => {
    const defaults: Record<string, any> = {};
    serviceData.inputs.forEach((input) => {
      const key = input.alias || input.name;

      // Get the value (prefer input.value over defaultValue)
      let value = input.value !== undefined && input.value !== null ? input.value : input.defaultValue;

      // Handle boolean conversion (Redis returns strings, Excel returns "TRUE"/"FALSE")
      if (input.type === 'boolean') {
        if (value !== undefined && value !== null) {
          // Convert various true representations to boolean
          const valueStr = String(value).toLowerCase();
          const boolValue = value === true || valueStr === 'true' || valueStr === '1' || value === 1;
          defaults[key] = boolValue;
        } else {
          defaults[key] = false;
        }
      } else if (value !== undefined && value !== null) {
        defaults[key] = value;
      } else if (input.allowedValues && input.allowedValues.length > 0 && input.mandatory !== false) {
        defaults[key] = input.allowedValues[0];
      } else if (input.type === 'number') {
        defaults[key] = input.min || 0;
      } else {
        defaults[key] = '';
      }
    });
    return defaults;
  }, [serviceData.inputs]);

  // Memoize formatters with user's locale
  const formatters = useMemo(() => ({
    integer: new Intl.NumberFormat(userLocale, { maximumFractionDigits: 0 }),
    decimal: new Intl.NumberFormat(userLocale, { maximumFractionDigits: 2 })
  }), [userLocale]);

  // Detect locale-specific separators
  const separators = useMemo(() => {
    const testNumber = 1234.56;
    const formatted = new Intl.NumberFormat(userLocale).format(testNumber);

    // Find thousands separator (between 1 and 2)
    const thousandsSep = formatted.charAt(1);

    // Find decimal separator (between 4 and 5)
    const decimalSep = formatted.charAt(formatted.length - 3);

    return {
      thousands: thousandsSep === '1' ? '' : thousandsSep, // No separator if directly adjacent
      decimal: decimalSep
    };
  }, [userLocale]);

  // Locale-aware parser for InputNumber
  const parseLocaleNumber = useCallback((value: string | undefined): number => {
    if (!value) return 0;

    // Remove thousands separators and replace decimal separator with dot
    let cleaned = value.toString();

    // Remove all thousands separators
    if (separators.thousands) {
      cleaned = cleaned.replace(new RegExp(`\\${separators.thousands}`, 'g'), '');
    }

    // Replace locale decimal separator with dot
    if (separators.decimal !== '.') {
      cleaned = cleaned.replace(separators.decimal, '.');
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, [separators]);

  const formatOutput = useCallback((output: Output, value: any) => {
    if (output.formatString && typeof value === 'number') {
      const formatStr = output.formatString.trim();

      // Handle percentage
      if (formatStr.includes('%')) {
        const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
        const formattedNum = new Intl.NumberFormat(userLocale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(value);
        return `${formattedNum}%`;
      }

      // Handle date
      if (formatStr.toLowerCase() === 'date') {
        return new Date(value).toLocaleDateString(userLocale);
      }

      // Parse format string
      const prefixMatch = formatStr.match(/^([^#0,.\s]+)/);
      const suffixMatch = formatStr.match(/([^#0,.\s]+)$/);
      const decimalMatch = formatStr.match(/\.0+/);
      const hasThousands = formatStr.includes(',');

      const decimals = decimalMatch ? decimalMatch[0].length - 1 : 0;
      const prefix = prefixMatch ? prefixMatch[1] : '';
      const suffix = suffixMatch && !prefixMatch ? suffixMatch[1] : '';

      const formattedNum = new Intl.NumberFormat(userLocale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: hasThousands
      }).format(value);

      return `${prefix}${formattedNum}${suffix}`;
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? formatters.integer.format(value) : formatters.decimal.format(value);
    }

    return value;
  }, [formatters, userLocale]);

  const handleSubmit = async (values: any) => {
    const startTime = Date.now();

    if (process.env.NODE_ENV === 'development') {
      console.log('[Web App] Input definitions:', serviceData.inputs.map(i => ({
        name: i.name,
        alias: i.alias,
        type: i.type,
        mandatory: i.mandatory,
        defaultValue: i.defaultValue,
        value: i.value,
        visible: isInputVisible(i.name)
      })));
      console.log('[Web App] Output definitions:', serviceData.outputs.map(o => ({
        name: o.name,
        alias: o.alias,
        type: o.type,
        visible: isOutputVisible(o.name)
      })));
    }

    // Start with visible field values
    const allValues = { ...values };

    // Add hidden fields that should be sent to the API
    // Note: Hidden fields should use their initial values (from form initialization)
    serviceData.inputs.forEach(input => {
      const fieldKey = input.alias || input.name;
      const isMandatory = input.mandatory !== false;
      const hasValue = input.value !== undefined && input.value !== null;
      const hasDefaultValue = input.defaultValue !== undefined && input.defaultValue !== null;
      const isBoolean = input.type === 'boolean'; // Booleans always have a default (false)
      const isVisible = isInputVisible(input.name);

      // If field is hidden and (mandatory OR has value OR has default OR is boolean), include it
      if (!isVisible && (isMandatory || hasValue || hasDefaultValue || isBoolean)) {
        // Only add if not already in values (visible fields take precedence)
        if (allValues[fieldKey] === undefined) {
          allValues[fieldKey] = initialValues[fieldKey];
        }
      }
    });

    // Store the values being used for calculation
    setLastCalculatedValues({ ...allValues });

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setExecuting(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      Object.entries(allValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/v1/services/${serviceId}/execute?${params.toString()}`, {
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Execution failed');
        } catch {
          throw new Error(errorText || 'Execution failed');
        }
      }

      const data = await response.json();

      // Convert outputs array to object
      const resultsObj: Record<string, any> = {};
      if (data.outputs && Array.isArray(data.outputs)) {
        data.outputs.forEach((output: any) => {
          if (output.name && output.value !== undefined) {
            resultsObj[output.name] = output.value;
          }
        });
      }

      setResults(resultsObj);
      setExecutionTime(data.metadata?.executionTime || Date.now() - startTime);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || t('executionFailed'));
      setResults(null);
    } finally {
      setExecuting(false);
      abortControllerRef.current = null;
    }
  };

  // Smart step size calculator - aims for ~2-5% steps
  const getSmartStep = (value: number | undefined, min: number | undefined, max: number | undefined) => {
    // Convert to numbers in case they're strings
    const minNum = min !== undefined ? Number(min) : undefined;
    const maxNum = max !== undefined ? Number(max) : undefined;
    const valueNum = value !== undefined ? Number(value) : undefined;

    // If we have a range, use 1% of the range (max 100 steps)
    if (minNum !== undefined && maxNum !== undefined && !isNaN(minNum) && !isNaN(maxNum)) {
      const range = maxNum - minNum;
      const step = range / 100;

      // For small ranges (like 0-1 for percentages), use decimal steps even if min/max are integers
      if (range <= 10) {
        return Math.max(step, 0.01);
      }

      if (Number.isInteger(minNum) && Number.isInteger(maxNum)) {
        // For integer ranges, round to nice numbers
        const intStep = Math.floor(step);
        if (intStep >= 10) return Math.round(intStep / 10) * 10; // Round to nearest 10
        if (intStep >= 5) return 5;
        return Math.max(intStep, 1);
      }

      return Math.max(step, 0.01);
    }

    // No range defined - use percentage of current value
    const currentValue = (valueNum !== undefined && !isNaN(valueNum)) ? valueNum : 0;
    const absValue = Math.abs(currentValue);

    // For very small values, use fixed small steps
    if (absValue < 1) return 0.1;
    if (absValue < 10) return 1;

    // For larger values, use ~2-5% of the value, rounded to nice numbers
    if (Number.isInteger(currentValue) || absValue >= 10) {
      // Aim for 2-5% step size, rounded to nice numbers
      if (absValue < 100) return 1;        // 20 → step 1 (5%)
      if (absValue < 500) return 10;       // 200 → step 10 (5%)
      if (absValue < 1000) return 25;      // 500 → step 25 (5%)
      if (absValue < 5000) return 100;     // 2000 → step 100 (5%)
      if (absValue < 10000) return 250;    // 5000 → step 250 (5%)
      if (absValue < 100000) return 1000;  // 50000 → step 1000 (2%)
      return Math.round(absValue / 50);    // Large values: ~2% step
    }

    // For decimals, use appropriate decimal steps
    if (absValue < 100) return 1;
    if (absValue < 1000) return 10;
    return 100;
  };

  const renderInputControl = useCallback((input: Input) => {
    const fieldName = input.alias || input.name;

    const label = (
      <div>
        <div style={{ fontWeight: 400, marginBottom: 2, fontSize: 13, color: '#666' }}>
          {input.title || input.name}
          {!input.mandatory && <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>({t('optional')})</Text>}
        </div>
        {input.description && (
          <div style={{ fontSize: 11, color: '#999', fontWeight: 400, marginBottom: 4 }}>
            {input.description}
          </div>
        )}
      </div>
    );

    // If input has allowedValues, render a dropdown
    if (input.allowedValues && input.allowedValues.length > 0) {
      return (
        <Form.Item
          key={fieldName}
          name={fieldName}
          label={label}
          rules={[{ required: input.mandatory !== false, message: `${t('pleaseSelect')} ${input.title || input.name}` }]}
          style={{ marginBottom: 12 }}
        >
          <Select
            placeholder={`${t('select')} ${input.title || input.name}`}
            size="middle"
            showSearch
            optionFilterProp="children"
            filterOption={(inputValue, option) =>
              (option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
            }
            options={input.allowedValues.map(value => ({
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
        // Use a custom component to synchronize both controls
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
                    const num = typeof val === 'number' ? val : parseFloat(val);
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
            rules={[{ required: input.mandatory !== false, message: `${t('pleaseEnter')} ${input.title || input.name}` }]}
            style={{ marginBottom: 12 }}
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
          rules={[{ required: input.mandatory !== false, message: `${t('pleaseEnter')} ${input.title || input.name}` }]}
          style={{ marginBottom: 12 }}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={minValue}
            max={maxValue}
            step={getSmartStep(input.value, minValue, maxValue)}
            placeholder={`${t('enter')} ${input.title || input.name}`}
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
              {!input.mandatory && <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>({t('optional')})</Text>}
            </div>
            {input.description && (
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
          style={{ marginBottom: 12 }}
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
        rules={[{ required: input.mandatory !== false, message: `${t('pleaseEnter')} ${input.title || input.name}` }]}
        style={{ marginBottom: 12 }}
      >
        <Input
          placeholder={`${t('enter')} ${input.title || input.name}`}
          size="middle"
        />
      </Form.Item>
    );
  }, [formatters, t]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Card
          style={{
            marginTop: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Title level={2} style={{ marginBottom: 24 }}>
            {serviceData.name}
          </Title>

          {error && (
            <Alert
              message={t('error')}
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={initialValues}
            size="middle"
          >
            {/* Non-boolean inputs (text, number, select, slider) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0 16px'
            }}>
              {serviceData.inputs
                .filter(input => isInputVisible(input.name))
                .filter(input => input.type !== 'boolean')
                .map((input) => renderInputControl(input))}
            </div>

            {/* Boolean inputs (switches) - separate grid to ensure they start on new row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0 16px'
            }}>
              {serviceData.inputs
                .filter(input => isInputVisible(input.name))
                .filter(input => input.type === 'boolean')
                .map((input) => renderInputControl(input))}
            </div>

            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={executing}
                icon={<PlayCircleOutlined />}
                block
                size="large"
                style={{
                  backgroundColor: '#4F2D7F',
                  borderColor: '#4F2D7F',
                  height: 48,
                  fontSize: 15,
                  fontWeight: 600
                }}
              >
                {executing ? t('calculating') : t('calculateResults')}
              </Button>
            </Form.Item>
          </Form>

          {results && (
            <>
              {resultsAreStale && (
                <Alert
                  message={t('staleWarning')}
                  type="warning"
                  showIcon={false}
                  style={{ marginTop: 24 }}
                />
              )}
              <div style={{ marginTop: resultsAreStale ? 16 : 32 }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  {t('results')}
                </Title>
                <div style={{
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  opacity: executing ? 0.5 : (resultsAreStale ? 0.4 : 1),
                  transition: 'opacity 0.3s ease',
                  position: 'relative'
                }}>
                  {serviceData.outputs
                    .filter(output => isOutputVisible(output.name))
                    .map((output, index, filteredArray) => {
                      const value = results[output.name];
                      if (value === undefined || value === null) return null;

                      return (
                        <div
                          key={output.name}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: index < filteredArray.length - 1 ? '1px solid #e8e8e8' : 'none'
                          }}
                        >
                          <Text style={{ fontSize: 14 }}>
                            {output.title || output.name}:
                          </Text>
                          <Text strong style={{
                            fontSize: 16,
                            color: '#4F2D7F'
                          }}>
                            {formatOutput(output, value)}
                          </Text>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div style={{
                marginTop: 24,
                color: '#999',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                {executionTime && (
                  <>
                    <span>{executionTime}ms</span>
                    <span>•</span>
                  </>
                )}
                <a
                  href="https://spreadapi.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4F2D7F', textDecoration: 'none' }}
                >
                  {t('spreadapi')}
                </a>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
