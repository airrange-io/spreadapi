import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Spin } from "antd";
import * as GC from "@mescius/spread-sheets";
import "@mescius/spread-sheets-tablesheet";
import "@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css";

// Set license key from environment variable
if (typeof window !== "undefined") {
  if (process.env.NEXT_PUBLIC_SPREADJS18_KEY) {
    GC.Spread.Sheets.LicenseKey = process.env.NEXT_PUBLIC_SPREADJS18_KEY;
  }
}

export const WorkbookViewer = forwardRef(function WorkbookViewer(props, ref) {
  const [spread, setSpread] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCellCount, setSelectedCellCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(80);
  const [recordCount, setRecordCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const hostRef = useRef(null);
  const handleZoomChangeRef = useRef(null);
  const isLoadingData = useRef(false);
  const changeCountRef = useRef(0);
  const lastLoadedDataRef = useRef(null);

  // Initialize workbook on mount
  useEffect(() => {
    if (!hostRef.current || isInitialized) return;

    const workbook = new GC.Spread.Sheets.Workbook(hostRef.current, {
      sheetCount: 1,
    });

    setIsInitialized(true);
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

    // Notify parent component
    if (props.actionHandlerProc) {
      props.actionHandlerProc("spread-changed", workbook);
    }

    // Add event listeners
    workbook.bind(GC.Spread.Sheets.Events.SelectionChanged, (e, info) => {
      if (props.actionHandlerProc) {
        props.actionHandlerProc("selection-changed", info);
      }

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

    workbook.bind(GC.Spread.Sheets.Events.RangeChanged, (e, args) => {
      if (isLoadingData.current) return;
      if (args.action === GC.Spread.Sheets.RangeChangedAction.clear) {
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

    workbook.bind(GC.Spread.Sheets.Events.CellChanged, (e, args) => {
      if (isLoadingData.current) return;
      const trackedProperties = [
        'style', 'formatter', 'font', 'backColor', 'foreColor',
        'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
        'locked', 'textIndent', 'wordWrap', 'shrinkToFit',
        'backgroundImage', 'cellType', 'validator'
      ];
      if (args.propertyName && trackedProperties.includes(args.propertyName)) {
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

    const sheet = workbook.getActiveSheet();
    if (sheet) {
      setRecordCount(sheet.getRowCount());
    }

    return () => {
      workbook.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Define the zoom handler
  const applyZoom = useCallback((newZoom) => {
    if (spread) {
      const zoomFactor = newZoom / 100;
      spread.options.zoomFactor = zoomFactor;

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

    if (props.actionHandlerProc && spread && handleZoomChangeRef.current) {
      props.actionHandlerProc("zoom-handler", handleZoomChangeRef.current);
    }
  }, [spread, props, applyZoom]);

  // Handle fade-in effect after loading completes
  useEffect(() => {
    if (!isLoading && spread) {
      const timer = setTimeout(() => {
        setFadeIn(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, spread]);

  // Load spreadsheet data
  useEffect(() => {
    if (!spread) return;

    if (!props.storeLocal?.spread) {
      return;
    }

    const currentDataKey = JSON.stringify({
      type: props.storeLocal.spread.type,
      hasBlob: !!props.storeLocal.spread.blob,
      hasData: !!props.storeLocal.spread.data,
      fileName: props.storeLocal.spread.fileName,
      sheetCount: props.storeLocal.spread.sheets ? Object.keys(props.storeLocal.spread.sheets).length : 0
    });

    if (dataLoaded && lastLoadedDataRef.current === currentDataKey) {
      return;
    }

    const isDefaultWorkbook = props.storeLocal.spread.version &&
                             props.storeLocal.spread.sheets &&
                             Object.keys(props.storeLocal.spread.sheets).length === 1 &&
                             !props.storeLocal.spread.type;

    try {
      isLoadingData.current = true;
      lastLoadedDataRef.current = currentDataKey;

      if (
        props.storeLocal.spread.type === "sjs" &&
        props.storeLocal.spread.blob
      ) {
        spread.open(
          props.storeLocal.spread.blob,
          () => {
            if (props.initialZoom && props.initialZoom !== 100) {
              const zoomFactor = props.initialZoom / 100;
              spread.options.zoomFactor = zoomFactor;
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
            isLoadingData.current = false;
            if (props.actionHandlerProc) {
              props.actionHandlerProc("workbook-loaded", spread);
            }
          },
          (error) => {
            console.error("Error loading SJS file:", error);
            setDataLoaded(true);
            setIsLoading(false);
            isLoadingData.current = false;
          },
          {
            openMode: 1
          }
        );
      } else if (
        props.storeLocal.spread.type === "excel" &&
        props.storeLocal.spread.data
      ) {
        console.warn("Excel import via spreadsheetData is deprecated - use importExcel() method instead");
        setDataLoaded(true);
        setIsLoading(false);
        isLoadingData.current = false;
      } else if (
        typeof props.storeLocal.spread === "object"
      ) {
        spread.fromJSON(props.storeLocal.spread);

        if (props.initialZoom && props.initialZoom !== 100) {
          const zoomFactor = props.initialZoom / 100;
          spread.options.zoomFactor = zoomFactor;
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
        isLoadingData.current = false;
        if (props.actionHandlerProc) {
          props.actionHandlerProc("file-loaded", spread);
        }
      }
    } catch (error) {
      console.error("Error loading spreadsheet data:", error);
      setDataLoaded(true);
      setIsLoading(false);
      isLoadingData.current = false;
    }

    if (isDefaultWorkbook) {
      setDataLoaded(true);
      setIsLoading(false);
      isLoadingData.current = false;
    }
  }, [spread, props.storeLocal?.spread, dataLoaded]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getWorkbookJSON: () => {
      if (spread) {
        return spread.toJSON();
      }
      return null;
    },
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
    getDesigner: () => null,
    getSpread: () => spread,
    hasChanges: () => {
      return changeCountRef.current > 0;
    },
    resetChangeCount: () => {
      setChangeCount(0);
      changeCountRef.current = 0;
    },
    saveWorkbookSJS: () => {
      return new Promise((resolve, reject) => {
        if (spread) {
          let hasTableSheets = false;
          const sheetCount = spread.getSheetCount();

          for (let i = 0; i < sheetCount; i++) {
            const sheet = spread.getSheet(i);
            if (sheet && sheet.getDataView && sheet.getDataView()) {
              hasTableSheets = true;
              break;
            }
          }

          const saveOptions = {
            includeStyles: true,
            includeFormulas: true,
            includeUnusedNames: false,
            saveAsView: false,
            includeBindingSource: false
          };

          if (hasTableSheets) {
            saveOptions.includeData = false;
            saveOptions.fullRecalc = false;
          }

          spread.save(
            (blob) => {
              if (hasTableSheets && blob.size > 5 * 1024 * 1024) {
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
    saveWorkbookStructureOnly: () => {
      return new Promise((resolve, reject) => {
        if (spread) {
          try {
            const workbookJSON = spread.toJSON();

            if (workbookJSON.sheets) {
              Object.keys(workbookJSON.sheets).forEach(sheetName => {
                const sheet = workbookJSON.sheets[sheetName];
                if (sheet.dataTable) {
                  if (sheet.dataTable.table) {
                    sheet.dataTable.table.data = [];
                  }
                }
              });
            }

            spread.fromJSON(workbookJSON);

            spread.save(
              (blob) => {
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
    loadWorkbookSJS: (blob) => {
      return new Promise((resolve, reject) => {
        if (spread && blob) {
          spread.open(
            blob,
            () => {
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
              openMode: 1
            }
          );
        } else {
          reject(new Error("Spread instance or blob not available"));
        }
      });
    },
    importExcel: (file) => {
      return new Promise((resolve, reject) => {
        if (spread && spread.import) {
          spread.import(
            file,
            () => {
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
  }), [spread, props]);

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
          ref={hostRef}
          style={{
            width: "100%",
            height: "100%",
            opacity: fadeIn ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
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
