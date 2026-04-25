import { httpRequest, resolveAssetUrl } from '@/services/http/client';
import type {
  ApiBulkDepositCorrectionPayload,
  ApiExtractedDeposit,
  ApiExtractionLog,
  ApiJobDetail,
  ApiJobListItem,
  ApiSourceImage,
} from '@/features/processing/types/processing.api';

function normalizeDeposits(deposits: ApiSourceImage['deposits'] | null | undefined): ApiExtractedDeposit[] {
  return (Array.isArray(deposits) ? deposits : []).map((deposit) => ({
    ...deposit,
    fecha_consignacion: deposit.fecha_consignacion ?? '',
    hora_consignacion: deposit.hora_consignacion ?? '',
    referencia: deposit.referencia ?? '',
    valor: String(deposit.valor ?? ''),
    observations: Array.isArray(deposit.observations) ? deposit.observations : [],
    structured_payload: deposit.structured_payload ?? {},
  }));
}

export function normalizeSourceImages(images: ApiJobDetail['source_images'] | null | undefined): ApiSourceImage[] {
  return (Array.isArray(images) ? images : []).map((image) => ({
    ...image,
    source_name: image.source_name ?? '',
    content_hash: image.content_hash ?? '',
    ocr_provider: image.ocr_provider ?? '',
    ocr_raw_text: image.ocr_raw_text ?? '',
    error_message: image.error_message ?? '',
    image_file: image.image_file ? resolveAssetUrl(image.image_file) : '',
    deposits: normalizeDeposits(image.deposits),
  }));
}

export function normalizeJobDetail(job: Partial<ApiJobDetail>): ApiJobDetail {
  return {
    ...job,
    id: job.id ?? 0,
    original_filename: job.original_filename ?? '',
    status: job.status ?? 'uploaded',
    source_docx: job.source_docx ? resolveAssetUrl(job.source_docx) : '',
    excel_file: job.excel_file ? resolveAssetUrl(job.excel_file) : null,
    total_images: job.total_images ?? 0,
    total_records: job.total_records ?? 0,
    error_message: job.error_message ?? '',
    provider_config_snapshot: job.provider_config_snapshot ?? {},
    started_at: job.started_at ?? null,
    finished_at: job.finished_at ?? null,
    created_at: job.created_at ?? '',
    updated_at: job.updated_at ?? '',
    source_images: normalizeSourceImages(job.source_images),
  };
}

export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return httpRequest<Partial<ApiJobDetail>>('documents/upload/', {
    method: 'POST',
    body: formData,
  }).then(normalizeJobDetail);
}

export function processJob(jobId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/process/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

export function saveJobCorrections(jobId: number, payload: ApiBulkDepositCorrectionPayload) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/deposits/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(normalizeJobDetail);
}

export function reprocessDeposit(jobId: number, depositId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/deposits/${depositId}/reprocess/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

export function getJob(jobId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/`).then(normalizeJobDetail);
}

export function listJobs() {
  return httpRequest<ApiJobListItem[]>('jobs/').then((jobs) => Array.isArray(jobs) ? jobs : []);
}

export function exportJob(jobId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/export/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

export function getJobLogs(jobId: number) {
  return httpRequest<ApiExtractionLog[]>(`jobs/${jobId}/logs/`).then((logs) => Array.isArray(logs) ? logs : []);
}
