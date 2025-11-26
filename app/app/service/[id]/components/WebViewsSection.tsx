'use client';

import React, { useState, useEffect } from 'react';
import { Space, Button, Card, Typography, Tag, Tooltip, Alert, Empty } from 'antd';
import { PlusOutlined, EyeOutlined, CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import CollapsibleSection from './CollapsibleSection';

const { Text, Paragraph } = Typography;

// Default view templates
export const DEFAULT_TEMPLATES = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple output display',
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  {{#outputs}}
  <div style="margin-bottom: 12px;">
    <strong>{{title}}:</strong> {{value}}
  </div>
  {{/outputs}}
</div>`,
    isDefault: true
  },
  card: {
    id: 'card',
    name: 'Card',
    description: 'Card-style layout with header',
    html: `<div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 18px;">{{serviceName}}</h2>
  </div>
  <div style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    {{#outputs}}
    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
      <span style="color: #666;">{{title}}</span>
      <strong>{{value}}</strong>
    </div>
    {{/outputs}}
  </div>
</div>`,
    isDefault: true
  },
  table: {
    id: 'table',
    name: 'Table',
    description: 'Traditional table format',
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">Parameter</th>
        <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">Value</th>
      </tr>
    </thead>
    <tbody>
      {{#outputs}}
      <tr>
        <td style="padding: 12px; border: 1px solid #e0e0e0;">{{title}}</td>
        <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>{{value}}</strong></td>
      </tr>
      {{/outputs}}
    </tbody>
  </table>
</div>`,
    isDefault: true
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient horizontal layout',
    html: `<div style="font-family: Arial, sans-serif; padding: 16px; background: #f9f9f9; border-radius: 6px;">
  {{#outputs}}
  <span style="display: inline-block; margin-right: 20px; margin-bottom: 8px;">
    <span style="color: #888; font-size: 12px;">{{title}}:</span>
    <strong style="margin-left: 4px;">{{value}}</strong>
  </span>
  {{/outputs}}
</div>`,
    isDefault: true
  },
  detailed: {
    id: 'detailed',
    name: 'Detailed',
    description: 'Full information with descriptions',
    html: `<div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px;">
  <h3 style="margin-top: 0; color: #333;">Results</h3>
  {{#outputs}}
  <div style="background: white; padding: 16px; margin-bottom: 12px; border-left: 4px solid #667eea; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="font-size: 14px; color: #888; margin-bottom: 4px;">{{title}}</div>
    <div style="font-size: 24px; font-weight: bold; color: #333;">{{value}}</div>
    {{#description}}
    <div style="font-size: 12px; color: #666; margin-top: 8px;">{{description}}</div>
    {{/description}}
  </div>
  {{/outputs}}
</div>`,
    isDefault: true
  }
};

interface WebView {
  id: string;
  name: string;
  description: string;
  html: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WebViewsSectionProps {
  serviceId: string;
  serviceName?: string;
  inputs?: any[];
  requireToken?: boolean;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  onConfigChange?: (updates: any) => void;
}

const WebViewsSection: React.FC<WebViewsSectionProps> = ({
  serviceId,
  serviceName,
  inputs = [],
  requireToken = false,
  isLoading = false,
  hasUnsavedChanges = false,
  onConfigChange
}) => {
  const [views, setViews] = useState<WebView[]>([]);

  // Initialize with default templates
  useEffect(() => {
    const defaultViews = Object.values(DEFAULT_TEMPLATES);
    setViews(defaultViews);
  }, []);

  // Build query string with default values
  const getDefaultQueryString = () => {
    const params = new URLSearchParams();

    // Add input parameters
    inputs.forEach(input => {
      if (input.value !== undefined && input.value !== null && input.value !== '') {
        params.append(input.name, String(input.value));
      }
    });

    // Add token placeholder if required
    if (requireToken) {
      params.append('token', 'YOUR_TOKEN_HERE');
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  // Generate embed URL for a view
  const getEmbedUrl = (viewId: string) => {
    const baseUrl = `https://spreadapi.io/app/v1/services/${serviceId}/view/${viewId}`;
    const queryString = getDefaultQueryString();
    return baseUrl + queryString;
  };

  // Generate iframe code
  const getIframeCode = (viewId: string) => {
    const url = getEmbedUrl(viewId);
    return `<iframe src="${url}" width="100%" height="300" frameborder="0"></iframe>`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <CollapsibleSection title="Create Web Views for Your API" defaultOpen={false}>
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        {/* Description */}
        <Alert
          message="Embeddable Result Views"
          description={
            <>
              Create customizable HTML views that display API results. Perfect for embedding in websites, blogs, and documentation.
              {requireToken && (
                <>
                  <br /><br />
                  <strong>⚠️ Authentication Required:</strong> This service requires a token. Replace <Text code>YOUR_TOKEN_HERE</Text> in the embed URL with your actual API token.
                </>
              )}
            </>
          }
          type="info"
          showIcon
        />

        {/* Create Custom View Button */}
        <div>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
            disabled
          >
            Create Custom View (Coming Soon)
          </Button>
        </div>

        {/* Views List */}
        {views.length === 0 ? (
          <Empty description="No views created yet" />
        ) : (
          <Space orientation="vertical" style={{ width: '100%' }} size={12}>
            {views.map((view) => (
              <Card
                key={view.id}
                size="small"
                title={
                  <Space>
                    <Text strong>{view.name}</Text>
                    {view.isDefault && <Tag color="blue">Default</Tag>}
                  </Space>
                }
                extra={
                  <Space>
                    <Tooltip title="Preview">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        disabled
                      />
                    </Tooltip>
                    <Tooltip title="Duplicate & Customize">
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        size="small"
                        disabled
                      />
                    </Tooltip>
                    {!view.isDefault && (
                      <>
                        <Tooltip title="Edit">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            disabled
                          />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            disabled
                          />
                        </Tooltip>
                      </>
                    )}
                  </Space>
                }
              >
                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {view.description}
                  </Text>

                  {/* Embed URL */}
                  <div>
                    <Text strong style={{ fontSize: 11, color: '#888' }}>
                      Embed URL:
                    </Text>
                    {requireToken && (
                      <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <Text type="warning" style={{ fontSize: 11 }}>
                          ⚠️ Remember to replace YOUR_TOKEN_HERE with your actual token
                        </Text>
                      </div>
                    )}
                    <div style={{
                      background: '#f5f5f5',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}>
                      <Text
                        copyable={{ text: getEmbedUrl(view.id) }}
                        style={{ fontSize: 11 }}
                      >
                        {getEmbedUrl(view.id)}
                      </Text>
                    </div>
                  </div>

                  {/* iFrame Code */}
                  <div>
                    <Text strong style={{ fontSize: 11, color: '#888' }}>iFrame Code:</Text>
                    <div style={{
                      background: '#f5f5f5',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}>
                      <Text
                        copyable={{ text: getIframeCode(view.id) }}
                        code
                        style={{ fontSize: 11 }}
                      >
                        {getIframeCode(view.id)}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        )}

        {/* Help Text */}
        <Alert
          message="How to Use"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                1. Choose a template or create a custom view<br />
                2. Copy the iFrame code<br />
                3. Paste it into your website, blog, or documentation<br />
                4. Add your API parameters to the URL
              </p>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Example: <Text code style={{ fontSize: 11 }}>?revenue=1000&costs=500&token=xxx</Text>
              </Text>
            </div>
          }
          type="success"
          showIcon
        />
      </Space>
    </CollapsibleSection>
  );
};

export default WebViewsSection;
