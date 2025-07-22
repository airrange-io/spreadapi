'use client';

import React from 'react';
import { Button, Space, Typography, Upload } from 'antd';
import { FileAddOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface EmptyWorkbookStateProps {
  onStartFromScratch: () => void;
  onImportFile: (file: File) => void;
  isLoading?: boolean;
}

const EmptyWorkbookState: React.FC<EmptyWorkbookStateProps> = ({ 
  onStartFromScratch, 
  onImportFile,
  isLoading = false 
}) => {
  const handleUpload = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx', '.xls'
    ];
    
    const isValidType = validTypes.some(type => 
      file.type === type || file.name.endsWith(type)
    );
    
    if (!isValidType) {
      return false;
    }
    
    onImportFile(file);
    return false; // Prevent default upload behavior
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      // backgroundColor: '#fafafa',
      padding: 40
    }}>
      <div style={{
        maxWidth: 500,
        width: '100%',
        textAlign: 'center'
      }}>
        <Title level={3} style={{ 
          fontWeight: 400,
          color: '#262626',
          marginBottom: 8
        }}>
          Create Your Service
        </Title>
        
        <Text style={{ 
          fontSize: 16,
          color: '#8c8c8c',
          display: 'block',
          marginBottom: 48
        }}>
          Choose how you'd like to begin
        </Text>

        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            // icon={<FileAddOutlined />}
            onClick={onStartFromScratch}
            loading={isLoading}
            style={{
              width: '100%',
              height: 56,
              fontSize: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          >
            Create a new spreadsheet
          </Button>

          <div style={{
            position: 'relative',
            margin: '24px 0',
            textAlign: 'center'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: 1,
              backgroundColor: '#e8e8e8'
            }} />
            <Text style={{
              position: 'relative',
              backgroundColor: '#fafafa',
              padding: '0 16px',
              color: '#bfbfbf',
              fontSize: 14
            }}>
              or
            </Text>
          </div>

          <Upload.Dragger
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={handleUpload}
            disabled={isLoading}
            style={{
              border: '2px dashed #d9d9d9',
              borderRadius: 8,
              backgroundColor: '#fff',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ padding: '24px 0' }}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ 
                  fontSize: 48,
                  color: '#1890ff'
                }} />
              </p>
              <p style={{ 
                fontSize: 16,
                color: '#262626',
                marginBottom: 4,
                fontWeight: 500
              }}>
                Import existing spreadsheet
              </p>
              <p style={{ 
                fontSize: 14,
                color: '#8c8c8c',
                margin: 0
              }}>
                Drop an Excel file here or click to browse
              </p>
            </div>
          </Upload.Dragger>
        </Space>

        <Text style={{
          fontSize: 12,
          color: '#bfbfbf',
          marginTop: 40,
          display: 'block'
        }}>
          Supported formats: .xlsx, .xls
        </Text>
      </div>
    </div>
  );
};

export default EmptyWorkbookState;