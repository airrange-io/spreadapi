import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Spin } from "antd";
import * as GC from "@mescius/spread-sheets";
import "@mescius/spread-sheets-io";
// import "@mescius/spread-sheets-charts";
// import "@mescius/spread-sheets-shapes";
import "@mescius/spread-sheets-tablesheet";
// import "@mescius/spread-sheets-languagepackages";
import "@mescius/spread-sheets-designer-resources-en";
// import "@mescius/spread-sheets-formula-panel";
import { Designer } from "@mescius/spread-sheets-designer-react";
import "@mescius/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";
import "@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css";

// Set license keys from environment variables
if (typeof window !== "undefined") {
  if (process.env.NEXT_PUBLIC_SPREADJS18_KEY) {
    GC.Spread.Sheets.LicenseKey = process.env.NEXT_PUBLIC_SPREADJS18_KEY;
  }
  if (process.env.NEXT_PUBLIC_SPREADJS18_DESIGNER_KEY) {
    GC.Spread.Sheets.Designer.LicenseKey =
      process.env.NEXT_PUBLIC_SPREADJS18_DESIGNER_KEY;
  }
}

export const WorkbookViewer = forwardRef(function WorkbookViewer(props, ref) {
  const [designer, setDesigner] = useState(null);
  const [spread, setSpread] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCellCount, setSelectedCellCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(80);
  const [recordCount, setRecordCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const handleZoomChangeRef = useRef(null);
  const isLoadingData = useRef(false);
  const changeCountRef = useRef(0);
  const lastLoadedDataRef = useRef(null); // Track last loaded data to prevent re-loads

  // Initialize ribbon configuration
  const initRibbon = useCallback((showRibbon) => {
    const config = GC.Spread.Sheets.Designer.ToolBarModeConfig;

    // Set compact ribbon height
    config.ribbon.ribbonHeight = 45;

    if (!showRibbon) {
      config.ribbon.panels = [];
      return config;
    }

    // Remove settings and pageLayout tabs
    config.ribbon.panels = config.ribbon.panels.filter(
      (rb) => rb.id !== "settings" && rb.id !== "pageLayout"
    );

    // Filter out the status bar from sidePanels
    config.sidePanels = config.sidePanels.filter(
      (panel) => panel.command !== "statusBarPanel"
    );

    // Hide the file menu
    config.fileMenu = null;

    // Hide barcode button in INSERT tab
    const insertTab = config.ribbon.panels.find((r) => r.id === "insert");
    if (insertTab) {
      const chartsGroup = insertTab.buttonGroups.find(
        (bg) => bg.buttonGroupName === "Charts"
      );
      if (chartsGroup?.commandGroup?.children) {
        chartsGroup.commandGroup.children =
          chartsGroup.commandGroup.children.filter(
            (ch) => ch !== "insertBarCode"
          );
      }
    }

    // Customize DATA tab
    const dataTab = config.ribbon.panels.find((r) => r.id === "data");
    if (dataTab?.buttonGroups[0]?.commandGroup?.children) {
      dataTab.buttonGroups[0].commandGroup.children =
        dataTab.buttonGroups[0].commandGroup.children.filter(
          (ch) => ch === "insertDataManager"
        );
    }
    return config;
  }, []);

  const initDesigner = useCallback(
    (designerInstance) => {
      if (isInitialized) return;

      console.log("Initializing designer...");
      setIsInitialized(true);
      setDesigner(designerInstance);

      const workbook = designerInstance.getWorkbook();
      setSpread(workbook);
      // Don't set isLoading to false here - wait for data to load
      // Configure workbook options
      workbook.options.allowDynamicArray = true;
      workbook.options.scrollbarMaxAlign = true;
      workbook.options.scrollbarShowMax = true;
      workbook.options.calcOnDemand = true;
      workbook.options.allowUserResize = true;
      workbook.options.allowUserZoom = true;
      workbook.options.scrollPixel = true;

      // Set read-only mode if specified
      if (props.readOnly) {
        workbook.options.protect = true;
      }

      // Apply minimal layout if specified
      if (props.workbookLayout === "minimum") {
        workbook.options.showHorizontalScrollbar = true;
        workbook.options.showVerticalScrollbar = true;
        workbook.options.tabStripVisible = false;
        workbook.options.newTabVisible = false;
      }

      // Notify parent component
      if (props.actionHandlerProc) {
        props.actionHandlerProc("spread-changed", workbook);
        props.actionHandlerProc("designer-initialized", designerInstance);
      }

      // Add event listeners
      workbook.bind(GC.Spread.Sheets.Events.SelectionChanged, (e, info) => {
        if (props.actionHandlerProc) {
          props.actionHandlerProc("selection-changed", info);
        }

        // Update selected cell count
        const sheet = workbook.getActiveSheet();
        if (sheet) {
          const selections = sheet.getSelections();
          let count = 0;
          selections.forEach((sel) => {
            count += sel.rowCount * sel.colCount;
          });
          setSelectedCellCount(count);
        }
      });

      workbook.bind(GC.Spread.Sheets.Events.EditEnded, (e, info) => {
        if (props.actionHandlerProc) {
          props.actionHandlerProc("edit-ended", info);
        }
        setChangeCount((prev) => {
          const newCount = prev + 1;
          changeCountRef.current = newCount;
          return newCount;
        });
      });

      // Track range changes to detect DELETE key
      workbook.bind(GC.Spread.Sheets.Events.RangeChanged, (e, args) => {
        // Ignore changes during data loading
        if (isLoadingData.current) return;
        
        // Check if this is a clear action (delete key)
        if (args.action === GC.Spread.Sheets.RangeChangedAction.clear) {
          console.log("Delete key pressed - cells cleared");
          setChangeCount((prev) => {
            const newCount = prev + 1;
            changeCountRef.current = newCount;
            return newCount;
          });
          if (props.actionHandlerProc) {
            props.actionHandlerProc("range-cleared", args);
          }
        }
      });

      // Track cell changes for format changes
      workbook.bind(GC.Spread.Sheets.Events.CellChanged, (e, args) => {
        // Ignore changes during data loading
        if (isLoadingData.current) return;
        
        // Only track specific user-initiated property changes
        // Ignore styleinfo which fires during load, focus on actual formatting changes
        const trackedProperties = [
          'style', 'formatter', 'font', 'backColor', 'foreColor', 
          'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
          'locked', 'textIndent', 'wordWrap', 'shrinkToFit',
          'backgroundImage', 'cellType', 'validator'
        ];
        
        if (args.propertyName && trackedProperties.includes(args.propertyName)) {
          console.log("Cell property changed:", args.propertyName);
          setChangeCount((prev) => {
            const newCount = prev + 1;
            changeCountRef.current = newCount;
            return newCount;
          });
          if (props.actionHandlerProc) {
            props.actionHandlerProc("cell-changed", args);
          }
        }
      });

      // Update record count
      const sheet = workbook.getActiveSheet();
      if (sheet) {
        setRecordCount(sheet.getRowCount());
      }
    },
    [isInitialized, props]
  );

  // Define the zoom handler
  const applyZoom = useCallback((newZoom) => {
    if (spread) {
      const zoomFactor = newZoom / 100;
      spread.options.zoomFactor = zoomFactor;

      // Apply zoom to all sheets
      const sheetCount = spread.getSheetCount();
      for (let i = 0; i < sheetCount; i++) {
        const sheet = spread.getSheet(i);
        if (sheet) {
          sheet.zoom(zoomFactor);
        }
      }

      setZoomLevel(newZoom);
    }
  }, [spread]);

  useEffect(() => {
    handleZoomChangeRef.current = applyZoom;

    // Notify parent that zoom handler is ready (only once when spread is available)
    if (props.actionHandlerProc && spread && handleZoomChangeRef.current) {
      props.actionHandlerProc("zoom-handler", handleZoomChangeRef.current);
    }
  }, [spread, props, applyZoom]);

  const clearSelection = () => {
    if (spread) {
      const sheet = spread.getActiveSheet();
      if (sheet) {
        sheet.clearSelection();
      }
    }
  };

  // Note: Initial zoom is now applied immediately when data loads,
  // so we don't need a separate effect for it

  // Handle fade-in effect after loading completes
  useEffect(() => {
    if (!isLoading && spread) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setFadeIn(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, spread]);

  useEffect(() => {
    if (!designer || !spread) return;
    
    // Don't load if spreadsheet data is null (still loading)
    if (!props.storeLocal?.spread) {
      console.log("WorkbookViewer: No spreadsheet data yet, waiting...");
      return;
    }
    
    // Check if we've already loaded this data to prevent re-initialization
    const currentDataKey = JSON.stringify({
      type: props.storeLocal.spread.type,
      hasBlob: !!props.storeLocal.spread.blob,
      hasData: !!props.storeLocal.spread.data,
      fileName: props.storeLocal.spread.fileName,
      sheetCount: props.storeLocal.spread.sheets ? Object.keys(props.storeLocal.spread.sheets).length : 0
    });
    
    if (dataLoaded && lastLoadedDataRef.current === currentDataKey) {
      console.log("WorkbookViewer: Data already loaded, skipping re-initialization");
      return;
    }
    
    // Check if this is just the default empty workbook
    const isDefaultWorkbook = props.storeLocal.spread.version && 
                             props.storeLocal.spread.sheets && 
                             Object.keys(props.storeLocal.spread.sheets).length === 1 &&
                             !props.storeLocal.spread.type;

    console.log("WorkbookViewer: Attempting to load data", {
      hasSpread: !!spread,
      dataType: typeof props.storeLocal.spread,
      isExcel: props.storeLocal.spread.type === "excel",
      isSJS: props.storeLocal.spread.type === "sjs",
      hasSheets: !!(props.storeLocal.spread.sheets),
      dataKeys: Object.keys(props.storeLocal.spread || {}).slice(0, 10) // First 10 keys
    });

    try {
      // Set loading flag to ignore change events during load
      isLoadingData.current = true;
      lastLoadedDataRef.current = currentDataKey;
      
      // Load spreadsheet data if provided
      if (
        props.storeLocal.spread.type === "sjs" &&
        props.storeLocal.spread.blob
      ) {
        // Load SJS binary format
        console.log("Loading SJS file...");
        spread.open(
          props.storeLocal.spread.blob,
          () => {
            console.log("SJS file loaded successfully");
            
            // Apply initial zoom immediately after loading
            if (props.initialZoom && props.initialZoom !== 100) {
              console.log("Applying initial zoom:", props.initialZoom);
              const zoomFactor = props.initialZoom / 100;
              spread.options.zoomFactor = zoomFactor;
              
              // Apply zoom to all sheets
              const sheetCount = spread.getSheetCount();
              for (let i = 0; i < sheetCount; i++) {
                const sheet = spread.getSheet(i);
                if (sheet) {
                  sheet.zoom(zoomFactor);
                }
              }
              setZoomLevel(props.initialZoom);
            }
            
            setDataLoaded(true);
            setIsLoading(false);
            isLoadingData.current = false; // Clear loading flag
            if (props.actionHandlerProc) {
              props.actionHandlerProc("workbook-loaded", spread);
            }
          },
          (error) => {
            console.error("Error loading SJS file:", error);
            setDataLoaded(true);
            setIsLoading(false);
            isLoadingData.current = false; // Clear loading flag
          },
          {
            openMode: 1 // 1 = normal
          }
        );
      } else if (
        props.storeLocal.spread.type === "excel" &&
        props.storeLocal.spread.data
      ) {
        // Check if Excel IO is available
        if (!GC.Spread.Excel || !GC.Spread.Excel.IO) {
          console.error("GC.Spread.Excel.IO is not available yet");
          // Try again after a short delay
          const retryTimeout = setTimeout(() => {
            if (spread && !dataLoaded) {
              console.log("Retrying Excel import...");
              if (GC.Spread.Excel && GC.Spread.Excel.IO) {
                const excelIO = new GC.Spread.Excel.IO();
                excelIO.import(
                  props.storeLocal.spread.data,
                  (json) => {
                    spread.fromJSON(json);
                    
                    // Apply initial zoom immediately after loading
                    if (props.initialZoom && props.initialZoom !== 100) {
                      console.log("Applying initial zoom:", props.initialZoom);
                      const zoomFactor = props.initialZoom / 100;
                      spread.options.zoomFactor = zoomFactor;
                      
                      // Apply zoom to all sheets
                      const sheetCount = spread.getSheetCount();
                      for (let i = 0; i < sheetCount; i++) {
                        const sheet = spread.getSheet(i);
                        if (sheet) {
                          sheet.zoom(zoomFactor);
                        }
                      }
                      setZoomLevel(props.initialZoom);
                    }
                    
                    console.log("Excel file imported successfully (retry)");
                    setDataLoaded(true);
                    setIsLoading(false);
                    isLoadingData.current = false; // Clear loading flag
                    if (props.actionHandlerProc) {
                      props.actionHandlerProc("file-loaded", spread);
                      props.actionHandlerProc("workbook-loaded", spread);
                    }
                  },
                  (error) => {
                    console.error("Error importing Excel file:", error);
                    setDataLoaded(true);
                    setIsLoading(false);
                    isLoadingData.current = false; // Clear loading flag
                  },
                  {
                    fileType: GC.Spread.Sheets.FileType.excel
                  }
                );
              } else {
                // If still not available, give up and show error
                console.error("Excel IO still not available after retry");
                setDataLoaded(true);
                setIsLoading(false);
              }
            }
          }, 1000);
          
          // Cleanup timeout on unmount
          return () => clearTimeout(retryTimeout);
        }
        
        // Import Excel file
        const excelIO = new GC.Spread.Excel.IO();
        excelIO.import(
          props.storeLocal.spread.data,
          (json) => {
            spread.fromJSON(json);
            
            // Apply initial zoom immediately after loading
            if (props.initialZoom && props.initialZoom !== 100) {
              console.log("Applying initial zoom:", props.initialZoom);
              const zoomFactor = props.initialZoom / 100;
              spread.options.zoomFactor = zoomFactor;
              
              // Apply zoom to all sheets
              const sheetCount = spread.getSheetCount();
              for (let i = 0; i < sheetCount; i++) {
                const sheet = spread.getSheet(i);
                if (sheet) {
                  sheet.zoom(zoomFactor);
                }
              }
              setZoomLevel(props.initialZoom);
            }
            
            setDataLoaded(true);
            setIsLoading(false);
            isLoadingData.current = false; // Clear loading flag
            if (props.actionHandlerProc) {
              props.actionHandlerProc("file-loaded", spread);
            }
          },
          (error) => {
            console.error("Error importing Excel file:", error);
            setDataLoaded(true);
            setIsLoading(false);
            isLoadingData.current = false; // Clear loading flag
          },
          {
            fileType: GC.Spread.Sheets.FileType.excel
          }
        );
      } else if (
        typeof props.storeLocal.spread === "object"
      ) {
        // Load JSON data - don't check for specific properties, just try to load
        console.log("Loading JSON data into spread...");
        spread.fromJSON(props.storeLocal.spread);
        
        // Apply initial zoom immediately after loading data
        if (props.initialZoom && props.initialZoom !== 100) {
          console.log("Applying initial zoom:", props.initialZoom);
          const zoomFactor = props.initialZoom / 100;
          spread.options.zoomFactor = zoomFactor;
          
          // Apply zoom to all sheets
          const sheetCount = spread.getSheetCount();
          for (let i = 0; i < sheetCount; i++) {
            const sheet = spread.getSheet(i);
            if (sheet) {
              sheet.zoom(zoomFactor);
            }
          }
          setZoomLevel(props.initialZoom);
        }
        
        console.log("JSON data loaded successfully");
        setDataLoaded(true);
        setIsLoading(false);
        isLoadingData.current = false; // Clear loading flag
        if (props.actionHandlerProc) {
          props.actionHandlerProc("file-loaded", spread);
        }
      }
    } catch (error) {
      console.error("Error loading spreadsheet data:", error);
      setDataLoaded(true);
      setIsLoading(false);
      isLoadingData.current = false; // Clear loading flag
    }
    
    // If it's a default workbook, immediately mark as loaded
    if (isDefaultWorkbook) {
      console.log("Default workbook detected, marking as loaded");
      setDataLoaded(true);
      setIsLoading(false);
      isLoadingData.current = false; // Clear loading flag
    }
    
    // Clear loading flag with a delay to ensure all initial events have fired
    setTimeout(() => {
      isLoadingData.current = false;
      console.log("Loading flag cleared - ready to track changes");
    }, 1000);
  }, [designer, spread, props.storeLocal?.spread, dataLoaded]);

  const getDesignerConfig = useMemo(() => {
    const showRibbon = props.workbookLayout !== "minimum";
    return initRibbon(showRibbon);
  }, [props.workbookLayout, initRibbon]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    // Get current workbook state as JSON
    getWorkbookJSON: () => {
      if (spread) {
        return spread.toJSON();
      }
      return null;
    },
    // Load workbook from JSON
    loadWorkbookJSON: (jsonData) => {
      if (spread && jsonData) {
        try {
          spread.fromJSON(jsonData);
          if (props.actionHandlerProc) {
            props.actionHandlerProc("workbook-loaded", spread);
          }
          return true;
        } catch (error) {
          console.error("Error loading workbook JSON:", error);
          return false;
        }
      }
      return false;
    },
    // Get designer instance
    getDesigner: () => designer,
    // Get spread instance
    getSpread: () => spread,
    // Check if workbook has changes
    hasChanges: () => {
      console.log('Checking hasChanges:', changeCountRef.current > 0, 'count:', changeCountRef.current);
      return changeCountRef.current > 0;
    },
    // Reset change count
    resetChangeCount: () => {
      console.log('Resetting change count from', changeCountRef.current, 'to 0');
      setChangeCount(0);
      changeCountRef.current = 0;
    },
    // Save workbook as SJS format (binary)
    saveWorkbookSJS: () => {
      return new Promise((resolve, reject) => {
        if (spread) {
          const startTime = performance.now();
          console.log("🔄 Starting workbook save operation...");
          
          // Gather workbook information
          const sheetCount = spread.getSheetCount();
          const activeSheet = spread.getActiveSheet();
          const activeSheetName = activeSheet ? activeSheet.name() : "Unknown";
          
          // Check if workbook contains TableSheets
          let hasTableSheets = false;
          let tableSheetCount = 0;
          const sheetInfo = [];
          
          for (let i = 0; i < sheetCount; i++) {
            const sheet = spread.getSheet(i);
            if (sheet) {
              const isTableSheet = sheet.getDataView && sheet.getDataView();
              if (isTableSheet) {
                hasTableSheets = true;
                tableSheetCount++;
              }
              sheetInfo.push({
                name: sheet.name(),
                type: isTableSheet ? "TableSheet" : "Worksheet",
                rowCount: sheet.getRowCount(),
                colCount: sheet.getColumnCount()
              });
            }
          }
          
          console.log(`📋 Workbook Details:
   • Total Sheets: ${sheetCount}
   • Active Sheet: ${activeSheetName}
   • TableSheets: ${tableSheetCount}
   • Regular Sheets: ${sheetCount - tableSheetCount}`);
          
          if (sheetInfo.length > 0) {
            console.log("📊 Sheet Information:");
            sheetInfo.forEach((info, index) => {
              console.log(`   ${index + 1}. ${info.name} (${info.type}) - ${info.rowCount} rows × ${info.colCount} cols`);
            });
          }
          
          // Optimize save options for TableSheets
          const saveOptions = {
            includeStyles: true,
            includeFormulas: true,
            includeUnusedNames: false,
            saveAsView: false,
            includeBindingSource: false
          };
          
          // If workbook has TableSheets, try to optimize by saving without data
          if (hasTableSheets) {
            console.log("Optimizing save for TableSheet workbook...");
            
            // First try: Save with minimal data inclusion
            saveOptions.includeData = false; // Try to exclude TableSheet data
            saveOptions.fullRecalc = false; // Skip recalculation
          }
          
          spread.save(
            (blob) => {
              const endTime = performance.now();
              const duration = endTime - startTime;
              
              console.log(`✅ Workbook save completed:
   • Duration: ${duration.toFixed(0)}ms
   • Blob Size: ${(blob.size / 1024 / 1024).toFixed(3)}MB (${blob.size.toLocaleString()} bytes)
   • Compression: ${blob.type || 'application/zip'}
   • Performance: ${(blob.size / duration * 1000 / 1024 / 1024).toFixed(2)} MB/s`);
              
              // If TableSheet workbook is still large, warn about it
              if (hasTableSheets && blob.size > 5 * 1024 * 1024) { // > 5MB
                console.warn(`⚠️  Large TableSheet workbook detected (${(blob.size / 1024 / 1024).toFixed(2)}MB).
   Consider using external data sources instead of embedded data for better performance.`);
              }
              
              resolve(blob);
            },
            (error) => {
              console.error("Error saving workbook as SJS:", error);
              reject(error);
            },
            saveOptions
          );
        } else {
          reject(new Error("Spread instance not available"));
        }
      });
    },
    // Save workbook structure only (for TableSheets)
    saveWorkbookStructureOnly: () => {
      return new Promise((resolve, reject) => {
        if (spread) {
          try {
            // Get workbook JSON but process it to remove TableSheet data
            const workbookJSON = spread.toJSON();
            
            // Process each sheet to remove TableSheet data
            if (workbookJSON.sheets) {
              Object.keys(workbookJSON.sheets).forEach(sheetName => {
                const sheet = workbookJSON.sheets[sheetName];
                
                // Check if this is a TableSheet
                if (sheet.dataTable) {
                  console.log(`Removing data from TableSheet: ${sheetName}`);
                  // Keep the TableSheet configuration but remove the data
                  if (sheet.dataTable.table) {
                    // Preserve table structure but clear data
                    sheet.dataTable.table.data = [];
                  }
                }
              });
            }
            
            // Convert processed JSON to SJS
            spread.fromJSON(workbookJSON);
            
            // Now save the modified workbook
            spread.save(
              (blob) => {
                console.log(`Structure-only workbook saved, size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                // Restore original workbook state
                // Note: In production, you'd want to save the original state first
                resolve(blob);
              },
              (error) => {
                console.error("Error saving workbook structure:", error);
                reject(error);
              },
              {
                includeStyles: true,
                includeFormulas: true,
                includeUnusedNames: false,
                saveAsView: false,
                includeBindingSource: false
              }
            );
          } catch (error) {
            console.error("Error processing workbook structure:", error);
            reject(error);
          }
        } else {
          reject(new Error("Spread instance not available"));
        }
      });
    },
    // Load workbook from SJS format (binary)
    loadWorkbookSJS: (blob) => {
      return new Promise((resolve, reject) => {
        if (spread && blob) {
          spread.open(
            blob,
            () => {
              console.log("SJS workbook loaded successfully");
              if (props.actionHandlerProc) {
                props.actionHandlerProc("workbook-loaded", spread);
              }
              resolve(true);
            },
            (error) => {
              console.error("Error loading workbook SJS:", error);
              reject(error);
            },
            {
              openMode: 1 // 1 = normal
            }
          );
        } else {
          reject(new Error("Spread instance or blob not available"));
        }
      });
    },
    // Import Excel file
    importExcel: (file) => {
      return new Promise((resolve, reject) => {
        if (spread && spread.import) {
          spread.import(
            file,
            () => {
                // Mark workbook as changed after import
              setChangeCount((prev) => {
                const newCount = prev + 1;
                changeCountRef.current = newCount;
                return newCount;
              });
              if (props.actionHandlerProc) {
                props.actionHandlerProc("workbook-loaded", spread);
              }
              resolve(true);
            },
            (error) => {
              // Error importing Excel
              reject(error);
            },
            {
              fileType: GC.Spread.Sheets.FileType.excel
            }
          );
        } else {
          reject(new Error("Spread instance not available or import not supported"));
        }
      });
    }
  }), [spread, designer, props]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, position: "relative", marginTop: 8 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: fadeIn ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <Designer
            styleInfo={{ width: "100%", height: "100%" }}
            config={getDesignerConfig}
            designerInitialized={initDesigner}
          />
        </div>
        {/* Loading overlay */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              // backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Spin size="default" />
              <div style={{ marginTop: 8, color: '#666' }}>Loading spreadsheet...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
