'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Drawer, Typography, Space, Upload, Card, message, Spin } from 'antd';
import { InboxOutlined, ArrowLeftOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { COLORS, TRANSITIONS } from '@/constants/theme';
import ConfigPanel from './ConfigPanel';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function NewApiPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [spreadInstance, setSpreadInstance] = useState<any>(null);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileUpload = (info: any) => {
    const { status } = info.file;
    
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      // TODO: Process the Excel file and initialize SpreadJS
      setSpreadsheetData(info.file);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps = {
    name: 'file',
    accept: '.xlsx,.xls,.csv',
    maxCount: 1,
    customRequest: ({ file, onSuccess }: any) => {
      // For now, just mark as success
      // TODO: Actually process the file
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    onChange: handleFileUpload,
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleSave = async () => {
    // TODO: Generate API definition and save to blob storage
    message.info('Save functionality coming soon!');
  };

  const renderSpreadsheet = () => {
    if (!spreadsheetData) {
      return (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#fafafa',
          border: '1px dashed #d9d9d9',
          borderRadius: '8px',
        }}>
          <Dragger {...uploadProps} style={{ maxWidth: 400 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: COLORS.primary }} />
            </p>
            <p className="ant-upload-text">Click or drag Excel file to this area</p>
            <p className="ant-upload-hint">
              Support for .xlsx, .xls, and .csv files
            </p>
          </Dragger>
        </div>
      );
    }

    return (
      <div style={{ height: '100%', position: 'relative' }}>
        {loading && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <Spin size="large" />
          </div>
        )}
        <div id="spreadsheet-container" style={{ width: '100%', height: '100%' }}>
          {/* SpreadJS will be mounted here */}
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f0f0f0',
          }}>
            <Text type="secondary">Spreadsheet viewer will be displayed here</Text>
          </div>
        </div>
      </div>
    );
  };

  const configPanel = <ConfigPanel spreadInstance={spreadInstance} />;

  return (
    <Layout style={{ height: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <div style={{
        height: 64,
        background: 'white',
        borderBottom: `1px solid ${COLORS.border}`,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <Space size="middle">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ fontSize: 16 }}
          >
            Back
          </Button>
          <Title level={4} style={{ margin: 0 }}>Create New API</Title>
        </Space>
        
        <Space>
          {isMobile && spreadsheetData && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => setDrawerVisible(true)}
            >
              Configure
            </Button>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!spreadsheetData}
          >
            Save API
          </Button>
        </Space>
      </div>

      {/* Main Layout */}
      <Layout>
        <Content style={{ padding: 24, overflow: 'auto' }}>
          {renderSpreadsheet()}
        </Content>

        {/* Desktop Sider */}
        {!isMobile && spreadsheetData && (
          <Sider
            width={400}
            style={{
              background: 'white',
              borderLeft: `1px solid ${COLORS.border}`,
              overflow: 'auto',
            }}
          >
            {configPanel}
          </Sider>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            title="Configure API"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width="90%"
            style={{ maxWidth: 400 }}
          >
            {configPanel}
          </Drawer>
        )}
      </Layout>
    </Layout>
  );
}