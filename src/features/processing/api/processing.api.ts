import { httpRequest, resolveAssetUrl } from '@/services/http/client';
import type {
  ApiBulkDepositCorrectionPayload,
  ApiExtractionLog,
  ApiJobDetail,
  ApiJobListItem,
} from '@/features/processing/types/processing.api';

function normalizeJobDetail(job: ApiJobDetail): ApiJobDetail {
  return {
    ...job,
    source_docx: job.source_docx ? resolveAssetUrl(job.source_docx) : '',
    excel_file: job.excel_file ? resolveAssetUrl(job.excel_file) : null,
    source_images: job.source_images.map((image) => ({
      ...image,
      image_file: image.image_file ? resolveAssetUrl(image.image_file) : '',
    })),
  };
}

export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return httpRequest<ApiJobDetail>('documents/upload/', {
    method: 'POST',
    body: formData,
  }).then(normalizeJobDetail);
}

export function processJob(jobId: number) {
  return httpRequest<ApiJobDetail>(`jobs/${jobId}/process/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

export function saveJobCorrections(jobId: number, payload: ApiBulkDepositCorrectionPayload) {
  return httpRequest<ApiJobDetail>(`jobs/${jobId}/deposits/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(normalizeJobDetail);
}

export function getJob(jobId: number) {
  return httpRequest<ApiJobDetail>(`jobs/${jobId}/`).then(normalizeJobDetail);
}

export function listJobs() {
  return httpRequest<ApiJobListItem[]>('jobs/');
}

export function exportJob(jobId: number) {
  return httpRequest<ApiJobDetail>(`jobs/${jobId}/export/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

export function getJobLogs(jobId: number) {
  return httpRequest<ApiExtractionLog[]>(`jobs/${jobId}/logs/`);
}
