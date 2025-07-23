'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Layout, Button, Drawer, Space, Spin, Splitter, Breadcrumb, App, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/constants/theme';
import EditorPanel from './EditorPanel';
import StatusBar from './StatusBar';
import dynamic from 'next/dynamic';
import { prepareServiceForPublish, publishService } from '@/utils/publishService';
import EmptyWorkbookState from './EmptyWorkbookState';

// Dynamically import WorkbookViewer to avoid SSR issues
const WorkbookViewer = dynamic(() => import('./WorkbookViewer').then(mod => mod.WorkbookViewer), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Spin size="default" />
    </div>
  )
}) as any;

const { Content, Sider } = Layout;
// const { Title, Text } = Typography;
// const { Dragger } = Upload;

export default function ServicePageClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const workbookRef = useRef<any>(null);
  const { message } = App.useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
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
    aiDescription: '',
    aiUsageExamples: [],
    aiTags: [],
    category: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(80);
  const [serviceStatus, setServiceStatus] = useState<any>({ published: false, status: 'draft' });
  const [spreadsheetVisible, setSpreadsheetVisible] = useState(false); // For fade-in transition
  const [configLoaded, setConfigLoaded] = useState(false); // Track if config has been loaded
  // const sheetRef = useRef<any>(null); // Reference to the TableSheet - removed, using workbookRef instead
  const zoomHandlerRef = useRef<any>(null); // Reference to the zoom handler function

  // Custom hook for panel sizes
  const usePanelSizes = () => {
    const [sizes, setSizes] = useState<number[]>([70, 30]); // Default sizes
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

  // Memoize the default workbook structure to prevent recreation
  const defaultEmptyWorkbook = useMemo(() => ({
    version: "18.0.7",
    sheetCount: 1,
    activeSheetIndex: 0,
    sheets: {
      Sheet1: {
        name: "Sheet1",
        isSelected: true,
        activeRow: 0,
        activeCol: 0,
        rowCount: 200,
        columnCount: 20,
        theme: "Office",
        data: {
          dataTable: {}
        },
        rowHeaderData: {},
        colHeaderData: {},
        selections: {
          0: {
            row: 0,
            col: 0,
            rowCount: 1,
            colCount: 1
          },
          length: 1
        },
        defaults: {
          colHeaderRowHeight: 20,
          colWidth: 64,
          rowHeaderColWidth: 40,
          rowHeight: 20
        },
        index: 0
      }
    },
    namedStyles: {},
    names: {},
    customLists: []
  }), []); // Empty dependency array since this never changes

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
      apiConfig.aiDescription !== savedConfig.aiDescription ||
      JSON.stringify(apiConfig.aiUsageExamples) !== JSON.stringify(savedConfig.aiUsageExamples) ||
      JSON.stringify(apiConfig.aiTags) !== JSON.stringify(savedConfig.aiTags) ||
      apiConfig.category !== savedConfig.category;

    setHasChanges(configChanged);
  }, [apiConfig, savedConfig]);

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
        // Start all requests in parallel with abort signal
        const [fullDataResponse, workbookResponse] = await Promise.all([
          // Get all service data in one call (service + status)
          fetch(`/api/services/${serviceId}/full`, {
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
          }),
          // Workbook data (with error handling for 404s)
          fetch(`/api/workbook/${serviceId}`, {
            signal: controller.signal,
            headers: {
              'X-Expected-404': 'true',
              'If-None-Match': localStorage.getItem(`workbook-etag-${serviceId}`) || ''
            }
          }).catch(err => ({
            ok: false,
            error: err
          }))
        ]);

        if (!mounted) return;

        // Process combined service data
        if (fullDataResponse.ok && fullDataResponse.status !== 204) {
          const data = await fullDataResponse.json();
          console.log('Service data loaded:', data);

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

          // Process workbook data if available
          if ('status' in workbookResponse && workbookResponse.status === 304) {
            // Workbook hasn't changed, use cached version
            console.log('Workbook unchanged (304), using cached version');
            const cachedWorkbook = localStorage.getItem(`workbook-data-${serviceId}`);
            if (cachedWorkbook) {
              setLoadingMessage('Loading cached workbook...');
              const workbookResult = JSON.parse(cachedWorkbook);
              processWorkbookData(workbookResult);
            }
          } else if (workbookResponse.ok && 'status' in workbookResponse && workbookResponse.status !== 204) {
            setLoadingMessage('Processing workbook...');
            try {
              const workbookResult = await workbookResponse.json();

              // Store ETag and data for future requests
              if ('headers' in workbookResponse) {
                const etag = workbookResponse.headers.get('etag');
                if (etag) {
                  localStorage.setItem(`workbook-etag-${serviceId}`, etag);
                  // Cache the workbook data too
                  localStorage.setItem(`workbook-data-${serviceId}`, JSON.stringify(workbookResult));
                }
              }
              processWorkbookData(workbookResult);
            } catch (error) {
              console.error('Error processing workbook response:', error);
            }
          } else {
            // No workbook or empty response
            setInitialLoading(false);
            setLoadingMessage('');
          }
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
            aiDescription: '',
            aiUsageExamples: [],
            aiTags: [],
            category: ''
          };
          setApiConfig(newConfig);
          setSavedConfig(newConfig); // Set same config to prevent immediate "Save Changes"
          setHasChanges(false); // Don't mark as changed until user actually makes changes
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
        console.error('Failed to load service:', error);
        setInitialLoading(false);
      }
    };

    // Helper function to process workbook data
    const processWorkbookData = (workbookResult: any) => {
      console.log('Processing workbook data:', workbookResult);

      if (workbookResult.format === 'sjs' && workbookResult.workbookBlob) {
        // Handle SJS format
        const base64 = workbookResult.workbookBlob;
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });

        setSpreadsheetData({
          type: 'sjs',
          blob: blob,
          format: 'sjs'
        });
        console.log('SJS workbook loaded');
      } else if (workbookResult.workbookData) {
        // Handle JSON format
        setSpreadsheetData(workbookResult.workbookData);
        console.log('JSON workbook loaded');
      }

      setInitialLoading(false);
      setLoadingMessage('');
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
      if (hasChanges) {
        message.warning('Please save your changes before publishing');
        return;
      }

      if (!spreadInstance) {
        message.error('Spreadsheet not loaded');
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
      if (hasChanges) {
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

  const handleSave = async () => {
    try {
      setLoading(true);
      setSavingWorkbook(true);

      // Check if workbook has changes before saving
      let workbookBlob = null;
      let workbookHasChanges = false;
      let shouldSaveWorkbook = false;

      if (workbookRef.current) {
        // Check if workbook has changes using the hasChanges method
        workbookHasChanges = workbookRef.current.hasChanges && workbookRef.current.hasChanges();

        // For services without a workbook URL, always save the workbook
        const hasNoWorkbook = !serviceStatus?.urlData;
        shouldSaveWorkbook = workbookHasChanges || hasNoWorkbook;

        console.log('Workbook save decision:', {
          hasChanges: workbookHasChanges,
          hasNoWorkbook,
          shouldSave: shouldSaveWorkbook
        });

        // Save workbook if needed
        if (shouldSaveWorkbook && workbookRef.current.saveWorkbookSJS) {
          console.log('WorkbookRef exists and has changes, getting SJS blob...');
          try {
            workbookBlob = await workbookRef.current.saveWorkbookSJS();
            if (!workbookBlob) {
              console.warn('No workbook blob available');
            } else {
              console.log('Got workbook blob:', {
                hasData: !!workbookBlob,
                size: workbookBlob.size,
                type: workbookBlob.type
              });
            }
          } catch (error) {
            console.error('Error getting workbook SJS:', error);
            // Fallback to JSON if SJS fails
            const workbookData = workbookRef.current.getWorkbookJSON();
            if (workbookData) {
              // Convert JSON to blob
              const jsonString = JSON.stringify(workbookData);
              workbookBlob = new Blob([jsonString], { type: 'application/json' });
            }
          }
        } else if (!shouldSaveWorkbook) {
          console.log('Workbook has no changes and already exists, skipping workbook save');
        }
      } else {
        console.error('WorkbookRef.current is null - cannot check workbook changes');
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

        const workbookResponse = await fetch(`/api/workbook/${serviceId}`, {
          method: 'PUT',
          body: formData
        });

        if (!workbookResponse.ok) {
          const error = await workbookResponse.json();
          throw new Error(error.error || 'Failed to save workbook');
        }

        const result = await workbookResponse.json();
        console.log('Workbook saved successfully:', {
          url: result.workbookUrl,
          size: result.size,
          timestamp: result.timestamp
        });
      }

      // Show appropriate success message based on what was saved
      if (workbookBlob) {
        message.success('Service configuration and workbook saved successfully!');
      } else {
        message.success('Service configuration saved successfully!');
      }

      // Update saved state to match current state
      setSavedConfig({
        ...apiConfig
      });
      setHasChanges(false);

      // Reset change count in workbook only if we saved the workbook
      if (workbookRef.current && workbookBlob) {
        workbookRef.current.resetChangeCount();
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
    } else if (action === 'edit-ended' || action === 'selection-changed') {
      // Mark as having changes when user edits
      if (action === 'edit-ended') {
        setHasChanges(true);
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

  const renderSpreadsheet = useMemo(() => {
    // Show loading spinner during initial load
    if (initialLoading) {
      return (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5'
        }}>
          <Spin size="default" />
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
          background: '#f5f5f5'
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
            readOnly={false}
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
  }, [spreadsheetData, loading, zoomLevel, handleWorkbookAction, initialLoading, showEmptyState, spreadsheetVisible]);

  const handleConfigChange = useCallback((config: any) => {
    setApiConfig(config);
  }, []);

  const handleImportExcel = useCallback(async (file: File) => {
    try {
      setSavingWorkbook(true);

      if (workbookRef.current && workbookRef.current.importExcel) {
        try {
          await workbookRef.current.importExcel(file);
          setHasChanges(true); // Mark as having changes

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

  const configPanel = (
    <EditorPanel
      spreadInstance={spreadInstance}
      serviceId={serviceId}
      serviceStatus={serviceStatus}
      onConfigChange={handleConfigChange}
      onImportExcel={handleImportExcel}
      initialConfig={apiConfig}
      showEmptyState={showEmptyState}
      isLoading={!configLoaded}
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
        paddingLeft: 8,
        paddingRight: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <Space size="small" align="center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ padding: '4px 8px' }}
          />
          <Breadcrumb
            items={[
              {
                title: <a onClick={handleBack}>Services</a>,
              },
              {
                title: configLoaded ? (apiConfig.name || 'New Service') : '...',
              },
            ]}
          />
          <Tag color={serviceStatus?.published ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
            {serviceStatus?.published ? 'Published' : 'Draft'}
          </Tag>
        </Space>

        <Space>
          {isMobile && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => setDrawerVisible(!drawerVisible)}
            >
              Configure
            </Button>
          )}
          {hasChanges && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              {savingWorkbook ? 'Saving Workbook...' : 'Save Changes'}
            </Button>
          )}
          {!hasChanges && <Button
            color="default"
            variant="filled"
            onClick={() => {
              window.open(`/api-tester?service=${serviceId}${apiConfig.name ? `&name=${encodeURIComponent(apiConfig.name)}` : ''}`, '_blank');
            }}
          >
            API Tester & Docs
          </Button>}
          {serviceStatus?.published ? (
            <Button
              danger
              color="danger"
              variant="filled"
              onClick={handleUnpublish}
              loading={loading}
              disabled={hasChanges}
            >
              Unpublish Service
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handlePublish}
              loading={loading}
              disabled={hasChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))}
            >
              Publish Service
            </Button>
          )}
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
              <Splitter.Panel collapsible defaultSize={panelSizes[0] + '%'} style={{ backgroundColor: '#ffffff' }}>
                <div style={{
                  height: '100%',
                  background: 'white',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {configPanel}
                </div>
              </Splitter.Panel>
              <Splitter.Panel collapsible style={{ paddingLeft: 10, backgroundColor: '#ffffff' }} defaultSize={panelSizes[1] + '%'} min="35%" max="70%">
                {showEmptyState && !spreadsheetData ? (
                  <EmptyWorkbookState
                    onStartFromScratch={() => {
                      setShowEmptyState(false);
                      setDefaultSpreadsheetData();
                    }}
                    onImportFile={(file) => {
                      setShowEmptyState(false);
                      handleEmptyStateImport(file);
                    }}
                  />
                ) : renderSpreadsheet}
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
          <Layout style={{ height: '100%', overflow: 'auto' }}>
            <Content style={{ overflow: 'auto' }}>
              {showEmptyState && !spreadsheetData ? (
                <EmptyWorkbookState
                  onStartFromScratch={() => {
                    setShowEmptyState(false);
                    setDefaultSpreadsheetData();
                  }}
                  onImportFile={(file) => {
                    setShowEmptyState(false);
                    handleEmptyStateImport(file);
                  }}
                />
              ) : renderSpreadsheet}
            </Content>
          </Layout>
        )}
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Configure API"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        // width={400}
        styles={{
          body: { padding: 0 },
          wrapper: {
            width: '90%',
            maxWidth: '500px'
          }
        }}
      >
        {configPanel}
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