import { httpRequest } from '@/services/http/client';
import type {
  ApiOllamaModelsResponse,
  ApiProcessingSettings,
  ApiProcessingSettingsOptions,
  ApiProcessingSettingsPatch,
} from '@/features/settings/types/settings.api';

export function getProcessingSettings() {
  return httpRequest<ApiProcessingSettings>('processing/settings/');
}

export function updateProcessingSettings(payload: ApiProcessingSettingsPatch) {
  return httpRequest<ApiProcessingSettings>('processing/settings/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function getProcessingSettingsOptions() {
  return httpRequest<ApiProcessingSettingsOptions>('processing/settings/options/');
}

export function getOllamaModels() {
  return httpRequest<ApiOllamaModelsResponse>('processing/ollama/models/');
}
