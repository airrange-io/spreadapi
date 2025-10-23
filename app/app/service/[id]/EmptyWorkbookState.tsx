'use client';

import React from 'react';
import { Button, Space, Typography, Upload } from 'antd';
import { FileAddOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface EmptyWorkbookStateProps {
  onStartFromScratch: () => void;
  onImportFile: (file: File) => void;
  onImportServicePackage?: (file: File) => void;
  isLoading?: boolean;
}

const EmptyWorkbookState: React.FC<EmptyWorkbookStateProps> = ({
  onStartFromScratch,
  onImportFile,
  onImportServicePackage,
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
      padding: 40
    }}>
      <div style={{
        maxWidth: 500,
        width: '100%',
        textAlign: 'center'
      }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Button
            type="default"
            size="large"
            // icon={<FileAddOutlined />}
            onClick={onStartFromScratch}
            loading={isLoading}
            style={{
              width: '100%',
              height: '25vh',
              minHeight: 160,
              fontSize: 16,
              fontWeight: 500,
              borderRadius: 8,
              // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
              transition: 'all 0.3s',
              height: '25vh',
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ padding: '0' }}>
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
                Import an existing spreadsheet
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

        {onImportServicePackage && (
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Button
              type="link"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    onImportServicePackage(file);
                  }
                };
                input.click();
              }}
              style={{ padding: 0, height: 'auto', fontSize: 12, color: '#502D80' }}
            >
              Import an existing Service Package
            </Button>
            <Text style={{
              fontSize: 12,
              color: '#bfbfbf',
              marginLeft: 8
            }}>
              (.json)
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyWorkbookState;