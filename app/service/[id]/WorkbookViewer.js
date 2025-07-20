import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as GC from "@mescius/spread-sheets";
import "@mescius/spread-sheets-io";
// import "@mescius/spread-sheets-charts";
// import "@mescius/spread-sheets-shapes";
// import "@mescius/spread-sheets-tablesheet";
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
  const [zoomLevel, setZoomLevel] = useState(100);
  const [recordCount, setRecordCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const handleZoomChangeRef = useRef(null);

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
        setChangeCount((prev) => prev + 1);
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
  useEffect(() => {
    handleZoomChangeRef.current = (newZoom) => {
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
    };

    // Notify parent that zoom handler is ready (only once when spread is available)
    if (props.actionHandlerProc && spread && handleZoomChangeRef.current) {
      props.actionHandlerProc("zoom-handler", handleZoomChangeRef.current);
    }
  }, [spread, props]);

  const clearSelection = () => {
    if (spread) {
      const sheet = spread.getActiveSheet();
      if (sheet) {
        sheet.clearSelection();
      }
    }
  };

  // Apply initial zoom if provided
  useEffect(() => {
    if (
      spread &&
      props.initialZoom &&
      props.initialZoom !== 100 &&
      handleZoomChangeRef.current
    ) {
      // Apply initial zoom after a short delay to ensure spread is fully initialized
      setTimeout(() => {
        if (handleZoomChangeRef.current) {
          handleZoomChangeRef.current(props.initialZoom);
        }
      }, 100);
    }
  }, [spread]); // Only depend on spread to avoid re-running

  useEffect(() => {
    if (!designer || !spread) return;
    
    // Don't load if spreadsheet data is null (still loading)
    if (!props.storeLocal?.spread) {
      console.log("WorkbookViewer: No spreadsheet data yet, waiting...");
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
            setDataLoaded(true);
            setIsLoading(false);
            if (props.actionHandlerProc) {
              props.actionHandlerProc("workbook-loaded", spread);
            }
          },
          (error) => {
            console.error("Error loading SJS file:", error);
            setDataLoaded(true);
            setIsLoading(false);
          },
          {
            openMode: 1 // 1 = normal
          }
        );
      } else if (
        props.storeLocal.spread.type === "excel" &&
        props.storeLocal.spread.data
      ) {
        // Import Excel file
        const excelIO = new GC.Spread.Excel.IO();
        excelIO.import(
          props.storeLocal.spread.data,
          (json) => {
            spread.fromJSON(json);
            console.log("Excel file imported successfully");
            setDataLoaded(true);
            setIsLoading(false);
            if (props.actionHandlerProc) {
              props.actionHandlerProc("file-loaded", spread);
            }
          },
          (error) => {
            console.error("Error importing Excel file:", error);
            setDataLoaded(true);
            setIsLoading(false);
          }
        );
      } else if (
        typeof props.storeLocal.spread === "object"
      ) {
        // Load JSON data - don't check for specific properties, just try to load
        console.log("Loading JSON data into spread...");
        spread.fromJSON(props.storeLocal.spread);
        console.log("JSON data loaded successfully");
        setDataLoaded(true);
        setIsLoading(false);
        if (props.actionHandlerProc) {
          props.actionHandlerProc("file-loaded", spread);
        }
      }
    } catch (error) {
      console.error("Error loading spreadsheet data:", error);
      setDataLoaded(true);
      setIsLoading(false);
    }
    
    // If it's a default workbook, immediately mark as loaded
    if (isDefaultWorkbook) {
      console.log("Default workbook detected, marking as loaded");
      setDataLoaded(true);
      setIsLoading(false);
    }
  }, [designer, spread, props.storeLocal?.spread]);

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
    hasChanges: () => changeCount > 0,
    // Reset change count
    resetChangeCount: () => setChangeCount(0),
    // Save workbook as SJS format (binary)
    saveWorkbookSJS: () => {
      return new Promise((resolve, reject) => {
        if (spread) {
          spread.save(
            (blob) => {
              resolve(blob);
            },
            (error) => {
              console.error("Error saving workbook as SJS:", error);
              reject(error);
            },
            {
              includeStyles: true,
              includeFormulas: true,
              includeUnusedNames: false,
              saveAsView: false
            }
          );
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
              console.log("Excel file imported successfully");
              if (props.actionHandlerProc) {
                props.actionHandlerProc("workbook-loaded", spread);
              }
              resolve(true);
            },
            (error) => {
              console.error("Error importing Excel:", error);
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
  }), [spread, designer, changeCount, props]);

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
      <div style={{ flex: 1, position: "relative" }}>
        <Designer
          styleInfo={{ width: "100%", height: "100%" }}
          config={getDesignerConfig}
          designerInitialized={initDesigner}
        />
        {/* Loading overlay */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid #f3f3f3",
                  borderTop: "3px solid #8A64C0",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                }}
                className="workbook-spinner"
              />
              <div style={{ color: "#666" }}>Loading workbook...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
