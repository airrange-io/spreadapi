export interface PrintSettings {
  printArea?: string;
  orientation?: 'portrait' | 'landscape';
  fitToPage?: boolean;
  scale?: number;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface PrintMetadata {
  title?: string;
  description?: string;
  calculationType?: string;
}

export interface PrintJobResult {
  pdfUrl?: string;
  generatedAt?: string;
}

export interface PrintJob {
  id: string;
  serviceId: string;
  userId: string;
  inputs: Record<string, any>;
  token?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  expiresAt: string;
  printSettings?: PrintSettings;
  metadata?: PrintMetadata;
  result?: PrintJobResult;
  error?: string;
}

export interface CreatePrintJobParams {
  serviceId: string;
  userId: string;
  inputs: Record<string, any>;
  token?: string;
  printSettings?: PrintSettings;
  metadata?: PrintMetadata;
}

export interface PrintJobResponse {
  jobId: string;
  printUrl: string;
  expiresAt: string;
  message?: string;
}

export interface PrintJobStatus {
  jobId: string;
  status: PrintJob['status'];
  pdfUrl?: string;
  expiresAt: string;
  error?: string;
}