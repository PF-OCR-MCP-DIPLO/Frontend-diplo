export interface ApiProcessingSettings {
  ocr_mode: 'tesseract' | 'vision' | 'auto';
  ocr_provider: 'ollama' | 'openai' | 'gemini' | 'deepseek';
  ocr_model: string;
  llm_provider: 'ollama' | 'openai' | 'gemini' | 'deepseek';
  llm_model: string;
  has_ocr_api_key: boolean;
  has_llm_api_key: boolean;
  request_timeout_seconds: number;
  updated_at: string;
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
