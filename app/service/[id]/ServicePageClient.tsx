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
    enableCaching: true,
    requireToken: false
  });
  const [savedConfig, setSavedConfig] = useState({
    name: '',
    description: '',
    inputs: [],
    outputs: [],
    enableCaching: true,
    requireToken: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [serviceStatus, setServiceStatus] = useState<any>({ published: false, status: 'draft' });
  // const sheetRef = useRef<any>(null); // Reference to the TableSheet - removed, using workbookRef instead
  const zoomHandlerRef = useRef<any>(null); // Reference to the zoom handler function

  // Initialize panel sizes from localStorage to prevent flickering
  const getInitialPanelSizes = (): number[] => {
    if (typeof window === 'undefined') return [70, 30];

    const savedSizes = localStorage.getItem('spreadapi-panel-sizes');
    if (savedSizes) {
      try {
        const sizes = JSON.parse(savedSizes);
        if (Array.isArray(sizes) && sizes.length === 2) {
          return sizes;
        }
      } catch (e) {
        console.error('Failed to parse saved panel sizes');
      }
    }
    return [70, 30]; // Default 70% content, 30% panel
  };

  const [panelSizes, setPanelSizes] = useState<number[]>(getInitialPanelSizes);

  // Save panel sizes to localStorage when they change
  const handlePanelResize = (sizes: (string | number)[]) => {
    // Convert sizes to numbers (they come as percentages)
    const numericSizes = sizes.map(size => {
      if (typeof size === 'string' && size.endsWith('%')) {
        return parseFloat(size);
      }
      return typeof size === 'number' ? size : 50;
    });
    setPanelSizes(numericSizes);
    localStorage.setItem('spreadapi-panel-sizes', JSON.stringify(numericSizes));
  };

  const setDefaultSpreadsheetData = () => {
    // Create a proper empty workbook structure that matches SpreadJS format
    const emptyWorkbook = {
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
    };

    console.log('Setting default empty workbook');
    setSpreadsheetData(emptyWorkbook);
  };

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
      apiConfig.enableCaching !== savedConfig.enableCaching ||
      apiConfig.requireToken !== savedConfig.requireToken;

    setHasChanges(configChanged);
  }, [apiConfig, savedConfig]);

  // Load existing workbook or check for pre-uploaded file
  useEffect(() => {
    let mounted = true;

    const loadWorkbook = async () => {
      // Skip if component unmounted (prevents double fetch in StrictMode)
      if (!mounted) return;

      // Check service status first
      try {
        const statusResponse = await fetch(`/api/services/${serviceId}/status`);
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          setServiceStatus(status);
        }
      } catch (error) {
        console.error('Error checking service status:', error);
      }

      // Check if this is an existing workbook
      try {
        setLoadingMessage('Loading service configuration...');
        const response = await fetch(`/api/services/${serviceId}`);
        if (!mounted) return;

        if (response.ok && response.status !== 204) {
          const data = await response.json();

          // Load the configuration data
          const loadedConfig = {
            name: data.name || '',
            description: data.description || '',
            inputs: data.inputs || [],
            outputs: data.outputs || [],
            enableCaching: data.enableCaching !== false,
            requireToken: data.requireToken === true
          };
          setApiConfig(loadedConfig);
          setSavedConfig(loadedConfig); // Track the saved state

          // Load workbook from blob storage
          try {
            setLoadingMessage('Loading workbook data...');
            const workbookResponse = await fetch(`/api/workbook/${serviceId}?t=${Date.now()}`, {
              cache: 'no-store',
              // Add custom header to suppress console errors for expected 404s
              headers: {
                'X-Expected-404': 'true'
              }
            });
            if (workbookResponse.ok && workbookResponse.status !== 204) {
              const workbookResult = await workbookResponse.json();
              console.log('Workbook API response:', workbookResult);

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
                console.log('SJS workbook loaded from blob storage');
              } else if (workbookResult.workbookData) {
                // Handle JSON format
                setSpreadsheetData(workbookResult.workbookData);
                console.log('JSON workbook loaded from blob storage', {
                  hasData: !!workbookResult.workbookData,
                  type: typeof workbookResult.workbookData
                });
              }
            } else if (workbookResponse.status === 204) {
              // 204 No Content - no workbook exists yet
              console.log('No workbook exists yet, checking legacy storage');
              if (data.file) {
                setSpreadsheetData(data.file);
                console.log('Workbook loaded from legacy storage');
              } else {
                setDefaultSpreadsheetData();
                console.log('No workbook found, using default');
              }
            } else {
              // Other error
              console.error('Error loading workbook:', workbookResponse.status);
              if (data.file) {
                setSpreadsheetData(data.file);
              } else {
                setDefaultSpreadsheetData();
              }
            }
          } catch (error) {
            console.error('Error loading workbook from blob:', error);
            // Fallback to legacy file data if available
            if (data.file) {
              setSpreadsheetData(data.file);
            } else {
              // Only set default data if no workbook exists anywhere
              setDefaultSpreadsheetData();
            }
          }
        } else if (response.status === 404 || response.status === 204) {
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
            enableCaching: true,
            requireToken: false
          };
          setApiConfig(newConfig);
          setSavedConfig({ name: '', description: '', inputs: [], outputs: [], enableCaching: true, requireToken: false }); // Track as unsaved
          setHasChanges(true); // Mark as having changes so user can save

          setDefaultSpreadsheetData();
        }
      } catch (error) {
        // Only log actual errors, not expected 404s
        if (error instanceof Error && !error.message.includes('404')) {
          console.error('Error loading service:', error);
        }
        // If all else fails, set default data
        setDefaultSpreadsheetData();
      }

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
    };

    loadWorkbook();

    return () => {
      mounted = false;
    };
  }, [serviceId, isMobile]);

  // Handle initial loading state based on spreadsheet data
  useEffect(() => {
    if (spreadsheetData !== null) {
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

      if (apiConfig.inputs.length === 0 || apiConfig.outputs.length === 0) {
        message.error('Please define at least one input and one output parameter');
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
        const hasNoWorkbook = !serviceStatus?.urlData && !savedConfig.workbookUrl;
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
          name: apiConfig.name || 'Untitled API',
          description: apiConfig.description || '',
          file: null, // Don't store workbook in Redis anymore
          inputs: apiConfig.inputs,
          outputs: apiConfig.outputs,
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
        ...apiConfig,
        workbookUrl: workbookBlob ? 'saved' : savedConfig.workbookUrl
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
    } else if (action === 'workbook-loaded') {
      console.log('Workbook loaded successfully');
      // Don't mark as changed when loading existing workbook
      // Only user actions should set hasChanges to true
    }
  }, []);

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
    );
  }, [spreadsheetData, loading, zoomLevel, handleWorkbookAction, initialLoading]);

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

  const configPanel = (
    <EditorPanel
      spreadInstance={spreadInstance}
      serviceId={serviceId}
      serviceStatus={serviceStatus}
      onConfigChange={handleConfigChange}
      onImportExcel={handleImportExcel}
      initialConfig={apiConfig}
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
                title: apiConfig.name || 'New Service',
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
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges}
          >
            {savingWorkbook ? 'Saving Workbook...' : 'Save Changes'}
          </Button>
          {serviceStatus?.published ? (
            <Button
              type="default"
              danger
              onClick={handleUnpublish}
              loading={loading}
              disabled={hasChanges}
            >
              Unpublish Service
            </Button>
          ) : (
            <Button
              type="default"
              onClick={handlePublish}
              loading={loading}
              disabled={hasChanges || apiConfig.inputs.length === 0 || apiConfig.outputs.length === 0}
            >
              Publish API
            </Button>
          )}
        </Space>
      </div>

      {/* Main Layout */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {!isMobile ? (
          <Splitter
            style={{ height: '100%' }}
            onResize={handlePanelResize}
          >
            <Splitter.Panel defaultSize={panelSizes[0] + '%'}>
              {renderSpreadsheet}
            </Splitter.Panel>
            <Splitter.Panel defaultSize={panelSizes[1] + '%'} min="20%" max="50%">
              <div style={{
                height: '100%',
                background: 'white',
                // borderLeft: `1px solid ${COLORS.border}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {configPanel}
              </div>
            </Splitter.Panel>
          </Splitter>
        ) : (
          <Layout style={{ height: '100%', overflow: 'auto' }}>
            <Content style={{ overflow: 'auto' }}>
              {renderSpreadsheet}
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
        width="100%"
        styles={{
          body: { padding: 0 },
          wrapper: {
            width: '90%',
            maxWidth: '400px'
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