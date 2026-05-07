import type { ApiJobDiagnosticsSummary, ApiJobStatus, ApiProcessingState, ApiSourceImage } from './processing.api';

export type ProcessingStatus = ApiJobStatus;
export type RowStatus = 'valid' | 'error';

export interface ConsignmentRow {
  id: string;
  depositId: number;
  sourceImageId: number;
  fecha: string;
  hora: string;
  monto: string;
  referencia: string;
  descripcion: string;
  sourceName: string;
  estado: RowStatus;
  errors: string[];
}

export type ResultRowId = ConsignmentRow['id'];
export type ResultFieldKey = keyof Pick<ConsignmentRow, 'fecha' | 'hora' | 'monto' | 'referencia' | 'descripcion' | 'sourceName' | 'estado'>;
export type ValidationSeverity = 'info' | 'warning' | 'error';

export interface ValidationIssue {
  id: string;
  message: string;
  severity: ValidationSeverity;
  source: 'backend' | 'frontend' | 'assistant';
}

export interface FieldValidationIssue extends ValidationIssue {
  rowId: ResultRowId;
  field: ResultFieldKey;
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
  processingState?: ApiProcessingState | null;
  diagnosticsSummary?: ApiJobDiagnosticsSummary | null;
}
