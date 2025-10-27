'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Layout, Button, Drawer, Divider, Space, Spin, Splitter, Breadcrumb, App, Tag, Typography, Dropdown, Segmented, Modal, Tooltip } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined, MenuOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined, MoreOutlined, FileExcelOutlined, MenuUnfoldOutlined, TableOutlined, CaretRightOutlined, CloseOutlined, BarChartOutlined, DownloadOutlined, AppstoreOutlined, RobotOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { COLORS } from '@/constants/theme';
import ParametersPanel from './components/ParametersPanel';
import ErrorBoundary from './components/ErrorBoundary';
import WorkbookView from './views/WorkbookView';

// Lazy load views that are not immediately visible
const ApiView = dynamic(() => import('./views/ApiView'), {
  loading: () => <div style={{ padding: 20 }}></div>,
  ssr: false
});

const AppsView = dynamic(() => import('./views/AppsView'), {
  loading: () => <div style={{ padding: 20 }}></div>,
  ssr: false
});

const AgentsView = dynamic(() => import('./views/AgentsView'), {
  loading: () => <div style={{ padding: 20 }}></div>,
  ssr: false
});

const SettingsView = dynamic(() => import('./views/SettingsView'), {
  loading: () => <div style={{ padding: 20 }}></div>,
  ssr: false
});

const UsageView = dynamic(() => import('./views/UsageView'), {
  loading: () => <div style={{ padding: 20 }}></div>,
  ssr: false
});

// Lazy load StatusBar as it's not critical for initial render
const StatusBar = dynamic(() => import('./StatusBar'), {
  loading: () => null,
  ssr: false
});

// Lazy load ApiDefinitionModal as it's only shown on demand
const ApiDefinitionModal = dynamic(() => import('./components/ApiDefinitionModal'), {
  loading: () => null,
  ssr: false
});

// Lazy load SaveProgressModal as it's only shown during large file saves
const SaveProgressModal = dynamic(() => import('./components/SaveProgressModal'), {
  loading: () => null,
  ssr: false
});

const TestPanel = dynamic(() => import('./components/TestPanel'), {
  loading: () => null,
  ssr: false
});

import { prepareServiceForPublish, publishService } from '@/utils/publishService';
import { appStore } from '../../../stores/AppStore';
import { isDemoService } from '@/lib/constants';
import { workbookManager } from '@/utils/workbookManager';
import { getSavedView, saveViewPreference, getSmartDefaultView } from '@/lib/viewPreferences';

// Import the main sidebar
const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => null
});

const { Content, Sider } = Layout;
const { Text } = Typography;

