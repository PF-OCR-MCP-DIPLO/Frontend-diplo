export interface ApiProcessingSettings {
  ocr_mode: 'tesseract' | 'vision' | 'auto';
  ocr_provider: 'ollama' | 'openai' | 'gemini' | 'deepseek';
  ocr_model: string;
  llm_provider: 'ollama' | 'anthropic' | 'openai' | 'gemini' | 'deepseek';
  llm_model: string;
  assistant_provider: 'ollama' | 'openai' | 'gemini' | 'deepseek' | 'anthropic';
  assistant_model: string;
  has_ocr_api_key: boolean;
  has_llm_api_key: boolean;
  has_assistant_api_key: boolean;
  assistant_temperature: number;
  assistant_num_predict: number;
  request_timeout_seconds: number;
  updated_at: string;
}

export interface ApiProcessingSettingsPatch {
  ocr_mode?: ApiProcessingSettings['ocr_mode'];
  ocr_provider?: ApiProcessingSettings['ocr_provider'];
  ocr_model?: string;
  llm_provider?: ApiProcessingSettings['llm_provider'];
  llm_model?: string;
  assistant_provider?: ApiProcessingSettings['assistant_provider'];
  assistant_model?: string;
  assistant_api_key?: string;
  assistant_temperature?: number;
  assistant_num_predict?: number;
  ocr_api_key?: string;
  llm_api_key?: string;
  request_timeout_seconds?: number;
}

export interface ApiProcessingSettingsOptions {
  ocr_modes: string[];
  providers: {
    ocr: string[];
    llm: string[];
  };
  provider_models: Record<string, { ocr: string[]; llm: string[] }>;
  provider_requirements: Record<string, { operational: boolean; requires_api_key: boolean }>;
}
