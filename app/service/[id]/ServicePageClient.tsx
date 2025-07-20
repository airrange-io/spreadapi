'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Layout, Button, Drawer, Space, message, Spin, Splitter, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/constants/theme';
import EditorPanel from './EditorPanel';
import StatusBar from './StatusBar';
import dynamic from 'next/dynamic';

// Dynamically import WorkbookViewer to avoid SSR issues
const WorkbookViewer = dynamic(() => import('./WorkbookViewer').then(mod => ({ default: mod.WorkbookViewer })), {
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
});

const { Content, Sider } = Layout;
// const { Title, Text } = Typography;
// const { Dragger } = Upload;

export default function ServicePageClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<any>({
    version: "18.0.7",
    sheets: {
      Sheet1: {
        name: "Sheet1",
        isSelected: true,
        rowCount: 100,
        columnCount: 26
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial load
  const [spreadInstance, setSpreadInstance] = useState<any>(null);
  const [apiConfig, setApiConfig] = useState({
    name: '',
    description: '',
    inputs: [],
    outputs: []
  });
  const [savedConfig, setSavedConfig] = useState({
    name: '',
    description: '',
    inputs: [],
    outputs: []
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const sheetRef = useRef<any>(null); // Reference to the TableSheet
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
      JSON.stringify(apiConfig.outputs) !== JSON.stringify(savedConfig.outputs);

    setHasChanges(configChanged);
  }, [apiConfig, savedConfig]);

  // Load existing workbook or check for pre-uploaded file
  useEffect(() => {
    let mounted = true;

    const loadWorkbook = async () => {
      // Skip if component unmounted (prevents double fetch in StrictMode)
      if (!mounted) return;

      // Check if this is an existing workbook
      try {
        const response = await fetch(`/api/services/${serviceId}`);
        if (!mounted) return;

        if (response.ok) {
          const data = await response.json();

          // Load the configuration data
          const loadedConfig = {
            name: data.name || '',
            description: data.description || '',
            inputs: data.inputs || [],
            outputs: data.outputs || []
          };
          setApiConfig(loadedConfig);
          setSavedConfig(loadedConfig); // Track the saved state

          // Load spreadsheet if exists
          if (data.file) {
            setSpreadsheetData(data.file);
          }
        } else if (response.status === 404) {
          // This is expected for new workbooks
          console.log('Creating new workbook');
        }
      } catch (error) {
        console.error('Error loading workbook:', error);
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

      // Mark initial load as complete immediately
      setInitialLoading(false);

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

  const handleSave = async () => {
    try {
      setLoading(true);

      // Create the service if it doesn't exist
      const createResponse = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serviceId,
          name: apiConfig.name || 'Untitled API',
          description: apiConfig.description || ''
        })
      });

      if (!createResponse.ok && createResponse.status !== 409 && createResponse.status !== 400) {
        // 409 = already exists, 400 = validation error (both are ok to continue)
        const error = await createResponse.json();
        // console.log('Create service response:', error);
      }

      // Update the service with file and configuration
      const updateResponse = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: apiConfig.name || 'Untitled API',
          description: apiConfig.description || '',
          file: spreadsheetData, // Can be null initially
          inputs: apiConfig.inputs,
          outputs: apiConfig.outputs,
          status: 'draft'
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update service');
      }

      message.success('API saved successfully!');

      // Update saved state to match current state
      setSavedConfig(apiConfig);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving service:', error);
      message.error('Failed to save API');
    } finally {
      setLoading(false);
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
    if (action === 'spread-changed' || action === 'designer-initialized') {
      setSpreadInstance(data);
    } else if (action === 'zoom-handler') {
      zoomHandlerRef.current = data;
    }
  }, []);

  const renderSpreadsheet = useMemo(() => {
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
          ref={sheetRef}
          workbookLayout="default"
          initialZoom={zoomLevel}
          actionHandlerProc={handleWorkbookAction}
        // createNewShareProc={(selection) => {
        //   console.log('Share selection:', selection);
        // }}
        />
      </div>
    );
  }, [spreadsheetData, loading, zoomLevel, handleWorkbookAction]);

  const handleConfigChange = useCallback((config: any) => {
    setApiConfig(config);
  }, []);

  const configPanel = (
    <EditorPanel
      spreadInstance={spreadInstance}
      onConfigChange={handleConfigChange}
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
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spin size="default" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Header */}
      <div style={{
        height: 56,
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
                title: <a onClick={handleBack}>APIs</a>,
              },
              {
                title: apiConfig.name || 'New API',
              },
            ]}
          />
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
            Save API
          </Button>
        </Space>
      </div>

      {/* Main Layout */}
      {!isMobile ? (
        <Splitter
          style={{ height: 'calc(100vh - 56px)' }}
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
              overflow: 'auto',
            }}>
              {configPanel}
            </div>
          </Splitter.Panel>
        </Splitter>
      ) : (
        <Layout>
          <Content style={{ overflow: 'auto' }}>
            {renderSpreadsheet}
          </Content>
        </Layout>
      )}

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