'use client';

import React from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  InfoCircleOutlined,
  ApiOutlined,
  MessageOutlined
} from '@ant-design/icons';

export type AgentsMenuSection =
  | 'ai-info'
  | 'chat-test'
  | 'mcp';

interface AgentsNavigationMenuProps {
  selectedKey: AgentsMenuSection;
  onSelect: (key: AgentsMenuSection) => void;
}

const AgentsNavigationMenu: React.FC<AgentsNavigationMenuProps> = ({
  selectedKey,
  onSelect
}) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'ai-info',
      icon: <InfoCircleOutlined />,
      label: 'AI Assistant Info'
    },
    {
      key: 'chat-test',
      icon: <MessageOutlined />,
      label: 'Chat Testing'
    },
    {
      key: 'mcp',
      icon: <ApiOutlined />,
      label: 'MCP Integration'
    }
  ];

  return (
    <>
      <style jsx global>{`
        .agents-navigation-menu .ant-menu-item-selected {
          background-color: #f0f0f0 !important;
        }
        .agents-navigation-menu .ant-menu-item-selected:hover {
          background-color: #e8e8e8 !important;
        }
      `}</style>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        className="agents-navigation-menu"
        style={{
          width: 220,
          height: '100%',
          borderRight: '1px solid #f0f0f0',
          marginTop: 10,
          paddingRight: 10
        }}
        items={menuItems}
        onClick={({ key }) => onSelect(key as AgentsMenuSection)}
      />
    </>
  );
};

export default AgentsNavigationMenu;
