import type { ApiProcessingSettings } from '@/features/settings/types/settings.api';

export type SettingsFormValues = {
  ocr_mode: ApiProcessingSettings['ocr_mode'];
  ocr_provider: ApiProcessingSettings['ocr_provider'];
  ocr_model: string;
  llm_provider: ApiProcessingSettings['llm_provider'];
  llm_model: string;
  request_timeout_seconds: number;
  ocr_api_key: string;
  llm_api_key: string;
};
