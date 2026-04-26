/**
 * Clientes API para configuración de OCR, LLM y asistente.
 *
 * Mantiene la capa de UI desacoplada del formato exacto del backend y aplica
 * normalización de respuestas donde el contrato devuelve campos parciales.
 *
 * @remarks
 * El backend expone un singleton de settings; estas funciones solo adaptan el
 * acceso y la forma de los datos para consumo de formularios.
 */
import { httpRequest } from '@/services/http/client';
import type {
  ApiOllamaModelsResponse,
  ApiProcessingSettings,
  ApiProcessingSettingsOptions,
  ApiProcessingSettingsPatch,
} from '@/features/settings/types/settings.api';
import { normalizeSettings, normalizeSettingsOptions } from '@/features/settings/utils/settings-normalizers';

/**
 * Lee la configuración persistida de procesamiento.
 *
 * @returns Settings normalizados para edición en formulario.
 */
export function getProcessingSettings() {
  return httpRequest<Partial<ApiProcessingSettings>>('processing/settings/').then(normalizeSettings);
}

/**
 * Actualiza parcialmente la configuración de procesamiento.
 *
 * @param payload - Parcial de settings con los campos editados por el usuario.
 * @returns Settings normalizados luego de persistirlos.
 */
export function updateProcessingSettings(payload: ApiProcessingSettingsPatch) {
  return httpRequest<Partial<ApiProcessingSettings>>('processing/settings/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(normalizeSettings);
}

/**
 * Obtiene las opciones válidas para controles de configuración.
 *
 * @returns Catálogos normalizados de proveedores, modos y criterios.
 */
export function getProcessingSettingsOptions() {
  return httpRequest<Partial<ApiProcessingSettingsOptions>>('processing/settings/options/').then(normalizeSettingsOptions);
}

/**
 * Obtiene un snapshot de modelos disponibles en Ollama.
 *
 * @returns Respuesta cruda del backend con modelos detectados.
 */
export function getOllamaModels() {
  return httpRequest<ApiOllamaModelsResponse>('processing/ollama/models/');
}
