'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import '@/styles/listcard.css';
import './main.css'; // Critical CSS for preventing layout shifts
import { Layout, Button, Input, Space, Popconfirm, App, Breadcrumb, Typography, Segmented, Dropdown } from 'antd';
import { MenuOutlined, PlusOutlined, SearchOutlined, InboxOutlined, AppstoreOutlined, AppstoreAddOutlined, TableOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { SIZES, TRANSITIONS, COLORS } from '@/constants/theme';
import Sidebar from '@/components/Sidebar';
import ServiceList from '@/components/ServiceList';
import dynamic from 'next/dynamic';

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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Mark when we're on the client
  useEffect(() => {
    setIsClient(true);
    // Load saved view mode
    const savedViewMode = localStorage.getItem('serviceViewMode');
    if (savedViewMode === 'table' || savedViewMode === 'card') {
      setViewMode(savedViewMode);
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
        console.log('[HomePage] Generated service ID from drag & drop:', newId);
        router.push(`/service/${newId}?fileDropped=true`);
      } catch (error) {
        console.error('Error processing dropped file:', error);
        messageApi.error('Fehler beim Verarbeiten der Datei');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 auto' }}>
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
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Check authentication
                  if (!isAuthenticated) {
                    router.push('/login?returnTo=/');
                    return;
                  }

                  // Generate a new service ID and navigate
                  const newId = generateServiceId(user?.id || 'test1234');
                  console.log('[HomePage Button] Generated service ID:', newId);
                  router.push(`/service/${newId}`);
                }}
                className="new-list-button"
              >
                <span className="desktop-text">New Service</span>
                <span className="mobile-text">New</span>
              </Button>
              
              {/* User Menu - Only for authenticated users */}
              {isAuthenticated && (
                <Dropdown
                  menu={{
                    items: [
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
                    ],
                  }}
                  placement="bottomRight"
                >
                  <Button type="text" icon={<UserOutlined />} />
                </Dropdown>
              )}
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
              <ServiceList searchQuery={searchQuery} viewMode={viewMode} isAuthenticated={isAuthenticated} userId={user?.id} />
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
                    <span style={{ fontSize: '12px' }}>💡</span>
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
  );
});

export default ListsPage;