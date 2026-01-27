'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  InfoCircleOutlined,
  ApiOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
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
      key: 'ai-info',
      icon: <InfoCircleOutlined />,
      label: t('agentsNav.aiInfo')
    },
    {
      key: 'chat-test',
      icon: <MessageOutlined />,
      label: t('agentsNav.chatTesting')
    },
    {
      key: 'mcp',
      icon: <ApiOutlined />,
      label: t('agentsNav.mcpIntegration')
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
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        className="agents-navigation-menu"
        style={{
          width: collapsed ? 80 : 200,
          height: '100%',
          borderRight: '1px solid #f0f0f0',
          paddingTop: 10,
          paddingRight: collapsed ? 2 : 10,
          transition: 'width 0.2s'
        }}
        items={menuItems}
        onClick={({ key }) => onSelect(key as AgentsMenuSection)}
      />
    </>
  );
};

export default AgentsNavigationMenu;
