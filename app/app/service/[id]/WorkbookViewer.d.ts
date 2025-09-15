import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface WorkbookViewerProps {
  storeLocal: {
    spread: any;
  };
  readOnly?: boolean;
  workbookLayout?: string;
  initialZoom?: number;
  actionHandlerProc?: (action: string, data: any) => void;
}

export const WorkbookViewer: ForwardRefExoticComponent<WorkbookViewerProps & RefAttributes<any>>;