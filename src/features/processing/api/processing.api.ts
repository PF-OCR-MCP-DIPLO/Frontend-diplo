/**
 * Clientes API del flujo de procesamiento.
 *
 * Este módulo traduce respuestas del backend a formas más estables para la UI
 * y resuelve rutas relativas de archivos servidos por Django.
 *
 * @remarks
 * La normalización vive aquí para evitar que las pantallas tengan que conocer
 * cómo Django representa rutas de media, campos opcionales o colecciones vacías.
 */
/**
 * Clientes API del flujo de procesamiento.
 *
 * Este módulo traduce respuestas del backend a formas estables para la UI y
 * resuelve rutas relativas de archivos servidos por Django.
 */
import { httpRequest, resolveAssetUrl } from '@/services/http/client';
import type {
  ApiBulkDepositCorrectionPayload,
  ApiExtractedDeposit,
  ApiExtractionLog,
  ApiJobDiagnostics,
  ApiJobDetail,
  ApiJobListItem,
  ApiProcessingState,
  ApiSourceImage,
} from '@/features/processing/types/processing.api';

export interface ProcessJobOptions {
  force?: boolean;
}

/**
 * Normaliza los depósitos asociados a una imagen fuente.
 *
 * @param deposits - Depósitos posiblemente parciales devueltos por la API.
 * @returns Lista homogénea para renderizado y edición.
 *
 * @remarks
 * Convierte `null`/`undefined` en listas vacías y asegura campos de texto
 * presentes para que la UI no tenga que hacer defensas repetidas.
 */
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

/**
 * Normaliza las imágenes fuente de una corrida.
 *
 * @param images - Fuente parcial o incompleta proveniente del backend.
 * @returns Imágenes con rutas de media resueltas y campos básicos presentes.
 */
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

/**
 * Normaliza un detalle de corrida para consumo de UI.
 *
 * @param job - Detalle parcial o completo devuelto por el backend.
 * @returns Un objeto con la forma esperada por la capa visual.
 */
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

/**
 * Sube un DOCX para crear una corrida de procesamiento.
 *
 * @param file - Archivo DOCX seleccionado por el usuario.
 * @returns Detalle normalizado de la corrida creada.
 */
export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return httpRequest<Partial<ApiJobDetail>>('documents/upload/', {
    method: 'POST',
    body: formData,
  }).then(normalizeJobDetail);
}

/**
 * Solicita el procesamiento de una corrida existente.
 *
 * @param jobId - Identificador de la corrida.
 * @param options - Opciones del proceso; `force` fuerza reprocesamiento completo.
 * @returns Corrida normalizada luego de iniciar o completar el proceso.
 */
export function processJob(jobId: number, options: ProcessJobOptions = {}) {
  const searchParams = new URLSearchParams();
  if (options.force) {
    searchParams.set('force', 'true');
  }
  const query = searchParams.toString();

  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/process/${query ? `?${query}` : ''}`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

/**
 * Elimina una corrida y sus artefactos asociados.
 *
 * @param jobId - Identificador de la corrida.
 * @returns `void` cuando la operación se completa sin error.
 */
export function deleteJob(jobId: number) {
  return httpRequest<void>(`jobs/${jobId}/`, {
    method: 'DELETE',
  });
}

/**
 * Persiste correcciones manuales sobre varios depósitos.
 *
 * @param jobId - Identificador de la corrida.
 * @param payload - Payload de corrección inferido por uso del formulario.
 * @returns Corrida normalizada con los cambios persistidos.
 */
export function saveJobCorrections(jobId: number, payload: ApiBulkDepositCorrectionPayload) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/deposits/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(normalizeJobDetail);
}

/**
 * Reprocesa el depósito asociado a una consignación.
 *
 * @param jobId - Identificador de la corrida.
 * @param depositId - Identificador del depósito.
 * @returns Corrida normalizada luego del reproceso.
 */
export function reprocessDeposit(jobId: number, depositId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/deposits/${depositId}/reprocess/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

/**
 * Reprocesa todas las fuentes que quedaron con error.
 *
 * @param jobId - Identificador de la corrida.
 * @returns Corrida normalizada con el nuevo estado.
 */
export function reprocessFailed(jobId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/reprocess-failed/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

/**
 * Reprocesa una imagen fuente individual.
 *
 * @param jobId - Identificador de la corrida.
 * @param sourceImageId - Identificador de la imagen fuente.
 * @returns Corrida normalizada con el nuevo estado.
 */
export function reprocessSourceImage(jobId: number, sourceImageId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/source-images/${sourceImageId}/reprocess/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

/**
 * Obtiene una corrida por su identificador.
 *
 * @param jobId - Identificador de la corrida.
 * @returns Detalle normalizado de la corrida.
 */
export function getJob(jobId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/`).then(normalizeJobDetail);
}

/**
 * Lista corridas disponibles para el historial.
 *
 * @returns Lista normalizada o vacía si el backend no devuelve un array.
 */
export function listJobs() {
  return httpRequest<ApiJobListItem[]>('jobs/').then((jobs) => Array.isArray(jobs) ? jobs : []);
}

/**
 * Genera la exportación Excel de una corrida.
 *
 * @param jobId - Identificador de la corrida.
 * @returns Detalle normalizado con la ruta del archivo exportado.
 */
export function exportJob(jobId: number) {
  return httpRequest<Partial<ApiJobDetail>>(`jobs/${jobId}/export/`, {
    method: 'POST',
  }).then(normalizeJobDetail);
}

/**
 * Obtiene los logs de extracción de una corrida.
 *
 * @param jobId - Identificador de la corrida.
 * @returns Lista de logs o lista vacía si la respuesta no es iterable.
 */
export function getJobLogs(jobId: number) {
  return httpRequest<ApiExtractionLog[]>(`jobs/${jobId}/logs/`).then((logs) => Array.isArray(logs) ? logs : []);
}

/**
 * Obtiene el resumen de diagnóstico de una corrida.
 *
 * @param jobId - Identificador de la corrida.
 * @returns Resumen de diagnóstico del backend.
 */
export function getJobDiagnostics(jobId: number) {
  return httpRequest<ApiJobDiagnostics>(`jobs/${jobId}/diagnostics/`);
}

/**
 * Obtiene el estado de procesamiento resumido para polling ligero.
 *
 * @param jobId - Identificador de la corrida.
 * @returns Estado resumido de procesamiento.
 */
export function getProcessingState(jobId: number) {
  return httpRequest<ApiProcessingState>(`jobs/${jobId}/processing-state/`);
}
