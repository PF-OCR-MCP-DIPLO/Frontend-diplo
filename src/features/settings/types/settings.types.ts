import type { ApiProcessingSettings } from '@/features/settings/types/settings.api';
import type { ExtractionCriteriaConfig } from '@/features/settings/types/extraction-criteria.types';

export type SettingsFormValues = {
  ocr_mode: ApiProcessingSettings['ocr_mode'];
  ocr_provider: ApiProcessingSettings['ocr_provider'];
  ocr_model: string;
  llm_provider: ApiProcessingSettings['llm_provider'];
  llm_model: string;
  assistant_provider: ApiProcessingSettings['assistant_provider'];
  assistant_model: string;
  assistant_show_debug_details: boolean;
  assistant_temperature: number;
  assistant_num_predict: number;
  request_timeout_seconds: number;
  ocr_api_key: string;
  llm_api_key: string;
  assistant_api_key: string;
  extraction_criteria: ExtractionCriteriaConfig;
};
