import type { ApiJobStatus, ApiSourceImage } from './processing.api';

export type ProcessingStatus = ApiJobStatus;
export type RowStatus = 'valid' | 'error';

export interface ConsignmentRow {
  id: string;
  fecha: string;
  monto: string;
  referencia: string;
  banco: string;
  estado: RowStatus;
  errors: string[];
}

export interface PreviewImage {
  id: number;
  url: string;
  name: string;
  status: string;
}

export interface ProcessedFile {
  id: string;
  jobId: number;
  name: string;
  date: Date;
  status: ProcessingStatus;
  displayStatus: 'success' | 'error';
  sourceDocxUrl: string;
  excelUrl: string | null;
  totalImages: number;
  totalRecords: number;
  errorMessage: string;
  sourceImages: ApiSourceImage[];
  data: ConsignmentRow[];
  errorCount: number;
}
