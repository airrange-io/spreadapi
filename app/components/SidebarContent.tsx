'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button, Typography, Tooltip, App, Dropdown, Popconfirm, Divider } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, MenuOutlined, LoadingOutlined, AppstoreOutlined, DeleteOutlined, LeftOutlined, InfoCircleOutlined, RocketOutlined, RobotOutlined, ReadOutlined, DollarOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { appStore } from '@/stores/AppStore';
import { runInAction } from 'mobx';
import { useIsClient } from '@/shared/hooks/useIsClient';
import { useTranslation } from '@/lib/i18n';
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
  const { notification } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();
  const { sidebarCollapsed, loading } = appStore;
  const isClient = useIsClient();
  const { t, locale } = useTranslation();
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
      router.push('/app');
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
      notification.error({ message: t('sidebar.deleteNotImplemented') });

      // If we were viewing this list, navigate away
      // if (appStore.activeList === listId) {
      //   router.push('/');
      // }
    } catch (error) {
      notification.error({ message: t('sidebar.errorDeleting') });
    }
  };

  const getListMenuItems = (list: any): MenuProps['items'] => [
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title={t('sidebar.deleteList')}
          description={({ en: (<>Are you sure you want to delete &quot;{list.name}&quot;?<br />This action cannot be undone.</>), de: (<>Sind Sie sicher, dass Sie &quot;{list.name}&quot; löschen möchten?<br />Dies kann nicht rückgängig gemacht werden.</>) } as Record<string, React.ReactNode>)[locale] ?? (<>Are you sure you want to delete &quot;{list.name}&quot;?<br />This action cannot be undone.</>)}
          onConfirm={(e) => {
            e?.stopPropagation();
            handleDeleteList(list.id, list.name);
          }}
          onCancel={(e) => {
            e?.stopPropagation();
          }}
          okText={t('sidebar.yesDelete')}
          cancelText={t('common.cancel')}
          okButtonProps={{ danger: true }}
        >
          <div onClick={(e) => e.stopPropagation()}>{t('sidebar.deleteList')}</div>
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
            <Text strong style={{ fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('sidebar.spreadsheetApis')}</Text>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '16px', color: "#4F2D7F" }} />}
              onClick={appStore.toggleSidebar}
              style={{ width: '32px', height: '32px', minWidth: '32px' }}
            />
          </>
        ) : isCollapsed ? (
          <Tooltip title={t('sidebar.showApis')} placement="right">
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
            <Text strong style={{ fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{t('sidebar.spreadsheetApis')}</Text>
            <Tooltip title={t('sidebar.collapseSidebar')} placement="top">
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
          <Tooltip title={t('sidebar.newService')} placement="right">
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
                const newId = generateServiceId(user?.id);
                console.log('[SidebarContent] Generated service ID:', newId);
                router.push(`/app/service/${newId}`);
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
              const newId = generateServiceId(user?.id);
              console.log('[SidebarContent] Generated service ID:', newId);
              router.push(`/app/service/${newId}`);
            }}
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
            }}
          >
            {t('sidebar.newService')}
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
              {t('sidebar.allApis')}
            </Button>
          </div>
        )}
      </div>

      {/* List Items */}
      <div style={{ flex: 1, overflow: 'auto', padding: isCollapsed ? '8px' : '0 8px' }}>
        {isCollapsed ? (
          <div>
            {/* Lists button in collapsed mode */}
            <Tooltip title={t('sidebar.showApis')} placement="right">
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

      {/* Bottom Links Section */}
      <div style={{
        padding: isCollapsed ? '8px' : '16px',
        marginTop: 'auto'
      }}>
        <Divider style={{ margin: isCollapsed ? '8px 0' : '0 0 16px 0' }} />
        {isCollapsed ? (
          <>
            <Tooltip title={t('sidebar.product')} placement="right">
              <Link href="/">
                <Button
                  type="text"
                  icon={<RocketOutlined style={{ fontSize: '18px' }} />}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      appStore.toggleSidebar();
                    }
                  }}
                />
              </Link>
            </Tooltip>
            <Tooltip title={t('sidebar.howItWorks')} placement="right">
              <Link href="/how-excel-api-works">
                <Button
                  type="text"
                  icon={<InfoCircleOutlined style={{ fontSize: '18px' }} />}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      appStore.toggleSidebar();
                    }
                  }}
                />
              </Link>
            </Tooltip>
            <Tooltip title={t('sidebar.aiIntegration')} placement="right">
              <Link href="/excel-ai-integration">
                <Button
                  type="text"
                  icon={<RobotOutlined style={{ fontSize: '18px' }} />}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      appStore.toggleSidebar();
                    }
                  }}
                />
              </Link>
            </Tooltip>
            <Tooltip title="Blog" placement="right">
              <Link href="/blog">
                <Button
                  type="text"
                  icon={<ReadOutlined style={{ fontSize: '18px' }} />}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      appStore.toggleSidebar();
                    }
                  }}
                />
              </Link>
            </Tooltip>
            <Tooltip title={t('sidebar.pricing')} placement="right">
              <Link href="/pricing">
                <Button
                  type="text"
                  icon={<DollarOutlined style={{ fontSize: '18px' }} />}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      appStore.toggleSidebar();
                    }
                  }}
                />
              </Link>
            </Tooltip>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                type="text"
                icon={<RocketOutlined />}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingLeft: '12px',
                  height: '36px'
                }}
                onClick={() => {
                  if (isMobile) {
                    appStore.toggleSidebar();
                  }
                }}
              >
                {t('sidebar.product')}
              </Button>
            </Link>
            <Link href="/how-excel-api-works" style={{ textDecoration: 'none' }}>
              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingLeft: '12px',
                  height: '36px'
                }}
                onClick={() => {
                  if (isMobile) {
                    appStore.toggleSidebar();
                  }
                }}
              >
                {t('sidebar.howItWorks')}
              </Button>
            </Link>
            <Link href="/excel-ai-integration" style={{ textDecoration: 'none' }}>
              <Button
                type="text"
                icon={<RobotOutlined />}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingLeft: '12px',
                  height: '36px'
                }}
                onClick={() => {
                  if (isMobile) {
                    appStore.toggleSidebar();
                  }
                }}
              >
                {t('sidebar.aiIntegration')}
              </Button>
            </Link>
            <Link href="/blog" style={{ textDecoration: 'none' }}>
              <Button
                type="text"
                icon={<ReadOutlined />}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingLeft: '12px',
                  height: '36px'
                }}
                onClick={() => {
                  if (isMobile) {
                    appStore.toggleSidebar();
                  }
                }}
              >
                Blog
              </Button>
            </Link>
            <Link href="/pricing" style={{ textDecoration: 'none' }}>
              <Button
                type="text"
                icon={<DollarOutlined />}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingLeft: '12px',
                  height: '36px'
                }}
                onClick={() => {
                  if (isMobile) {
                    appStore.toggleSidebar();
                  }
                }}
              >
                {t('sidebar.pricing')}
              </Button>
            </Link>
          </div>
        )}
      </div>


    </div>
  );
});