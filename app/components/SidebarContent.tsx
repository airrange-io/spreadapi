'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button, Typography, Tooltip, App, Dropdown, Popconfirm, Space } from 'antd';
import { PlusOutlined, MenuOutlined, DownOutlined, LoadingOutlined, ShareAltOutlined, AppstoreOutlined, DeleteOutlined, TableOutlined, LeftOutlined, UserOutlined, ApiOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { appStore } from '@/stores/AppStore';
import { runInAction } from 'mobx';
import { useIsClient } from '@/shared/hooks/useIsClient';
import { COLORS, TRANSITIONS } from '@/constants/theme';
import type { MenuProps } from 'antd';

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
  const { activeList, sidebarCollapsed, loading } = appStore;
  const isClient = useIsClient();
  const isCollapsed = sidebarCollapsed && !isMobile;


  const handleUserMenuClick = useCallback(async (info: { key: string }) => {
    switch (info.key) {
      case 'manage-account':
        appStore.setShowProfileModal(true);
        break;
      case 'mcp-settings':
        router.push('/settings/mcp');
        break;
      case 'login':
      case 'register':
        // Both login and register use the same modal/component since Hanko handles both
        appStore.setShowRegisterModal(true);
        break;
      case 'signout':
        try {
          console.log('🔄 Starting logout process...');

          // Use the Hanko logout approach from documentation
          const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL;

          if (hankoApi) {
            // Import Hanko
            // const { Hanko } = await import('@teamhanko/hanko-elements');
            // const hanko = new Hanko(hankoApi);

            // console.log('📤 Calling hanko.user.logout()...');
            // // Trigger logout
            // await hanko.user.logout();
            // console.log('✅ Hanko logout completed');

            // // Clear any stored data thoroughly
            // if (typeof window !== 'undefined') {
            //   // Clear Hanko-specific storage
            //   const storageKeys = Object.keys(localStorage);
            //   storageKeys.forEach(key => {
            //     if (key.includes('hanko') || key.includes('auth') || key.includes('token')) {
            //       localStorage.removeItem(key);
            //     }
            //   });

            //   // Clear session storage
            //   sessionStorage.clear();

            //   // Clear any cookies that might contain session data
            //   document.cookie.split(";").forEach(function (c) {
            //     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            //   });
            // }

          } else {
            console.error('❌ Hanko API URL not found');
          }

          // Update app state after Hanko logout
          console.log('🔄 Updating app state...');
          appStore.setUserRegistered(false);

          // Set a flag to prevent automatic re-authentication on next load
          if (typeof window !== 'undefined') {
            localStorage.setItem('logout_performed', 'true');
          }

          // Wait a bit for state to propagate
          await new Promise(resolve => setTimeout(resolve, 100));

          console.log('🏠 Redirecting to home page...');
          // Force a full page reload to clear any remaining session state
          window.location.replace('/');

        } catch (error) {
          console.error('❌ Logout failed:', error);
          // Fallback: force logout anyway
          appStore.setUserRegistered(false);
          // Wait before redirect to ensure state update
          setTimeout(() => {
            window.location.replace('/');
          }, 100);
        }
        break;
    }
  }, []);

  const userMenuItems: MenuProps['items'] = useMemo(() => appStore.authChecked && appStore.user.isRegistered ? [
    {
      key: 'manage-account',
      label: <span style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', minWidth: '120px', display: 'block' }}>Manage Account</span>,
      icon: <UserOutlined />
    },
    {
      key: 'mcp-settings',
      label: <span style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', minWidth: '120px', display: 'block' }}>MCP Settings</span>,
      icon: <ApiOutlined />
    },
    {
      key: 'signout',
      label: <span style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', minWidth: '120px', display: 'block' }}>Sign Out</span>,
      icon: <LogoutOutlined />
    },
  ] : [
    {
      key: 'login',
      label: <span style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', minWidth: '120px', display: 'block' }}>Login</span>,
      icon: <LoginOutlined />
    },
    {
      key: 'register',
      label: <span style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', minWidth: '120px', display: 'block' }}>Register</span>,
      icon: <UserAddOutlined />
    },
  ], [appStore.authChecked, appStore.user.isRegistered]);

  const handleListClick = useCallback((listId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!listId || listId === 'undefined') {
      return;
    }

    // Request navigation with guard check
    appStore.requestNavigation(() => {
      appStore.setActiveList(listId);
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
      await appStore.deleteList(listId);
      messageApi.success(`Liste "${listName}" wurde gelöscht`);

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
              onClick={() => {
                if (!appStore.user.isRegistered) {
                  appStore.setShowRegisterModal(true);
                  return;
                }
                // Navigate to new list creation page
                router.push('/new-list');
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
            onClick={() => {
              if (!appStore.user.isRegistered) {
                appStore.setShowRegisterModal(true);
                return;
              }
              // Navigate to new list creation page
              router.push('/new-list');
            }}
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
            }}
          >
            New API
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
            <Space direction="vertical" style={{ width: '100%', padding: 10, marginTop: 100 }}>
              <Link href="/api-tester">API Service Tester</Link>
              <Link href="/api/cache-stats">Cache Statistics</Link>
              <Link href="/api/diagnose-cache">Cache Diagnostics</Link>
            </Space>
          </div>
        )}
      </div>


      {/* User Area */}
      <div style={{
        padding: isCollapsed ? '8px 6px' : '16px',
        borderTop: `1px solid ${COLORS.border}`,
        height: isCollapsed ? '48px' : '80px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>

        {isCollapsed ? (
          <div style={{ position: 'relative' }}>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              trigger={['click']}
              placement="topRight"
              dropdownRender={(menu) => (
                <div style={{ minWidth: '160px', maxWidth: '200px', width: 'auto' }}>
                  {menu}
                </div>
              )}
              overlayClassName="sidebar-user-dropdown"
              getPopupContainer={() => document.body}
            >
              <Tooltip
                title={appStore.user.isRegistered && appStore.user.email ? appStore.user.email : ''}
                placement="right"
              >
                <div
                  className="user-avatar-trigger"
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: COLORS.userAvatar,
                    borderRadius: '50%',
                    margin: '0 auto',
                    fontSize: '14px',
                  }}
                >
                  <Text style={{ fontWeight: 600, fontSize: '14px' }}>
                    {appStore.user.isRegistered ? (appStore.user.name?.[0]?.toUpperCase() || 'U') : '?'}
                  </Text>
                </div>
              </Tooltip>
            </Dropdown>
          </div>
        ) : (
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            trigger={['click']}
            placement="topLeft"
            getPopupContainer={() => document.body}
          >
            <Button
              type="text"
              style={{
                width: '100%',
                height: 'auto',
                padding: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tooltip
                  title={appStore.user.isRegistered && appStore.user.email ? appStore.user.email : ''}
                  placement="top"
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: COLORS.userAvatar,
                      borderRadius: '50%',
                      fontSize: '14px',
                    }}
                  >
                    <Text style={{ fontWeight: 600, fontSize: '14px' }}>
                      {appStore.user.isRegistered ? (appStore.user.name?.[0]?.toUpperCase() || 'U') : '?'}
                    </Text>
                  </div>
                </Tooltip>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>
                    {appStore.user.isRegistered ? appStore.user.name : 'Anonymous User'}
                  </div>
                  <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                    {appStore.user.isRegistered ? appStore.user.plan : 'Register for sharing'}
                  </div>
                </div>
              </div>
              <DownOutlined style={{ fontSize: '12px' }} />
            </Button>
          </Dropdown>
        )}
      </div>
    </div>
  );
});