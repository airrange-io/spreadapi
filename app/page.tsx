'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import '@/styles/listcard.css';
import './main.css'; // Critical CSS for preventing layout shifts
import { Layout, Button, Input, App, Breadcrumb, Typography, Segmented, Dropdown, Avatar } from 'antd';
import { MenuOutlined, PlusOutlined, SearchOutlined, InboxOutlined, AppstoreOutlined, AppstoreAddOutlined, TableOutlined, UserOutlined, LogoutOutlined, SettingOutlined, LoadingOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { SIZES, TRANSITIONS, COLORS } from '@/constants/theme';
import dynamic from 'next/dynamic';
import ServiceListSkeleton from '@/components/ServiceListSkeleton';

// Dynamically import heavy components
const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => null
});

const ServiceList = dynamic(() => import('@/components/ServiceList'), {
  ssr: true
});
import { IntercomProvider } from './components/IntercomProvider';
import { IntercomScript } from './components/IntercomScript';

// Lazy load the MCP Settings Modal
const MCPSettingsModal = dynamic(() => import('@/components/MCPSettingsModal'), {
  ssr: false,
  loading: () => null
});
import type { MenuProps } from 'antd';
import { generateServiceId } from '@/lib/generateServiceId';
import { useAuth } from '@/components/auth/AuthContext';

const { Content } = Layout;
const { Text } = Typography;

