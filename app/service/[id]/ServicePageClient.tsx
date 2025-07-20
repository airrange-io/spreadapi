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
        setLoadingMessage('Loading service configuration...');
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

          // Load workbook from blob storage
          try {
            setLoadingMessage('Loading workbook data...');
            const workbookResponse = await fetch(`/api/workbook/${serviceId}?t=${Date.now()}`, {
              cache: 'no-store'
            });
            if (workbookResponse.ok) {
              const workbookResult = await workbookResponse.json();
              console.log('Workbook API response:', workbookResult);
              if (workbookResult.workbookData) {
                setSpreadsheetData(workbookResult.workbookData);
                console.log('Workbook loaded from blob storage', {
                  hasData: !!workbookResult.workbookData,
                  type: typeof workbookResult.workbookData
                });
              } else if (workbookResult.error === 'No workbook found for this service') {
                // No workbook exists yet, check legacy or set default
                if (data.file) {
                  setSpreadsheetData(data.file);
                  console.log('Workbook loaded from legacy storage');
                } else {
                  setDefaultSpreadsheetData();
                  console.log('No workbook found, using default');
                }
              }
            } else {
              // Check legacy file data in Redis
              if (data.file) {
                setSpreadsheetData(data.file);
                console.log('Workbook loaded from legacy storage');
              } else {
                // Only set default data if no workbook exists anywhere
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
        } else if (response.status === 404) {
          // This is expected for new workbooks
          console.log('Creating new workbook');
          setDefaultSpreadsheetData();
        }
      } catch (error) {
        console.error('Error loading workbook:', error);
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
      setInitialLoading(false);
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

  const handleSave = async () => {
    try {
      setLoading(true);
      setSavingWorkbook(true);
      
      // Get current workbook state from designer
      let workbookData = null;
      if (workbookRef.current) {
        console.log('WorkbookRef exists, getting JSON...');
        workbookData = workbookRef.current.getWorkbookJSON();
        if (!workbookData) {
          console.warn('No workbook data available');
        } else {
          console.log('Got workbook data:', { 
            hasData: !!workbookData,
            sheetCount: workbookData.sheets ? Object.keys(workbookData.sheets).length : 0,
            sheetNames: workbookData.sheets ? Object.keys(workbookData.sheets) : [],
            version: workbookData.version
          });
        }
      } else {
        console.error('WorkbookRef.current is null - cannot save workbook data');
      }

      // Check if service exists first
      const checkResponse = await fetch(`/api/services/${serviceId}`);
      
      if (checkResponse.status === 404) {
        // Service doesn't exist, create it
        const createResponse = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: serviceId,
            name: apiConfig.name || 'Untitled API',
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
      if (workbookData) {
        const workbookResponse = await fetch(`/api/workbook/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workbookData })
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

      message.success('API and workbook saved successfully!');

      // Update saved state to match current state
      setSavedConfig(apiConfig);
      setHasChanges(false);
      
      // Reset change count in workbook
      if (workbookRef.current) {
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
    if (action === 'spread-changed' || action === 'designer-initialized') {
      setSpreadInstance(data);
    } else if (action === 'zoom-handler') {
      zoomHandlerRef.current = data;
    } else if (action === 'edit-ended' || action === 'selection-changed') {
      // Mark as having changes when user edits
      if (action === 'edit-ended') {
        setHasChanges(true);
      }
    } else if (action === 'workbook-loaded') {
      console.log('Workbook loaded successfully');
    }
  }, []);

  const renderSpreadsheet = useMemo(() => {
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
            {savingWorkbook ? 'Saving Workbook...' : 'Save API'}
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