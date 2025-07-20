import React, { useEffect, useState, useRef, useCallback } from "react";
import * as GC from "@mescius/spread-sheets";
import "@mescius/spread-sheets-io";
import "@mescius/spread-sheets-charts";
import "@mescius/spread-sheets-shapes";
import "@mescius/spread-sheets-tablesheet";
import "@mescius/spread-sheets-languagepackages";
import "@mescius/spread-sheets-designer-resources-en";
import "@mescius/spread-sheets-formula-panel";
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

export function WorkbookViewer(props) {
  const [designer, setDesigner] = useState(null);
  const [spread, setSpread] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCellCount, setSelectedCellCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [recordCount, setRecordCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const handleZoomChangeRef = useRef(null);

  // Initialize ribbon configuration
  const initRibbon = (showRibbon) => {
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
  };

  const initDesigner = (designerInstance) => {
    if (isInitialized) return;

    console.log("Initializing designer...");
    setIsInitialized(true);
    setDesigner(designerInstance);

    const workbook = designerInstance.getWorkbook();
    setSpread(workbook);

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
  };

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
    if (spread && props.initialZoom && props.initialZoom !== 100 && handleZoomChangeRef.current) {
      // Apply initial zoom after a short delay to ensure spread is fully initialized
      setTimeout(() => {
        if (handleZoomChangeRef.current) {
          handleZoomChangeRef.current(props.initialZoom);
        }
      }, 100);
    }
  }, [spread]); // Only depend on spread to avoid re-running

  useEffect(() => {
    if (!designer || !spread || !props.storeLocal?.spread) return;

    try {
      // Load spreadsheet data if provided
      if (
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
            if (props.actionHandlerProc) {
              props.actionHandlerProc("file-loaded", spread);
            }
          },
          (error) => {
            console.error("Error importing Excel file:", error);
          }
        );
      } else if (
        typeof props.storeLocal.spread === "object" &&
        props.storeLocal.spread.sheets
      ) {
        // Load JSON data
        spread.fromJSON(props.storeLocal.spread);
        if (props.actionHandlerProc) {
          props.actionHandlerProc("file-loaded", spread);
        }
      }
    } catch (error) {
      console.error("Error loading spreadsheet data:", error);
    }
  }, [designer, spread, props.storeLocal?.spread]);

  const getDesignerConfig = () => {
    const showRibbon = props.workbookLayout !== "minimum";
    return initRibbon(showRibbon);
  };

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
      <div style={{ flex: 1 }}>
        <Designer
          styleInfo={{ width: "100%", height: "100%" }}
          config={getDesignerConfig()}
          designerInitialized={initDesigner}
        />
      </div>
    </div>
  );
}
