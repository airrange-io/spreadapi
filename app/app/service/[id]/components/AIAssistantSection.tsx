'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Space, Input, Select } from 'antd';

// Debounced Input component
interface DebouncedInputProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  delay?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({
  defaultValue = '',
  onChange,
  placeholder,
  disabled,
  delay = 500
}) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

// Debounced TextArea component
interface DebouncedTextAreaProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  delay?: number;
}

const DebouncedTextArea: React.FC<DebouncedTextAreaProps> = ({
  defaultValue = '',
  onChange,
  placeholder,
  rows,
  disabled,
  delay = 500
}) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Input.TextArea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  );
};

interface AIAssistantSectionProps {
  aiDescription: string;
  aiUsageGuidance?: string;
  aiUsageExamples: string[];
  aiTags: string[];
  category: string;
  isLoading?: boolean;
  onAiDescriptionChange: (value: string) => void;
  onAiUsageGuidanceChange: (value: string) => void;
  onAiUsageExamplesChange: (values: string[]) => void;
  onAiTagsChange: (values: string[]) => void;
  onCategoryChange: (value: string) => void;
}

const AIAssistantSection: React.FC<AIAssistantSectionProps> = ({
  aiDescription,
  aiUsageGuidance,
  aiUsageExamples,
  aiTags,
  category,
  isLoading = false,
  onAiDescriptionChange,
  onAiUsageGuidanceChange,
  onAiUsageExamplesChange,
  onAiTagsChange,
  onCategoryChange,
}) => {
  return (
    <div style={{ padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            AI Description
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Detailed explanation for AI assistants about what this service does and when to use it
          </div>
          <DebouncedTextArea
            placeholder="e.g., This service calculates mortgage payments based on loan amount, interest rate, and term..."
            defaultValue={aiDescription}
            onChange={onAiDescriptionChange}
            rows={4}
            disabled={isLoading}
            delay={500}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Usage Guidance
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            When should AI use this service?
          </div>
          <DebouncedTextArea
            placeholder="e.g., Use when user wants to calculate mortgage payments or compare loan terms"
            defaultValue={aiUsageGuidance || ''}
            onChange={onAiUsageGuidanceChange}
            rows={3}
            disabled={isLoading}
            delay={500}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Usage Examples
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Add example questions or use cases (press Enter to add)
          </div>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="e.g., What's my monthly payment for a $300k loan at 4%?"
            value={aiUsageExamples}
            onChange={onAiUsageExamplesChange}
            tokenSeparators={[',']}
            disabled={isLoading}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Tags
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Searchable keywords for AI discovery
          </div>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="e.g., finance, mortgage, loan, calculator"
            value={aiTags}
            onChange={onAiTagsChange}
            tokenSeparators={[',']}
            disabled={isLoading}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Category
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Main category for this service
          </div>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a category"
            value={category}
            onChange={onCategoryChange}
            disabled={isLoading}
          >
            <Select.Option value="finance">Finance</Select.Option>
            <Select.Option value="math">Mathematics</Select.Option>
            <Select.Option value="statistics">Statistics</Select.Option>
            <Select.Option value="business">Business</Select.Option>
            <Select.Option value="science">Science</Select.Option>
            <Select.Option value="engineering">Engineering</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </div>
      </Space>
    </div>
  );
};

export default AIAssistantSection;
