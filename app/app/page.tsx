'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import '@/styles/listcard.css';
import '../main.css'; // Critical CSS for preventing layout shifts
import { Layout, Button, Input, App, Breadcrumb, Typography, Segmented, Dropdown, Avatar, Modal, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, InboxOutlined, AppstoreAddOutlined, TableOutlined, UserOutlined, LogoutOutlined, SettingOutlined, LoadingOutlined, MessageOutlined, PlayCircleOutlined, FileExcelOutlined, ArrowRightOutlined, GlobalOutlined, CheckOutlined, CloudOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { SIZES, TRANSITIONS, COLORS } from '@/constants/theme';
import dynamic from 'next/dynamic';
import ServiceListSkeleton from '@/components/ServiceListSkeleton';
import { useTranslation } from '@/lib/i18n';
import { useEnterpriseMode } from '@/lib/useEnterpriseMode';
import { createLocalService, listLocalServices } from '@/lib/localServiceStorage';
import type { LocalService } from '@/lib/localServiceStorage';

// Dynamically import heavy components
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

const PWAInstallPrompt = dynamic(() => import('../components/PWAInstallPrompt').then(mod => ({ default: mod.PWAInstallPrompt })), {
  ssr: false
});

// MCP Settings Modal removed - now using service-specific MCP Integration


import type { MenuProps } from 'antd';
import { generateServiceId } from '@/lib/generateServiceId';
import type { Template } from '@/lib/templates';
import { useAuth } from '@/components/auth/AuthContext';

const { Content } = Layout;
const { Text } = Typography;

const ListsPage: React.FC = observer(() => {
  const { notification } = App.useApp();
  const router = useRouter();
  const appStore = useAppStore();
  const { user, isAuthenticated: authIsAuthenticated, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [serviceCount, setServiceCount] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [loadedTemplates, setLoadedTemplates] = useState<Template[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState('rfdcf8rpnd');
  const { t, locale, setLocale } = useTranslation();
  const { isEnterpriseMode, setEnterpriseMode } = useEnterpriseMode();
  const [localServices, setLocalServices] = useState<LocalService[]>([]);

  // Load local services from IndexedDB
  const refreshLocalServices = useCallback(() => {
    listLocalServices().then(setLocalServices);
  }, []);

  useEffect(() => {
    refreshLocalServices();
  }, [refreshLocalServices]);

  // Tour refs
  const serviceListRef = useRef<HTMLDivElement>(null);
  const onboardingCardsRef = useRef<HTMLDivElement>(null);
  const watchVideoCardRef = useRef<HTMLDivElement>(null);
  const useSampleCardRef = useRef<HTMLDivElement>(null);
  const newServiceButtonRef = useRef<HTMLButtonElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // Lazy load tour only when needed
  const [tourState, setTourState] = useState<{
    open: boolean;
    steps: any[];
    TourComponent: any;
  } | null>(null);

  // Load tour dynamically only when user hasn't seen it
  useEffect(() => {
    // Don't show tour on mobile devices
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    // Check localStorage first (zero cost for returning users)
    const tourCompleted = typeof window !== 'undefined' &&
      localStorage.getItem('spreadapi_tour_completed_app-welcome-tour') === 'true';

    if (tourCompleted) return;

    // Only load tour code if user hasn't seen it
    const timer = setTimeout(async () => {
      try {
        // Dynamic imports - only loaded when needed
        const [{ getAppTourSteps }, { Tour }] = await Promise.all([
          import('@/tours/appTour'),
          import('antd')
        ]);

        // Create tour steps with refs
        const tourSteps = getAppTourSteps(locale);
        const steps = [
          {
            ...tourSteps[0],
            target: () => watchVideoCardRef.current,
          },
          {
            ...tourSteps[1],
            target: () => useSampleCardRef.current,
          },
          {
            ...tourSteps[2],
            target: () => newServiceButtonRef.current,
          }
        ];

        setTourState({
          open: true,
          steps,
          TourComponent: Tour
        });
      } catch (error) {
        console.error('Failed to load tour:', error);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [locale]);

  // Handle tour close
  const handleTourClose = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spreadapi_tour_completed_app-welcome-tour', 'true');
    }
    setTourState(null);
  }, []);

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

  // Select video based on locale
  useEffect(() => {
    setSelectedVideoId(locale === 'de' ? 'pi5ljxwf4o' : 'rfdcf8rpnd');
  }, [locale]);

  // Lazy-load template data only when the modal opens
  useEffect(() => {
    if (!isTemplateModalOpen || loadedTemplates.length > 0) return;
    import('@/lib/templates').then(({ templates }) => {
      setLoadedTemplates(templates);
    });
  }, [isTemplateModalOpen, loadedTemplates.length]);

  // Load Wistia script when video modal opens
  useEffect(() => {
    if (isVideoModalOpen && typeof window !== 'undefined' && !(window as any)._wq) {
      const script = document.createElement('script');
      script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [isVideoModalOpen]);

  // Share notifications are handled by a separate component to prevent re-renders

  useEffect(() => {

    // Initialize client without blocking UI
    // This checks auth and loads lists in the background
    appStore.initializeClient();
  }, [appStore]);

  const handleUseSample = useCallback(() => {
    setIsTemplateModalOpen(true);
  }, []);

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

    // In cloud mode, check authentication
    if (!isEnterpriseMode && !isAuthenticated) {
      notification.warning({ message: t('app.pleaseSignIn') });
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
      notification.error({ message: t('app.selectFileType') });
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
        const newId = generateServiceId(user?.id || (isEnterpriseMode ? 'local' : 'anonymous'));

        // Generate automatic name based on file name
        const date = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const baseFileName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
        const automaticName = `${baseFileName} - ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        const description = t('app.importedFrom', { fileName: file.name });

        // Private mode: create locally
        if (isEnterpriseMode) {
          await createLocalService(newId, automaticName, description);
          refreshLocalServices();
          router.push(`/app/service/${newId}?fileDropped=true`);
          return;
        }

        // Create the service in the backend first
        const createResponse = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: newId,
            name: automaticName,
            description
          })
        });

        if (createResponse.ok || createResponse.status === 409) {
          // Service created or already exists, navigate with file flag
          router.push(`/app/service/${newId}?fileDropped=true`);
        } else {
          // Handle error
          const errorData = await createResponse.json().catch(() => ({}));
          console.error('Failed to create service:', errorData);
          notification.error({ message: t('app.failedToCreateService') });
          delete (window as any).__draggedFile; // Clean up the global variable
        }
      } catch (error) {
        console.error('Error processing file:', error);
        notification.error({ message: t('app.errorProcessingFile') });
        delete (window as any).__draggedFile; // Clean up the global variable
      }
    };

    reader.readAsArrayBuffer(file);
  }, [isAuthenticated, notification, router, user?.id, t, isEnterpriseMode, refreshLocalServices]);

  // Memoized dropdown menu items
  const dropdownMenuItems = useMemo(() => {
    const languageItems = [
      { key: 'en', label: 'English', icon: <CheckOutlined style={{ visibility: locale === 'en' ? 'visible' : 'hidden' }} />, onClick: () => setLocale('en') },
      { key: 'de', label: 'Deutsch', icon: <CheckOutlined style={{ visibility: locale === 'de' ? 'visible' : 'hidden' }} />, onClick: () => setLocale('de') },
    ];

    const storageModeItems = [
      { key: 'cloud', label: t('app.storeInCloud'), icon: <CheckOutlined style={{ visibility: !isEnterpriseMode ? 'visible' : 'hidden' }} />, onClick: () => setEnterpriseMode(false) },
      { key: 'local', label: t('app.storeLocally'), icon: <CheckOutlined style={{ visibility: isEnterpriseMode ? 'visible' : 'hidden' }} />, onClick: () => setEnterpriseMode(true) },
    ];

    if (isAuthenticated) {
      return [
        {
          key: 'profile',
          icon: <SettingOutlined />,
          label: t('app.profileSettings'),
          onClick: () => router.push('/app/profile'),
        },
        {
          key: 'language',
          icon: <GlobalOutlined />,
          label: t('app.language'),
          children: languageItems,
        },
        {
          key: 'storage',
          icon: <CloudOutlined />,
          label: t('app.storageMode'),
          children: storageModeItems,
        },
        { type: 'divider' as const },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: t('app.logout'),
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
        key: 'language',
        icon: <GlobalOutlined />,
        label: t('app.language'),
        children: languageItems,
      },
      { type: 'divider' as const },
      {
        key: 'login',
        label: t('app.login'),
        onClick: () => router.push('/login'),
      },
    ];
  }, [isAuthenticated, router, setIsAuthenticated, t, locale, setLocale, isEnterpriseMode, setEnterpriseMode]);

  // Memoized new service handler
  const handleNewService = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Private mode: create locally without authentication
    if (isEnterpriseMode) {
      setIsCreatingService(true);
      try {
        const newId = generateServiceId(user?.id || 'local');
        const date = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const automaticName = `Service ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        await createLocalService(newId, automaticName, '');
        refreshLocalServices();
        router.push(`/app/service/${newId}`);
      } catch (error) {
        console.error('Error creating private service:', error);
        notification.error({ message: t('app.failedToCreateService') });
        setIsCreatingService(false);
      }
      return;
    }

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
        notification.error({ message: t('app.failedToCreateService') });
        setIsCreatingService(false);
      }
    } catch (error) {
      console.error('Error creating service:', error);
      notification.error({ message: t('app.failedToCreateService') });
      setIsCreatingService(false);
    }
  }, [isAuthenticated, router, user?.id, notification, t, isEnterpriseMode, refreshLocalServices]);

  // Template selection handler
  const handleTemplateSelect = useCallback(async (template: Template) => {
    // In cloud mode, check authentication
    if (!isEnterpriseMode && !isAuthenticated) {
      notification.warning({ message: t('app.pleaseSignInTemplates') });
      router.push('/login?returnTo=/app');
      return;
    }

    setIsTemplateModalOpen(false);
    setIsCreatingService(true);

    try {
      // Download workbook from Vercel Blob
      const response = await fetch(template.fileUrl);
      if (!response.ok) throw new Error('Failed to download template');
      const blob = await response.blob();

      // Create a File object matching the drag-and-drop flow
      const urlPath = template.fileUrl.split('/').pop() || 'template.xlsx';
      const fileName = decodeURIComponent(urlPath);
      const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Store file globally (same as drag-and-drop)
      (window as any).__draggedFile = file;
      sessionStorage.setItem('draggedFileData', JSON.stringify({
        fileName: file.name,
        fileType: 'excel',
        fileSize: file.size,
        timestamp: Date.now(),
      }));

      // Generate service ID and name
      const newId = generateServiceId(user?.id || (isEnterpriseMode ? 'local' : 'anonymous'));
      const templateName = (template.name as Record<string, string>)[locale] ?? template.name.en;
      const date = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const serviceName = `${templateName} - ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      const serviceDescription = (template.description as Record<string, string>)[locale] ?? template.description.en;

      // Private mode: create locally
      if (isEnterpriseMode) {
        await createLocalService(newId, serviceName, serviceDescription);
        refreshLocalServices();
        router.push(`/app/service/${newId}?templateId=${template.id}`);
        return;
      }

      // Create service in backend
      const createResponse = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: serviceName,
          description: serviceDescription,
        }),
      });

      if (createResponse.ok || createResponse.status === 409) {
        router.push(`/app/service/${newId}?templateId=${template.id}`);
      } else {
        throw new Error('Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service from template:', error);
      notification.error({ message: t('app.failedToCreateFromTemplate') });
      delete (window as any).__draggedFile;
      setIsCreatingService(false);
    }
  }, [isAuthenticated, locale, t, notification, router, user?.id, isEnterpriseMode, refreshLocalServices]);

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
      <style jsx global>{`
        @media (max-width: 732px) {
          .how-it-works-card { display: none !important; }
        }
        .search-input.ant-input-outlined,
        .search-input .ant-input {
          font-size: 14px !important;
        }
        .ant-tour .ant-tour-content {
          max-width: 400px !important;
        }
      `}</style>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
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
                    {t('app.dropFileHere')}
                  </Typography.Title>
                </div>
              </div>
            )}
            
            {/* Header */}
            <div className="lists-page-header">
              {/* Left side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto' }}>
                <img
                  src="/icons/logo.svg"
                  alt="SpreadAPI"
                  style={{ width: 18, height: 18, borderRadius: 3, cursor: 'pointer' }}
                  onClick={() => router.push('/')}
                />
                {/* Breadcrumb */}
                <Breadcrumb
                  items={[{
                    title: <span style={{ marginLeft: 0 }}>{t('app.breadcrumb')}</span>,
                  }]}
                />
              </div>

              {/* Right side - Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 0 }}>
                {/* Chat Button - hidden when no services exist */}
                {serviceCount > 0 && (
                  <Button
                    ref={chatButtonRef}
                    variant='filled'
                    color="default"
                    icon={<MessageOutlined />}
                    onClick={() => router.push('/app/chat')}
                    title={t('app.chatWithServices')}
                  >
                    <span className="desktop-text">Chat</span>
                  </Button>
                )}

                {/* MCP Settings Button removed - now per-service in API tab */}

                {/* New Service Button */}
                <Button
                  ref={newServiceButtonRef}
                  type="primary"
                  icon={isCreatingService ? <LoadingOutlined /> : <PlusOutlined />}
                  loading={isCreatingService}
                  onClick={handleNewService}
                  className="new-list-button"
                >
                  <span className="desktop-text">{t('app.newService')}</span>
                  <span className="mobile-text">{t('app.new')}</span>
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

                {/* Search Bar and View Toggle — hidden when no services */}
                {serviceCount > 0 && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 0 }}>
                  <Input
                    placeholder={t('app.searchPlaceholder')}
                    disabled={appStore.loading}
                    prefix={<SearchOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    // size="large"
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      fontSize: '14px'
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
                )}
                {/* Service List */}
                <div ref={serviceListRef}>
                  {isClient ? (
                    <ServiceList searchQuery={searchQuery} viewMode={viewMode} isAuthenticated={isAuthenticated} onServiceCount={setServiceCount} onUseSample={handleUseSample} localServices={localServices} onLocalServicesChange={refreshLocalServices} />
                  ) : (
                    <ServiceListSkeleton viewMode={viewMode} />
                  )}
                </div>
                {/* New here? Cards - show for users with less than 5 lists */}
                {!searchQuery && serviceCount < 7 && (
                  <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    marginTop: '0',
                    paddingBottom: '0',
                    width: '100%',
                    maxWidth: '700px',
                    transition: 'all 0.3s ease',
                    zIndex: 1
                  }}>
                    <div ref={onboardingCardsRef} style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {/* Watch Video Card */}
                      <div
                        ref={watchVideoCardRef}
                        onClick={() => setIsVideoModalOpen(true)}
                        style={{
                          background: 'white',
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '16px 20px',
                          cursor: 'pointer',
                          color: '#262626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flex: '1 1 0',
                          minWidth: '140px',
                          maxWidth: '220px',
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
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          position: 'relative',
                          background: '#f0f0f0'
                        }}>
                          <img
                            src={`https://fast.wistia.com/embed/medias/${selectedVideoId}/swatch`}
                            alt="Video thumbnail"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.3)'
                          }}>
                            <PlayCircleOutlined style={{ fontSize: '14px', color: 'white' }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                            {t('app.watchVideo')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {t('app.fiveMinTutorial')}
                          </div>
                        </div>
                      </div>

                      {/* Use a Sample Card */}
                      <div
                        ref={useSampleCardRef}
                        onClick={() => setIsTemplateModalOpen(true)}
                        style={{
                          background: 'white',
                          border: '1px solid #e8e8e8',
                          borderRadius: '8px',
                          padding: '16px 20px',
                          cursor: 'pointer',
                          color: '#262626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flex: '1 1 0',
                          minWidth: '140px',
                          maxWidth: '220px',
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
                          background: '#f9f0ff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#722ed1" strokeWidth="2" fill="none"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke="#722ed1" strokeWidth="2"/>
                            <line x1="12" y1="3" x2="12" y2="21" stroke="#722ed1" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                            {t('app.useSample')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {t('app.testImmediately')}
                          </div>
                        </div>
                      </div>

                      {/* How it Works Card — hidden on small screens */}
                      <a
                        href="/how-excel-api-works"
                        className="how-it-works-card"
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
                          flex: '1 1 0',
                          minWidth: '140px',
                          maxWidth: '220px',
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
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                            {t('app.howItWorks')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {t('app.seeInAction')}
                          </div>
                        </div>
                      </a>

                    </div>
                  </div>
                )}

              </div>

            </div>
          </Content>
        </Layout>
      </Layout>
      {isClient && (
        <>
          <IntercomProvider />
          <IntercomScript />
          <PWAInstallPrompt />
        </>
      )}

      {/* Welcome Tour - Lazy Loaded */}
      {tourState && tourState.TourComponent && (
        <>
          <tourState.TourComponent
            open={tourState.open}
            onClose={handleTourClose}
            steps={tourState.steps}
          />
        </>
      )}

      {/* Video Modal */}
      <Modal
        open={isVideoModalOpen}
        onCancel={() => setIsVideoModalOpen(false)}
        footer={null}
        width={900}
        centered
        styles={{
          body: { padding: 0 }
        }}
      >
        <div
          className="wistia_responsive_padding"
          style={{
            padding: '56.25% 0 0 0',
            position: 'relative'
          }}
        >
          <div
            className="wistia_responsive_wrapper"
            style={{
              height: '100%',
              left: 0,
              position: 'absolute',
              top: 0,
              width: '100%'
            }}
          >
            <div
              className={`wistia_embed wistia_async_${selectedVideoId} videoFoam=true preload=metadata`}
              style={{
                height: '100%',
                position: 'relative',
                width: '100%'
              }}
            >
              &nbsp;
            </div>
          </div>
        </div>
      </Modal>

      {/* Template Sample Modal */}
      <Modal
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        footer={null}
        width={640}
        centered
        title={t('app.chooseSampleWorkbook')}
      >
        <p style={{ color: '#8c8c8c', margin: '4px 0 20px' }}>
          {t('app.pickTemplate')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loadedTemplates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="small" />
            </div>
          )}
          {loadedTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#faf5ff';
                e.currentTarget.style.borderColor = '#d3adf7';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 45, 127, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#f9f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileExcelOutlined style={{ fontSize: '22px', color: '#722ed1' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: '#262626' }}>
                  {(template.name as Record<string, string>)[locale] ?? template.name.en}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#8c8c8c',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}>
                  {(template.description as Record<string, string>)[locale] ?? template.description.en}
                </div>
              </div>
              <ArrowRightOutlined style={{ fontSize: '14px', color: '#d9d9d9', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
});

export default ListsPage;