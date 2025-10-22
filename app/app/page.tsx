'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import '@/styles/listcard.css';
import '../main.css'; // Critical CSS for preventing layout shifts
import { Layout, Button, Input, App, Breadcrumb, Typography, Segmented, Dropdown, Avatar, Tour } from 'antd';
import { MenuOutlined, PlusOutlined, SearchOutlined, InboxOutlined, AppstoreOutlined, AppstoreAddOutlined, TableOutlined, UserOutlined, LogoutOutlined, SettingOutlined, LoadingOutlined, MessageOutlined } from '@ant-design/icons';
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

// Lazy load Intercom components
const IntercomProvider = dynamic(() => import('../components/IntercomProvider').then(mod => ({ default: mod.IntercomProvider })), {
  ssr: false
});

const IntercomScript = dynamic(() => import('../components/IntercomScript').then(mod => ({ default: mod.IntercomScript })), {
  ssr: false
});

// Lazy load the MCP Settings Modal
const MCPSettingsModal = dynamic(() => import('@/components/MCPSettingsModal'), {
  ssr: false,
  loading: () => null
});


import type { MenuProps } from 'antd';
import { generateServiceId } from '@/lib/generateServiceId';
import { useAuth } from '@/components/auth/AuthContext';
import { useTour } from '@/hooks/useTour';
import { appTour } from '@/tours/appTour';

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
  const [isCreatingService, setIsCreatingService] = useState(false);

  // Tour refs
  const demoServicesRef = useRef<HTMLDivElement>(null);
  const newServiceButtonRef = useRef<HTMLButtonElement>(null);
  const mcpButtonRef = useRef<HTMLButtonElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize tour with refs
  const tourSteps = useMemo(() => [
    {
      ...appTour.steps[0],
      target: () => demoServicesRef.current,
    },
    {
      ...appTour.steps[1],
      target: () => newServiceButtonRef.current,
    },
    {
      ...appTour.steps[2],
      target: () => mcpButtonRef.current,
    },
    {
      ...appTour.steps[3],
      target: () => chatButtonRef.current,
    },
  ], []);

  const tour = useTour(
    { ...appTour, steps: tourSteps },
    { autoStart: true, delay: 1500 } // Start tour after 1.5s delay
  );

  // Mark when we're on the client
  useEffect(() => {
    setIsClient(true);
    // Load saved view mode only once on client
    const savedViewMode = localStorage.getItem('serviceViewMode');
    if (savedViewMode === 'table' || savedViewMode === 'card') {
      setViewMode(savedViewMode);
    } else {
      // If no saved preference, save the default
      localStorage.setItem('serviceViewMode', 'table');
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

  // Memoized handlers
  const handleHomeClick = useCallback(() => {
    router.push('/app');
  }, [router]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
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
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isDragging to false if we're leaving the main container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Check authentication
    if (!isAuthenticated) {
      messageApi.warning('Please sign in to create a new service');
      router.push('/login?returnTo=/app');
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
      messageApi.error('Please select a CSV, Excel or JSON file');
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

        // Generate a new service ID
        const newId = generateServiceId(user?.id);
        
        // Generate automatic name based on file name
        const date = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const baseFileName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
        const automaticName = `${baseFileName} - ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

        // Create the service in the backend first
        const createResponse = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: newId,
            name: automaticName,
            description: `Imported from ${file.name}`
          })
        });

        if (createResponse.ok || createResponse.status === 409) {
          // Service created or already exists, navigate with file flag
          router.push(`/app/service/${newId}?fileDropped=true`);
        } else {
          // Handle error
          const errorData = await createResponse.json().catch(() => ({}));
          console.error('Failed to create service:', errorData);
          messageApi.error('Failed to create service. Please try again.');
          delete (window as any).__draggedFile; // Clean up the global variable
        }
      } catch (error) {
        console.error('Error processing file:', error);
        messageApi.error('Error processing the file. Please try again.');
        delete (window as any).__draggedFile; // Clean up the global variable
      }
    };

    reader.readAsArrayBuffer(file);
  }, [isAuthenticated, messageApi, router, user?.id]);

  // Memoized dropdown menu items
  const dropdownMenuItems = useMemo(() => {
    if (isAuthenticated) {
      return [
        {
          key: 'profile',
          icon: <SettingOutlined />,
          label: 'Profile Settings',
          onClick: () => router.push('/app/profile'),
        },
        { type: 'divider' as const },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: async () => {
            document.cookie = 'hanko=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            router.push('/app');
            setIsAuthenticated(false);
          },
        },
      ];
    }
    return [
      {
        key: 'login',
        label: 'Login',
        onClick: () => router.push('/login'),
      },
    ];
  }, [isAuthenticated, router, setIsAuthenticated]);

  // Memoized new service handler
  const handleNewService = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
    if (!isAuthenticated) {
      router.push('/login?returnTo=/app');
      return;
    }

    // Set loading state
    setIsCreatingService(true);

    // Generate a new service ID
    const newId = generateServiceId(user?.id);
    
    // Generate automatic name for new service
    const date = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const automaticName = `Service ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    try {
      // Create the service in the backend first
      const createResponse = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newId,
          name: automaticName,
          description: ''
        })
      });

      if (createResponse.ok) {
        // Service created successfully, navigate to it
        router.push(`/app/service/${newId}`);
      } else if (createResponse.status === 409) {
        // Service already exists (unlikely but possible), navigate anyway
        router.push(`/app/service/${newId}`);
      } else {
        // Handle other errors
        const errorData = await createResponse.json().catch(() => ({}));
        console.error('Failed to create service:', errorData);
        messageApi.error('Failed to create service. Please try again.');
        setIsCreatingService(false);
      }
    } catch (error) {
      console.error('Error creating service:', error);
      messageApi.error('Failed to create service. Please try again.');
      setIsCreatingService(false);
    }
  }, [isAuthenticated, router, user?.id, messageApi]);

  // Memoized styles
  const dragOverlayStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 45, 127, 0.1)',
    border: '2px dashed #4F2D7F',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none' as const
  }), []);

  const dragOverlayContentStyle = useMemo(() => ({
    background: 'white',
    padding: '24px 48px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }), []);

  return (
    <>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
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
          <Content style={{ background: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drag and drop overlay */}
            {isDragging && (
              <div style={dragOverlayStyle}>
                <div style={dragOverlayContentStyle}>
                  <InboxOutlined style={{ fontSize: 48, color: '#4F2D7F', marginBottom: 16, display: 'block' }} />
                  <Typography.Title level={4} style={{ margin: 0, color: '#4F2D7F' }}>
                    Drop your Excel, CSV or JSON file here
                  </Typography.Title>
                </div>
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
                {/* Chat Button */}
                <Button
                  ref={chatButtonRef}
                  variant='filled'
                  color="default"
                  icon={<MessageOutlined />}
                  onClick={() => router.push('/app/chat')}
                  title="Chat with services"
                >
                  <span className="desktop-text">Chat</span>
                </Button>

                {/* MCP Settings Button */}
                <Button
                  ref={mcpButtonRef}
                  variant='filled'
                  color="default"
                  icon={<AppstoreOutlined />}
                  onClick={() => setShowMCPModal(true)}
                  title="MCP Integration"
                >
                  <span className="desktop-text">MCP</span>
                </Button>

                {/* New Service Button */}
                <Button
                  ref={newServiceButtonRef}
                  type="primary"
                  icon={isCreatingService ? <LoadingOutlined /> : <PlusOutlined />}
                  loading={isCreatingService}
                  onClick={handleNewService}
                  className="new-list-button"
                >
                  <span className="desktop-text">New Service</span>
                  <span className="mobile-text">New</span>
                </Button>

                {/* User Menu - Always visible */}
                <Dropdown
                  menu={{ items: dropdownMenuItems }}
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
            <div style={{ flex: 1, background: '#fdfdfd', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
                <div ref={demoServicesRef}>
                  {isClient ? (
                    <ServiceList searchQuery={searchQuery} viewMode={viewMode} isAuthenticated={isAuthenticated} userId={user?.id} />
                  ) : (
                    <ServiceListSkeleton viewMode={viewMode} />
                  )}
                </div>
                {/* New here? Cards - show for users with less than 5 lists */}
                {!searchQuery && appStore.list.length < 5 && (
                  <div style={{
                    position: isContentScrollable ? 'relative' : 'fixed',
                    bottom: isContentScrollable ? 'auto' : '40px',
                    left: isContentScrollable ? 'auto' : '50%',
                    transform: isContentScrollable ? 'none' : 'translateX(-50%)',
                    textAlign: 'center',
                    marginTop: isContentScrollable ? '48px' : '0',
                    paddingBottom: isContentScrollable ? '24px' : '0',
                    width: isContentScrollable ? 'auto' : '100%',
                    maxWidth: '600px',
                    transition: 'all 0.3s ease',
                    zIndex: 1
                  }}>
                    {/* <p style={{
                      color: '#8c8c8c',
                      fontSize: '14px',
                      marginBottom: '16px',
                      fontWeight: '400'
                    }}>
                      New to SpreadAPI? Get started here:
                    </p> */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {/* Overview Card */}
                      <a
                        href="/"
                        style={{
                          background: 'white',
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '16px 20px',
                          textDecoration: 'none',
                          color: '#262626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          minWidth: '140px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 45, 128, 0.15)';
                          e.currentTarget.style.borderColor = '#502D80';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
                          e.currentTarget.style.borderColor = '#e8e8e8';
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: '#f0e6ff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7V17C2 17.55 2.17 18.08 2.47 18.5L12 21L21.53 18.5C21.83 18.08 22 17.55 22 17V7L12 2ZM12 4.15L19.04 7.53L12 10.15L4.96 7.53L12 4.15ZM4 9.31L11 11.93V18.07L4 15.77V9.31ZM13 18.07V11.93L20 9.31V15.77L13 18.07Z" fill="#502D80"/>
                          </svg>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>Overview</div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>What is SpreadAPI?</div>
                        </div>
                      </a>

                      {/* How it Works Card */}
                      <a
                        href="/how-excel-api-works"
                        style={{
                          background: 'white',
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '16px 20px',
                          textDecoration: 'none',
                          color: '#262626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          minWidth: '140px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 45, 128, 0.15)';
                          e.currentTarget.style.borderColor = '#502D80';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
                          e.currentTarget.style.borderColor = '#e8e8e8';
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: '#e6f7ff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="#1890ff"/>
                            <rect x="11" y="4" width="2" height="16" rx="1" fill="#1890ff"/>
                          </svg>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>How it Works</div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>See it in action</div>
                        </div>
                      </a>

                      {/* Claude Setup Card */}
                      <a
                        href="/excel-ai-integration#quick-setup"
                        style={{
                          background: 'white',
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '16px 20px',
                          textDecoration: 'none',
                          color: '#262626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          minWidth: '140px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 45, 128, 0.15)';
                          e.currentTarget.style.borderColor = '#502D80';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
                          e.currentTarget.style.borderColor = '#e8e8e8';
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: '#fff0e6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {/* Claude Logo from the AI Integration page */}
                          <svg height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                            <title>Claude</title>
                            <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero" />
                          </svg>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>Claude Setup</div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Connect AI to Excel</div>
                        </div>
                      </a>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </Content>
        </Layout>

        {/* MCP Settings Modal */}
        {showMCPModal && (
          <MCPSettingsModal
            visible={showMCPModal}
            onClose={() => setShowMCPModal(false)}
            isAuthenticated={isAuthenticated}
          />
        )}
      </Layout>
      {isClient && (
        <>
          <IntercomProvider />
          <IntercomScript />
        </>
      )}

      {/* Welcome Tour */}
      <>
        <style jsx global>{`
          .ant-tour .ant-tour-content {
            max-width: 400px !important;
          }
        `}</style>
        <Tour
          open={tour.open}
          onClose={tour.onClose}
          steps={tour.steps}
          onChange={tour.onChange}
        />
      </>
    </>
  );
});

export default ListsPage;