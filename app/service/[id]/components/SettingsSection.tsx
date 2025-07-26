'use client';

import React from 'react';
import { Space, Input, Checkbox, Tooltip, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';

interface SettingsSectionProps {
  apiName: string;
  apiDescription: string;
  enableCaching: boolean;
  aiDescription: string;
  aiUsageExamples: string[];
  aiTags: string[];
  category: string;
  onApiNameChange: (value: string) => void;
  onApiDescriptionChange: (value: string) => void;
  onEnableCachingChange: (checked: boolean) => void;
  onAiDescriptionChange: (value: string) => void;
  onAiUsageExamplesChange: (values: string[]) => void;
  onAiTagsChange: (values: string[]) => void;
  onCategoryChange: (value: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  apiName,
  apiDescription,
  enableCaching,
  aiDescription,
  aiUsageExamples,
  aiTags,
  category,
  onApiNameChange,
  onApiDescriptionChange,
  onEnableCachingChange,
  onAiDescriptionChange,
  onAiUsageExamplesChange,
  onAiTagsChange,
  onCategoryChange,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginTop: '8px',
    }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <CollapsibleSection title="Service Info" defaultOpen={true}>
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Service Name</strong></div>
            <Input
              placeholder="Enter service name"
              value={apiName}
              onChange={(e) => onApiNameChange(e.target.value)}
            />
          </div>

          <div>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Description</strong></div>
            <Input.TextArea
              placeholder="Describe what this API does"
              value={apiDescription}
              onChange={(e) => onApiDescriptionChange(e.target.value)}
              rows={2}
            />
          </div>

          <div style={{ marginTop: '0px' }}>
            <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Advanced Options</strong></div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space align="center">
                <Checkbox
                  checked={enableCaching}
                  onChange={(e) => onEnableCachingChange(e.target.checked)}
                >
                  Enable response caching
                </Checkbox>
                <Tooltip title="Cache API responses for improved performance. Users can bypass with nocache=true parameter.">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </Space>
            </Space>
          </div>
        </Space>
      </CollapsibleSection>

      <CollapsibleSection title="AI Assistant Information" defaultOpen={false}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>AI Description</div>
              <Input.TextArea
                placeholder="Detailed explanation for AI assistants about what this service does and when to use it..."
                value={aiDescription}
                onChange={(e) => onAiDescriptionChange(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Usage Examples</div>
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Add example questions or use cases (press Enter to add)"
                value={aiUsageExamples}
                onChange={onAiUsageExamplesChange}
                tokenSeparators={[',']}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Tags</div>
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Add searchable tags (e.g., finance, mortgage, loan)"
                value={aiTags}
                onChange={onAiTagsChange}
                tokenSeparators={[',']}
              />
            </div>

            <div>
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Category</div>
              <Select
                style={{ width: '100%' }}
                placeholder="Select a category"
                value={category}
                onChange={onCategoryChange}
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
      </CollapsibleSection>
      </Space>
    </div>
  );
};

export default SettingsSection;