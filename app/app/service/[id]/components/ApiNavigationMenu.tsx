'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  ApiOutlined,
  KeyOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  CodeOutlined
} from '@ant-design/icons';

export type ApiMenuSection =
  | 'test'
  | 'tokens'
  | 'webhooks'
  | 'docs-interactive'
  | 'docs-quickstart'
  | 'docs-errors'
  | 'example-curl'
  | 'example-javascript'
  | 'example-python'
  | 'example-nodejs'
  | 'example-php'
  | 'example-excel'
  | 'example-googlesheets'
  | 'example-postman'
  | 'example-standalone';

interface ApiNavigationMenuProps {
  selectedKey: ApiMenuSection;
  onSelect: (key: ApiMenuSection) => void;
}

const ApiNavigationMenu: React.FC<ApiNavigationMenuProps> = ({
  selectedKey,
  onSelect
}) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const menuItems: MenuProps['items'] = [
    {
      key: 'test',
      icon: <ApiOutlined />,
      label: 'API Testing'
    },
    {
      key: 'tokens',
      icon: <KeyOutlined />,
      label: 'API Tokens'
    },
    {
      key: 'webhooks',
      icon: <CloudUploadOutlined />,
      label: 'Webhooks'
    },
    {
      key: 'docs-folder',
      icon: <FileTextOutlined />,
      label: 'Documentation',
      children: [
        { key: 'docs-interactive', label: 'Interactive Docs' },
        { key: 'docs-quickstart', label: 'Quick Start' },
        { key: 'docs-errors', label: 'Error Codes' }
      ]
    },
    {
      key: 'examples-folder',
      icon: <CodeOutlined />,
      label: 'Code Examples',
      children: [
        { key: 'example-curl', label: 'cURL' },
        { key: 'example-javascript', label: 'JavaScript' },
        { key: 'example-python', label: 'Python' },
        { key: 'example-nodejs', label: 'Node.js' },
        { key: 'example-php', label: 'PHP' },
        { key: 'example-excel', label: 'Excel' },
        { key: 'example-googlesheets', label: 'Google Sheets' },
        { key: 'example-postman', label: 'Postman' },
        { key: 'example-standalone', label: 'HTML UI' }
      ]
    }
  ];

  return (
    <>
      <style jsx global>{`
        .api-navigation-menu .ant-menu-item-selected {
          background-color: #f0f0f0 !important;
        }
        .api-navigation-menu .ant-menu-item-selected:hover {
          background-color: #e8e8e8 !important;
        }
      `}</style>
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={[]}
        className="api-navigation-menu"
        style={{
          width: collapsed ? 80 : 220,
          height: '100%',
          borderRight: '1px solid #f0f0f0',
          paddingTop: 10,
          paddingRight: collapsed ? 2 : 10,
          transition: 'width 0.2s'
        }}
        items={menuItems}
        onClick={({ key }) => onSelect(key as ApiMenuSection)}
      />
    </>
  );
};

export default ApiNavigationMenu;
