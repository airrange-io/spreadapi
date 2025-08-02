'use client';

import React, { forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import EmptyWorkbookState from '../EmptyWorkbookState';

// Dynamically import WorkbookViewer to avoid SSR issues
const WorkbookViewer = dynamic(
  () => import('../WorkbookViewer').then(mod => mod.WorkbookViewer),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <Spin size="default" tip="Loading spreadsheet..." />
      </div>
    )
  }
);

interface WorkbookViewProps {
  spreadsheetData: any;
  showEmptyState: boolean;
  isDemoMode: boolean;
  zoomLevel: number;
  onWorkbookInit: (instance: any) => void;
  onEmptyStateAction: (action: 'start' | 'import', file?: File) => void;
  onZoomHandlerReady?: (handler: (zoom: number) => void) => void;
  onEditableAreaAdd?: (area: any) => void;
  onEditableAreaUpdate?: (area: any) => void;
  onEditableAreaRemove?: (areaId: string) => void;
  onImportExcel?: (file: File) => void;
  onWorkbookChange?: () => void;
}

const WorkbookView = forwardRef<any, WorkbookViewProps>(({
  spreadsheetData,
  showEmptyState,
  isDemoMode,
  zoomLevel,
  onWorkbookInit,
  onEmptyStateAction,
  onZoomHandlerReady,
  onEditableAreaAdd,
  onEditableAreaUpdate,
  onEditableAreaRemove,
  onImportExcel,
  onWorkbookChange
}, ref) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  // Show empty state for new services
  if (showEmptyState && !spreadsheetData) {
    return (
      <EmptyWorkbookState
        onStartFromScratch={() => onEmptyStateAction('start')}
        onImportFile={(file) => onEmptyStateAction('import', file)}
      />
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
        background: '#fafafa'
      }}>
        <Spin size="default" tip="Initializing spreadsheet..." />
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <WorkbookViewer
        ref={ref}
        storeLocal={{ spread: spreadsheetData }}
        readOnly={isDemoMode}
        workbookLayout="default"
        initialZoom={zoomLevel}
        actionHandlerProc={(action, data) => {
        if (action === 'spread-changed') {
          onWorkbookInit(data);
        } else if (action === 'designer-initialized' && data && typeof data.getWorkbook === 'function') {
          onWorkbookInit(data.getWorkbook());
        } else if (action === 'zoom-handler') {
          onZoomHandlerReady?.(data);
        } else if (action === 'edit-ended' || action === 'cell-changed' || action === 'range-cleared') {
          onWorkbookChange?.();
        } else if (action === 'editable-area-add') {
          onEditableAreaAdd?.(data);
        } else if (action === 'editable-area-update') {
          onEditableAreaUpdate?.(data);
        } else if (action === 'editable-area-remove') {
          onEditableAreaRemove?.(data);
        } else if (action === 'import-excel') {
          onImportExcel?.(data);
        }
      }}
    />
    </div>
  );
});

WorkbookView.displayName = 'WorkbookView';

export default WorkbookView;