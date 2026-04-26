/**
 * Convierte respuestas del backend a estructuras consumibles por la UI.
 *
 * Los mappers concentran la normalización de estados, errores y rutas de media
 * para que las pantallas no repitan reglas de transformación.
 */
import type { ApiJobDetail, ApiJobListItem } from '@/features/processing/types/processing.api';
import type { ConsignmentRow, PreviewImage, ProcessedFile, RowStatus } from '@/features/processing/types/processing.types';

function resolveRowStatus(hasImageError: boolean, hasObservations: boolean): RowStatus {
  // La fila se marca en error si su imagen fuente falló o si el depósito ya
  // trae observaciones que requieren revisión manual.
  return hasImageError || hasObservations ? 'error' : 'valid';
}

export function mapJobToConsignmentRows(job: ApiJobDetail): ConsignmentRow[] {
  const sourceImages = Array.isArray(job.source_images) ? job.source_images : [];

  return sourceImages
    .flatMap((image) =>
      image.deposits.map((deposit): ConsignmentRow => ({
        id: `${image.id}-${deposit.id}`,
        depositId: deposit.id,
        sourceImageId: image.id,
        fecha: deposit.fecha_consignacion || 'Sin fecha',
        hora: deposit.hora_consignacion || '',
        monto: String(deposit.valor),
        referencia: deposit.referencia,
        sourceName: image.source_name,
        estado: resolveRowStatus(image.ocr_status === 'failed', (deposit.observations ?? []).length > 0),
        errors: [...(deposit.observations ?? []), ...(image.error_message ? [image.error_message] : [])],
      }))
    )
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));
}

export function mapJobToProcessedFile(job: ApiJobDetail): ProcessedFile {
  const data = mapJobToConsignmentRows(job);
  const sourceImages = Array.isArray(job.source_images) ? job.source_images : [];
  const imageErrors = sourceImages.filter((image) => image.ocr_status === 'failed').length;
  const rowErrors = data.filter((row) => row.estado === 'error').length;

  return {
    id: String(job.id),
    jobId: job.id,
    name: job.original_filename,
    date: new Date(job.created_at),
    status: job.status,
    displayStatus: job.status === 'failed' || rowErrors > 0 || imageErrors > 0 ? 'error' : 'success',
    sourceDocxUrl: job.source_docx,
    excelUrl: job.excel_file,
    totalImages: job.total_images,
    totalRecords: job.total_records,
    errorMessage: job.error_message,
    sourceImages,
    data,
    errorCount: Math.max(rowErrors, imageErrors),
  };
}

export function mapJobListItemToPlaceholder(job: ApiJobListItem): ProcessedFile {
  return {
    id: String(job.id),
    jobId: job.id,
    name: job.original_filename,
    date: new Date(job.created_at),
    status: job.status,
    displayStatus: job.status === 'failed' ? 'error' : 'success',
    sourceDocxUrl: '',
    excelUrl: null,
    totalImages: job.total_images,
    totalRecords: job.total_records,
    errorMessage: '',
    sourceImages: [],
    data: [],
    errorCount: job.status === 'failed' ? 1 : 0,
  };
}

export function mapSourceImagesToPreview(images: ProcessedFile['sourceImages']): PreviewImage[] {
  return images
    .filter((image) => image.image_file)
    .map((image) => ({
      id: image.id,
      url: image.image_file,
      name: image.source_name,
      status: image.ocr_status,
    }));
}