const ListsPage: React.FC = observer(() => {
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const appStore = useAppStore();
  const { user, isAuthenticated: authIsAuthenticated, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isContentScrollable, setIsContentScrollable] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [showMCPModal, setShowMCPModal] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);

  // Mark when we're on the client
  useEffect(() => {
    setIsClient(true);
    // Load saved view mode only once on client
    const savedViewMode = localStorage.getItem('serviceViewMode');
    if (savedViewMode === 'table' || savedViewMode === 'card') {
      setViewMode(savedViewMode);
    } else {
      // If no saved preference, save the default
      localStorage.setItem('serviceViewMode', 'card');
    }
  }, []);

  // Update authentication status when auth context changes
  useEffect(() => {
    // Only update if auth is not loading
    if (!authLoading) {
      setIsAuthenticated(authIsAuthenticated);
    }
  }, [authIsAuthenticated, authLoading]);

  // Share notifications are handled by a separate component to prevent re-renders

  useEffect(() => {

    // Initialize client without blocking UI
    // This checks auth and loads lists in the background
    appStore.initializeClient();
  }, [appStore]);

  // Debug auth state (only when auth becomes ready)
  useEffect(() => {
    if (appStore.authChecked) {
    }
  }, [appStore.authChecked, appStore.user.isRegistered]);

  // Search for public lists when query changes
  const handleHomeClick = () => {
    router.push('/');
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragging files
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const firstItem = e.dataTransfer.items[0];
      if (firstItem.kind === 'file') {
        setIsDragging(true);
        e.dataTransfer.dropEffect = 'copy';
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isDragging to false if we're leaving the main container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Check authentication
    if (!isAuthenticated) {
      messageApi.warning('Please sign in to create a new service');
      router.push('/login?returnTo=/');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const fileName = file.name.toLowerCase();

    // Check if file type is allowed
    const isCSV = fileName.endsWith('.csv');
    const isJSON = fileName.endsWith('.json');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isJSON && !isExcel) {
      messageApi.error('Bitte wählen Sie eine CSV, Excel oder JSON Datei aus');
      return;
    }

    // Determine file type for the wizard
    let fileType = 'csv';
    if (isExcel) fileType = 'excel';
    else if (isJSON) fileType = 'json';

    // Store the file data in sessionStorage to pass to the wizard
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        // Create a simple preview data structure
        const previewData = {
          file,
          fileType,
          timestamp: Date.now()
        };

        // Store in sessionStorage
        sessionStorage.setItem('draggedFileData', JSON.stringify({
          fileName: file.name,
          fileType,
          fileSize: file.size,
          timestamp: previewData.timestamp
        }));

        // Store the actual file in a way we can retrieve it
        // We'll use a global variable temporarily
        (window as any).__draggedFile = file;

        // Generate a new service ID and navigate with file flag
        const newId = generateServiceId(user?.id || 'test1234');
        router.push(`/service/${newId}?fileDropped=true`);
      } catch (error) {
        messageApi.error('Fehler beim Verarbeiten der Datei');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <IntercomProvider>
      <Layout style={{ height: '100vh' }}>
        <Sidebar />

        <Layout
          style={{
            marginLeft: 0, // No margin needed since sidebar is now a drawer overlay
            transition: TRANSITIONS.default,
            position: 'relative'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Content style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Drag and drop overlay */}
            {isDragging && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(79, 45, 127, 0.1)',
                  border: '3px dashed #4F2D7F',
                  borderRadius: '8px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <InboxOutlined style={{ fontSize: '64px', color: '#4F2D7F', marginBottom: '16px' }} />
                <Text style={{ fontSize: '20px', color: '#4F2D7F', fontWeight: 500 }}>
                  Datei hier ablegen
                </Text>
                <Text style={{ fontSize: '16px', color: '#6B4A99', marginTop: '8px' }}>
                  CSV, Excel oder JSON
                </Text>
              </div>
            )}
            {/* Header */}
            <div className="lists-page-header">
              {/* Left side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto' }}>
                <Button
                  type='text'
                  icon={<MenuOutlined />}
                  onClick={appStore.toggleSidebar}
                />
                {/* Breadcrumb */}
                <div className="desktop-only">
                  <Breadcrumb
                    items={[{
                      title: <span style={{ marginLeft: 0 }}>Spreadsheet APIs</span>,
                    }]}
                  />
                </div>
              </div>

              {/* Right side - Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 0 }}>
                {/* MCP Settings Button - Only for authenticated users */}
                {isAuthenticated && (
                  <Button
                    variant='filled'
                    color="default"
                    icon={<AppstoreOutlined />}
                    onClick={() => setShowMCPModal(true)}
                    title="MCP Integration"
                  >
                    <span className="desktop-text">MCP</span>
                  </Button>
                )}

                {/* New Service Button */}
                <Button
                  type="primary"
                  icon={isCreatingService ? <LoadingOutlined /> : <PlusOutlined />}
                  loading={isCreatingService}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Check authentication
                    if (!isAuthenticated) {
                      router.push('/login?returnTo=/');
                      return;
                    }

                    // Set loading state
                    setIsCreatingService(true);

                    // Generate a new service ID and navigate
                    const newId = generateServiceId(user?.id || 'test1234');
                    router.push(`/service/${newId}`);
                  }}
                  className="new-list-button"
                >
                  <span className="desktop-text">New Service</span>
                  <span className="mobile-text">New</span>
                </Button>

                {/* User Menu - Always visible */}
                <Dropdown
                  menu={{
                    items: isAuthenticated ? [
                      {
                        key: 'profile',
                        icon: <SettingOutlined />,
                        label: 'Profile Settings',
                        onClick: () => router.push('/profile'),
                      },
                      { type: 'divider' },
                      {
                        key: 'logout',
                        icon: <LogoutOutlined />,
                        label: 'Logout',
                        onClick: async () => {
                          document.cookie = 'hanko=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                          router.push('/');
                          setIsAuthenticated(false);
                        },
                      },
                    ] : [
                      {
                        key: 'login',
                        label: 'Login',
                        onClick: () => router.push('/login'),
                      },
                    ],
                  }}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    style={{ padding: 4 }}
                    icon={
                      isAuthenticated && user?.email ? (
                        <Avatar
                          style={{
                            backgroundColor: '#4F2D7F',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          size={32}
                        >
                          {user.email.charAt(0).toUpperCase()}
                        </Avatar>
                      ) : (
                        <Avatar
                          style={{
                            backgroundColor: '#f0f0f0',
                            color: '#999',
                            cursor: 'pointer'
                          }}
                          size={32}
                          icon={<UserOutlined />}
                        />
                      )
                    }
                  />
                </Dropdown>
              </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, background: '#fdfdfd', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Page Title and Search */}
              <div style={{ width: '100%' }}>

                {/* Search Bar and View Toggle */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                  <Input
                    placeholder="Search Service APIs..."
                    disabled={appStore.loading}
                    prefix={<SearchOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    size="large"
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    className="search-input"
                  />
                  <Segmented
                    options={[
                      { label: <AppstoreAddOutlined />, value: 'card' },
                      { label: <TableOutlined />, value: 'table' }
                    ]}
                    value={viewMode}
                    onChange={(value) => {
                      setViewMode(value as 'card' | 'table');
                      localStorage.setItem('serviceViewMode', value);
                    }}
                  />
                </div>
                {/* Service List */}
                {isClient ? (
                  <ServiceList searchQuery={searchQuery} viewMode={viewMode} isAuthenticated={isAuthenticated} userId={user?.id} />
                ) : (
                  <ServiceListSkeleton viewMode={viewMode} />
                )}
                {/* New here? Link - show for users with less than 5 lists */}
                {!searchQuery && appStore.list.length < 5 && (
                  <div style={{
                    position: isContentScrollable ? 'relative' : 'fixed',
                    bottom: isContentScrollable ? 'auto' : '80px',
                    left: isContentScrollable ? 'auto' : '50%',
                    transform: isContentScrollable ? 'none' : 'translateX(-50%)',
                    textAlign: 'center',
                    marginTop: isContentScrollable ? '32px' : '0',
                    paddingBottom: isContentScrollable ? '16px' : '0',
                    width: isContentScrollable ? 'auto' : '100%',
                  }}>
                    <a
                      href="/product"
                      style={{
                        fontSize: '14px',
                        color: '#8c8c8c',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#4F2D7F';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#8c8c8c';
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <path d="M12 2C10.0222 2 8.08879 2.58649 6.4443 3.6853C4.79981 4.78412 3.51809 6.3459 2.76121 8.17317C2.00433 10.0004 1.8063 12.0111 2.19215 13.9509C2.578 15.8907 3.53041 17.6725 4.92894 19.0711C6.32746 20.4696 8.10929 21.422 10.0491 21.8079C11.9889 22.1937 13.9996 21.9957 15.8268 21.2388C17.6541 20.4819 19.2159 19.2002 20.3147 17.5557C21.4135 15.9112 22 13.9778 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7363 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.76121C14.6136 2.25866 13.3132 2 12 2ZM12 20C10.4178 20 8.87104 19.5308 7.55544 18.6518C6.23985 17.7727 5.21447 16.5233 4.60897 15.0615C4.00347 13.5997 3.84504 11.9911 4.15372 10.4393C4.4624 8.88743 5.22433 7.46197 6.34315 6.34315C7.46197 5.22433 8.88743 4.4624 10.4393 4.15372C11.9911 3.84504 13.5997 4.00346 15.0615 4.60896C16.5233 5.21447 17.7727 6.23984 18.6518 7.55544C19.5308 8.87103 20 10.4177 20 12C20 14.1217 19.1572 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20ZM9 12H10V17H14V16H11V12H9ZM12 8C11.7348 8 11.4804 8.10536 11.2929 8.29289C11.1054 8.48043 11 8.73478 11 9C11 9.26522 11.1054 9.51957 11.2929 9.70711C11.4804 9.89464 11.7348 10 12 10C12.2652 10 12.5196 9.89464 12.7071 9.70711C12.8946 9.51957 13 9.26522 13 9C13 8.73478 12.8946 8.48043 12.7071 8.29289C12.5196 8.10536 12.2652 8 12 8Z" fill="currentColor" />
                      </svg>
                      <span>Neu hier? So funktioniert SpreadAPI</span>
                    </a>
                  </div>
                )}

              </div>

            </div>
          </Content>
        </Layout>

        {/* MCP Settings Modal */}
        <MCPSettingsModal
          visible={showMCPModal}
          onClose={() => setShowMCPModal(false)}
        />
      </Layout>
      <IntercomScript />
    </IntercomProvider>
  );
});

export default ListsPage;