'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Layout, Button, Drawer, Divider, Space, Spin, Splitter, Breadcrumb, App, Tag, Typography, Dropdown, Segmented, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined, MenuOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined, MoreOutlined, FileExcelOutlined, MenuFoldOutlined, TableOutlined, CaretRightOutlined, CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/constants/theme';
import ParametersPanel from './components/ParametersPanel';
import ApiTestView from './views/ApiTestView';
import SettingsView from './views/SettingsView';
import WorkbookView from './views/WorkbookView';
import StatusBar from './StatusBar';
import dynamic from 'next/dynamic';
import { prepareServiceForPublish, publishService } from '@/utils/publishService';
import { appStore } from '@/stores/AppStore';
import { isDemoService } from '@/lib/constants';
import { workbookManager } from '@/utils/workbookManager';
import { getSavedView, saveViewPreference, getSmartDefaultView } from '@/lib/viewPreferences';

const { Content, Sider } = Layout;
const { Text } = Typography;

export default function ServicePageClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const workbookRef = useRef<any>(null);
  const { message } = App.useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  // Initialize activeView from localStorage or default based on context
  const [activeView, setActiveView] = useState<'Workbook' | 'API Test' | 'Settings'>(() => {
    const savedView = getSavedView(serviceId);
    if (savedView && ['Workbook', 'API Test', 'Settings'].includes(savedView)) {
      return savedView as 'Workbook' | 'API Test' | 'Settings';
    }
    // Default to Workbook for now, will update based on service status once loaded
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
    aiUsageExamples: [],
    aiTags: [],
    category: ''
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
    aiUsageExamples: [],
    aiTags: [],
    category: ''
  });
  const [configHasChanges, setConfigHasChanges] = useState(false);
  const [workbookChangeCount, setWorkbookChangeCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(80);
  const [serviceStatus, setServiceStatus] = useState<any>({ published: false, status: 'draft' });
  const [spreadsheetVisible, setSpreadsheetVisible] = useState(false); // For fade-in transition
  const [configLoaded, setConfigLoaded] = useState(false); // Track if config has been loaded
  const [hasSetSmartDefault, setHasSetSmartDefault] = useState(false); // Track if we've set smart default
  const [workbookLoading, setWorkbookLoading] = useState(false); // Track workbook loading state
  const [workbookLoaded, setWorkbookLoaded] = useState(false); // Track if workbook has been loaded
  const [isDemoMode, setIsDemoMode] = useState(false); // Track if this is the demo service
  const [availableTokens, setAvailableTokens] = useState<any[]>([]); // Available API tokens
  const [tokenCount, setTokenCount] = useState(0); // Total token count
  const zoomHandlerRef = useRef<any>(null); // Reference to the zoom handler function

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
          console.error('Failed to parse saved panel sizes');
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

    console.log('hasAnyChanges computed:', {
      configHasChanges,
      workbookChangeCount,
      result
    });

    return result;
  }, [configHasChanges, workbookChangeCount]);

  // Memoize the default workbook structure to prevent recreation
  const defaultEmptyWorkbook = useMemo(() => workbookManager.createDefaultWorkbook(), []);

  const setDefaultSpreadsheetData = useCallback(() => {
    console.log('Setting default empty workbook');
    setSpreadsheetData(defaultEmptyWorkbook);
  }, [defaultEmptyWorkbook]);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // Auto-manage drawer visibility based on screen size
      if (!mobile) {
        // Desktop: close drawer (use sider instead)
        setDrawerVisible(false);
      } else if (mobile && !wasMobile) {
        // Just became mobile: show drawer
        setDrawerVisible(true);
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
      JSON.stringify(apiConfig.aiUsageExamples) !== JSON.stringify(savedConfig.aiUsageExamples) ||
      JSON.stringify(apiConfig.aiTags) !== JSON.stringify(savedConfig.aiTags) ||
      apiConfig.category !== savedConfig.category;

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
        console.log(`Setting smart default view: ${smartDefault} (service is ${serviceStatus?.published ? 'published' : 'draft'})`);
      }

      setHasSetSmartDefault(true);
    }
  }, [configLoaded, serviceStatus, serviceId, hasSetSmartDefault]);

  // Helper function to process workbook data
  const processWorkbookData = useCallback((workbookResult: any) => {
    console.log('Processing workbook data:', workbookResult);

    const processedData = workbookManager.processWorkbookData(workbookResult);

    if (processedData) {
      if (processedData.type === 'sjs') {
        setSpreadsheetData({
          type: 'sjs',
          blob: processedData.blob,
          format: 'sjs'
        });
        console.log('SJS workbook loaded');
      } else if (processedData.type === 'json') {
        setSpreadsheetData(processedData.data);
        console.log('JSON workbook loaded');
      }
    }

    setWorkbookLoaded(true);
    setWorkbookLoading(false);
  }, []);

  // Load workbook on demand (when switching to Workbook view)
  const loadWorkbookOnDemand = useCallback(async () => {
    // Don't reload if already loaded or loading
    if (workbookLoaded || workbookLoading || !serviceId) {
      console.log('Workbook already loaded/loading or no serviceId');
      return;
    }

    console.log('Loading workbook on demand...');
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
        console.log('Workbook unchanged (304), using cached version');
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
          console.error('Error processing workbook response:', error);
          setWorkbookLoading(false);
        }
      } else {
        // No workbook available
        console.log('No workbook available for this service');
        setWorkbookLoading(false);
        if (!spreadsheetData) {
          setShowEmptyState(true);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to load workbook:', error);
        message.error('Failed to load workbook');
      }
      setWorkbookLoading(false);
    }
  }, [serviceId, workbookLoaded, workbookLoading, spreadsheetData, message, processWorkbookData]);

  // Load workbook when switching to Workbook view
  useEffect(() => {
    if (activeView === 'Workbook' && !workbookLoaded && !workbookLoading && configLoaded) {
      console.log('Switching to Workbook view - loading workbook...');
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

      // Parallel load all data for optimal performance
      setLoadingMessage('Loading service data...');

      try {
        // Only load service data initially - NOT workbook
        const fullDataResponse = await fetch(`/api/services/${serviceId}/full`, {
          signal: controller.signal
        }).then(async (res) => {
          // If full endpoint fails, try regular endpoint as fallback
          if (!res.ok && res.status === 404) {
            console.log('Full endpoint not found, trying regular service endpoint');
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
          console.log('Service data loaded:', data);

          // Check if this is a demo service
          const isDemo = isDemoService(serviceId);
          setIsDemoMode(isDemo);

          // Check if this is the full endpoint response or regular endpoint
          const isFullEndpoint = data.service && data.status;

          if (isFullEndpoint) {
            // Full endpoint response
            setServiceStatus(data.status);

            const loadedConfig = {
              name: data.service.name || '',
              description: data.service.description || '',
              inputs: data.service.inputs || [],
              outputs: data.service.outputs || [],
              areas: data.service.areas || [],
              enableCaching: data.service.enableCaching !== false,
              requireToken: data.service.requireToken === true,
              cacheTableSheetData: data.service.cacheTableSheetData !== false,
              tableSheetCacheTTL: data.service.tableSheetCacheTTL || 300,
              aiDescription: data.service.aiDescription || '',
              aiUsageExamples: data.service.aiUsageExamples || [],
              aiTags: data.service.aiTags || [],
              category: data.service.category || ''
            };
            console.log('Loaded config from full endpoint:', loadedConfig);
            setApiConfig(loadedConfig);
            setSavedConfig(loadedConfig);
            setConfigLoaded(true); // Mark config as loaded
          } else {
            // Regular endpoint response - data is the service directly
            setServiceStatus({
              published: data.status === 'published',
              status: data.status || 'draft'
            });

            const loadedConfig = {
              name: data.name || '',
              description: data.description || '',
              inputs: data.inputs || [],
              outputs: data.outputs || [],
              areas: data.areas || [],
              enableCaching: data.cacheEnabled !== 'false', // Redis stores as 'cacheEnabled' string
              requireToken: data.requireToken === 'true', // Redis stores as string
              cacheTableSheetData: data.cacheTableSheetData !== 'false', // Default to true
              tableSheetCacheTTL: parseInt(data.tableSheetCacheTTL) || 300,
              aiDescription: data.aiDescription || '',
              aiUsageExamples: data.aiUsageExamples || [],
              aiTags: data.aiTags || [],
              category: data.category || ''
            };
            console.log('Loaded config from regular endpoint:', loadedConfig);
            setApiConfig(loadedConfig);
            setSavedConfig(loadedConfig);
            setConfigLoaded(true); // Mark config as loaded
          }

          // Don't load workbook initially - will load when switching to Workbook view
          setInitialLoading(false);
          setLoadingMessage('');
        } else if (fullDataResponse.status === 404 || fullDataResponse.status === 204) {
          // 204 No Content is expected for new services
          console.log('Creating new service');

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
            aiUsageExamples: [],
            aiTags: [],
            category: ''
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
          console.error('Failed to load service:', error);
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
  }, [serviceId, isMobile]);

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
            console.error('Error processing file:', error);
            message.error('Failed to process the file');
          }
        };
        reader.readAsArrayBuffer(originFileObj);
      } catch (error) {
        console.error('Error reading file:', error);
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
    console.log('Back button clicked');
    router.push('/');
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
      console.log("🚀 ~ handlePublish ~ publishData:", publishData)

      // Publish the service
      const result = await publishService(serviceId, publishData);

      if (result.error) {
        throw new Error(result.error);
      }

      message.success('Service published successfully!');
      console.log('Publish result:', result);

      // Set a flag to refresh the service list
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('refreshServiceList', Date.now().toString());
      }

      // Update the service status
      setServiceStatus({
        published: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
        useCaching: apiConfig.enableCaching,
        needsToken: apiConfig.requireToken
      });

    } catch (error) {
      console.error('Error publishing service:', error);
      message.error('Failed to publish service: ' + (error.message || 'Unknown error'));
    } finally {
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
      setServiceStatus({
        published: false,
        status: 'draft',
        publishedAt: null,
        useCaching: false,
        needsToken: false
      });

    } catch (error) {
      console.error('Error unpublishing service:', error);
      message.error('Failed to unpublish: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
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
      console.error('Error exporting to Excel:', error);
      message.destroy();
      message.error('Failed to export: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Check what needs to be saved
      const workbookNeedsSave = workbookRef.current?.hasChanges?.() || false;
      const hasNoWorkbook = !serviceStatus?.urlData;
      const shouldSaveWorkbook = workbookNeedsSave || hasNoWorkbook;

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
        console.error('Cannot save workbook - WorkbookViewer not initialized yet');
        message.error('Please wait for the workbook to load before saving');
        setLoading(false);
        setSavingWorkbook(false);
        return;
      }

      if (workbookRef.current && shouldSaveWorkbook) {

        console.log('Workbook save decision:', {
          hasChanges: workbookNeedsSave,
          hasNoWorkbook,
          shouldSave: shouldSaveWorkbook
        });

        // Save workbook if needed
        if (shouldSaveWorkbook) {
          console.log('WorkbookRef exists and has changes, getting SJS blob...');
          saveStartTime = performance.now();

          try {
            workbookBlob = await workbookManager.saveWorkbookAsSJS(workbookRef.current);
            saveEndTime = performance.now();
            console.log(`Workbook SJS generation took ${(saveEndTime - saveStartTime).toFixed(0)}ms`);

            if (!workbookBlob) {
              console.warn('No workbook blob available');
            } else {
              console.log('Got workbook blob:', {
                hasData: !!workbookBlob,
                size: workbookBlob.size,
                sizeInMB: (workbookBlob.size / 1024 / 1024).toFixed(2),
                type: workbookBlob.type
              });
            }
          } catch (error) {
            console.error('Error getting workbook SJS:', error);
            // Fallback to JSON if SJS fails
            try {
              const workbookData = workbookManager.getWorkbookJSON(workbookRef.current);
              if (workbookData) {
                // Convert JSON to blob
                const jsonString = JSON.stringify(workbookData);
                workbookBlob = new Blob([jsonString], { type: 'application/json' });
              }
            } catch (jsonError) {
              console.error('Error getting workbook JSON:', jsonError);
            }
          }
        } else if (!shouldSaveWorkbook) {
          console.log('Workbook has no changes and already exists, skipping workbook save');
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
          console.error('Failed to create service:', error);
          throw new Error(error.error || 'Failed to create service');
        }

        const createResult = await createResponse.json();
        console.log('Service created successfully:', createResult);
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
          aiUsageExamples: apiConfig.aiUsageExamples,
          aiTags: apiConfig.aiTags,
          category: apiConfig.category,
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
        const workbookResponse = await fetch(`/api/workbook/${serviceId}`, {
          method: 'PUT',
          body: formData
        });
        const uploadEndTime = performance.now();
        console.log(`Workbook upload took ${(uploadEndTime - uploadStartTime).toFixed(0)}ms`);

        if (!workbookResponse.ok) {
          const error = await workbookResponse.json();
          throw new Error(error.error || 'Failed to save workbook');
        }

        const result = await workbookResponse.json();

        // Calculate total save time (from SJS generation start to upload end)
        const totalSaveTime = uploadEndTime - saveStartTime;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 WORKBOOK SAVE SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📁 File Information:
   • Size: ${result.size} (${workbookBlob.size.toLocaleString()} bytes)
   • Format: SJS (SpreadJS native)
   • Service ID: ${serviceId}`);
        console.log(`⏱️  Performance Metrics:
   • SJS Generation: ${(saveEndTime - saveStartTime).toFixed(0)}ms
   • Upload to Blob: ${(uploadEndTime - uploadStartTime).toFixed(0)}ms
   • Total Save Time: ${totalSaveTime.toFixed(0)}ms (${(totalSaveTime / 1000).toFixed(1)}s)`);
        console.log(`🔗 Storage Details:
   • URL: ${result.workbookUrl}
   • Timestamp: ${result.timestamp}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Update service status with the new workbook URL
        setServiceStatus(prevStatus => ({
          ...prevStatus,
          urlData: result.workbookUrl
        }));
      }

      // Show appropriate success message based on what was saved
      message.destroy();
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
      console.error('Error saving service:', error);
      message.error('Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setSavingWorkbook(false);
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
    // console.log('Workbook action:', action, data);
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
        console.log(`Workbook change detected: ${action}`);
        setWorkbookChangeCount(prev => prev + 1);
      }
    } else if (action === 'workbook-loaded' || action === 'file-loaded') {
      console.log(action === 'workbook-loaded' ? 'Workbook loaded successfully' : 'File loaded successfully');
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
    console.log('Workbook change detected');
    setWorkbookChangeCount(prev => prev + 1);
  }, []);

  const setZoomHandlerRef = useCallback((handler: (zoom: number) => void) => {
    zoomHandlerRef.current = handler;
  }, []);

  const handleEditableAreaAdd = useCallback((area: any) => {
    // This would be handled by the ParametersPanel
    console.log('Editable area added:', area);
  }, []);

  const handleEditableAreaUpdate = useCallback((area: any) => {
    // This would be handled by the ParametersPanel
    console.log('Editable area updated:', area);
  }, []);

  const handleEditableAreaRemove = useCallback((areaId: string) => {
    // This would be handled by the ParametersPanel
    console.log('Editable area removed:', areaId);
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
          //   console.log('Share selection:', selection);
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
  }, [savedConfig]);

  const handleImportExcel = useCallback(async (file: File) => {
    try {
      setSavingWorkbook(true);

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
          console.error('Error importing Excel file:', error);
          message.error('Failed to import Excel file: ' + (error.message || 'Unknown error'));
        }
      } else {
        message.error('Spreadsheet not initialized. Please wait for the workbook to load.');
      }
    } catch (error) {
      console.error('Error handling Excel import:', error);
      message.error('Failed to import Excel file');
    } finally {
      setSavingWorkbook(false);
    }
  }, [apiConfig.name]);

  // Handle Excel import for empty state (when workbook is not initialized yet)
  const handleEmptyStateImport = useCallback((file: File) => {
    // Store the file for later use
    setImportFileForEmptyState(file);

    // First create an empty spreadsheet
    setShowEmptyState(false);
    setDefaultSpreadsheetData();

    // The file will be imported once the workbook is initialized
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
    />
  );

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
      {/* Header */}
      <div style={{
        minHeight: 56,
        height: 56,
        flexShrink: 0,
        background: 'white',
        padding: 0,
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
          <Breadcrumb
            items={[
              {
                title: <a onClick={() => router.push('/')}>Services</a>,
              },
              ...(isMobile ? [] : [{
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
                    {isDemoMode && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>Demo Mode</Tag>
                    )}
                  </Space>
                ) : '...',
              }]),
            ]}
          />
        </Space>

        <Segmented
          value={activeView}
          // shape="round"
          onChange={(value) => {
            const newView = value as 'Workbook' | 'API Test' | 'Settings';
            setActiveView(newView);
            // Save view preference using helper
            saveViewPreference(serviceId, newView);
          }}
          options={isMobile ? [
            { value: 'Workbook', icon: <TableOutlined /> },
            { value: 'API Test', icon: <CaretRightOutlined /> },
            { value: 'Settings', icon: <SettingOutlined /> }
          ] : ['Workbook', 'API Test', 'Settings']}
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
        />

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
          {!isDemoMode && (
            <Dropdown
              menu={{
                items: [
                  serviceStatus?.published ? {
                    key: 'unpublish',
                    label: 'Unpublish this service',
                    icon: <CloseCircleOutlined />,
                    danger: true,
                    onClick: handleUnpublish,
                    disabled: hasAnyChanges
                  } : {
                    key: 'publish',
                    label: 'Publish this service',
                    icon: <CheckCircleOutlined />,
                    onClick: handlePublish,
                    disabled: hasAnyChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))
                  }
                ]
              }}
              trigger={['click']}
              disabled={loading}
            >
              <Button style={{
                borderRadius: 6,
                paddingLeft: 12,
                paddingRight: 12,
                backgroundColor: serviceStatus?.published ? '#f6ffed' : '#f5f5f5', //'#FFFBE6',
                borderColor: serviceStatus?.published ? '#f6ffed' : '#f5f5f5', // '#FFE58F',
                // borderColor: serviceStatus?.published ? '#b7eb8f' : '#ffd591',
                color: serviceStatus?.published ? '#52c41a' : '#666666', //'#fa8c16'
              }}>
                <Space size={4}>
                  {serviceStatus?.published ? 'Published' : 'Draft'}
                  {/* <Divider type="vertical" style={{ marginRight: 5, borderColor: serviceStatus?.published ? '#52c41a' : '#fa8c16' }} /> */}
                  <DownOutlined style={{ fontSize: 12 }} />
                </Space>
              </Button>
            </Dropdown>
          )}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => setDrawerVisible(!drawerVisible)}
            />
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'export-excel',
                  label: 'Export to Excel',
                  icon: <FileExcelOutlined />,
                  onClick: () => handleExportToExcel()
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
                          <div style={{ marginTop: 16, color: '#666' }}>Loading workbook...</div>
                        </div>
                      </div>
                    ) : (
                      <WorkbookView
                        ref={workbookRef}
                        spreadsheetData={spreadsheetData}
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
                      />
                    )}
                  </div>

                  {/* API Test View */}
                  <div style={{
                    display: activeView === 'API Test' ? 'block' : 'none',
                    height: '100%'
                  }}>
                    <ApiTestView
                      serviceId={serviceId}
                      apiConfig={apiConfig}
                      serviceStatus={serviceStatus}
                      availableTokens={availableTokens}
                      isDemoMode={isDemoMode}
                      onRequireTokenChange={(value) => {
                        handleConfigChange({ requireToken: value });
                      }}
                      onTokenCountChange={setTokenCount}
                      onTokensChange={setAvailableTokens}
                    />
                  </div>

                  {/* Settings View */}
                  <div style={{
                    display: activeView === 'Settings' ? 'block' : 'none',
                    height: '100%'
                  }}>
                    <SettingsView
                      apiConfig={apiConfig}
                      serviceId={serviceId}
                      serviceStatus={serviceStatus}
                      availableTokens={availableTokens}
                      isDemoMode={isDemoMode}
                      onConfigChange={handleConfigChange}
                      onTokensChange={setAvailableTokens}
                      onTokenCountChange={setTokenCount}
                    />
                  </div>
                </div>
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
                        <div style={{ marginTop: 16, color: '#666' }}>Loading workbook...</div>
                      </div>
                    </div>
                  ) : (
                    <WorkbookView
                      ref={workbookRef}
                      spreadsheetData={spreadsheetData}
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
                    />
                  )}
                </div>

                {/* API Test View */}
                <div style={{
                  display: activeView === 'API Test' ? 'block' : 'none',
                  height: '100%'
                }}>
                  <ApiTestView
                    serviceId={serviceId}
                    apiConfig={apiConfig}
                    serviceStatus={serviceStatus}
                    availableTokens={availableTokens}
                    isDemoMode={isDemoMode}
                    onRequireTokenChange={(value) => {
                      handleConfigChange({ requireToken: value });
                    }}
                    onTokenCountChange={setTokenCount}
                    onTokensChange={setAvailableTokens}
                  />
                </div>

                {/* Settings View */}
                <div style={{
                  display: activeView === 'Settings' ? 'block' : 'none',
                  height: '100%'
                }}>
                  <SettingsView
                    apiConfig={apiConfig}
                    serviceId={serviceId}
                    serviceStatus={serviceStatus}
                    availableTokens={availableTokens}
                    isDemoMode={isDemoMode}
                    onConfigChange={handleConfigChange}
                    onTokensChange={setAvailableTokens}
                    onTokenCountChange={setTokenCount}
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
        {parametersPanel}
      </Drawer>
      {/* Status Bar */}
      <StatusBar
        recordCount={0}
        selectedCount={0}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
      />
    </Layout>
  );
}