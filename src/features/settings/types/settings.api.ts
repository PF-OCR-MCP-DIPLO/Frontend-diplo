import type { ExtractionCriteriaConfig } from '@/features/settings/types/extraction-criteria.types';

export interface ApiProcessingSettings {
  ocr_mode: 'tesseract' | 'vision' | 'auto';
  ocr_provider: 'ollama' | 'openai' | 'gemini' | 'deepseek';
  ocr_model: string;
  vision_model: string;
  llm_provider: 'ollama' | 'anthropic' | 'openai' | 'gemini' | 'deepseek';
  llm_model: string;
  assistant_provider: 'ollama' | 'openai' | 'gemini' | 'deepseek' | 'anthropic';
  assistant_model: string;
  assistant_show_debug_details: boolean;
  has_ocr_api_key: boolean;
  has_llm_api_key: boolean;
  has_assistant_api_key: boolean;
  assistant_temperature: number;
  assistant_num_predict: number;
  request_timeout_seconds: number;
  max_images_warning_threshold: number;
  block_documents_over_image_limit: boolean;
  valid_consignation_month: number;
  valid_consignation_year: number;
  extraction_criteria: ExtractionCriteriaConfig;
  updated_at: string;
}

export interface ApiProcessingSettingsPatch {
  ocr_mode?: ApiProcessingSettings['ocr_mode'];
  ocr_provider?: ApiProcessingSettings['ocr_provider'];
  ocr_model?: string;
  vision_model?: string;
  llm_provider?: ApiProcessingSettings['llm_provider'];
  llm_model?: string;
  assistant_provider?: ApiProcessingSettings['assistant_provider'];
  assistant_model?: string;
  assistant_show_debug_details?: boolean;
  assistant_api_key?: string;
  assistant_temperature?: number;
  assistant_num_predict?: number;
  ocr_api_key?: string;
  llm_api_key?: string;
  request_timeout_seconds?: number;
  max_images_warning_threshold?: number;
  block_documents_over_image_limit?: boolean;
  valid_consignation_month?: number;
  valid_consignation_year?: number;
  extraction_criteria?: ExtractionCriteriaConfig;
}

export interface ApiProcessingSettingsOptions {
  ocr_modes: string[];
  providers: {
    ocr: string[];
    llm: string[];
  };
  provider_models: Record<string, ProviderModels>;
  provider_requirements: Record<string, ProviderRequirements>;
}

export interface ProviderModels {
  ocr: string[];
  vision: string[];
  llm: string[];
}

export interface ProviderRequirements {
  operational: boolean;
  requires_api_key: boolean;
}

export interface ApiOllamaModelInfo {
  name: string;
  label: string;
  size: number | null;
  modifiedAt: string | null;
}

export interface ApiOllamaModelsResponse {
  provider: 'ollama';
  available: boolean;
  models: ApiOllamaModelInfo[];
  error: string | null;
}
