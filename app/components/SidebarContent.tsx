'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button, Typography, Tooltip, App, Dropdown, Popconfirm } from 'antd';
import { PlusOutlined, MenuOutlined, LoadingOutlined, AppstoreOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { appStore } from '@/stores/AppStore';
import { runInAction } from 'mobx';
import { useIsClient } from '@/shared/hooks/useIsClient';
import { COLORS, TRANSITIONS } from '@/constants/theme';
import { generateServiceId } from '@/lib/generateServiceId';
import { useAuth } from '@/components/auth/AuthContext';

const { Text } = Typography;

interface SidebarContentProps {
  isMobile: boolean;
}

// Extended interface for lists with sharing information
interface ListWithSharing {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  itemCount?: number;
  // Sharing properties
  isShared?: boolean;
  isOwner?: boolean;
  permission?: 'read' | 'write' | 'admin';
  sharedBy?: string;
  collaborators?: number;
}

export const SidebarContent: React.FC<SidebarContentProps> = observer(({ isMobile }) => {
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();
  const { sidebarCollapsed, loading } = appStore;
  const isClient = useIsClient();
  const isCollapsed = sidebarCollapsed && !isMobile;


  const handleListClick = useCallback((listId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!listId || listId === 'undefined') {
      return;
    }

    // Request navigation with guard check
    appStore.requestNavigation(() => {
      // appStore.setActiveList(listId);
      router.push(`/list/${listId}`);
      if (isMobile) {
        appStore.toggleSidebar();
      }
    });
  }, [isMobile, router]);

  const handleSearchClick = () => {
    // Request navigation with guard check
    appStore.requestNavigation(() => {
      runInAction(() => {
        // appStore.setActiveList(null);
        appStore.setSwitchingView(true);
      });
      router.push('/');
      if (isMobile) {
        appStore.toggleSidebar();
      }
    });
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!isCollapsed) return;

    // Check if the click was on an interactive element
    const target = e.target as HTMLElement;

    // Don't expand sidebar if clicking on interactive elements or dropdown menu items
    const isInteractiveElement = target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('.ant-dropdown-trigger') ||
      target.closest('.ant-dropdown') ||
      target.closest('.ant-dropdown-menu') ||
      target.closest('.ant-dropdown-menu-item') ||
      target.closest('.user-avatar-trigger') ||
      target.tagName === 'BUTTON';

    // Check if any dropdown is currently visible
    const isDropdownVisible = document.querySelector('.ant-dropdown:not(.ant-dropdown-hidden)');

    // If there's a dropdown visible, don't expand sidebar regardless of where clicked
    if (isDropdownVisible || isInteractiveElement) {
      return;
    }

    appStore.toggleSidebar();
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    try {
      // await appStore.deleteList(listId);
      messageApi.error('Delete functionality not yet implemented');

      // If we were viewing this list, navigate away
      // if (appStore.activeList === listId) {
      //   router.push('/');
      // }
    } catch (error) {
      messageApi.error('Fehler beim Löschen der Liste');
    }
  };

  const getListMenuItems = (list: any): MenuProps['items'] => [
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title="Liste löschen"
          description={(
            <>
              Möchten Sie die Liste "{list.name}" wirklich löschen?
              <br />
              Diese Aktion kann nicht rückgängig gemacht werden.
            </>
          )}
          onConfirm={(e) => {
            e?.stopPropagation();
            handleDeleteList(list.id, list.name);
          }}
          onCancel={(e) => {
            e?.stopPropagation();
          }}
          okText="Ja, löschen"
          cancelText="Abbrechen"
          okButtonProps={{ danger: true }}
        >
          <div onClick={(e) => e.stopPropagation()}>Liste löschen</div>
        </Popconfirm>
      ),
      danger: true,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: COLORS.background,
        cursor: isCollapsed ? 'pointer' : 'default',
        overflow: 'hidden',
        width: '100%'
      }}
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div style={{
        padding: isCollapsed ? '10px 8px' : '10px 16px',
        marginTop: 2,
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'space-between' : (isCollapsed ? 'center' : 'flex-start'),
        minHeight: '44px',
        height: '55px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {isMobile ? (
          <>
            <Text strong style={{ fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Spreadsheet APIs</Text>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '16px', color: "#4F2D7F" }} />}
              onClick={appStore.toggleSidebar}
              style={{ width: '32px', height: '32px', minWidth: '32px' }}
            />
          </>
        ) : isCollapsed ? (
          <Tooltip title="Show APIs" placement="right">
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '16px', color: "#4F2D7F" }} />}
              onClick={appStore.toggleSidebar}
              size="small"
              style={{ width: '32px', height: '32px' }}
            />
          </Tooltip>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', width: '100%' }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '16px', color: "#4F2D7F" }} />}
              onClick={appStore.toggleSidebar}
              style={{ width: '32px', height: '32px', minWidth: '32px', flexShrink: 0 }}
            />
            <Text strong style={{ fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>Spreadsheet APIs</Text>
            <Tooltip title="Sidebar einklappen" placement="top">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={appStore.toggleSidebar}
                size="small"
                style={{
                  width: '32px',
                  height: '32px',
                  minWidth: '32px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {/* New List Button */}
      <div style={{
        padding: isCollapsed ? '8px 8px' : '16px',
        display: isCollapsed ? 'flex' : 'block',
        justifyContent: isCollapsed ? 'center' : 'normal',
        overflow: 'hidden',
        height: isCollapsed ? '48px' : '72px',
        boxSizing: 'border-box'
      }}>
        {isCollapsed ? (
          <Tooltip title="Neue Liste" placement="right">
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                // Registration check disabled for development
                // if (!appStore.user.isRegistered) {
                //   appStore.setShowRegisterModal(true);
                //   return;
                // }
                // Generate a new service ID and navigate
                const newId = generateServiceId(user?.id || 'test1234');
                console.log('[SidebarContent] Generated service ID:', newId);
                router.push(`/service/${newId}`);
              }}
              size="small"
              style={{
                backgroundColor: COLORS.primary,
                borderColor: COLORS.primary,
                width: '32px',
                height: '32px',
                minWidth: '32px',
                margin: '0 auto',
              }}
            />
          </Tooltip>
        ) : (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // Registration check disabled for development
              // if (!appStore.user.isRegistered) {
              //   appStore.setShowRegisterModal(true);
              //   return;
              // }
              // Generate a new service ID and navigate
              const newId = generateServiceId(user?.id || 'test1234');
              console.log('[SidebarContent] Generated service ID:', newId);
              router.push(`/service/${newId}`);
            }}
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
            }}
          >
            New Service
          </Button>
        )}
      </div>

      {/* Search Button */}
      <div style={{
        height: isCollapsed ? '0' : '56px',
        opacity: isCollapsed ? 0 : 1,
        transition: 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease',
        overflow: 'hidden'
      }}>
        {!isCollapsed && (
          <div style={{ padding: '0 16px 16px' }}>
            <Button
              style={{ width: '100%' }}
              onClick={handleSearchClick}
            >
              All APIs
            </Button>
          </div>
        )}
      </div>

      {/* List Items */}
      <div style={{ flex: 1, overflow: 'auto', padding: isCollapsed ? '8px' : '0 8px' }}>
        {isCollapsed ? (
          <div>
            {/* Lists button in collapsed mode */}
            <Tooltip title="Show APIs" placement="right">
              <Button
                type="text"
                icon={<AppstoreOutlined style={{ fontSize: '20px', color: "#8c8c8c" }} />}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  border: '1px solid transparent',
                  transition: TRANSITIONS.default,
                  padding: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearchClick();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.activeBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              />
            </Tooltip>
          </div>
        ) : loading && appStore.list.length === 0 && isClient ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '200px'
          }}>
            <LoadingOutlined style={{ fontSize: '24px', color: COLORS.primary }} />
          </div>
        ) : (
          <div>
          </div>
        )}
      </div>


    </div>
  );
});