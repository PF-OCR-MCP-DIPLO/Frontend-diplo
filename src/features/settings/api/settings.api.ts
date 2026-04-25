import { httpRequest } from '@/services/http/client';
import type {
  ApiOllamaModelsResponse,
  ApiProcessingSettings,
  ApiProcessingSettingsOptions,
  ApiProcessingSettingsPatch,
} from '@/features/settings/types/settings.api';
import { normalizeSettings, normalizeSettingsOptions } from '@/features/settings/utils/settings-normalizers';

export function getProcessingSettings() {
  return httpRequest<Partial<ApiProcessingSettings>>('processing/settings/').then(normalizeSettings);
}

export function updateProcessingSettings(payload: ApiProcessingSettingsPatch) {
  return httpRequest<Partial<ApiProcessingSettings>>('processing/settings/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(normalizeSettings);
}

export function getProcessingSettingsOptions() {
  return httpRequest<Partial<ApiProcessingSettingsOptions>>('processing/settings/options/').then(normalizeSettingsOptions);
}

export function getOllamaModels() {
  return httpRequest<ApiOllamaModelsResponse>('processing/ollama/models/');
}
