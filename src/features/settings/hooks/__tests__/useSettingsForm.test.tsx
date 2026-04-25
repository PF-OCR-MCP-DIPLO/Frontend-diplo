import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsForm } from '@/features/settings/hooks/useSettingsForm';
import { DEFAULT_EXTRACTION_CRITERIA } from '@/features/settings/types/extraction-criteria.types';

const getProcessingSettingsMock = vi.fn();
const getProcessingSettingsOptionsMock = vi.fn();
const getOllamaModelsMock = vi.fn();
const updateProcessingSettingsMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('@/features/settings/api/settings.api', () => ({
  getProcessingSettings: () => getProcessingSettingsMock(),
  getProcessingSettingsOptions: () => getProcessingSettingsOptionsMock(),
  getOllamaModels: () => getOllamaModelsMock(),
  updateProcessingSettings: (payload: unknown) => updateProcessingSettingsMock(payload),
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

const settingsResponse = {
  ocr_mode: 'tesseract',
  ocr_provider: 'openai',
  ocr_model: 'spa',
  llm_provider: 'openai',
  llm_model: 'gpt-4o-mini',
  assistant_provider: 'ollama',
  assistant_model: 'gemma4:e2b',
  assistant_show_debug_details: true,
  has_ocr_api_key: true,
  has_llm_api_key: true,
  has_assistant_api_key: false,
  assistant_temperature: 0.4,
  assistant_num_predict: 512,
  request_timeout_seconds: 30,
  extraction_criteria: DEFAULT_EXTRACTION_CRITERIA,
  updated_at: '2025-01-01T00:00:00Z',
} as const;

const ollamaModelsResponse = {
  provider: 'ollama',
  available: true,
  models: [{ name: 'llama3.2', label: 'llama3.2', size: 123, modifiedAt: '2026-04-24T00:00:00Z' }],
  error: null,
} as const;

const optionsResponse = {
  ocr_modes: ['tesseract', 'vision', 'auto'],
  providers: {
    ocr: ['openai'],
    llm: ['openai'],
  },
    provider_models: {
      openai: {
        ocr: ['gpt-4.1-mini'],
        llm: ['gpt-4o-mini'],
      },
      ollama: {
        ocr: [],
        llm: [],
      },
    },
    provider_requirements: {
      openai: {
        operational: true,
        requires_api_key: true,
      },
      ollama: {
        operational: true,
        requires_api_key: false,
      },
    },
  } as const;

describe('useSettingsForm', () => {
  beforeEach(() => {
    getProcessingSettingsMock.mockReset();
    getProcessingSettingsOptionsMock.mockReset();
    getOllamaModelsMock.mockReset();
    updateProcessingSettingsMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it('loads settings and options on mount', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBeNull();
    expect(result.current.settings?.ocr_model).toBe('spa');
    expect(result.current.options?.ocr_modes).toEqual(['tesseract', 'vision', 'auto']);
    expect(result.current.values?.assistant_model).toBe('gemma4:e2b');
    expect(result.current.values?.assistant_show_debug_details).toBe(true);
    expect(result.current.values?.extraction_criteria.fields[0].key).toBe('fecha_consignacion');
    expect(result.current.modelOptions.assistant).toContain('llama3.2');
  });

  it('allows reload after an initial failure', async () => {
    getProcessingSettingsMock
      .mockRejectedValueOnce(new Error('Load failed'))
      .mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe('Load failed');

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.loadError).toBeNull();
    expect(result.current.settings?.llm_model).toBe('gpt-4o-mini');
  });

  it('falls back to manual assistant model input when ollama models are absent', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue({
      ...optionsResponse,
      provider_models: {
        ...optionsResponse.provider_models,
        ollama: {
          ocr: [],
          llm: [],
        },
      },
    });
    getOllamaModelsMock.mockResolvedValue({ ...ollamaModelsResponse, models: [] });

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.modelOptions.assistant).toContain('gemma4:e2b');
  });

  it('normalizes partial settings options without crashing', async () => {
    getProcessingSettingsMock.mockResolvedValue({ ocr_mode: 'vision' });
    getProcessingSettingsOptionsMock.mockResolvedValue({
      providers: {},
      provider_models: undefined,
      provider_requirements: undefined,
    });
    getOllamaModelsMock.mockResolvedValue({ ...ollamaModelsResponse, available: false, models: [] });

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.values?.ocr_provider).toBe('ollama');
    expect(result.current.options?.providers.ocr).toEqual(['ollama', 'openai', 'gemini', 'deepseek']);
    expect(result.current.options?.providers.llm).toEqual(['ollama', 'openai', 'gemini', 'deepseek', 'anthropic']);
    expect(result.current.options?.provider_requirements.ollama).toMatchObject({
      operational: true,
      requires_api_key: false,
    });
  });

  it('sends assistant fields on save and omits empty api keys', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);
    updateProcessingSettingsMock.mockResolvedValue({
      ...settingsResponse,
      assistant_model: 'llama3.2:3b',
    });

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        assistant_model: 'llama3.2:3b',
        assistant_api_key: '',
        assistant_show_debug_details: true,
      });
    });

    await act(async () => {
      await result.current.save();
    });

    expect(updateProcessingSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        assistant_model: 'llama3.2:3b',
        assistant_provider: 'ollama',
        assistant_temperature: 0.4,
        assistant_num_predict: 512,
        assistant_show_debug_details: true,
      }),
    );
    const payload = updateProcessingSettingsMock.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('assistant_api_key');
    expect(payload).toHaveProperty('extraction_criteria');
  });
});
