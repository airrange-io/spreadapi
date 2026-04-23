import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface DataSourceApi {
  applyDataSource: (def: any) => Promise<void>;
  applyDataSources: (defs: any[]) => Promise<void>;
  removeDataSource: (tableName: string) => void;
}

interface WorkbookViewerProps {
  storeLocal: {
    spread: any;
  };
  readOnly?: boolean;
  workbookLayout?: string;
  initialZoom?: number;
  serviceId?: string;    // v4: required by applyDataSource to construct read-fn URLs
  /**
   * Called with the data-source API once the internal spread is ready.
   * Preferred over the imperative handle because it's immune to the ref
   * forwarding flakiness of next/dynamic.
   */
  onDataSourceApiReady?: (api: DataSourceApi) => void;
  actionHandlerProc?: (action: string, data: any) => void;
}

export const WorkbookViewer: ForwardRefExoticComponent<WorkbookViewerProps & RefAttributes<any>>;