'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import '@/styles/listcard.css';
import '@/styles/dashboard.css';
import '../main.css'; // Critical CSS for preventing layout shifts
import { Layout, Button, Input, App, Breadcrumb, Typography, Segmented, Dropdown, Avatar, Modal, Spin, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, InboxOutlined, AppstoreOutlined, BarsOutlined, UserOutlined, LogoutOutlined, SettingOutlined, LoadingOutlined, MessageOutlined, PlayCircleOutlined, FileExcelOutlined, ArrowRightOutlined, ArrowLeftOutlined, GlobalOutlined, CheckOutlined, CloudOutlined, CrownOutlined, BarChartOutlined, DownOutlined } from '@ant-design/icons';
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
import { LICENSE_LIMITS, type LicenseType } from '@/lib/licensing';
const UpgradeModal = dynamic(() => import('@/components/UpgradeModal'), {
  ssr: false
});

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFolderName, setActiveFolderName] = useState<string>('');
  const [onboardingCollapsed, setOnboardingCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spreadapi_onboarding_collapsed') === 'true';
    }
    return false;
  });
  const [onboardingHidden, setOnboardingHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spreadapi_onboarding_hidden') === 'true';
    }
    return false;
  });

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
    let savedViewMode = localStorage.getItem('serviceViewMode');
    // Migrate old values
    if (savedViewMode === 'table') savedViewMode = 'list';
    if (savedViewMode === 'card') savedViewMode = 'grid';
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      setViewMode(savedViewMode);
      localStorage.setItem('serviceViewMode', savedViewMode);
    } else {
      localStorage.setItem('serviceViewMode', 'list');
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
      notification.warning({ title: t('app.pleaseSignIn') });
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
      notification.error({ title: t('app.selectFileType') });
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
          notification.error({ title: t('app.failedToCreateService') });
          delete (window as any).__draggedFile; // Clean up the global variable
        }
      } catch (error) {
        console.error('Error processing file:', error);
        notification.error({ title: t('app.errorProcessingFile') });
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
      const licenseType = (user?.licenseType || 'free') as LicenseType;
      const licenseColors: Record<LicenseType, string> = {
        free: '#8c8c8c',
        pro: '#722ed1',
        premium: '#faad14',
      };
      const licenseLabels: Record<LicenseType, string> = {
        free: 'Free',
        pro: 'Pro',
        premium: 'Premium',
      };

      return [
        {
          key: 'license',
          icon: <CrownOutlined style={{ color: licenseColors[licenseType] }} />,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color={licenseType === 'free' ? 'default' : licenseType === 'pro' ? 'purple' : 'gold'} style={{ margin: 0 }}>
                {licenseLabels[licenseType]}
              </Tag>
              {licenseType !== 'premium' && (
                <span style={{ fontSize: 12, color: '#722ed1' }}>{t('app.upgrade')}</span>
              )}
            </div>
          ),
          onClick: () => setUpgradeModalOpen(true),
        },
        { type: 'divider' as const },
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
          disabled: process.env.NODE_ENV === 'production',
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
  }, [isAuthenticated, router, setIsAuthenticated, t, locale, setLocale, isEnterpriseMode, setEnterpriseMode, user?.licenseType]);

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
        notification.error({ title: t('app.failedToCreateService') });
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
        if (errorData.code === 'SERVICE_LIMIT_REACHED') {
          setUpgradeModalOpen(true);
        } else {
          notification.error({ title: t('app.failedToCreateService') });
        }
        setIsCreatingService(false);
      }
    } catch (error) {
      console.error('Error creating service:', error);
      notification.error({ title: t('app.failedToCreateService') });
      setIsCreatingService(false);
    }
  }, [isAuthenticated, router, user?.id, notification, t, isEnterpriseMode, refreshLocalServices]);

  // Template selection handler
  const handleTemplateSelect = useCallback(async (template: Template) => {
    // In cloud mode, check authentication
    if (!isEnterpriseMode && !isAuthenticated) {
      notification.warning({ title: t('app.pleaseSignInTemplates') });
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
      notification.error({ title: t('app.failedToCreateFromTemplate') });
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
                {activeFolderId ? (
                  <>
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => { setActiveFolderId(null); setActiveFolderName(''); }}
                      style={{ color: '#8c8c8c', padding: '4px 8px' }}
                    />
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#262626' }}>
                      {activeFolderName}
                    </span>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Right side - Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 0 }}>
                {/* Analytics Button - hidden when no services exist */}
                {serviceCount > 0 && (
                  <Button
                    variant='filled'
                    color="default"
                    icon={<BarChartOutlined />}
                    onClick={() => router.push('/app/analytics')}
                    title="Analytics"
                  >
                    <span className="desktop-text">Analytics</span>
                  </Button>
                )}

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
                  style={{ backgroundColor: '#9233E9', borderColor: '#9233E9' }}
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
            <div style={{ flex: 1, background: '#fdfdfd', padding: '12px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: 960, margin: '0 auto', width: '100%' }}>

              {/* Onboarding Panel — collapsible, hidden when searching or inside folders, deferred to client to avoid flash */}
              {isClient && !searchQuery && !activeFolderId && !onboardingHidden && (
                <div style={{
                  background: '#F0F4FB',
                  border: '1px solid #DFEAF5',
                  borderRadius: 10,
                  margin: '4px 0 12px',
                  ...(onboardingCollapsed
                    ? { padding: '14px 12px' }
                    : { padding: '24px 24px 16px', position: 'relative' as const }),
                }}>
                  {onboardingCollapsed ? (
                    /* Collapsed bar */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg onClick={() => { setOnboardingCollapsed(false); localStorage.setItem('spreadapi_onboarding_collapsed', 'false'); }} width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ flexShrink: 0, cursor: 'pointer' }}>
                        <path d="M2 2L12 8L2 14V2Z" stroke="#7c5cc4" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                      </svg>
                      <span onClick={() => { setOnboardingCollapsed(false); localStorage.setItem('spreadapi_onboarding_collapsed', 'false'); }} style={{ fontWeight: 500, fontSize: 13, color: '#1a1a1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, cursor: 'pointer' }}>
                        {t('onboarding.title')}
                      </span>
                      <span
                        onClick={() => {
                          setOnboardingCollapsed(false);
                          localStorage.setItem('spreadapi_onboarding_collapsed', 'false');
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#7c5cc4', cursor: 'pointer', fontWeight: 500 }}
                      >
                        {t('onboarding.showVideos')}
                        <DownOutlined style={{ fontSize: 10 }} />
                      </span>
                      <span style={{ width: 1, height: 16, background: '#DFEAF5' }} />
                      <span
                        onClick={() => window.open('mailto:support@spreadapi.com?subject=' + encodeURIComponent('SpreadAPI Support Request') + '&body=' + encodeURIComponent('Hi SpreadAPI Team,\n\nI need help with:\n\n\n---\nAccount: ' + (appStore.user.email || 'Not logged in') + '\nURL: ' + window.location.href), '_blank')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#999', cursor: 'pointer' }}
                      >
                        <MessageOutlined style={{ fontSize: 13 }} />
                        {t('onboarding.contactSupport')}
                      </span>
                    </div>
                  ) : (
                    /* Expanded view */
                    <>
                      {/* Collapse chevron */}
                      <span
                        onClick={() => {
                          setOnboardingCollapsed(true);
                          localStorage.setItem('spreadapi_onboarding_collapsed', 'true');
                        }}
                        style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer', lineHeight: 1 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M4 10L8 6L12 10" stroke="#bfbfbf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>

                      {/* Title + description */}
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a', marginBottom: 4 }}>
                        {t('onboarding.title')}
                      </div>
                      <div style={{ fontSize: 13, color: '#999', lineHeight: 1.5, marginBottom: 20, maxWidth: 560 }}>
                        {t('onboarding.description')}
                      </div>

                      {/* Video cards */}
                      <div style={{ display: 'grid', gap: 14, marginBottom: 16, maxWidth: 860 }} className="onboarding-cards-grid">
                        {[
                          { titleKey: 'onboarding.card1Title' as const, descKey: 'onboarding.card1Desc' as const, durationKey: 'onboarding.card1Duration' as const, gradient: 'linear-gradient(135deg, #7c5cc4 0%, #9b7ae8 50%, #b49cfa 100%)', disabled: false },
                          { titleKey: 'onboarding.card2Title' as const, descKey: 'onboarding.card2Desc' as const, durationKey: 'onboarding.card2Duration' as const, gradient: 'linear-gradient(135deg, #4a8bb5 0%, #6ba3cc 50%, #8bbde0 100%)', disabled: true },
                          { titleKey: 'onboarding.card3Title' as const, descKey: 'onboarding.card3Desc' as const, durationKey: 'onboarding.card3Duration' as const, gradient: 'linear-gradient(135deg, #3d9e70 0%, #5cb88a 50%, #7dd0a5 100%)', disabled: true },
                        ].map((card) => (
                          <div
                            key={card.titleKey}
                            ref={card.titleKey === 'onboarding.card1Title' ? watchVideoCardRef : undefined}
                            onClick={card.disabled ? undefined : () => setIsVideoModalOpen(true)}
                            style={{
                              cursor: card.disabled ? 'default' : 'pointer',
                              borderRadius: 12,
                              overflow: 'hidden',
                              border: '1px solid #eeeef2',
                              background: '#fff',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                              opacity: card.disabled ? 0.45 : 1,
                              pointerEvents: card.disabled ? 'none' : undefined,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            {/* Gradient thumbnail */}
                            <div style={{
                              background: card.gradient,
                              padding: '10px 14px 8px',
                              position: 'relative',
                              aspectRatio: '2/1',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}>
                              {/* Decorative shapes */}
                              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, overflow: 'hidden' }}>
                                {[0, 1, 2, 3].map((i) => (
                                  <div key={i} style={{
                                    position: 'absolute',
                                    left: `${20 + i * 22}%`,
                                    top: '25%',
                                    width: 30,
                                    height: 30,
                                    borderRadius: 6,
                                    border: '1.5px solid white',
                                    transform: `rotate(${-8 + i * 5}deg)`,
                                  }} />
                                ))}
                              </div>
                              {/* Top row: brand + duration */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                                  <BarChartOutlined style={{ fontSize: 9 }} />
                                  SPREADAPI
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>
                                  {card.disabled ? 'Coming soon' : t(card.durationKey)}
                                </span>
                              </div>
                              {/* Play button */}
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <div style={{ width: '20%', aspectRatio: '1', maxWidth: 40, minWidth: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg width="50%" viewBox="0 0 24 24" fill="none">
                                    <polygon points="8 5 19 12 8 19 8 5" fill="white" />
                                  </svg>
                                </div>
                              </div>
                              {/* Card title */}
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-line' }}>
                                {t(card.titleKey)}
                              </div>
                            </div>
                            {/* Description area */}
                            <div style={{ padding: '10px 12px 12px', fontSize: 11.5, color: '#5b5b75', lineHeight: 1.35, flex: 1 }}>
                              {t(card.descKey)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Support link, sample, and dismiss */}
                      <div style={{ paddingTop: 10, borderTop: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          onClick={() => window.open('mailto:support@spreadapi.com?subject=' + encodeURIComponent('SpreadAPI Support Request') + '&body=' + encodeURIComponent('Hi SpreadAPI Team,\n\nI need help with:\n\n\n---\nAccount: ' + (appStore.user.email || 'Not logged in') + '\nURL: ' + window.location.href), '_blank')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#999', cursor: 'pointer' }}
                        >
                          <MessageOutlined style={{ fontSize: 13 }} />
                          {t('onboarding.contactSupport')}
                        </span>
                        {isAuthenticated && (
                          <span
                            className="onboarding-sample-link"
                            onClick={() => setIsTemplateModalOpen(true)}
                            style={{ fontSize: 13, color: '#7c5cc4', cursor: 'pointer', fontWeight: 500 }}
                          >
                            {locale === 'de' ? 'Beispielberechnung ausprobieren' : 'Try a sample calculation'}
                          </span>
                        )}
                        <span
                          onClick={() => {
                            setOnboardingHidden(true);
                            localStorage.setItem('spreadapi_onboarding_hidden', 'true');
                          }}
                          style={{ fontSize: 12, color: '#bbb', cursor: 'pointer' }}
                        >
                          {locale === 'de' ? 'Nicht mehr anzeigen' : "Don't show this again"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Search Bar and View Toggle */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, paddingLeft: 0, paddingRight: 0 }}>
                {serviceCount > 0 && (
                  <>
                    <Input
                      placeholder={t('app.searchPlaceholder')}
                      disabled={appStore.loading}
                      prefix={<SearchOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      allowClear
                      size="large"
                      style={{ flex: 1, borderRadius: 10, fontSize: '14px' }}
                      className="search-input"
                    />
                    <Segmented
                      options={[
                        { label: <AppstoreOutlined />, value: 'grid' },
                        { label: <BarsOutlined />, value: 'list' }
                      ]}
                      value={viewMode}
                      onChange={(value) => {
                        setViewMode(value as 'grid' | 'list');
                        localStorage.setItem('serviceViewMode', value);
                      }}
                      size="large"
                      style={{ flexShrink: 0, borderRadius: 10 }}
                    />
                  </>
                )}
              </div>

              {/* Service List */}
              <div ref={serviceListRef} style={{ flex: 1, padding: '4px 0' }}>
                {isClient ? (
                  <ServiceList searchQuery={searchQuery} viewMode={viewMode} isAuthenticated={isAuthenticated} onServiceCount={setServiceCount} onUseSample={handleUseSample} onCreateService={(e?: any) => handleNewService(e || { preventDefault: () => {}, stopPropagation: () => {} } as any)} localServices={localServices} onLocalServicesChange={refreshLocalServices} activeFolderId={activeFolderId} onFolderOpen={(id, name) => { setActiveFolderId(id); setActiveFolderName(name); }} onFolderClose={() => { setActiveFolderId(null); setActiveFolderName(''); }} />
                ) : (
                  <ServiceListSkeleton viewMode={viewMode} />
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loadedTemplates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="small" />
            </div>
          )}
          {loadedTemplates.map((template, index) => (
            <React.Fragment key={template.id}>
            <div
              onClick={() => handleTemplateSelect(template)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 12px',
                borderRadius: '12px',
                border: '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d3adf7';
                e.currentTarget.style.background = '#faf5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.background = '#fff';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#f3ecff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileExcelOutlined style={{ fontSize: '18px', color: '#722ed1' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px', color: '#1a1a1a' }}>
                  {(template.name as Record<string, string>)[locale] ?? template.name.en}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  lineHeight: '1.4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {(template.description as Record<string, string>)[locale] ?? template.description.en}
                </div>
              </div>
              {template.category?.label && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: template.category.color,
                  backgroundColor: (() => {
                    const c = template.category.color;
                    const r = parseInt(c.slice(1, 3), 16);
                    const g = parseInt(c.slice(3, 5), 16);
                    const b = parseInt(c.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, 0.12)`;
                  })(),
                  padding: '3px 10px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {template.category.label}
                </span>
              )}
              <ArrowRightOutlined style={{ fontSize: '13px', color: '#ccc', flexShrink: 0 }} />
            </div>
            {index < loadedTemplates.length - 1 && (
              <div style={{ height: 1, background: '#f0f0f0', margin: '0 16px' }} />
            )}
            </React.Fragment>
          ))}
        </div>
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentLicense={(user?.licenseType || 'free') as LicenseType}
        userEmail={user?.email}
      />
    </>
  );
});

export default ListsPage;