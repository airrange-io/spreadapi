'use client';

import React from 'react';
import { Drawer } from 'antd';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { SidebarContent } from './SidebarContent';
import { SIZES } from '@/constants/theme';

const Sidebar: React.FC = observer(() => {
  const appStore = useAppStore();
  const { sidebarCollapsed } = appStore;

  // Always use Drawer for all screen sizes
  return (
    <Drawer
      placement="left"
      open={!sidebarCollapsed}
      onClose={appStore.toggleSidebar}
      width={SIZES.sidebarWidth}
      styles={{ body: { padding: 0 }, header: { display: 'none' } }}
      style={{ zIndex: 100 }}
    >
      <SidebarContent isMobile={true} />
    </Drawer>
  );
});

export default Sidebar;