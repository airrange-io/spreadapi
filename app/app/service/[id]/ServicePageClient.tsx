'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Layout, Button, Drawer, Divider, Space, Spin, Splitter, Breadcrumb, App, Tag, Typography, Dropdown, Segmented, Modal, Tooltip } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined, MoreOutlined, FileExcelOutlined, MenuUnfoldOutlined, TableOutlined, CaretRightOutlined, CloseOutlined, BarChartOutlined, DownloadOutlined, AppstoreOutlined, RobotOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { COLORS } from '@/constants/theme';
import type { Template } from '@/lib/templates';
import ParametersPanel from './components/ParametersPanel';
import ErrorBoundary from './components/ErrorBoundary';
import WorkbookView from './views/WorkbookView';
import pako from 'pako';

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

import { generateParameterId } from '@/lib/generateParameterId';
import { prepareServiceForPublish, publishService, estimatePayloadSize, PAYLOAD_LIMITS } from '@/utils/publishService';
import { workbookManager } from '@/utils/workbookManager';
import { getSavedView, saveViewPreference, getSmartDefaultView } from '@/lib/viewPreferences';
import { useTranslation } from '@/lib/i18n';

const { Text } = Typography;

export default function ServicePageClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workbookRef = useRef<any>(null);
  const { notification, modal } = App.useApp();
  const { t, locale } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactNav, setIsCompactNav] = useState(false);
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
  const [loadingMessage, setLoadingMessage] = useState(
    typeof navigator !== 'undefined' && navigator.language?.startsWith('de') ? 'Service wird geladen...' : 'Loading service...'
  );
  const [spreadInstance, setSpreadInstance] = useState<any>(null);
  const [workbookSize, setWorkbookSize] = useState<number | null>(null);
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
  const templateId = searchParams.get('templateId');
  const [template, setTemplate] = useState<Template | null>(null);
  const isDemoMode = false; // Keep false — template services are fully editable
  const [isImporting, setIsImporting] = useState(false); // Track if we're importing a service package
  const justImportedRef = useRef(false); // Track if we just completed an import (prevents reload)
  const hasDragDropFileRef = useRef(false); // Track if we have a drag & drop file pending
  const workbookLoadAbortControllerRef = useRef<AbortController | null>(null); // Cleanup for workbook loading
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
  const [publishProgress, setPublishProgress] = useState<{ visible: boolean; percent: number; status: string }>({
    visible: false,
    percent: 0,
    status: ''
  }); // Publish progress for large files

  // Tour refs
  const parametersPanelRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);
  const viewSwitcherRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const testButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const templateParamsPromptedRef = useRef(false);

  // Lazy load tour only when needed
  const [tourState, setTourState] = useState<{
    open: boolean;
    steps: any[];
    TourComponent: any;
  } | null>(null);

  // Lazy-load template config only when templateId is present (rare — only on template creation)
  useEffect(() => {
    if (!templateId) return;
    import('@/lib/templates').then(({ templates }) => {
      setTemplate(templates.find(t => t.id === templateId) || null);
    });
  }, [templateId]);

  // Load tour dynamically only when conditions are met and tour hasn't been completed
  useEffect(() => {
    const shouldShowTour = !!template && activeView === 'Workbook' && workbookLoaded && !isMobile;

    if (!shouldShowTour) return;

    // Check localStorage first (zero cost for returning users)
    const tourCompleted = typeof window !== 'undefined' &&
      localStorage.getItem('spreadapi_tour_completed_service-detail-tour') === 'true';

    if (tourCompleted) return;

    // Only load tour code if user hasn't seen it
    const timer = setTimeout(async () => {
      try {
        // Dynamic imports - only loaded when needed
        const [{ getServiceDetailTourSteps }, { Tour }, { useTour }] = await Promise.all([
          import('@/tours/serviceDetailTour'),
          import('antd'),
          import('@/hooks/useTour')
        ]);

        // Create tour steps with refs
        const tourSteps = getServiceDetailTourSteps(locale);
        const steps = [
          {
            ...tourSteps[0],
            target: () => parametersPanelRef.current,
          },
          {
            ...tourSteps[1],
            target: () => addButtonRef.current,
          },
          {
            ...tourSteps[2],
            target: () => viewSwitcherRef.current,
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
  }, [template, activeView, workbookLoaded, isMobile, locale]);

  // Auto-detect parameters from template cell addresses using SpreadJS
  const autoDetectTemplateParameters = useCallback((spread: any, cells: string[]) => {
    const inputs: any[] = [];
    const outputs: any[] = [];
    const usedNames = new Set<string>();

    const colLetterToIndex = (letters: string): number => {
      let index = 0;
      for (let i = 0; i < letters.length; i++) {
        index = index * 26 + (letters.toUpperCase().charCodeAt(i) - 64);
      }
      return index - 1;
    };

    const parseCellRef = (ref: string) => {
      const match = ref.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { row: 0, col: 0 };
      return { row: parseInt(match[2]) - 1, col: colLetterToIndex(match[1]) };
    };

    const getCellAddr = (row: number, col: number) => {
      let columnLetter = '';
      let tempCol = col;
      while (tempCol >= 0) {
        columnLetter = String.fromCharCode(65 + (tempCol % 26)) + columnLetter;
        tempCol = Math.floor(tempCol / 26) - 1;
      }
      return `${columnLetter}${row + 1}`;
    };

    const isTextLabel = (val: any): boolean => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'number' || typeof val === 'boolean') return false;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return false;
        const numVal = parseFloat(trimmed);
        if (!isNaN(numVal) && trimmed === numVal.toString()) return false;
        if (/^[\d.,\-+$€£¥%()]+$/.test(trimmed)) return false;
        return true;
      }
      return false;
    };

    const findLabel = (
      sheet: any, startRow: number, startCol: number,
      rowDelta: number, colDelta: number, maxSteps: number
    ): string | null => {
      for (let step = 1; step <= maxSteps; step++) {
        const r = startRow + rowDelta * step;
        const c = startCol + colDelta * step;
        if (r < 0 || c < 0) break;
        try {
          const v = sheet.getValue(r, c);
          if (v === null || v === undefined || (typeof v === 'string' && !v.trim())) continue;
          if (isTextLabel(v)) return String(v).trim();
          else break;
        } catch { break; }
      }
      return null;
    };

    // Extract a clean format string from complex Excel formats
    // e.g. \€#,##0.0"m";\(\€#,##0.0"m"\);"–"_) → €#,##0.0
    const simplifyFormat = (fmt: string): string | null => {
      // Take first section only (positive numbers)
      let s = fmt.split(';')[0];
      // Remove quoted text ("m", "kg", etc.)
      s = s.replace(/"[^"]*"/g, '');
      // Unescape currency symbols (\€ → €, \$ → $)
      s = s.replace(/\\([€$£¥₹])/g, '$1');
      // Remove remaining escape sequences
      s = s.replace(/\\./g, '');
      // Remove spacing (_X) and fill (*X) characters
      s = s.replace(/_./g, '').replace(/\*./g, '');
      // Remove parentheses (negative number wrapping)
      s = s.replace(/[()]/g, '');
      s = s.trim();
      // Only return if it still has a number pattern
      return /[#0]/.test(s) ? s : null;
    };

    for (const cellAddr of cells) {
      try {
        const bangIndex = cellAddr.indexOf('!');
        const sheetName = bangIndex > -1 ? cellAddr.substring(0, bangIndex) : 'Sheet1';
        const cellRef = bangIndex > -1 ? cellAddr.substring(bangIndex + 1) : cellAddr;
        const parts = cellRef.split(':');
        const start = parseCellRef(parts[0]);

        let rowCount = 1, colCount = 1;
        if (parts.length === 2) {
          const end = parseCellRef(parts[1]);
          rowCount = end.row - start.row + 1;
          colCount = end.col - start.col + 1;
        }

        const sheet = spread.getSheetFromName(sheetName);
        if (!sheet) continue;

        const isRange = rowCount > 1 || colCount > 1;
        let value = null;
        let hasFormula = false;
        let detectedType: 'number' | 'string' | 'boolean' = 'string';
        let cellFormat: any = null;
        let dropdownItems: any = null;

        value = sheet.getValue(start.row, start.col);
        hasFormula = !!sheet.getFormula(start.row, start.col);

        // Detect data type
        if (typeof value === 'number') detectedType = 'number';
        else if (typeof value === 'boolean') detectedType = 'boolean';
        else if (typeof value === 'string') {
          const numVal = parseFloat(value);
          if (!isNaN(numVal) && value.trim() === numVal.toString()) detectedType = 'number';
        }

        // Detect format and dropdown (single cells only)
        if (!isRange) {
          try {
            const cell = sheet.getCell(start.row, start.col);
            const formatter = cell.formatter();
            const style = sheet.getStyle(start.row, start.col);
            const formatterString = formatter || (style && style.formatter) || null;

            cellFormat = {
              formatter: formatterString,
              isPercentage: false,
              format: null as string | null,
              currencySymbol: null as string | null,
              decimals: null as number | null,
              thousandsSeparator: null as boolean | null
            };

            if (formatterString) {
              if (formatterString.includes('%')) {
                cellFormat.isPercentage = true;
                cellFormat.format = 'percentage';
                const m = formatterString.match(/0\.(0+)%/);
                cellFormat.decimals = m ? m[1].length : 0;
              } else if (/[$€£¥₹]|CHF/.test(formatterString)) {
                cellFormat.format = 'currency';
                if (formatterString.includes('€')) cellFormat.currencySymbol = '€';
                else if (formatterString.includes('$')) cellFormat.currencySymbol = '$';
                else if (formatterString.includes('£')) cellFormat.currencySymbol = '£';
                else if (formatterString.includes('¥')) cellFormat.currencySymbol = '¥';
                else if (formatterString.includes('₹')) cellFormat.currencySymbol = '₹';
                else if (formatterString.includes('CHF')) cellFormat.currencySymbol = 'CHF';
                const dm = formatterString.match(/0\.(0+)/);
                cellFormat.decimals = dm ? dm[1].length : formatterString.includes('.') ? 2 : 0;
                cellFormat.thousandsSeparator = formatterString.includes('#,##') || formatterString.includes('#.##');
              } else if (/[dmyDMY]{1,4}|h{1,2}|s{1,2}/.test(formatterString)) {
                cellFormat.format = 'date';
              }
            }

            // Detect dropdown — combobox cell type
            if (style?.cellType) {
              const ct = style.cellType;
              if (ct.typeName === 'combobox' || ct.type === 'combobox') {
                dropdownItems = ct.items || ct.option?.items || null;
              }
            }

            // Detect dropdown — data validation list
            if (!dropdownItems) {
              const dv = sheet.getDataValidator(start.row, start.col);
              if (dv && dv.type() === 3) {
                try {
                  const validList = dv.getValidList(sheet, start.row, start.col);
                  if (validList && Array.isArray(validList) && validList.length > 0) {
                    dropdownItems = validList;
                  }
                } catch {
                  let formula = dv._S?.[0] ?? null;
                  if (formula && typeof formula === 'object' && 'row' in formula && 'col' in formula && 'rowCount' in formula && 'colCount' in formula) {
                    dropdownItems = [];
                    for (let r = formula.row; r < formula.row + formula.rowCount; r++) {
                      for (let c = formula.col; c < formula.col + formula.colCount; c++) {
                        const v = sheet.getValue(r, c);
                        if (v !== null && v !== undefined && v !== '') dropdownItems.push(v);
                      }
                    }
                  } else if (formula && typeof formula === 'string') {
                    dropdownItems = formula.split(',').map((item: string) => item.trim().replace(/^["']|["']$/g, ''));
                  }
                }
              }
            }

            // Detect dropdown — legacy cellButtons
            if (!dropdownItems && style?.cellButtons?.length > 0) {
              const hasDd = style.cellButtons.some((btn: any) => btn.command === 'openList' || btn.imageType === 1);
              if (hasDd && style.dropDowns?.[0]?.option?.items) {
                dropdownItems = style.dropDowns[0].option.items;
              }
            }
          } catch { /* ignore format/dropdown detection errors */ }
        }

        // Find label from adjacent cells (left first, then up)
        const MAX_STEPS = 4;
        let titleText = findLabel(sheet, start.row, start.col, 0, -1, MAX_STEPS) || '';
        if (!titleText) titleText = findLabel(sheet, start.row, start.col, -1, 0, MAX_STEPS) || '';

        // Generate parameter name
        const cellAddress = getCellAddr(start.row, start.col);
        let suggestedName = '';
        if (titleText) {
          suggestedName = titleText.toLowerCase()
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/^_+|_+$/g, '').replace(/^(\d)/, '_$1');
          if (!suggestedName || /^_*$/.test(suggestedName)) suggestedName = cellAddress.toLowerCase();
        } else {
          suggestedName = cellAddress.toLowerCase();
        }

        // Ensure unique name
        let finalName = suggestedName;
        let counter = 2;
        while (usedNames.has(finalName)) { finalName = `${suggestedName}_${counter}`; counter++; }
        usedNames.add(finalName);

        const suggestedTitle = titleText || (value ? String(value).substring(0, 30) : cellAddress);
        const endAddress = isRange ? getCellAddr(start.row + rowCount - 1, start.col + colCount - 1) : '';
        const address = isRange ? `${sheetName}!${cellAddress}:${endAddress}` : `${sheetName}!${cellAddress}`;
        const paramDirection = hasFormula || isRange ? 'output' : 'input';

        if (paramDirection === 'input') {
          const param: any = {
            id: generateParameterId(),
            address,
            name: finalName,
            title: suggestedTitle,
            row: start.row,
            col: start.col,
            type: detectedType,
            value,
            direction: 'input' as const,
            description: '',
          };

          if (cellFormat?.isPercentage) {
            param.format = 'percentage';
            param.aiExamples = ['0.05 for 5%', '0.10 for 10%', '0.075 for 7.5%'];
            param.description = 'CRITICAL: This is a percentage parameter. User says "6%" but you MUST pass 0.06 as decimal. Convert: 5%→0.05, 6%→0.06, 7.5%→0.075. Never pass the whole number!';
          } else if (detectedType === 'boolean') {
            param.aiExamples = ['true', 'false', 'yes', 'no', '1', '0'];
            param.description = 'Accept multiple formats: yes/no, true/false, 1/0, ja/nein. Pass actual boolean value (true/false), NOT string.';
          }

          if (dropdownItems?.length > 0) {
            param.allowedValues = dropdownItems.map((item: any) => String(item));
            param.type = 'string';
          }

          const simplifiedFmt = cellFormat?.formatter ? simplifyFormat(cellFormat.formatter) : null;
          if (simplifiedFmt) param.formatString = simplifiedFmt;

          inputs.push(param);
        } else {
          const param: any = {
            id: generateParameterId(),
            address,
            name: finalName,
            title: suggestedTitle,
            row: start.row,
            col: start.col,
            rowCount,
            colCount,
            type: detectedType,
            value,
            direction: 'output' as const,
            description: '',
          };

          const simplifiedFmt = cellFormat?.formatter ? simplifyFormat(cellFormat.formatter) : null;
          if (simplifiedFmt) param.formatString = simplifiedFmt;

          outputs.push(param);
        }
      } catch (error) {
        console.error(`Error auto-detecting parameter for ${cellAddr}:`, error);
      }
    }

    return { inputs, outputs };
  }, []);

  // Show auto-detect prompt and apply results
  const promptAutoDetectParameters = useCallback(() => {
    if (templateParamsPromptedRef.current) return;
    if (!template || !template.cells.length || !spreadInstance) return;
    templateParamsPromptedRef.current = true;

    modal.confirm({
      title: t('service.setupParameters'),
      content: t('service.setupParametersContent', { count: String(template.cells.length) }),
      okText: t('service.yesSetUp'),
      cancelText: t('service.noThanks'),
      onOk: () => {
        const result = autoDetectTemplateParameters(spreadInstance, template.cells);
        setApiConfig(prev => ({ ...prev, inputs: result.inputs, outputs: result.outputs }));
        setConfigHasChanges(true);
        const totalParams = result.inputs.length + result.outputs.length;
        notification.success({
          message: t('service.paramsAutoConfigured', { total: String(totalParams), inputs: String(result.inputs.length), outputs: String(result.outputs.length) })
        });

        // After parameters are added, show a one-step tour highlighting the test button
        // Delay to let React render the test button (it's conditional on parameters existing)
        setTimeout(async () => {
          try {
            const { Tour } = await import('antd');
            setTourState({
              open: true,
              steps: [{
                title: t('service.testServiceInstantly'),
                description: (
                  <div>
                    <p style={{ margin: 0 }}>
                      {t('service.testServiceInstantlyDesc')}
                    </p>
                  </div>
                ),
                target: () => testButtonRef.current,
                placement: 'bottom' as const,
              }],
              TourComponent: Tour,
            });
          } catch (error) {
            console.error('Failed to load tour for test button:', error);
          }
        }, 5000);
      },
    });
  }, [template, spreadInstance, autoDetectTemplateParameters, modal, notification]);

  // Handle tour close — offer parameter auto-config for templates
  const handleTourClose = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spreadapi_tour_completed_service-detail-tour', 'true');
    }
    setTourState(null);

    // If template has cell definitions, offer to auto-detect and load parameters
    if (template && template.cells.length > 0) {
      promptAutoDetectParameters();
    }
  }, [template, promptAutoDetectParameters]);

  // If tour was already completed, prompt for auto-detect directly when template loads
  useEffect(() => {
    if (templateParamsPromptedRef.current) return;
    if (!template || !template.cells.length) return;
    if (!workbookLoaded || !spreadInstance) return;
    // Only trigger if no parameters have been configured yet
    if (apiConfig.inputs.length > 0 || apiConfig.outputs.length > 0) return;

    const tourCompleted = typeof window !== 'undefined' &&
      localStorage.getItem('spreadapi_tour_completed_service-detail-tour') === 'true';
    if (!tourCompleted) return; // Tour will handle it via handleTourClose

    // Tour was already seen — prompt directly after a short delay
    const timer = setTimeout(() => {
      promptAutoDetectParameters();
    }, 1500);
    return () => clearTimeout(timer);
  }, [template, workbookLoaded, spreadInstance, apiConfig.inputs.length, apiConfig.outputs.length, promptAutoDetectParameters]);

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
      setIsCompactNav(window.innerWidth < 1120);

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

    // Abort any previous workbook load request
    if (workbookLoadAbortControllerRef.current) {
      workbookLoadAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    workbookLoadAbortControllerRef.current = controller;

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
        notification.error({ message: t('service.failedLoadWorkbook') });
      }
      setWorkbookLoading(false);
    } finally {
      // Clear the abort controller ref after request completes
      workbookLoadAbortControllerRef.current = null;
    }
  }, [serviceId, workbookLoaded, workbookLoading, spreadsheetData, notification, processWorkbookData]);

  // Load workbook when switching to Workbook view
  useEffect(() => {
    // Don't load workbook from API if we have a pending drag & drop file to import
    if (activeView === 'Workbook' && !workbookLoaded && !workbookLoading && configLoaded && !importFileForEmptyState) {
      loadWorkbookOnDemand();
    }
  }, [activeView, workbookLoaded, workbookLoading, configLoaded, importFileForEmptyState, loadWorkbookOnDemand]);

  // Calculate workbook size when workbook data is fully loaded into SpreadJS
  // This is called from the workbook-loaded event, which fires AFTER fromJSON completes
  const workbookSizeCalculated = useRef(false);
  const handleWorkbookDataLoaded = useCallback((spreadInstance: any) => {
    if (!spreadInstance || workbookSizeCalculated.current) return;

    workbookSizeCalculated.current = true;
    try {
      if (typeof spreadInstance.toJSON === 'function') {
        const json = spreadInstance.toJSON();
        const jsonString = JSON.stringify(json);
        const size = new Blob([jsonString]).size;
        setWorkbookSize(size);

        // Calculate compressed size to show upload estimate
        const compressed = pako.gzip(jsonString);
        const compressedSize = compressed.length;
        const ratio = ((1 - compressedSize / size) * 100).toFixed(1);

        // Count sheets for logging
        const sheetCount = spreadInstance.getSheetCount?.() || Object.keys(json.sheets || {}).length;

        // Determine upload method
        const INLINE_THRESHOLD = 2.5 * 1024 * 1024; // 2.5MB
        const uploadMethod = compressedSize < INLINE_THRESHOLD ? 'inline' : 'blob upload';

        console.log(`[Workbook Size] Raw: ${(size / 1024).toFixed(1)} KB (${(size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`[Workbook Size] Compressed: ${(compressedSize / 1024).toFixed(1)} KB (${(compressedSize / 1024 / 1024).toFixed(2)} MB) - ${ratio}% reduction`);
        console.log(`[Workbook Size] Sheets: ${sheetCount}, Upload method: ${uploadMethod}`);
      }
    } catch (e) {
      console.warn('Could not calculate workbook size:', e);
    }
  }, []);

  // Load existing workbook or check for pre-uploaded file
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadWorkbook = async () => {
      // Skip if component unmounted (prevents double fetch in StrictMode)
      if (!mounted) return;

      // Skip if we're importing a service package OR just finished importing
      if (isImporting || justImportedRef.current) {
        return;
      }

      // Parallel load all data for optimal performance
      setLoadingMessage(t('service.loadingServiceData'));

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

      // Store the file to be imported once the workbook is ready
      setImportFileForEmptyState(file);

      // Create default spreadsheet data so WorkbookViewer can initialize
      // This will be replaced by the imported file once import completes
      setDefaultSpreadsheetData();

      delete (window as any).__draggedFile;
    }

    // Initial loading will be handled in a separate effect

    // Show drawer on mobile after initial load
    if (isMobile) {
      setDrawerVisible(true);
    }

    // Always load workbook to get service config (needed for ParametersPanel)
    // This only loads config, not spreadsheet data
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
              notification.success({ message: t('service.fileLoadedSuccess', { name: info.file.name }) });
            }
          } catch (error) {
            notification.error({ message: t('service.failedProcessFile') });
          }
        };
        reader.readAsArrayBuffer(originFileObj);
      } catch (error) {
        notification.error({ message: t('service.failedReadFile') });
      }
    } else if (status === 'error') {
      notification.error({ message: t('service.fileUploadFailed', { name: info.file.name }) });
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

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (hasAnyChanges) {
      modal.confirm({
        title: t('service.unsavedChanges'),
        content: t('service.unsavedChangesContent'),
        okText: t('service.leaveWithoutSaving'),
        cancelText: t('service.stay'),
        okButtonProps: { danger: true },
        onOk: () => {
          router.push('/app');
        },
      });
      return;
    }

    router.push('/app');
  };

  const handlePublish = async () => {
    try {
      // First ensure everything is saved
      if (hasAnyChanges) {
        notification.warning({ message: t('service.saveBeforePublishing') });
        return;
      }

      // If workbook not loaded, we need to load it first
      if (!spreadInstance) {
        // Check if we even have a workbook to load
        const hasWorkbook = apiConfig.inputs?.length > 0 || apiConfig.outputs?.length > 0;

        if (!hasWorkbook) {
          notification.error({ message: t('service.cannotPublishNoParams') });
          return;
        }

        // Show modal asking user to switch to Workbook view
        modal.confirm({
          title: t('service.workbookRequiredPublish'),
          content: t('service.workbookRequiredPublishContent'),
          okText: t('service.switchToWorkbook'),
          cancelText: t('common.cancel'),
          onOk: () => {
            setActiveView('Workbook');
            notification.info({ message: t('service.waitForWorkbookThenPublish') });
          }
        });

        return;
      }

      if (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0)) {
        notification.error({ message: t('service.defineAtLeastOneParam') });
        return;
      }

      setLoading(true);
      notification.info({ message: t('service.preparingPublish'), key: 'publish', duration: 0 });

      // Prepare the publish data
      const publishData = await prepareServiceForPublish(
        spreadInstance,
        apiConfig,
        {
          enableCaching: apiConfig.enableCaching,
          requireToken: apiConfig.requireToken,
          cacheTableSheetData: apiConfig.cacheTableSheetData,
          tableSheetCacheTTL: apiConfig.tableSheetCacheTTL,
          // Note: tokens are managed separately via the token:{id} Redis hashes
          // Token validation is handled by validateServiceToken in calculateDirect.js
        }
      );

      // Check if large payload - show progress modal
      const { size: payloadSize } = estimatePayloadSize(publishData);
      const isLargePayload = payloadSize >= PAYLOAD_LIMITS.LARGE_FILE_THRESHOLD;

      // Progress callback for large payloads
      const onProgress = isLargePayload ? (percent: number) => {
        let status = t('service.progressPreparing');
        if (percent >= 0 && percent < 5) status = t('service.progressPreparingData');
        if (percent >= 5 && percent < 20) status = t('service.progressCompressing');
        if (percent >= 20 && percent < 50) status = t('service.progressEncoding');
        if (percent >= 50 && percent < 85) status = t('service.progressUploading');
        if (percent >= 85 && percent < 100) status = t('service.progressProcessing');
        if (percent >= 100) status = t('service.progressFinalizing');
        setPublishProgress({ visible: true, percent, status });
      } : null;

      if (isLargePayload) {
        notification.destroy('publish'); // Clear the "Preparing..." message
        setPublishProgress({ visible: true, percent: 0, status: t('service.progressPreparingData') });
      }

      // Publish the service
      const result = await publishService(serviceId, publishData, null, onProgress);

      // Hide progress modal
      setPublishProgress({ visible: false, percent: 0, status: '' });

      if (result.error) {
        throw new Error(result.error);
      }

      notification.success({ message: t('service.publishedSuccess') });

      // Clear client-side workbook cache so fresh data is fetched
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`workbook-etag-${serviceId}`);
        window.localStorage.removeItem(`workbook-data-${serviceId}`);
        // Set a flag to refresh the service list
        window.localStorage.setItem('refreshServiceList', Date.now().toString());
      }

      // Update the service status
      setServiceStatus(prevStatus => ({
        ...prevStatus,
        published: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
        useCaching: apiConfig.enableCaching,
        needsToken: apiConfig.requireToken,
        fileSize: result.fileSize
      }));

      setLoading(false);

    } catch (error) {
      console.error('Failed to publish service:', error);
      notification.error({ message: t('service.publishFailed', { error: error.message || t('service.unknownError') }) });
      setPublishProgress({ visible: false, percent: 0, status: '' });
      setLoading(false);
    }
  };

  const handleRepublish = async () => {
    try {
      // First ensure everything is saved
      if (hasAnyChanges) {
        notification.warning({ message: t('service.saveBeforeRepublishing') });
        return;
      }

      // If workbook not loaded, we need to load it first
      if (!spreadInstance) {
        // Check if we even have a workbook to load
        const hasWorkbook = apiConfig.inputs?.length > 0 || apiConfig.outputs?.length > 0;

        if (!hasWorkbook) {
          notification.error({ message: t('service.cannotRepublishNoParams') });
          return;
        }

        // Show modal asking user to switch to Workbook view
        modal.confirm({
          title: t('service.workbookRequiredRepublish'),
          content: t('service.workbookRequiredRepublishContent'),
          okText: t('service.switchToWorkbook'),
          cancelText: t('common.cancel'),
          onOk: () => {
            setActiveView('Workbook');
            notification.info({ message: t('service.waitForWorkbookThenRepublish') });
          }
        });

        return;
      }

      if (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0)) {
        notification.error({ message: t('service.defineAtLeastOneParam') });
        return;
      }

      setLoading(true);
      notification.info({ message: t('service.republishing'), key: 'republish', duration: 0 });

      // Prepare the publish data
      const publishData = await prepareServiceForPublish(
        spreadInstance,
        apiConfig,
        {
          enableCaching: apiConfig.enableCaching,
          requireToken: apiConfig.requireToken,
          cacheTableSheetData: apiConfig.cacheTableSheetData,
          tableSheetCacheTTL: apiConfig.tableSheetCacheTTL,
          // Note: tokens are managed separately via the token:{id} Redis hashes
          // Token validation is handled by validateServiceToken in calculateDirect.js
        }
      );

      // Check if large payload - show progress modal
      const { size: payloadSize } = estimatePayloadSize(publishData);
      const isLargePayload = payloadSize >= PAYLOAD_LIMITS.LARGE_FILE_THRESHOLD;

      // Progress callback for large payloads
      const onProgress = isLargePayload ? (percent: number) => {
        let status = t('service.progressPreparing');
        if (percent >= 0 && percent < 5) status = t('service.progressPreparingData');
        if (percent >= 5 && percent < 20) status = t('service.progressCompressing');
        if (percent >= 20 && percent < 50) status = t('service.progressEncoding');
        if (percent >= 50 && percent < 85) status = t('service.progressUploading');
        if (percent >= 85 && percent < 100) status = t('service.progressProcessing');
        if (percent >= 100) status = t('service.progressFinalizing');
        setPublishProgress({ visible: true, percent, status });
      } : null;

      if (isLargePayload) {
        notification.destroy('republish'); // Clear the "Republishing..." message
        setPublishProgress({ visible: true, percent: 0, status: t('service.progressPreparingData') });
      }

      // Publish the service (backend handles update)
      const result = await publishService(serviceId, publishData, null, onProgress);

      // Hide progress modal
      setPublishProgress({ visible: false, percent: 0, status: '' });

      if (result.error) {
        throw new Error(result.error);
      }

      notification.success({ message: t('service.republishedSuccess') });

      // Clear client-side workbook cache so fresh data is fetched
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`workbook-etag-${serviceId}`);
        window.localStorage.removeItem(`workbook-data-${serviceId}`);
        // Set a flag to refresh the service list
        window.localStorage.setItem('refreshServiceList', Date.now().toString());
      }

      // Update the service status
      setServiceStatus(prevStatus => ({
        ...prevStatus,
        published: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
        useCaching: apiConfig.enableCaching,
        needsToken: apiConfig.requireToken,
        fileSize: result.fileSize
      }));

      setLoading(false);

    } catch (error) {
      console.error('Failed to republish service:', error);
      notification.error({ message: t('service.republishFailed', { error: error.message || t('service.unknownError') }) });
      setPublishProgress({ visible: false, percent: 0, status: '' });
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      if (hasAnyChanges) {
        notification.warning({ message: t('service.saveBeforeUnpublishing') });
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

      notification.success({ message: t('service.unpublishedSuccess') });

      // Update the service status
      setServiceStatus(prevStatus => ({
        ...prevStatus,
        published: false,
        status: 'draft',
        publishedAt: null
      }));

    } catch (error) {
      notification.error({ message: t('service.unpublishFailed', { error: error.message || t('service.unknownError') }) });
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
          notification.error({ message: t('service.notPublishedYet') });
          setShowApiDefinitionModal(false);
          return;
        }
        throw new Error('Failed to fetch API definition');
      }

      const data = await response.json();
      setApiDefinitionData(data);

    } catch (error) {
      notification.error({ message: t('service.failedLoadApiDef', { error: error.message || t('service.unknownError') }) });
      setShowApiDefinitionModal(false);
    } finally {
      setLoadingApiDefinition(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      if (!spreadInstance) {
        notification.error({ message: t('service.spreadsheetNotLoaded') });
        return;
      }

      notification.open({ message: t('service.exportingExcel'), key: 'export-excel', duration: 0 });

      await workbookManager.exportToExcel(
        spreadInstance,
        apiConfig.name || 'spreadsheet'
      );

      notification.destroy('export-excel');
      notification.success({ message: t('service.excelExportSuccess') });
    } catch (error) {
      notification.destroy('export-excel');
      notification.error({ message: t('service.exportFailed', { error: error.message || t('service.unknownError') }) });
    }
  };

  const handleExportServicePackage = async () => {
    try {
      if (!spreadInstance) {
        notification.error({ message: t('service.spreadsheetNotLoaded') });
        return;
      }

      notification.open({ message: t('service.exportingPackage'), key: 'export-package', duration: 0 });

      // Get workbook JSON
      const workbookJSON = spreadInstance.toJSON();

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

      notification.destroy('export-package');
      notification.success({ message: t('service.packageExportSuccess') });
    } catch (error) {
      notification.destroy('export-package');
      notification.error({ message: t('service.packageExportFailed', { error: error.message || t('service.unknownError') }) });
    }
  };

  const handleExportForRuntime = async () => {
    try {
      if (!spreadInstance) {
        notification.error({ message: t('service.spreadsheetNotLoaded') });
        return;
      }

      notification.open({ message: t('service.exportingRuntime'), key: 'export-runtime', duration: 0 });

      // Get workbook JSON (this is the fileJson for calculations)
      const fileJson = spreadInstance.toJSON();

      // Build apiJson with input/output definitions
      const apiJson = {
        name: (apiConfig.name || 'service').replace(/[^a-z0-9]/gi, '-').toLowerCase(),
        title: apiConfig.name || 'Untitled Service',
        description: apiConfig.description || '',
        inputs: (apiConfig.inputs || []).map((inp: any) => ({
          name: inp.name,
          title: inp.title || inp.name,
          address: inp.address,
          row: inp.row,
          col: inp.col,
          type: inp.type || 'string',
          mandatory: inp.mandatory !== false,
          defaultValue: inp.defaultValue,
          min: inp.min,
          max: inp.max,
          allowedValues: inp.allowedValues,
          description: inp.description,
          formatString: inp.formatString,
        })),
        outputs: (apiConfig.outputs || []).map((out: any) => ({
          name: out.name,
          title: out.title || out.name,
          address: out.address,
          row: out.row,
          col: out.col,
          rowCount: out.rowCount,
          colCount: out.colCount,
          type: out.type,
          description: out.description,
          formatString: out.formatString,
        })),
        flags: {
          useCaching: apiConfig.enableCaching !== false,
          needsToken: apiConfig.requireToken || false,
        },
      };

      // Create runtime package
      const runtimePackage = {
        serviceId: (apiConfig.name || 'service').replace(/[^a-z0-9]/gi, '-').toLowerCase(),
        name: apiJson.name,
        title: apiJson.title,
        description: apiJson.description,
        apiJson,
        fileJson,
        exportedAt: new Date().toISOString(),
        exportedFrom: 'SpreadAPI.io',
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(runtimePackage, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${apiJson.name}_runtime.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notification.destroy('export-runtime');
      notification.success({ message: t('service.runtimeExportSuccess') });
    } catch (error: any) {
      notification.destroy('export-runtime');
      notification.error({ message: t('service.exportFailed', { error: error.message || t('service.unknownError') }) });
    }
  };

  const isSavingRef = useRef(false);

  const handleSave = async () => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      notification.warning({ message: t('service.saveInProgress') });
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
        notification.info({ message: t('service.noChanges') });
        setLoading(false);
        return;
      }

      // Show specific loading message
      if (shouldSaveWorkbook && configHasChanges) {
        setSavingWorkbook(true);
        notification.open({ message: t('service.savingConfigAndWorkbook'), key: 'save', duration: 0 });
      } else if (shouldSaveWorkbook) {
        setSavingWorkbook(true);
        notification.open({ message: t('service.savingWorkbook'), key: 'save', duration: 0 });
      } else if (configHasChanges) {
        notification.open({ message: t('service.savingConfig'), key: 'save', duration: 0 });
      }

      let workbookBlob = null;
      let saveStartTime = 0;
      let saveEndTime = 0;

      // Additional safety check for workbookRef
      if (!workbookRef.current && shouldSaveWorkbook) {
        notification.error({ message: t('service.waitForWorkbookBeforeSaving') });
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
              notification.destroy('save');
              setSaveProgress({ visible: true, percent: 30, status: t('service.savingWorkbookData') });
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
                setSaveProgress({ visible: true, percent: 60, status: t('service.uploadingFile', { size: sizeInMB.toFixed(1) }) });
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
          setSaveProgress({ visible: true, percent: 90, status: t('service.progressFinalizing') });
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
      notification.destroy('save');
      setSaveProgress({ visible: false, percent: 0, status: '' });

      if (shouldSaveWorkbook && configHasChanges) {
        notification.success({ message: t('service.savedConfigAndWorkbook') });
      } else if (shouldSaveWorkbook) {
        notification.success({ message: t('service.savedWorkbook') });
      } else {
        notification.success({ message: t('service.savedConfig') });
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
      notification.error({ message: t('service.saveFailed', { error: error.message || t('service.unknownError') }) });
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
  }, [savedConfig, serviceStatus.published, notification]);

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
        notification.error({ message: t('service.fileSizeExceeds', { size: String(MAX_FILE_SIZE / (1024 * 1024)) }) });
        setSavingWorkbook(false);
        return;
      }

      // Check file type and extension
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!ALLOWED_EXTENSIONS.includes(fileExtension) && !ALLOWED_EXCEL_TYPES.includes(file.type)) {
        notification.error({ message: t('service.onlyExcelSupported') });
        setSavingWorkbook(false);
        return;
      }

      // Check for macro-enabled files
      if (fileExtension === '.xlsm' || file.type === 'application/vnd.ms-excel.sheet.macroEnabled.12') {
        notification.warning({ message: t('service.macrosNotSupported') });
      }

      if (workbookRef.current) {
        try {
          await workbookManager.importFromExcel(workbookRef.current, file);
          setWorkbookChangeCount(prev => prev + 1);

          let successMessage = t('service.excelImportSuccess');

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
            successMessage = t('service.excelImportRenamed', { filename });
          }

          notification.success({ message: successMessage });
        } catch (error: any) {
          notification.error({ message: t('service.excelImportFailed', { error: error.message || t('service.unknownError') }) });
        }
      } else {
        notification.error({ message: t('service.spreadsheetNotInitialized') });
      }
    } catch (error) {
      notification.error({ message: t('service.excelImportFailedGeneric') });
    } finally {
      setSavingWorkbook(false);
    }
  }, [apiConfig.name]);

  // Handle Import from Excel menu action (updates existing workbook)
  const handleImportExcelUpdate = useCallback(() => {
    // Check if workbook is available
    if (!workbookRef.current) {
      notification.error({ message: t('service.waitForWorkbook') });
      return;
    }

    // Check for unsaved changes
    const hasUnsavedChanges = workbookRef.current?.hasChanges?.() || false;

    modal.confirm({
      title: t('service.importExcelTitle'),
      content: (
        <div>
          <p>{t('service.importExcelReplace')}</p>
          {hasUnsavedChanges && (
            <p style={{ color: '#ff4d4f', marginTop: 8 }}>
              <strong>{t('service.warning')}</strong> {t('service.unsavedChangesLost')}
            </p>
          )}
          <p style={{ marginTop: 8 }}>
            {t('service.paramsPreserved')}
          </p>
        </div>
      ),
      okText: t('service.import'),
      cancelText: t('common.cancel'),
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
            notification.open({ message: t('service.importingExcel'), key: 'import-excel', duration: 0 });

            // Use existing import function
            await handleImportExcel(file);

            // Clear loading and show success
            notification.destroy('import-excel');
            notification.success({ message: t('service.excelImportedRememberSave') });

            // Mark as having changes so save button is enabled
            setWorkbookChangeCount(prev => prev + 1);
          } catch (error: any) {
            notification.destroy('import-excel');
            notification.error({ message: t('service.importFailed', { error: error.message || t('service.unknownError') }) });
          }
        };
        input.click();
      }
    });
  }, [handleImportExcel, workbookRef, spreadInstance, activeView, modal, notification]);

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
      notification.open({ message: t('service.importingPackage'), key: 'import-package', duration: 0 });

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonContent = e.target?.result as string;
          const servicePackage = JSON.parse(jsonContent);

          // Validate package structure
          if (!servicePackage.version || !servicePackage.service) {
            throw new Error('Invalid service package format');
          }

          const { service } = servicePackage;

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
            name: service.name || t('service.importedService'),
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

          notification.destroy('import-package');
          notification.success({ message: t('service.packageImportedRememberSave') });
        } catch (error: any) {
          console.error('[Import] Error:', error);
          notification.destroy('import-package');
          notification.error({ message: t('service.packageParseFailed', { error: error.message || t('service.invalidJson') }) });
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        notification.destroy('import-package');
        notification.error({ message: t('service.failedReadFile') });
        setIsImporting(false);
      };

      reader.readAsText(file);
    } catch (error: any) {
      console.error('[Import] Outer error:', error);
      notification.destroy('import-package');
      notification.error({ message: t('service.packageImportFailed', { error: error.message || t('service.unknownError') }) });
      setIsImporting(false);
    }
  }, []);

  // Import the stored file once the workbook is ready
  useEffect(() => {
    if (importFileForEmptyState && spreadInstance && workbookRef.current) {
      // Store the file locally before clearing state
      const fileToImport = importFileForEmptyState;

      // Mark workbook as loaded FIRST to prevent loadWorkbookOnDemand() effect from
      // fetching from API when we clear importFileForEmptyState below
      setWorkbookLoaded(true);

      // Clear the stored file IMMEDIATELY to prevent effect from running again
      // if component re-renders during import
      setImportFileForEmptyState(null);

      // Import the file using the existing handleImportExcel function
      const doImport = async () => {
        await handleImportExcel(fileToImport);

        // Clear the flag after import to allow normal loadWorkbook behavior
        hasDragDropFileRef.current = false;
      };

      doImport();
    }
  }, [importFileForEmptyState, spreadInstance, handleImportExcel]);

  // Cleanup: Abort any pending workbook load on unmount
  useEffect(() => {
    return () => {
      if (workbookLoadAbortControllerRef.current) {
        workbookLoadAbortControllerRef.current.abort();
        workbookLoadAbortControllerRef.current = null;
      }
    };
  }, []);

  // Warn before leaving with unsaved changes (tab close / refresh)
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

  // Warn on browser back/forward button with unsaved changes
  const backGuardPushed = useRef(false);
  useEffect(() => {
    if (!hasAnyChanges) {
      backGuardPushed.current = false;
      return;
    }

    // Push a guard entry so the first back press triggers popstate without leaving
    if (!backGuardPushed.current) {
      window.history.pushState({ unsavedGuard: true }, '');
      backGuardPushed.current = true;
    }

    const handlePopState = () => {
      backGuardPushed.current = false;
      modal.confirm({
        title: t('service.unsavedChanges'),
        content: t('service.unsavedChangesContent'),
        okText: t('service.leaveWithoutSaving'),
        cancelText: t('service.stay'),
        okButtonProps: { danger: true },
        onOk: () => {
          window.history.back();
        },
        onCancel: () => {
          window.history.pushState({ unsavedGuard: true }, '');
          backGuardPushed.current = true;
        },
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasAnyChanges, modal]);

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
          {isMobile && (
            <Tooltip title={t('service.openParamsPanel')}>
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setDrawerVisible(!drawerVisible)}
              />
            </Tooltip>
          )}
          <Breadcrumb
            items={[
              {
                title: <a onClick={handleBack}>Services</a>,
              },
              ...(!isMobile ? [{
                title: configLoaded ? (
                  <Text
                    ellipsis={{ tooltip: apiConfig.name || t('service.newService') }}
                    style={{ margin: 0, maxWidth: 200, cursor: 'pointer' }}
                    onClick={() => {
                      setActiveView('Settings');
                      saveViewPreference(serviceId, 'Settings');
                    }}
                  >
                    {apiConfig.name || t('service.newService')}
                  </Text>
                ) : '...',
              }] : []),
            ]}
          />
        </Space>

        <Space size="small">
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
              options={isCompactNav ? [
              {
                value: 'Settings',
                icon: <Tooltip title={t('service.settings')}><SettingOutlined /></Tooltip>
              },
              {
                value: 'Workbook',
                icon: <Tooltip title={t('service.workbook')}><TableOutlined /></Tooltip>
              },
              {
                value: 'API',
                icon: <Tooltip title="API"><CaretRightOutlined /></Tooltip>
              },
              {
                value: 'Agents',
                icon: <Tooltip title={t('service.agents')}><RobotOutlined /></Tooltip>
              },
              {
                value: 'Apps',
                icon: <Tooltip title={t('service.apps')}><AppstoreOutlined /></Tooltip>
              },
              {
                value: 'Usage',
                icon: <Tooltip title={t('service.usage')}><BarChartOutlined /></Tooltip>
              }
            ] : [
              { value: 'Settings', label: t('service.settings') },
              { value: 'Workbook', label: t('service.workbook') },
              { value: 'API', label: 'API' },
              { value: 'Agents', label: t('service.agents') },
              { value: 'Apps', label: t('service.apps') },
              { value: 'Usage', label: t('service.usage') }
            ]}
            style={{ marginLeft: 'auto', marginRight: 'auto' }}
          />
          </div>
          {/* Test Parameters Button */}
          {(apiConfig.inputs.length > 0 || apiConfig.outputs.length > 0) && (
            <Tooltip title={t('service.testTooltip')}>
              <Button
                ref={testButtonRef}
                type="primary"
                icon={<CaretRightOutlined />}
                onClick={() => setTestPanelOpen(!testPanelOpen)}
                style={{
                  boxShadow: 'none',
                }}
              />
            </Tooltip>
          )}
        </Space>

        <Space>
          {hasAnyChanges && !isDemoMode && (
            <Tooltip title={
              configHasChanges && workbookChangeCount > 0
                ? t('service.saveConfigAndWorkbookTooltip')
                : configHasChanges
                  ? t('service.saveConfigTooltip')
                  : t('service.saveWorkbookTooltip')
            }>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={loading}
              >
                {t('common.save')}
              </Button>
            </Tooltip>
          )}

          {/* Desktop Publish Button - Only visible on desktop */}
          {!isMobile && !isDemoMode && (
            serviceStatus?.published ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'republish',
                      label: t('service.republish'),
                      icon: <CheckCircleOutlined />,
                      onClick: handleRepublish,
                      disabled: hasAnyChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))
                    },
                    {
                      type: 'divider' as const
                    },
                    {
                      key: 'unpublish',
                      label: t('service.unpublish'),
                      icon: <CloseCircleOutlined />,
                      danger: true,
                      onClick: handleUnpublish,
                      disabled: hasAnyChanges
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a', borderColor: '#52c41a' }}
                >
                  {t('service.published')} <DownOutlined />
                </Button>
              </Dropdown>
            ) : (
              <Tooltip
                title={
                  hasAnyChanges
                    ? t('service.saveBeforePublishing')
                    : (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))
                    ? t('service.defineParamsToPublish')
                    : ''
                }
              >
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={handlePublish}
                  disabled={hasAnyChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))}
                >
                  {t('service.publish')}
                </Button>
              </Tooltip>
            )
          )}

          <Dropdown
            menu={{
              items: [
                // Publish/Draft options (only for mobile and non-demo services)
                ...(isMobile && !isDemoMode ? [
                  serviceStatus?.published ? {
                    key: 'republish',
                    label: t('service.republishThisService'),
                    icon: <CheckCircleOutlined />,
                    onClick: handleRepublish,
                    disabled: hasAnyChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0)),
                    title: hasAnyChanges
                      ? t('service.saveBeforeRepublishing')
                      : (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))
                      ? t('service.defineAtLeastOneParam')
                      : undefined
                  } : {
                    key: 'publish',
                    label: t('service.publishThisService'),
                    icon: <CheckCircleOutlined />,
                    onClick: handlePublish,
                    disabled: hasAnyChanges || (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0)),
                    title: hasAnyChanges
                      ? t('service.saveBeforePublishing')
                      : (apiConfig.inputs.length === 0 && apiConfig.outputs.length === 0 && (!apiConfig.areas || apiConfig.areas.length === 0))
                      ? t('service.defineAtLeastOneParam')
                      : undefined
                  },
                  ...(serviceStatus?.published ? [{
                    key: 'unpublish',
                    label: t('service.unpublishThisService'),
                    icon: <CloseCircleOutlined />,
                    danger: true,
                    onClick: handleUnpublish,
                    disabled: hasAnyChanges
                  }] : []),
                  {
                    type: 'divider' as const
                  }
                ] : []),
                {
                  key: 'view-definition',
                  label: t('service.viewApiDefinition'),
                  icon: <FileExcelOutlined />,
                  onClick: handleViewApiDefinition,
                  disabled: !serviceStatus?.published
                },
                {
                  type: 'divider' as const
                },
                {
                  key: 'import-excel',
                  label: t('service.importFromExcel'),
                  icon: <FileExcelOutlined />,
                  onClick: () => handleImportExcelUpdate(),
                  disabled: !spreadInstance || activeView !== 'Workbook'
                },
                {
                  type: 'divider' as const
                },
                {
                  key: 'export-excel',
                  label: t('service.exportToExcel'),
                  icon: <FileExcelOutlined />,
                  onClick: () => handleExportToExcel()
                },
                {
                  type: 'divider' as const
                },
                {
                  key: 'export-package',
                  label: t('service.exportServicePackage'),
                  icon: <DownloadOutlined />,
                  onClick: () => handleExportServicePackage(),
                  disabled: !spreadInstance
                },
                {
                  key: 'export-runtime',
                  label: t('service.exportForRuntime'),
                  icon: <DownloadOutlined />,
                  onClick: () => handleExportForRuntime(),
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
      <div className={isMobile ? 'splitter-mobile' : ''} style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {isMobile && <style>{`.splitter-mobile .ant-splitter-bar { display: none !important; }`}</style>}
        {sizesLoaded ? (
            <Splitter
              style={{ height: '100%' }}
              onResize={!isMobile ? handlePanelResize : undefined}
            >
              <Splitter.Panel collapsible size={isMobile ? '0%' : panelSizes[0] + '%'} min={isMobile ? '0%' : '20%'} max={isMobile ? '0%' : '50%'} resizable={!isMobile} style={{ backgroundColor: '#ffffff', ...(isMobile ? { overflow: 'hidden', padding: 0 } : {}) }}>
                <div style={{
                  height: '100%',
                  background: 'white',
                  overflow: 'hidden',
                  display: isMobile ? 'none' : 'flex',
                  flexDirection: 'column'
                }}>
                  {parametersPanel}
                </div>
              </Splitter.Panel>
              <Splitter.Panel collapsible style={{ paddingLeft: isMobile ? 0 : 10, backgroundColor: '#ffffff' }} size={isMobile ? '100%' : panelSizes[1] + '%'} min={isMobile ? '100%' : '50%'} max={isMobile ? '100%' : '80%'}>
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
                            <div style={{ marginTop: 16, color: '#666' }}>{t('service.loadingSpreadsheet')}</div>
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
                          onWorkbookDataLoaded={handleWorkbookDataLoaded}
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
          )}
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={t('service.parameters')}
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
          workbookSize={workbookSize}
          publishedSize={serviceStatus?.fileSize}
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

      {/* Publish Progress Modal */}
      <SaveProgressModal
        visible={publishProgress.visible}
        percent={publishProgress.percent}
        status={publishProgress.status}
        title={t('service.publishingService')}
        subtitle={t('service.publishingSubtitle')}
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