export default function ServicePageClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const workbookRef = useRef<any>(null);
  const { message } = App.useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  // Initialize activeView from localStorage or default based on context
  const [activeView, setActiveView] = useState<'Settings' | 'Workbook' | 'API' | 'Agents' | 'Apps' | 'Usage'>(() => {
    const savedView = getSavedView(serviceId);
    if (savedView && ['Settings', 'Workbook', 'API', 'Agents', 'Apps', 'Usage'].includes(savedView)) {
      return savedView as 'Settings' | 'Workbook' | 'API' | 'Agents' | 'Apps' | 'Usage';
    }
    // Default to Workbook (not Settings, even though Settings is first in navigation)
    return 'Workbook';
  });
  const [spreadsheetData, setSpreadsheetData] = useState<any>(null); // Start with null to prevent default data
  const [showEmptyState, setShowEmptyState] = useState(false); // Show empty state for new services
  const [importFileForEmptyState, setImportFileForEmptyState] = useState<File | null>(null); // File to import after workbook is ready
  const [loading, setLoading] = useState(false);
  const [savingWorkbook, setSavingWorkbook] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial load
  const [loadingMessage, setLoadingMessage] = useState('Loading service...');
  const [spreadInstance, setSpreadInstance] = useState<any>(null);
  const [apiConfig, setApiConfig] = useState({
    name: '',
    description: '',
    inputs: [],
    outputs: [],
    areas: [],
    enableCaching: true,
    requireToken: false,
    cacheTableSheetData: true,
    tableSheetCacheTTL: 300,
    aiDescription: '',
    aiUsageGuidance: '',
    aiUsageExamples: [],
    aiTags: [],
    category: '',
    webAppToken: '',
    webAppConfig: '',
    webAppTheme: 'default',
    customThemeParams: ''
  });
  const [savedConfig, setSavedConfig] = useState({
    name: '',
    description: '',
    inputs: [],
    outputs: [],
    areas: [],
    enableCaching: true,
    requireToken: false,
    cacheTableSheetData: true,
    tableSheetCacheTTL: 300,
    aiDescription: '',
    aiUsageGuidance: '',
    aiUsageExamples: [],
    aiTags: [],
    category: '',
    webAppToken: '',
    webAppConfig: '',
    webAppTheme: 'default',
    customThemeParams: ''
  });
  const [configHasChanges, setConfigHasChanges] = useState(false);
  const [workbookChangeCount, setWorkbookChangeCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(80);
  const [serviceStatus, setServiceStatus] = useState<any>({ published: false, status: 'draft' });
  const [spreadsheetVisible, setSpreadsheetVisible] = useState(false); // For fade-in transition
  const [configLoaded, setConfigLoaded] = useState(false); // Track if config has been loaded
  const [hasSetSmartDefault, setHasSetSmartDefault] = useState(false); // Track if we've set smart default
  const [testPanelOpen, setTestPanelOpen] = useState(false); // Test panel state
  const [workbookLoading, setWorkbookLoading] = useState(false); // Track workbook loading state
  const [workbookLoaded, setWorkbookLoaded] = useState(false); // Track if workbook has been loaded
  const [isDemoMode, setIsDemoMode] = useState(false); // Track if this is the demo service
  const [isImporting, setIsImporting] = useState(false); // Track if we're importing a service package
  const justImportedRef = useRef(false); // Track if we just completed an import (prevents reload)
  const [availableTokens, setAvailableTokens] = useState<any[]>([]); // Available API tokens
  const [tokenCount, setTokenCount] = useState(0); // Total token count
  const [showApiDefinitionModal, setShowApiDefinitionModal] = useState(false); // View API Definition modal
  const [apiDefinitionData, setApiDefinitionData] = useState<any>(null); // API definition data
  const [loadingApiDefinition, setLoadingApiDefinition] = useState(false); // Loading state for API definition
  const zoomHandlerRef = useRef<any>(null); // Reference to the zoom handler function
  const [saveProgress, setSaveProgress] = useState<{ visible: boolean; percent: number; status: string }>({
    visible: false,
    percent: 0,
    status: ''
  }); // Save progress for large files

  // Tour refs
  const parametersPanelRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);
  const viewSwitcherRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const testButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  // Lazy load tour only when needed
  const [tourState, setTourState] = useState<{
    open: boolean;
    steps: any[];
    TourComponent: any;
  } | null>(null);

  // Load tour dynamically only when conditions are met and tour hasn't been completed
  useEffect(() => {
    const shouldShowTour = isDemoMode && activeView === 'Workbook' && workbookLoaded;

    if (!shouldShowTour) return;

    // Check localStorage first (zero cost for returning users)
    const tourCompleted = typeof window !== 'undefined' &&
      localStorage.getItem('spreadapi_tour_completed_service-detail-tour') === 'true';

    if (tourCompleted) return;

    // Only load tour code if user hasn't seen it
    const timer = setTimeout(async () => {
      try {
        // Dynamic imports - only loaded when needed
        const [{ serviceDetailTour }, { Tour }, { useTour }] = await Promise.all([
          import('@/tours/serviceDetailTour'),
          import('antd'),
          import('@/hooks/useTour')
        ]);

        // Create tour steps with refs
        const steps = [
          {
            ...serviceDetailTour.steps[0],
            target: () => parametersPanelRef.current,
          },
          {
            ...serviceDetailTour.steps[1],
            target: () => addButtonRef.current,
          },
          {
            ...serviceDetailTour.steps[2],
            target: () => viewSwitcherRef.current,
          },
          {
            ...serviceDetailTour.steps[3],
            target: () => testButtonRef.current,
          },
        ];

        setTourState({
          open: true,
          steps,
          TourComponent: Tour
        });
      } catch (error) {
        console.error('Failed to load tour:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDemoMode, activeView, workbookLoaded]);

  // Handle tour close
  const handleTourClose = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spreadapi_tour_completed_service-detail-tour', 'true');
    }
    setTourState(null);
  }, []);

  // Handle tour step change
  const handleTourChange = useCallback((current: number) => {
    // Track step changes if needed
  }, []);

  // Custom hook for panel sizes
  const usePanelSizes = () => {
    const [sizes, setSizes] = useState<number[]>([30, 70]); // Default sizes - parameters panel 30%, content 70%
    const [sizesLoaded, setSizesLoaded] = useState(false);

    // Load sizes from localStorage after mount to prevent hydration issues
    useEffect(() => {
      const savedSizes = localStorage.getItem('spreadapi-panel-sizes');
      if (savedSizes) {
        try {
          const parsedSizes = JSON.parse(savedSizes);
          if (Array.isArray(parsedSizes) && parsedSizes.length === 2) {
            setSizes(parsedSizes);
          }
        } catch (e) {
        }
      }
      setSizesLoaded(true);
    }, []);

    const handleResize = useCallback((newSizes: (string | number)[]) => {
      const numericSizes = newSizes.map(size => {
        if (typeof size === 'string' && size.endsWith('%')) {
          return parseFloat(size);
        }
        return typeof size === 'number' ? size : 50;
      });
      setSizes(numericSizes);
      localStorage.setItem('spreadapi-panel-sizes', JSON.stringify(numericSizes));
    }, []);

    return { panelSizes: sizes, handlePanelResize: handleResize, sizesLoaded };
  };

  const { panelSizes, handlePanelResize, sizesLoaded } = usePanelSizes();

  // Computed property for any changes
  const hasAnyChanges = useMemo(() => {
    const result = configHasChanges || workbookChangeCount > 0;
    return result;
  }, [configHasChanges, workbookChangeCount]);

  // Memoize the default workbook structure to prevent recreation
  const defaultEmptyWorkbook = useMemo(() => workbookManager.createDefaultWorkbook(), []);

  const setDefaultSpreadsheetData = useCallback(() => {
    setSpreadsheetData(defaultEmptyWorkbook);
  }, [defaultEmptyWorkbook]);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // Auto-manage drawer visibility based on screen size
      if (mobile && !wasMobile) {
        // Just became mobile: show drawer
        setDrawerVisible(true);
      } else if (!mobile && wasMobile) {
        // Just became desktop: hide drawer (sider is now visible)
        setDrawerVisible(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  // Detect changes by comparing current config with saved config
  useEffect(() => {
    const configChanged =
      apiConfig.name !== savedConfig.name ||
      apiConfig.description !== savedConfig.description ||
      JSON.stringify(apiConfig.inputs) !== JSON.stringify(savedConfig.inputs) ||
      JSON.stringify(apiConfig.outputs) !== JSON.stringify(savedConfig.outputs) ||
      JSON.stringify(apiConfig.areas || []) !== JSON.stringify(savedConfig.areas || []) ||
      apiConfig.enableCaching !== savedConfig.enableCaching ||
      apiConfig.requireToken !== savedConfig.requireToken ||
      apiConfig.cacheTableSheetData !== savedConfig.cacheTableSheetData ||
      apiConfig.tableSheetCacheTTL !== savedConfig.tableSheetCacheTTL ||
      apiConfig.aiDescription !== savedConfig.aiDescription ||
      apiConfig.aiUsageGuidance !== savedConfig.aiUsageGuidance ||
      JSON.stringify(apiConfig.aiUsageExamples) !== JSON.stringify(savedConfig.aiUsageExamples) ||
      JSON.stringify(apiConfig.aiTags) !== JSON.stringify(savedConfig.aiTags) ||
      apiConfig.category !== savedConfig.category ||
      apiConfig.webAppToken !== savedConfig.webAppToken ||
      apiConfig.webAppConfig !== savedConfig.webAppConfig;

    setConfigHasChanges(configChanged);
  }, [apiConfig, savedConfig]);

  // Set smart default view based on service status
  useEffect(() => {
    // Only set smart default once, and only if user hasn't already chosen a view
    if (!hasSetSmartDefault && configLoaded) {
      const savedView = getSavedView(serviceId);

      // If no saved preference for this service, set smart default
      if (!savedView) {
        // Use smart default based on service status and workbook availability
        const hasWorkbook = !!apiConfig.inputs?.length || !!apiConfig.outputs?.length || !!spreadsheetData;
        const smartDefault = getSmartDefaultView(serviceStatus?.published, hasWorkbook);
        setActiveView(smartDefault);

        // Don't save this as a preference - let user's first manual choice be saved
      }

      setHasSetSmartDefault(true);
    }
  }, [configLoaded, serviceStatus, serviceId, hasSetSmartDefault]);

  // Helper function to process workbook data
  const processWorkbookData = useCallback((workbookResult: any) => {

    const processedData = workbookManager.processWorkbookData(workbookResult);

    if (processedData) {
      if (processedData.type === 'sjs') {
        setSpreadsheetData({
          type: 'sjs',
          blob: processedData.blob,
          format: 'sjs'
        });
      } else if (processedData.type === 'json') {
        setSpreadsheetData(processedData.data);
      }
    }

    setWorkbookLoaded(true);
    setWorkbookLoading(false);
  }, []);

  // Load workbook on demand (when switching to Workbook view)
  const loadWorkbookOnDemand = useCallback(async () => {
    // Don't reload if already loaded or loading
    if (workbookLoaded || workbookLoading || !serviceId) {
      return;
    }

    setWorkbookLoading(true);
    const controller = new AbortController();

    try {
      const workbookResponse = await fetch(`/api/workbook/${serviceId}`, {
        signal: controller.signal,
        headers: {
          'X-Expected-404': 'true',
          'If-None-Match': localStorage.getItem(`workbook-etag-${serviceId}`) || ''
        }
      });

      if (workbookResponse.status === 304) {
        // Workbook hasn't changed, use cached version
        const cachedWorkbook = localStorage.getItem(`workbook-data-${serviceId}`);
        if (cachedWorkbook) {
          const workbookResult = JSON.parse(cachedWorkbook);
          processWorkbookData(workbookResult);
        } else {
          // Cache miss, need to reload
          setWorkbookLoading(false);
        }
      } else if (workbookResponse.ok && workbookResponse.status !== 204) {
        try {
          const workbookResult = await workbookResponse.json();

          // Store ETag and data for future requests
          const etag = workbookResponse.headers.get('etag');
          if (etag) {
            localStorage.setItem(`workbook-etag-${serviceId}`, etag);
            localStorage.setItem(`workbook-data-${serviceId}`, JSON.stringify(workbookResult));
          }

          processWorkbookData(workbookResult);
        } catch (error) {
          setWorkbookLoading(false);
        }
      } else {
        // No workbook available (204 or other status)
        setWorkbookLoading(false);
        setWorkbookLoaded(true); // Mark as loaded to prevent infinite loop
        if (!spreadsheetData) {
          setShowEmptyState(true);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        message.error('Failed to load workbook');
      }
      setWorkbookLoading(false);
    }
  }, [serviceId, workbookLoaded, workbookLoading, spreadsheetData, message, processWorkbookData]);

  // Load workbook when switching to Workbook view
  useEffect(() => {
    if (activeView === 'Workbook' && !workbookLoaded && !workbookLoading && configLoaded) {
      loadWorkbookOnDemand();
    }
  }, [activeView, workbookLoaded, workbookLoading, configLoaded, loadWorkbookOnDemand]);

  // Load existing workbook or check for pre-uploaded file
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadWorkbook = async () => {
      // Skip if component unmounted (prevents double fetch in StrictMode)
      if (!mounted) return;

      // Skip if we're importing a service package OR just finished importing
      if (isImporting || justImportedRef.current) {
        console.log('[Load] Skipping API load - importing service package or just imported');
        return;
      }

      // Parallel load all data for optimal performance
      setLoadingMessage('Loading service data...');

      try {
        // Only load service data initially - NOT workbook
        const fullDataResponse = await fetch(`/api/services/${serviceId}/full`, {
          signal: controller.signal
        }).then(async (res) => {
          // If full endpoint fails, try regular endpoint as fallback
          if (!res.ok && res.status === 404) {
            return fetch(`/api/services/${serviceId}`, {
              signal: controller.signal
            });
          }
          return res;
        });

        if (!mounted) return;

        // Process combined service data
        if (fullDataResponse.ok && fullDataResponse.status !== 204) {
          const data = await fullDataResponse.json();

          // Check if this is a demo service
          const isDemo = isDemoService(serviceId);
          setIsDemoMode(isDemo);

          // Check if this is the full endpoint response or regular endpoint
          const isFullEndpoint = data.service && data.status;

          if (isFullEndpoint) {
            // Full endpoint response - include workbook info
            setServiceStatus({
              ...data.status,
              hasWorkbook: data.workbook?.hasWorkbook || false,
              workbookUrl: data.service?.workbookUrl || null
            });

            // Normalize numeric fields and filter out undefined/null values from aiExamples in inputs
            const normalizeNumeric = (val: any) => {
              if (val === '' || val === null || val === undefined) return undefined;
              if (typeof val === 'string') {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? undefined : parsed;
              }
              return val;
            };

            const sanitizedInputs = (data.service.inputs || []).map((input: any) => ({
              ...input,
              min: normalizeNumeric(input.min),
              max: normalizeNumeric(input.max),
              defaultValue: normalizeNumeric(input.defaultValue),
              aiExamples: (input.aiExamples || []).filter((ex: any) => ex !== undefined && ex !== null && ex !== '')
            }));

            const loadedConfig = {
              name: data.service.name || '',
              description: data.service.description || '',
              inputs: sanitizedInputs,
              outputs: data.service.outputs || [],
              areas: data.service.areas || [],
              enableCaching: data.service.enableCaching !== false,
              requireToken: data.service.requireToken === true,
              cacheTableSheetData: data.service.cacheTableSheetData !== false,
              tableSheetCacheTTL: data.service.tableSheetCacheTTL || 300,
              aiDescription: data.service.aiDescription || '',
              aiUsageGuidance: data.service.aiUsageGuidance || '',
              aiUsageExamples: data.service.aiUsageExamples || [],
              aiTags: data.service.aiTags || [],
              category: data.service.category || '',
              webAppToken: data.service.webAppToken || '',
              webAppConfig: data.service.webAppConfig || '',
              webAppTheme: data.service.webAppTheme || 'default',
              customThemeParams: data.service.customThemeParams || ''
            };
            setApiConfig(loadedConfig);
            setSavedConfig(loadedConfig);
            setConfigLoaded(true); // Mark config as loaded
          } else {
            // Regular endpoint response - data is the service directly
            setServiceStatus({
              published: data.status === 'published',
              status: data.status || 'draft',
              hasWorkbook: !!data.workbookUrl,
              workbookUrl: data.workbookUrl || null
            });

            // Normalize numeric fields and filter out undefined/null values from aiExamples in inputs
            const normalizeNumeric = (val: any) => {
              if (val === '' || val === null || val === undefined) return undefined;
              if (typeof val === 'string') {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? undefined : parsed;
              }
              return val;
            };

            const sanitizedInputs = (data.inputs || []).map((input: any) => ({
              ...input,
              min: normalizeNumeric(input.min),
              max: normalizeNumeric(input.max),
              defaultValue: normalizeNumeric(input.defaultValue),
              aiExamples: (input.aiExamples || []).filter((ex: any) => ex !== undefined && ex !== null && ex !== '')
            }));

            console.log('Loading service - webAppConfig from API:', data.webAppConfig);

            const loadedConfig = {
              name: data.name || '',
              description: data.description || '',
              inputs: sanitizedInputs,
              outputs: data.outputs || [],
              areas: data.areas || [],
              enableCaching: data.cacheEnabled !== 'false', // Redis stores as 'cacheEnabled' string
              requireToken: data.requireToken === 'true', // Redis stores as string
              cacheTableSheetData: data.cacheTableSheetData !== 'false', // Default to true
              tableSheetCacheTTL: parseInt(data.tableSheetCacheTTL) || 300,
              aiDescription: data.aiDescription || '',
              aiUsageGuidance: data.aiUsageGuidance || '',
              aiUsageExamples: data.aiUsageExamples || [],
              aiTags: data.aiTags || [],
              category: data.category || '',
              webAppToken: data.webAppToken || '',
              webAppConfig: data.webAppConfig || '',
              webAppTheme: data.webAppTheme || 'default',
              customThemeParams: data.customThemeParams || ''
            };

            console.log('Loading service - webAppConfig in loadedConfig:', loadedConfig.webAppConfig);

            setApiConfig(loadedConfig);
            setSavedConfig(loadedConfig);
            setConfigLoaded(true); // Mark config as loaded
          }

          // Don't load workbook initially - will load when switching to Workbook view
          setInitialLoading(false);
          setLoadingMessage('');
        } else if (fullDataResponse.status === 404 || fullDataResponse.status === 204) {
          // 204 No Content is expected for new services

          // Generate automatic name for new service
          const date = new Date();
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const automaticName = `Service ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

          const newConfig = {
            name: automaticName,
            description: '',
            inputs: [],
            outputs: [],
            areas: [],
            enableCaching: true,
            requireToken: false,
            cacheTableSheetData: true,
            tableSheetCacheTTL: 300,
            aiDescription: '',
            aiUsageGuidance: '',
            aiUsageExamples: [],
            aiTags: [],
            category: '',
            webAppToken: '',
            webAppConfig: '',
            webAppTheme: 'default',
            customThemeParams: ''
          };
          setApiConfig(newConfig);
          setSavedConfig(newConfig); // Set same config to prevent immediate "Save Changes"
          setConfigHasChanges(false); // Don't mark as changed until user actually makes changes
          setConfigLoaded(true); // Mark config as loaded for new service

          // Show empty state instead of default spreadsheet
          setShowEmptyState(true);
          setInitialLoading(false);
          setLoadingMessage('');
        } else {
          // Other errors
          setInitialLoading(false);
        }
      } catch (error) {
        // Ignore abort errors - they're expected when component unmounts
        if (error.name !== 'AbortError') {
        }
        setInitialLoading(false);
      }
    };

    // Check for pre-uploaded file from drag & drop
    if (typeof window !== 'undefined' && (window as any).__draggedFile) {
      const file = (window as any).__draggedFile;

      // Process the dragged file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result;
        if (arrayBuffer) {
          setSpreadsheetData({
            type: 'excel',
            data: arrayBuffer,
            fileName: file.name
          });
        }
      };
      reader.readAsArrayBuffer(file);

      delete (window as any).__draggedFile;
    }

    // Initial loading will be handled in a separate effect

    // Show drawer on mobile after initial load
    if (isMobile) {
      setDrawerVisible(true);
    }

    loadWorkbook();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [serviceId, isMobile, isImporting]);

  // Handle initial loading state based on spreadsheet data
  useEffect(() => {
    if (spreadsheetData !== null) {
      // Don't reset visibility - let the workbook handle it
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setInitialLoading(false);
      }, 100);
    }
  }, [spreadsheetData]);

  const handleFileUpload = async (info: any) => {
    const { status, originFileObj } = info.file;

    if (status === 'done') {
      try {
        // Read the file content
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result;
            if (arrayBuffer) {
              // For Excel files, we'll pass the array buffer to WorkbookViewer
              // It will handle the import internally
              setSpreadsheetData({
                type: 'excel',
                data: arrayBuffer,
                fileName: info.file.name
              });
              message.success(`${info.file.name} loaded successfully.`);
            }
          } catch (error) {
            message.error('Failed to process the file');
          }
        };
        reader.readAsArrayBuffer(originFileObj);
      } catch (error) {
        message.error('Failed to read the file');
      }
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps = {
    name: 'file',
    accept: '.xlsx,.xls,.csv',
    maxCount: 1,
    customRequest: ({ file, onSuccess }: any) => {
      // For now, just mark as success
      // TODO: Actually process the file
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    onChange: handleFileUpload,
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/app');
  };

  const handlePublish = async () => {
    try {
      // First ensure everything is saved
      if (hasAnyChanges) {
        message.warning('Please save your changes before publishing');
        return;
      }

      // If workbook not loaded, we need to load it first
      if (!spreadInstance) {
        // Check if we even have a workbook to load
        const hasWorkbook = apiConfig.inputs?.length > 0 || apiConfig.outputs?.length > 0;

        if (!hasWorkbook) {
          message.error('Cannot publish: No parameters defined. Please add inputs or outputs first.');
          return;
        }

        // Show modal asking user to switch to Workbook view
        Modal.confirm({
          title: 'Workbook Required for Publishing',
          content: 'Publishing requires the workbook to be loaded. Please switch to the Workbook view to load the spreadsheet data, then try publishing again.',
          okText: 'Switch to Workbook',
          cancelText: 'Cancel',
          onOk: () => {
            setActiveView('Workbook');
            message.info('Please wait for the workbook to load, then click Publish again.');
          }
        });

        return;
      }

      if (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0)) {
        message.error('Please define at least one input, output, or editable area');
        return;
      }

      setLoading(true);
      message.info('Preparing service for publishing...');

      // Prepare the publish data
      const publishData = await prepareServiceForPublish(
        spreadInstance,
        apiConfig,
        {
          enableCaching: apiConfig.enableCaching,
          requireToken: apiConfig.requireToken,
          cacheTableSheetData: apiConfig.cacheTableSheetData,
          tableSheetCacheTTL: apiConfig.tableSheetCacheTTL,
          tokens: [] // Will add token management later
        }
      );

      // Publish the service
      const result = await publishService(serviceId, publishData);

      if (result.error) {
        throw new Error(result.error);
      }

      message.success('Service published successfully!');

      // Set a flag to refresh the service list
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('refreshServiceList', Date.now().toString());
      }

      // Update the service status
      setServiceStatus(prevStatus => ({
        ...prevStatus,
        published: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
        useCaching: apiConfig.enableCaching,
        needsToken: apiConfig.requireToken
      }));

      setLoading(false);

    } catch (error) {
      console.error('Failed to publish service:', error);
      message.error('Failed to publish service: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleRepublish = async () => {
    try {
      // First ensure everything is saved
      if (hasAnyChanges) {
        message.warning('Please save your changes before republishing');
        return;
      }

      // If workbook not loaded, we need to load it first
      if (!spreadInstance) {
        // Check if we even have a workbook to load
        const hasWorkbook = apiConfig.inputs?.length > 0 || apiConfig.outputs?.length > 0;

        if (!hasWorkbook) {
          message.error('Cannot republish: No parameters defined. Please add inputs or outputs first.');
          return;
        }

        // Show modal asking user to switch to Workbook view
        Modal.confirm({
          title: 'Workbook Required for Republishing',
          content: 'Republishing requires the workbook to be loaded. Please switch to the Workbook view to load the spreadsheet data, then try republishing again.',
          okText: 'Switch to Workbook',
          cancelText: 'Cancel',
          onOk: () => {
            setActiveView('Workbook');
            message.info('Please wait for the workbook to load, then click Republish again.');
          }
        });

        return;
      }

      if (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0)) {
        message.error('Please define at least one input, output, or editable area');
        return;
      }

      setLoading(true);
      message.info('Republishing service...');

      // Prepare the publish data
      const publishData = await prepareServiceForPublish(
        spreadInstance,
        apiConfig,
        {
          enableCaching: apiConfig.enableCaching,
          requireToken: apiConfig.requireToken,
          cacheTableSheetData: apiConfig.cacheTableSheetData,
          tableSheetCacheTTL: apiConfig.tableSheetCacheTTL,
          tokens: [] // Will add token management later
        }
      );

      // Publish the service (backend handles update)
      const result = await publishService(serviceId, publishData);

      if (result.error) {
        throw new Error(result.error);
      }

      message.success('Service republished successfully! Cache will update within 10 minutes.');

      // Set a flag to refresh the service list
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('refreshServiceList', Date.now().toString());
      }

      // Update the service status
      setServiceStatus(prevStatus => ({
        ...prevStatus,
        published: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
        useCaching: apiConfig.enableCaching,
        needsToken: apiConfig.requireToken
      }));

      setLoading(false);

    } catch (error) {
      console.error('Failed to republish service:', error);
      message.error('Failed to republish service: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      if (hasAnyChanges) {
        message.warning('Please save your changes before unpublishing');
        return;
      }

      setLoading(true);

      // Call unpublish API endpoint
      const response = await fetch(`/api/services/${serviceId}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unpublish service');
      }

      message.success('Service unpublished successfully!');

      // Update the service status
      setServiceStatus(prevStatus => ({
        ...prevStatus,
        published: false,
        status: 'draft',
        publishedAt: null
      }));

    } catch (error) {
      message.error('Failed to unpublish: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewApiDefinition = async () => {
    try {
      setLoadingApiDefinition(true);
      setShowApiDefinitionModal(true);

      // Fetch the complete API definition
      const response = await fetch(`/api/v1/services/${serviceId}/definition`);

      if (!response.ok) {
        if (response.status === 404) {
          message.error('Service not published yet. Please publish the service first.');
          setShowApiDefinitionModal(false);
          return;
        }
        throw new Error('Failed to fetch API definition');
      }

      const data = await response.json();
      setApiDefinitionData(data);

    } catch (error) {
      message.error('Failed to load API definition: ' + (error.message || 'Unknown error'));
      setShowApiDefinitionModal(false);
    } finally {
      setLoadingApiDefinition(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      if (!spreadInstance) {
        message.error('Spreadsheet not loaded');
        return;
      }

      message.loading('Exporting to Excel...', 0);

      await workbookManager.exportToExcel(
        spreadInstance,
        apiConfig.name || 'spreadsheet'
      );

      message.destroy();
      message.success('Excel file exported successfully');
    } catch (error) {
      message.destroy();
      message.error('Failed to export: ' + (error.message || 'Unknown error'));
    }
  };

  const handleExportServicePackage = async () => {
    try {
      if (!spreadInstance) {
        message.error('Spreadsheet not loaded');
        return;
      }

      message.loading('Exporting service package...', 0);

      // Get workbook JSON
      const workbookJSON = spreadInstance.toJSON();

      console.log('[Export] Workbook JSON:', workbookJSON);
      console.log('[Export] ApiConfig:', {
        inputs: apiConfig.inputs,
        outputs: apiConfig.outputs,
        areas: apiConfig.areas
      });

      // Create service package with all configuration
      const servicePackage = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        service: {
          name: apiConfig.name || 'Untitled Service',
          description: apiConfig.description || '',
          aiDescription: apiConfig.aiDescription || '',
          aiUsageGuidance: apiConfig.aiUsageGuidance || '',
          aiUsageExamples: apiConfig.aiUsageExamples || [],
          aiTags: apiConfig.aiTags || [],
          category: apiConfig.category || '',
          requireToken: apiConfig.requireToken || false,
          enableCaching: apiConfig.enableCaching !== false,
          cacheTableSheetData: apiConfig.cacheTableSheetData !== false,
          tableSheetCacheTTL: apiConfig.tableSheetCacheTTL || 300,
          inputs: apiConfig.inputs || [],
          outputs: apiConfig.outputs || [],
          areas: apiConfig.areas || [],
          webAppToken: apiConfig.webAppToken || '',
          webAppConfig: apiConfig.webAppConfig || '',
          webAppTheme: apiConfig.webAppTheme || 'default',
          customThemeParams: apiConfig.customThemeParams || '',
          workbook: workbookJSON
        }
      };

      console.log('[Export] Service package:', servicePackage);

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(servicePackage, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(apiConfig.name || 'service').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_package.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.destroy();
      message.success('Service package exported successfully');
    } catch (error) {
      message.destroy();
      message.error('Failed to export package: ' + (error.message || 'Unknown error'));
    }
  };

  const isSavingRef = useRef(false);

  const handleSave = async () => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      message.warning('Save already in progress');
      return;
    }

    try {
      isSavingRef.current = true;
      setLoading(true);

      // Check what needs to be saved
      const workbookNeedsSave = workbookRef.current?.hasChanges?.() || false;
      // Only save workbook if:
      // 1. It has changes OR
      // 2. Service has never had a workbook AND the workbook is currently loaded
      const serviceHasWorkbook = serviceStatus?.hasWorkbook || serviceStatus?.workbookUrl || serviceStatus?.urlData;
      const shouldSaveWorkbook = workbookNeedsSave || (!serviceHasWorkbook && workbookRef.current);

      // Check if there are any changes to save
      if (!configHasChanges && !shouldSaveWorkbook) {
        message.info('No changes to save');
        setLoading(false);
        return;
      }

      // Show specific loading message
      if (shouldSaveWorkbook && configHasChanges) {
        setSavingWorkbook(true);
        message.loading('Saving configuration and workbook...', 0);
      } else if (shouldSaveWorkbook) {
        setSavingWorkbook(true);
        message.loading('Saving workbook...', 0);
      } else if (configHasChanges) {
        message.loading('Saving configuration...', 0);
      }

      let workbookBlob = null;
      let saveStartTime = 0;
      let saveEndTime = 0;

      // Additional safety check for workbookRef
      if (!workbookRef.current && shouldSaveWorkbook) {
        message.error('Please wait for the workbook to load before saving');
        setLoading(false);
        setSavingWorkbook(false);
        return;
      }

      if (workbookRef.current && shouldSaveWorkbook) {
        // Save workbook if needed
        if (shouldSaveWorkbook) {
          saveStartTime = performance.now();

          try {
            // For large files, show progress modal
            // We can't detect size before saving, so we'll show progress based on save time
            const savePromise = workbookManager.saveWorkbookAsSJS(workbookRef.current);

            // If save takes more than 500ms, show progress
            const progressTimeout = setTimeout(() => {
              message.destroy();
              setSaveProgress({ visible: true, percent: 30, status: 'Saving workbook data...' });
            }, 500);

            workbookBlob = await savePromise;
            saveEndTime = performance.now();

            // Clear timeout if save was fast
            clearTimeout(progressTimeout);

            if (!workbookBlob) {
            } else {
              const sizeInMB = workbookBlob.size / 1024 / 1024;
              // Update progress if it's a large file and we're showing progress
              if (sizeInMB > 2 && saveProgress.visible) {
                setSaveProgress({ visible: true, percent: 60, status: `Uploading ${sizeInMB.toFixed(1)}MB file...` });
              }
            }
          } catch (error) {
            // Fallback to JSON if SJS fails
            try {
              const workbookData = workbookManager.getWorkbookJSON(workbookRef.current);
              if (workbookData) {
                // Convert JSON to blob
                const jsonString = JSON.stringify(workbookData);
                workbookBlob = new Blob([jsonString], { type: 'application/json' });
              }
            } catch (jsonError) {
            }
          }
        } else if (!shouldSaveWorkbook) {
        }
      }

      // Check if service exists first
      const checkResponse = await fetch(`/api/services/${serviceId}`);

      if (checkResponse.status === 404 || checkResponse.status === 204) {
        // Service doesn't exist, create it
        const createResponse = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: serviceId,
            name: apiConfig.name || 'Untitled Service',
            description: apiConfig.description || ''
          })
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.error || 'Failed to create service');
        }

        const createResult = await createResponse.json();
      } else if (!checkResponse.ok) {
        throw new Error('Failed to check service existence');
      }

      // First update the service with configuration
      const updateResponse = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: apiConfig.name || 'Untitled Service',
          description: apiConfig.description || '',
          file: null, // Don't store workbook in Redis anymore
          inputs: apiConfig.inputs,
          outputs: apiConfig.outputs,
          areas: apiConfig.areas || [],
          enableCaching: apiConfig.enableCaching,
          requireToken: apiConfig.requireToken,
          cacheTableSheetData: apiConfig.cacheTableSheetData,
          tableSheetCacheTTL: apiConfig.tableSheetCacheTTL,
          aiDescription: apiConfig.aiDescription,
          aiUsageGuidance: apiConfig.aiUsageGuidance,
          aiUsageExamples: apiConfig.aiUsageExamples,
          aiTags: apiConfig.aiTags,
          category: apiConfig.category,
          webAppToken: apiConfig.webAppToken,
          webAppConfig: apiConfig.webAppConfig,
          webAppTheme: apiConfig.webAppTheme,
          customThemeParams: apiConfig.customThemeParams,
          status: 'draft'
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update service');
      }

      // Save workbook to blob storage if we have data
      if (workbookBlob) {
        const formData = new FormData();
        formData.append('workbook', workbookBlob, `${serviceId}.sjs`);

        const uploadStartTime = performance.now();

        // Update progress for large files during upload
        const sizeInMB = workbookBlob.size / 1024 / 1024;
        if (saveProgress.visible) {
          setSaveProgress({ visible: true, percent: 90, status: 'Finalizing...' });
        }

        const workbookResponse = await fetch(`/api/workbook/${serviceId}`, {
          method: 'PUT',
          body: formData
        });
        const uploadEndTime = performance.now();

        if (!workbookResponse.ok) {
          const error = await workbookResponse.json();
          throw new Error(error.error || 'Failed to save workbook');
        }

        const result = await workbookResponse.json();

        // Calculate total save time (from SJS generation start to upload end)
        const totalSaveTime = uploadEndTime - saveStartTime;

        // Update service status with the new workbook URL
        setServiceStatus(prevStatus => ({
          ...prevStatus,
          urlData: result.workbookUrl,
          hasWorkbook: true,
          workbookUrl: result.workbookUrl
        }));
      }

      // Show appropriate success message based on what was saved
      message.destroy();
      setSaveProgress({ visible: false, percent: 0, status: '' });

      if (shouldSaveWorkbook && configHasChanges) {
        message.success('Configuration and workbook saved successfully!');
      } else if (shouldSaveWorkbook) {
        message.success('Workbook saved successfully!');
      } else {
        message.success('Configuration saved successfully!');
      }

      // Update saved state to match current state
      if (configHasChanges) {
        setSavedConfig({
          ...apiConfig
        });
        setConfigHasChanges(false);
      }

      // Reset change count in workbook only if we saved the workbook
      if (workbookRef.current && shouldSaveWorkbook) {
        workbookRef.current.resetChangeCount();
        setWorkbookChangeCount(0);
      }
    } catch (error) {
      message.error('Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      isSavingRef.current = false;
      setLoading(false);
      setSavingWorkbook(false);
      setSaveProgress({ visible: false, percent: 0, status: '' });
    }
  };

  // Handle zoom level changes
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(newZoom);
    // Call the WorkbookViewer's zoom handler if available
    if (zoomHandlerRef.current) {
      zoomHandlerRef.current(newZoom);
    }
  }, []);

  const handleWorkbookAction = useCallback((action, data) => {
    if (action === 'spread-changed') {
      // This is the workbook/spread instance
      setSpreadInstance(data);
      // Don't set visibility here - wait for file-loaded or workbook-loaded
    } else if (action === 'designer-initialized') {
      // This is the designer instance, get the workbook from it
      if (data && typeof data.getWorkbook === 'function') {
        setSpreadInstance(data.getWorkbook());
      }
    } else if (action === 'zoom-handler') {
      zoomHandlerRef.current = data;
    } else if (action === 'edit-ended' || action === 'selection-changed' ||
      action === 'range-cleared' || action === 'cell-changed') {
      // Update change count when workbook changes
      if (action === 'edit-ended' || action === 'range-cleared' || action === 'cell-changed') {
        setWorkbookChangeCount(prev => prev + 1);
      }
    } else if (action === 'workbook-loaded' || action === 'file-loaded') {
      // Don't mark as changed when loading existing workbook
      // Only user actions should set hasChanges to true
      setSavingWorkbook(false); // Clear loading state
      // Set visibility after data is fully loaded to prevent flicker
      if (!spreadsheetVisible) {
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
          setSpreadsheetVisible(true);
        });
      }
    }
  }, [spreadsheetVisible]);

  // Workbook event handlers
  const handleWorkbookInit = useCallback((instance: any) => {
    if (workbookRef.current !== instance) {
      workbookRef.current = instance;
    }
    setSpreadInstance(instance);
  }, []);

  const handleWorkbookChange = useCallback(() => {
    setWorkbookChangeCount(prev => prev + 1);
  }, []);

  const setZoomHandlerRef = useCallback((handler: (zoom: number) => void) => {
    zoomHandlerRef.current = handler;
  }, []);

  const handleEditableAreaAdd = useCallback((area: any) => {
    // This would be handled by the ParametersPanel
  }, []);

  const handleEditableAreaUpdate = useCallback((area: any) => {
    // This would be handled by the ParametersPanel
  }, []);

  const handleEditableAreaRemove = useCallback((areaId: string) => {
    // This would be handled by the ParametersPanel
  }, []);

  // Remove this as we're using WorkbookView component now
  /* const renderSpreadsheet = useMemo(() => {
    // Show loading spinner during initial load
    if (initialLoading) {
      return (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #8A64C0',
                borderRadius: '50%',
                margin: '0 auto 16px'
              }}
              className="workbook-spinner"
            />
            <div style={{ color: '#666' }}>Loading...</div>
          </div>
        </div>
      );
    }

    // Show empty state for new services
    if (showEmptyState && !spreadsheetData) {
      return null; // Will be handled outside of memo
    }

    // Don't render WorkbookViewer until we have data
    if (!spreadsheetData) {
      return (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff'
        }}>
          <Spin size="default" />
        </div>
      );
    }

    return (
      <div style={{ height: '100%', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <Spin size="default" />
          </div>
        )}
        <div style={{
          height: '100%',
          opacity: spreadsheetVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          willChange: 'opacity'
        }}>
          <WorkbookViewer
            storeLocal={{ spread: spreadsheetData }}
            readOnly={isDemoMode}
            ref={workbookRef}
            workbookLayout="default"
            initialZoom={zoomLevel}
            actionHandlerProc={handleWorkbookAction}
          // createNewShareProc={(selection) => {
          // }}
          />
        </div>
      </div>
    );
  }, [spreadsheetData, loading, zoomLevel, handleWorkbookAction, initialLoading, showEmptyState, spreadsheetVisible]); */

  const handleConfigChange = useCallback((updates: any) => {
    // If updates contain all config fields, it's a full replacement
    // Otherwise, it's a partial update
    const isFullConfig = updates.hasOwnProperty('name') &&
      updates.hasOwnProperty('description') &&
      updates.hasOwnProperty('inputs');

    if (isFullConfig) {
      // Full config replacement
      const hasActualChanges = JSON.stringify(updates) !== JSON.stringify(savedConfig);
      setConfigHasChanges(hasActualChanges);
      setApiConfig(updates);
    } else {
      // Partial update - merge with existing config
      setApiConfig(prev => {
        const newConfig = { ...prev, ...updates };
        const hasActualChanges = JSON.stringify(newConfig) !== JSON.stringify(savedConfig);
        setConfigHasChanges(hasActualChanges);
        return newConfig;
      });
    }
  }, [savedConfig, serviceStatus.published, message]);

  const handleImportExcel = useCallback(async (file: File) => {
    try {
      setSavingWorkbook(true);

      // File validation
      const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB for free tier (will be updated with licenses)
      const ALLOWED_EXCEL_TYPES = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ];
      const ALLOWED_EXTENSIONS = ['.xls', '.xlsx', '.xlsm'];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        message.error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please use a smaller file.`);
        setSavingWorkbook(false);
        return;
      }

      // Check file type and extension
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!ALLOWED_EXTENSIONS.includes(fileExtension) && !ALLOWED_EXCEL_TYPES.includes(file.type)) {
        message.error('Only Excel files (.xls, .xlsx, .xlsm) are supported');
        setSavingWorkbook(false);
        return;
      }

      // Check for macro-enabled files
      if (fileExtension === '.xlsm' || file.type === 'application/vnd.ms-excel.sheet.macroEnabled.12') {
        message.warning('This file contains macros (.xlsm), but macros are not supported. Only the spreadsheet data will be imported.');
      }

      if (workbookRef.current) {
        try {
          await workbookManager.importFromExcel(workbookRef.current, file);
          setWorkbookChangeCount(prev => prev + 1);

          let successMessage = 'Excel file imported successfully!';

          // Check if the current name is a default name pattern (starts with "Service")
          if (apiConfig.name.startsWith('Service ')) {
            // Extract filename without extension
            const filename = file.name.replace(/\.[^/.]+$/, '');
            // Update the service name to the Excel filename
            setApiConfig(prev => ({
              ...prev,
              name: filename
            }));
            setConfigHasChanges(true); // Mark config as changed
            successMessage = `Excel file imported and service renamed to "${filename}"`;
          }

          message.success(successMessage);
        } catch (error: any) {
          message.error('Failed to import Excel file: ' + (error.message || 'Unknown error'));
        }
      } else {
        message.error('Spreadsheet not initialized. Please wait for the workbook to load.');
      }
    } catch (error) {
      message.error('Failed to import Excel file');
    } finally {
      setSavingWorkbook(false);
    }
  }, [apiConfig.name]);

  // Handle Import from Excel menu action (updates existing workbook)
  const handleImportExcelUpdate = useCallback(() => {
    // Check if workbook is available
    if (!workbookRef.current) {
      message.error('Please wait for the workbook to load');
      return;
    }

    // Check for unsaved changes
    const hasUnsavedChanges = workbookRef.current?.hasChanges?.() || false;

    Modal.confirm({
      title: 'Import Excel File',
      content: (
        <div>
          <p>This will replace your current workbook content with the imported Excel file.</p>
          {hasUnsavedChanges && (
            <p style={{ color: '#ff4d4f', marginTop: 8 }}>
              <strong>Warning:</strong> You have unsaved changes that will be lost.
            </p>
          )}
          <p style={{ marginTop: 8 }}>
            Your parameters and settings will be preserved.
          </p>
        </div>
      ),
      okText: 'Import',
      cancelText: 'Cancel',
      okButtonProps: { danger: hasUnsavedChanges },
      onOk: () => {
        // Create hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.xlsm';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          try {
            // Show loading message
            message.loading('Importing Excel file...', 0);

            // Use existing import function
            await handleImportExcel(file);

            // Clear loading and show success
            message.destroy();
            message.success('Excel file imported successfully! Remember to save your changes.');

            // Mark as having changes so save button is enabled
            setWorkbookChangeCount(prev => prev + 1);
          } catch (error: any) {
            message.destroy();
            message.error('Failed to import: ' + (error.message || 'Unknown error'));
          }
        };
        input.click();
      }
    });
  }, [handleImportExcel]);

  // Handle Excel import for empty state (when workbook is not initialized yet)
  const handleEmptyStateImport = useCallback((file: File) => {
    // Store the file for later use
    setImportFileForEmptyState(file);

    // First create an empty spreadsheet
    setShowEmptyState(false);
    setDefaultSpreadsheetData();

    // The file will be imported once the workbook is initialized
  }, []);

  // Handle Service Package import
  const handleImportServicePackage = useCallback(async (file: File) => {
    try {
      // Set importing flag to prevent config from being overwritten by API load
      setIsImporting(true);
      message.loading('Importing service package...', 0);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonContent = e.target?.result as string;
          const servicePackage = JSON.parse(jsonContent);

          console.log('[Import] Parsed service package:', servicePackage);

          // Validate package structure
          if (!servicePackage.version || !servicePackage.service) {
            throw new Error('Invalid service package format');
          }

          const { service } = servicePackage;

          console.log('[Import] Service data:', {
            name: service.name,
            inputs: service.inputs,
            outputs: service.outputs,
            hasWorkbook: !!service.workbook
          });

          // First, hide empty state and load the workbook
          if (service.workbook) {
            setShowEmptyState(false);
            setSpreadsheetData(service.workbook);  // Set JSON directly, not wrapped
          } else {
            // If no workbook data, create empty spreadsheet
            setShowEmptyState(false);
            setDefaultSpreadsheetData();
          }

          // Small delay to ensure workbook loads first
          await new Promise(resolve => setTimeout(resolve, 100));

          // Normalize numeric fields in inputs (same as API load)
          const normalizeNumeric = (val: any) => {
            if (val === '' || val === null || val === undefined) return undefined;
            if (typeof val === 'string') {
              const parsed = parseFloat(val);
              return isNaN(parsed) ? undefined : parsed;
            }
            return val;
          };

          const sanitizedInputs = (service.inputs || []).map((input: any) => ({
            ...input,
            min: normalizeNumeric(input.min),
            max: normalizeNumeric(input.max),
            defaultValue: normalizeNumeric(input.defaultValue),
            aiExamples: (input.aiExamples || []).filter((ex: any) => ex !== undefined && ex !== null && ex !== '')
          }));

          // Then, set the configuration (include ALL properties)
          const importedConfig = {
            name: service.name || 'Imported Service',
            description: service.description || '',
            aiDescription: service.aiDescription || '',
            aiUsageGuidance: service.aiUsageGuidance || '',
            aiUsageExamples: service.aiUsageExamples || [],
            aiTags: service.aiTags || [],
            category: service.category || '',
            requireToken: service.requireToken || false,
            enableCaching: service.enableCaching !== false,
            cacheTableSheetData: service.cacheTableSheetData !== false,
            tableSheetCacheTTL: service.tableSheetCacheTTL || 300,
            inputs: sanitizedInputs,
            outputs: service.outputs || [],
            areas: service.areas || [],
            webAppToken: service.webAppToken || '',
            webAppConfig: service.webAppConfig || '',
            webAppTheme: service.webAppTheme || 'default',
            customThemeParams: service.customThemeParams || ''
          };

          console.log('[Import] Setting apiConfig:', importedConfig);
          console.log('[Import] Config has inputs:', importedConfig.inputs?.length, 'outputs:', importedConfig.outputs?.length);

          setApiConfig(importedConfig);
          // DON'T set savedConfig - leave it as the old value so comparison shows changes
          // This ensures the Save button appears after import

          // Small delay to ensure state updates propagate before marking as loaded
          await new Promise(resolve => setTimeout(resolve, 50));

          // Set config as loaded
          setConfigLoaded(true);

          // configHasChanges will be automatically set by the useEffect that compares apiConfig vs savedConfig
          // No need to manually set it here

          // Clear importing flag and set justImported flag
          setIsImporting(false);
          justImportedRef.current = true; // Prevent API reload after import

          message.destroy();
          message.success('Service package imported successfully! Remember to save your changes.');
        } catch (error: any) {
          console.error('[Import] Error:', error);
          message.destroy();
          message.error('Failed to parse service package: ' + (error.message || 'Invalid JSON'));
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        message.destroy();
        message.error('Failed to read file');
        setIsImporting(false);
      };

      reader.readAsText(file);
    } catch (error: any) {
      console.error('[Import] Outer error:', error);
      message.destroy();
      message.error('Failed to import service package: ' + (error.message || 'Unknown error'));
      setIsImporting(false);
    }
  }, []);

  // Import the stored file once the workbook is ready
  useEffect(() => {
    if (importFileForEmptyState && spreadInstance && workbookRef.current) {
      // Import the file using the existing handleImportExcel function
      handleImportExcel(importFileForEmptyState);
      // Clear the stored file
      setImportFileForEmptyState(null);
    }
  }, [importFileForEmptyState, spreadInstance, handleImportExcel]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyChanges]);

  const parametersPanel = (
    <div ref={parametersPanelRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ParametersPanel
        spreadInstance={spreadInstance}
        serviceId={serviceId}
        onConfigChange={(updates) => {
          // Only update parameters-related fields
          if (updates.inputs !== undefined || updates.outputs !== undefined || updates.areas !== undefined) {
            handleConfigChange(updates);
          }
        }}
        initialConfig={{
        inputs: apiConfig.inputs,
        outputs: apiConfig.outputs,
        areas: apiConfig.areas
      }}
      isLoading={!configLoaded}
      isDemoMode={isDemoMode}
      addButtonRef={addButtonRef}
    />
    </div>
  );

  // Memoize spreadsheetData to prevent unnecessary re-renders
  const memoizedSpreadsheetData = useMemo(() => {
    if (!spreadsheetData) return null;

    // For object types, create a stable reference
    if (spreadsheetData.type === 'sjs' || spreadsheetData.type === 'excel') {
      return spreadsheetData;
    }

    // For JSON data, only update if content actually changed
    return spreadsheetData;
  }, [
    // Use specific properties that actually indicate data change
    spreadsheetData?.type,
    spreadsheetData?.blob,
    spreadsheetData?.data,
    spreadsheetData?.fileName,
    // For JSON workbooks, stringify to detect actual content changes
    spreadsheetData?.version ? JSON.stringify(spreadsheetData) : null
  ]);

  // Show loading spinner until everything is ready
  if (initialLoading) {
    return (
      <Layout style={{ height: '100vh' }}>
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          gap: 16
        }}>
          <Spin size="default" />
          <div style={{ color: '#666' }}>{loadingMessage}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Sidebar />
      {/* Header */}
      <div style={{
        minHeight: 56,
        height: 56,
        flexShrink: 0,
        background: 'white',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 16,
        paddingRight: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <Space size="small" align="center">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={appStore.toggleSidebar}
          />
          {!isMobile && (
            <Breadcrumb
              items={[
                {
                  title: <a onClick={() => router.push('/app')}>Services</a>,
                },
                {
                  title: configLoaded ? (
                    <Space>
                      <Text
                        editable={!isDemoMode && {
                          onChange: (value) => {
                            if (value && value.trim()) {
                              setApiConfig(prev => ({ ...prev, name: value.trim() }));
                              setConfigHasChanges(true);
                            }
                          },
                          tooltip: 'Click to edit service name',
                          enterIcon: null,
                          maxLength: 100,
                        }}
                        style={{ margin: 0 }}
                      >
                        {apiConfig.name || 'New Service'}
                      </Text>
                    </Space>
                  ) : '...',
                },
              ]}
            />
          )}
        </Space>

        <div ref={viewSwitcherRef}>
          <Segmented
            value={activeView}
            // shape="round"
            onChange={(value) => {
              const newView = value as 'Settings' | 'Workbook' | 'API' | 'Agents' | 'Apps' | 'Usage';
              setActiveView(newView);
              // Save view preference using helper
              saveViewPreference(serviceId, newView);
            }}
            options={isMobile ? [
            {
              value: 'Settings',
              icon: <Tooltip title="Settings"><SettingOutlined /></Tooltip>
            },
            {
              value: 'Workbook',
              icon: <Tooltip title="Workbook"><TableOutlined /></Tooltip>
            },
            {
              value: 'API',
              icon: <Tooltip title="API"><CaretRightOutlined /></Tooltip>
            },
            {
              value: 'Agents',
              icon: <Tooltip title="Agents"><RobotOutlined /></Tooltip>
            },
            {
              value: 'Apps',
              icon: <Tooltip title="Apps"><AppstoreOutlined /></Tooltip>
            },
            {
              value: 'Usage',
              icon: <Tooltip title="Usage"><BarChartOutlined /></Tooltip>
            }
          ] : ['Settings', 'Workbook', 'API', 'Agents', 'Apps', 'Usage']}
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
        />
        </div>

        <Space>
          {hasAnyChanges && !isDemoMode && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              <span>
                Save
                {(configHasChanges || workbookChangeCount > 0) && (
                  <span style={{ fontSize: '12px', marginLeft: '4px', opacity: 0.8 }}>
                    ({configHasChanges && 'Config'}
                    {configHasChanges && workbookChangeCount > 0 && ' + '}
                    {workbookChangeCount > 0 && 'Workbook'})
                  </span>
                )}
              </span>
            </Button>
          )}
          {isDemoMode ? (
            <Tag color='geekblue' style={{
              cursor: 'default',
              fontSize: '12px',
              padding: '4px 12px',
              marginRight: 0
            }}>
              {isMobile ? 'Demo' : 'Demo Mode'}
            </Tag>
          ) : (
            <Dropdown
              menu={{
                items: [
                  serviceStatus?.published ? {
                    key: 'republish',
                    label: 'Republish this service',
                    icon: <CheckCircleOutlined />,
                    onClick: handleRepublish,
                    disabled: hasAnyChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))
                  } : {
                    key: 'publish',
                    label: 'Publish this service',
                    icon: <CheckCircleOutlined />,
                    onClick: handlePublish,
                    disabled: hasAnyChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))
                  },
                  serviceStatus?.published ? {
                    key: 'unpublish',
                    label: 'Unpublish this service',
                    icon: <CloseCircleOutlined />,
                    danger: true,
                    onClick: handleUnpublish,
                    disabled: hasAnyChanges
                  } : null
                ].filter(Boolean)
              }}
              trigger={['click']}
              disabled={loading}
            >
              <Button style={{
                borderRadius: 6,
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 12,
                paddingRight: 12,
                minWidth: 108,
                backgroundColor: serviceStatus?.published ? '#E4F2D4' : '#f5f5f5', //'#FFFBE6',
                borderColor: serviceStatus?.published ? '#f6ffed' : '#f5f5f5', // '#FFE58F',
                // borderColor: serviceStatus?.published ? '#b7eb8f' : '#ffd591',
                color: serviceStatus?.published ? '#389E0E' : '#666666', //'#fa8c16'
              }}>
                <Space size={4}>
                  {loading ? (
                    <>
                      <Spin size="small" />
                      <span>Working...</span>
                    </>
                  ) : configLoaded ? (
                    serviceStatus?.published ? 'Published' : 'Draft'
                  ) : (
                    <Spin size="small" />
                  )}
                  {!loading && <DownOutlined style={{ fontSize: 12 }} />}
                </Space>
              </Button>
            </Dropdown>
          )}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(!drawerVisible)}
            />
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view-definition',
                  label: 'View API Definition',
                  icon: <FileExcelOutlined />,
                  onClick: handleViewApiDefinition,
                  disabled: !serviceStatus?.published
                },
                {
                  type: 'divider'
                },
                {
                  key: 'import-excel',
                  label: 'Import from Excel',
                  icon: <FileExcelOutlined />,
                  onClick: () => handleImportExcelUpdate(),
                  disabled: !spreadInstance || activeView !== 'Workbook'
                },
                {
                  type: 'divider'
                },
                {
                  key: 'export-excel',
                  label: 'Export to Excel',
                  icon: <FileExcelOutlined />,
                  onClick: () => handleExportToExcel()
                },
                {
                  type: 'divider'
                },
                {
                  key: 'export-package',
                  label: 'Export Service Package',
                  icon: <DownloadOutlined />,
                  onClick: () => handleExportServicePackage(),
                  disabled: !spreadInstance
                }
              ]
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      </div>

      {/* Main Layout */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {!isMobile ? (
          sizesLoaded ? (
            <Splitter
              style={{ height: '100%' }}
              onResize={handlePanelResize}
            >
              <Splitter.Panel collapsible defaultSize={panelSizes[0] + '%'} min="20%" max="50%" style={{ backgroundColor: '#ffffff' }}>
                <div style={{
                  height: '100%',
                  background: 'white',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {parametersPanel}
                </div>
              </Splitter.Panel>
              <Splitter.Panel collapsible style={{ paddingLeft: 10, backgroundColor: '#ffffff' }} defaultSize={panelSizes[1] + '%'} min="50%" max="80%">
                <ErrorBoundary>
                  <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
                    {/* Workbook View */}
                    <div style={{
                      display: activeView === 'Workbook' ? 'block' : 'none',
                      height: '100%'
                    }}>
                      {workbookLoading ? (
                        <div style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#ffffff'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <Spin size="default" />
                            <div style={{ marginTop: 16, color: '#666' }}>Loading spreadsheet...</div>
                          </div>
                        </div>
                      ) : (
                        <WorkbookView
                          ref={workbookRef}
                          spreadsheetData={memoizedSpreadsheetData}
                          showEmptyState={showEmptyState}
                          isDemoMode={isDemoMode}
                          zoomLevel={zoomLevel}
                          onWorkbookInit={handleWorkbookInit}
                          onEmptyStateAction={(action, file) => {
                            if (action === 'start') {
                              setShowEmptyState(false);
                              setDefaultSpreadsheetData();
                            } else if (action === 'import' && file) {
                              setShowEmptyState(false);
                              handleEmptyStateImport(file);
                            }
                          }}
                          onZoomHandlerReady={setZoomHandlerRef}
                          onEditableAreaAdd={handleEditableAreaAdd}
                          onEditableAreaUpdate={handleEditableAreaUpdate}
                          onEditableAreaRemove={handleEditableAreaRemove}
                          onImportExcel={handleImportExcel}
                          onWorkbookChange={handleWorkbookChange}
                          onImportServicePackage={handleImportServicePackage}
                        />
                      )}
                    </div>

                    {/* API View */}
                    <div style={{
                      display: activeView === 'API' ? 'block' : 'none',
                      height: '100%'
                    }}>
                      <ApiView
                        serviceId={serviceId}
                        apiConfig={apiConfig}
                        serviceStatus={serviceStatus}
                        availableTokens={availableTokens}
                        isDemoMode={isDemoMode}
                        configLoaded={configLoaded}
                        isLoading={!configLoaded}
                        hasUnsavedChanges={configHasChanges}
                        onRequireTokenChange={(value) => {
                          handleConfigChange({ requireToken: value });
                        }}
                        onTokenCountChange={setTokenCount}
                        onTokensChange={setAvailableTokens}
                        onConfigChange={handleConfigChange}
                      />
                    </div>

                    {/* Apps View */}
                    <div style={{
                      display: activeView === 'Apps' ? 'block' : 'none',
                      height: '100%'
                    }}>
                      <AppsView
                        serviceId={serviceId}
                        apiConfig={apiConfig}
                        serviceStatus={serviceStatus}
                        isDemoMode={isDemoMode}
                        configLoaded={configLoaded}
                        isLoading={!configLoaded}
                        hasUnsavedChanges={configHasChanges}
                        onConfigChange={handleConfigChange}
                      />
                    </div>

                    {/* Agents View */}
                    <div style={{
                      display: activeView === 'Agents' ? 'block' : 'none',
                      height: '100%'
                    }}>
                      <AgentsView
                        serviceId={serviceId}
                        apiConfig={apiConfig}
                        serviceStatus={serviceStatus}
                        isDemoMode={isDemoMode}
                        configLoaded={configLoaded}
                        isLoading={!configLoaded}
                        hasUnsavedChanges={configHasChanges}
                        onConfigChange={handleConfigChange}
                      />
                    </div>

                    {/* Settings View */}
                    <div style={{
                      display: activeView === 'Settings' ? 'block' : 'none',
                      height: '100%'
                    }}>
                      <SettingsView
                        apiConfig={apiConfig}
                        spreadsheetData={spreadsheetData}
                        workbookLoaded={workbookLoaded}
                        serviceId={serviceId}
                        serviceStatus={serviceStatus}
                        availableTokens={availableTokens}
                        isDemoMode={isDemoMode}
                        isLoading={!configLoaded}
                        onConfigChange={handleConfigChange}
                        onTokensChange={setAvailableTokens}
                        onTokenCountChange={setTokenCount}
                      />
                    </div>

                    {/* Usage View */}
                    <div style={{
                      display: activeView === 'Usage' ? 'block' : 'none',
                      height: '100%'
                    }}>
                      <UsageView
                        serviceId={serviceId}
                        serviceStatus={serviceStatus}
                        configLoaded={configLoaded}
                      />
                    </div>
                  </div>
                </ErrorBoundary>
              </Splitter.Panel>
            </Splitter>
          ) : (
            // Show a loading placeholder with the same layout to prevent layout shift
            <div style={{ height: '100%', display: 'flex' }}>
              <div style={{ width: '70%', backgroundColor: '#ffffff' }}>
                <Spin spinning={true} style={{ marginTop: 100 }} />
              </div>
              <div style={{ width: '30%', paddingLeft: 10, backgroundColor: '#ffffff' }}>
                <Spin spinning={true} style={{ marginTop: 100 }} />
              </div>
            </div>
          )
        ) : (
          <Layout style={{ height: '100%', overflow: 'auto', backgroundColor: '#ffffff' }}>
            <Content style={{ overflow: 'auto', position: 'relative', backgroundColor: '#ffffff' }}>
              {/* Mobile View Switching */}
              <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
                {/* Workbook View */}
                <div style={{
                  display: activeView === 'Workbook' ? 'block' : 'none',
                  height: '100%'
                }}>
                  {workbookLoading ? (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ffffff'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <Spin size="default" />
                        <div style={{ marginTop: 16, color: '#666' }}>Loading spreadsheet...</div>
                      </div>
                    </div>
                  ) : (
                    <WorkbookView
                      ref={workbookRef}
                      spreadsheetData={memoizedSpreadsheetData}
                      showEmptyState={showEmptyState}
                      isDemoMode={isDemoMode}
                      zoomLevel={zoomLevel}
                      onWorkbookInit={handleWorkbookInit}
                      onEmptyStateAction={(action, file) => {
                        if (action === 'start') {
                          setShowEmptyState(false);
                          setDefaultSpreadsheetData();
                        } else if (action === 'import' && file) {
                          setShowEmptyState(false);
                          handleEmptyStateImport(file);
                        }
                      }}
                      onZoomHandlerReady={setZoomHandlerRef}
                      onEditableAreaAdd={handleEditableAreaAdd}
                      onEditableAreaUpdate={handleEditableAreaUpdate}
                      onEditableAreaRemove={handleEditableAreaRemove}
                      onImportExcel={handleImportExcel}
                      onWorkbookChange={handleWorkbookChange}
                      onImportServicePackage={handleImportServicePackage}
                    />
                  )}
                </div>

                {/* API View */}
                <div style={{
                  display: activeView === 'API' ? 'block' : 'none',
                  height: '100%'
                }}>
                  <ApiView
                    serviceId={serviceId}
                    apiConfig={apiConfig}
                    serviceStatus={serviceStatus}
                    availableTokens={availableTokens}
                    isDemoMode={isDemoMode}
                    configLoaded={configLoaded}
                    isLoading={!configLoaded}
                    hasUnsavedChanges={configHasChanges}
                    onRequireTokenChange={(value) => {
                      handleConfigChange({ requireToken: value });
                    }}
                    onTokenCountChange={setTokenCount}
                    onTokensChange={setAvailableTokens}
                    onConfigChange={handleConfigChange}
                  />
                </div>

                {/* Apps View */}
                <div style={{
                  display: activeView === 'Apps' ? 'block' : 'none',
                  height: '100%'
                }}>
                  <AppsView
                    serviceId={serviceId}
                    apiConfig={apiConfig}
                    serviceStatus={serviceStatus}
                    isDemoMode={isDemoMode}
                    configLoaded={configLoaded}
                    isLoading={!configLoaded}
                    hasUnsavedChanges={configHasChanges}
                    onConfigChange={handleConfigChange}
                  />
                </div>

                {/* Agents View */}
                <div style={{
                  display: activeView === 'Agents' ? 'block' : 'none',
                  height: '100%'
                }}>
                  <AgentsView
                    serviceId={serviceId}
                    apiConfig={apiConfig}
                    serviceStatus={serviceStatus}
                    isDemoMode={isDemoMode}
                    configLoaded={configLoaded}
                    isLoading={!configLoaded}
                    hasUnsavedChanges={configHasChanges}
                    onConfigChange={handleConfigChange}
                  />
                </div>

                {/* Settings View */}
                <div style={{
                  display: activeView === 'Settings' ? 'block' : 'none',
                  height: '100%'
                }}>
                  <SettingsView
                    apiConfig={apiConfig}
                    spreadsheetData={spreadsheetData}
                    workbookLoaded={workbookLoaded}
                    serviceId={serviceId}
                    serviceStatus={serviceStatus}
                    availableTokens={availableTokens}
                    isDemoMode={isDemoMode}
                    isLoading={!configLoaded}
                    onConfigChange={handleConfigChange}
                    onTokensChange={setAvailableTokens}
                    onTokenCountChange={setTokenCount}
                  />
                </div>

                {/* Usage View */}
                <div style={{
                  display: activeView === 'Usage' ? 'block' : 'none',
                  height: '100%'
                }}>
                  <UsageView
                    serviceId={serviceId}
                    serviceStatus={serviceStatus}
                    configLoaded={configLoaded}
                  />
                </div>
              </div>
            </Content>
          </Layout>
        )}
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Parameters"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        closeIcon={false}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setDrawerVisible(false)}
          />
        }
        // width={400}
        styles={{
          body: { padding: 0 },
          wrapper: {
            width: '90%',
            maxWidth: '500px'
          }
        }}
      >
        <ErrorBoundary>
          {parametersPanel}
        </ErrorBoundary>
      </Drawer>
      {/* Status Bar */}
      <div ref={statusBarRef}>
        <StatusBar
          recordCount={0}
          selectedCount={0}
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
          hasParameters={apiConfig.inputs.length > 0 || apiConfig.outputs.length > 0}
          onTestClick={() => setTestPanelOpen(!testPanelOpen)}
          testButtonRef={testButtonRef}
        />
      </div>

      {/* Test Panel */}
      <ErrorBoundary>
        <TestPanel
          open={testPanelOpen}
          onClose={() => setTestPanelOpen(false)}
          serviceId={serviceId}
          serviceName={apiConfig.name}
          inputs={apiConfig.inputs || []}
          outputs={apiConfig.outputs || []}
          spreadInstance={spreadInstance}
        />
      </ErrorBoundary>

      {/* Save Progress Modal */}
      <SaveProgressModal
        visible={saveProgress.visible}
        percent={saveProgress.percent}
        status={saveProgress.status}
      />

      {/* API Definition Modal */}
      <ApiDefinitionModal
        visible={showApiDefinitionModal}
        onClose={() => setShowApiDefinitionModal(false)}
        data={apiDefinitionData}
        loading={loadingApiDefinition}
      />

      {/* Service Detail Tour (Demo Services Only) - Lazy Loaded */}
      {tourState && tourState.TourComponent && (
        <>
          <style jsx global>{`
            .ant-tour .ant-tour-content {
              max-width: 400px !important;
            }
          `}</style>
          <tourState.TourComponent
            open={tourState.open}
            onClose={handleTourClose}
            steps={tourState.steps}
            onChange={handleTourChange}
          />
        </>
      )}
    </Layout>
  );
}