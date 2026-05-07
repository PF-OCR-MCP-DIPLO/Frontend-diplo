import { DEFAULT_EXTRACTION_CRITERIA } from '@/features/settings/types/extraction-criteria.types';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions, ProviderRequirements } from '@/features/settings/types/settings.api';

const DEFAULT_OCR_MODES: ApiProcessingSettings['ocr_mode'][] = ['tesseract', 'vision', 'auto'];
const DEFAULT_OCR_PROVIDERS: ApiProcessingSettings['ocr_provider'][] = ['ollama', 'openai', 'gemini', 'deepseek'];
const DEFAULT_LLM_PROVIDERS: ApiProcessingSettings['llm_provider'][] = ['ollama', 'openai', 'gemini', 'deepseek', 'anthropic'];

const DEFAULT_PROVIDER_REQUIREMENTS: ProviderRequirements = {
  operational: false,
  requires_api_key: true,
};

export const DEFAULT_PROCESSING_SETTINGS: ApiProcessingSettings = {
  ocr_mode: 'vision',
  ocr_provider: 'ollama',
  ocr_model: '',
  vision_model: '',
  llm_provider: 'ollama',
  llm_model: '',
  assistant_provider: 'ollama',
  assistant_model: '',
  assistant_show_debug_details: false,
  has_ocr_api_key: false,
  has_llm_api_key: false,
  has_assistant_api_key: false,
  assistant_temperature: 0.2,
  assistant_num_predict: 256,
  request_timeout_seconds: 320,
  max_images_warning_threshold: 50,
  block_documents_over_image_limit: false,
  valid_consignation_month: new Date().getMonth() + 1,
  valid_consignation_year: new Date().getFullYear(),
  extraction_criteria: DEFAULT_EXTRACTION_CRITERIA,
  updated_at: '',
};

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeIntegerInRange(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'string' && value.trim() !== ''
    ? Number.parseInt(value, 10)
    : asNumber(value, Number.NaN);

  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

export function normalizeProviderModels(value: unknown): ApiProcessingSettingsOptions['provider_models'] {
  if (!value || typeof value !== 'object') return {};

  return Object.entries(value as Record<string, unknown>).reduce<ApiProcessingSettingsOptions['provider_models']>((acc, [provider, models]) => {
    const modelConfig = models && typeof models === 'object' ? models as Record<string, unknown> : {};
    acc[provider] = {
      ocr: asStringArray(modelConfig.ocr, []),
      vision: asStringArray(modelConfig.vision, []),
      llm: asStringArray(modelConfig.llm, []),
    };
    return acc;
  }, {});
}

export function normalizeProviderRequirements(value: unknown): ApiProcessingSettingsOptions['provider_requirements'] {
  const knownProviders = [...DEFAULT_OCR_PROVIDERS, 'anthropic'];
  const normalized = knownProviders.reduce<ApiProcessingSettingsOptions['provider_requirements']>((acc, provider) => {
    acc[provider] = provider === 'ollama'
      ? { operational: true, requires_api_key: false }
      : DEFAULT_PROVIDER_REQUIREMENTS;
    return acc;
  }, {});

  if (!value || typeof value !== 'object') return normalized;

  Object.entries(value as Record<string, unknown>).forEach(([provider, requirements]) => {
    const config = requirements && typeof requirements === 'object' ? requirements as Record<string, unknown> : {};
    normalized[provider] = {
      operational: asBoolean(config.operational, normalized[provider]?.operational ?? false),
      requires_api_key: asBoolean(config.requires_api_key, normalized[provider]?.requires_api_key ?? provider !== 'ollama'),
    };
  });

  return normalized;
}

export function normalizeSettingsOptions(options?: Partial<ApiProcessingSettingsOptions> | null): ApiProcessingSettingsOptions {
  const providers = options?.providers;

  return {
    ocr_modes: asStringArray(options?.ocr_modes, DEFAULT_OCR_MODES),
    providers: {
      ocr: asStringArray(providers?.ocr, DEFAULT_OCR_PROVIDERS),
      llm: asStringArray(providers?.llm, DEFAULT_LLM_PROVIDERS),
    },
    provider_models: normalizeProviderModels(options?.provider_models),
    provider_requirements: normalizeProviderRequirements(options?.provider_requirements),
  };
}

export function normalizeSettings(settings?: Partial<ApiProcessingSettings> | null): ApiProcessingSettings {
  const next = { ...DEFAULT_PROCESSING_SETTINGS, ...settings };
  return {
    ...next,
    ocr_model: next.ocr_model ?? '',
    vision_model: next.vision_model ?? '',
    llm_model: next.llm_model ?? '',
    assistant_model: next.assistant_model ?? '',
    assistant_show_debug_details: Boolean(next.assistant_show_debug_details),
    has_ocr_api_key: Boolean(next.has_ocr_api_key),
    has_llm_api_key: Boolean(next.has_llm_api_key),
    has_assistant_api_key: Boolean(next.has_assistant_api_key),
    assistant_temperature: asNumber(next.assistant_temperature, DEFAULT_PROCESSING_SETTINGS.assistant_temperature),
    assistant_num_predict: asNumber(next.assistant_num_predict, DEFAULT_PROCESSING_SETTINGS.assistant_num_predict),
    request_timeout_seconds: asNumber(next.request_timeout_seconds, DEFAULT_PROCESSING_SETTINGS.request_timeout_seconds),
    max_images_warning_threshold: normalizeIntegerInRange(next.max_images_warning_threshold, DEFAULT_PROCESSING_SETTINGS.max_images_warning_threshold, 1, 1000),
    block_documents_over_image_limit: Boolean(next.block_documents_over_image_limit),
    valid_consignation_month: normalizeIntegerInRange(next.valid_consignation_month, DEFAULT_PROCESSING_SETTINGS.valid_consignation_month, 1, 12),
    valid_consignation_year: normalizeIntegerInRange(next.valid_consignation_year, DEFAULT_PROCESSING_SETTINGS.valid_consignation_year, 2000, 2100),
    extraction_criteria: next.extraction_criteria ?? DEFAULT_EXTRACTION_CRITERIA,
    updated_at: next.updated_at ?? '',
  };
}
