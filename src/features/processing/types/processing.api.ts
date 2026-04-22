export type ApiJobStatus = 'uploaded' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';

export interface ApiExtractedDeposit {
  id: number;
  sequence_index: number;
  fecha_consignacion: string;
  hora_consignacion: string;
  referencia: string;
  valor: string;
  is_current_month: boolean | null;
  observations: string[];
  structured_payload: Record<string, unknown>;
  created_at: string;
}

export interface ApiSourceImage {
  id: number;
  sequence_index: number;
  source_name: string;
  content_hash: string;
  ocr_status: 'pending' | 'processed' | 'failed';
  ocr_provider: string;
  ocr_raw_text: string;
  error_message: string;
  image_file: string;
  deposits: ApiExtractedDeposit[];
  created_at: string;
  updated_at: string;
}

export interface ApiJobListItem {
  id: number;
  original_filename: string;
  status: ApiJobStatus;
  total_images: number;
  total_records: number;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface ApiJobDetail extends ApiJobListItem {
  source_docx: string;
  excel_file: string | null;
  error_message: string;
  provider_config_snapshot: Record<string, unknown>;
  updated_at: string;
  source_images: ApiSourceImage[];
}

export interface ApiExtractionLog {
  id: number;
  source_image_id: number | null;
  sequence_index: number;
  stage: string;
  provider: string;
  model: string;
  ocr_mode: string;
  raw_payload: Record<string, unknown>;
  raw_text: string;
  notes: string;
  is_error: boolean;
  created_at: string;
}

export interface ApiDepositCorrectionItem {
  id: number;
  fecha_consignacion: string;
  hora_consignacion: string;
  referencia: string;
  valor: string;
}

export interface ApiBulkDepositCorrectionPayload {
  items: ApiDepositCorrectionItem[];
}
