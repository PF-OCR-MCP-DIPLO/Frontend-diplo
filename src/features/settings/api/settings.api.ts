import { httpRequest } from '@/services/http/client';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';

export function getProcessingSettings() {
  return httpRequest<ApiProcessingSettings>('processing/settings/');
}

export function updateProcessingSettings(payload: Partial<ApiProcessingSettings> & Record<string, unknown>) {
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
