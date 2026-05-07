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
  vision_model: 'gpt-4.1-mini',
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
  max_images_warning_threshold: 50,
  block_documents_over_image_limit: false,
  valid_consignation_month: 4,
  valid_consignation_year: 2026,
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
        vision: ['gpt-4.1-vision'],
        llm: ['gpt-4o-mini'],
      },
      ollama: {
        ocr: [],
        vision: [],
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
    expect(result.current.values?.valid_consignation_month).toBe(4);
    expect(result.current.values?.valid_consignation_year).toBe(2026);
    expect(result.current.values?.extraction_criteria.fields[0].key).toBe('fecha_consignacion');
    expect(result.current.modelOptions.assistant).toContain('llama3.2');
  });

  it('keeps the settings page usable when ollama models cannot be loaded', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockRejectedValue(new Error('Ollama unavailable'));

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.loadError).toBeNull();
    expect(result.current.settings?.ocr_model).toBe('spa');
    expect(result.current.ollamaModels).toMatchObject({
      available: false,
      models: [],
      error: 'Ollama unavailable',
    });
    expect(result.current.modelOptions.assistant).toContain('gemma4:e2b');
    expect(toastErrorMock).toHaveBeenCalledWith('Ollama unavailable');
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
          vision: [],
          llm: [],
        },
      },
    });
    getOllamaModelsMock.mockResolvedValue({ ...ollamaModelsResponse, models: [] });

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.modelOptions.assistant).toContain('gemma4:e2b');
  });

  it('preserves saved custom model values in the available options', async () => {
    getProcessingSettingsMock.mockResolvedValue({
      ...settingsResponse,
      ocr_provider: 'openai',
      ocr_model: 'gpt-4.1-custom-ocr',
      vision_model: 'gpt-4.1-custom-vision',
      llm_provider: 'openai',
      llm_model: 'gpt-4.1-custom-llm',
      assistant_provider: 'openai',
      assistant_model: 'gpt-4.1-custom-assistant',
    });
    getProcessingSettingsOptionsMock.mockResolvedValue({
      ...optionsResponse,
      provider_models: {
        ...optionsResponse.provider_models,
        openai: {
          ocr: ['gpt-4.1-mini'],
          vision: ['gpt-4.1-vision'],
          llm: ['gpt-4o-mini'],
        },
      },
    });
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.modelOptions.ocr).toContain('gpt-4.1-custom-ocr');
    expect(result.current.modelOptions.vision).toContain('gpt-4.1-custom-vision');
    expect(result.current.modelOptions.llm).toContain('gpt-4.1-custom-llm');
    expect(result.current.modelOptions.assistant).toContain('gpt-4.1-custom-assistant');
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
      assistant_model: 'llama3.1:8b',
    });

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        assistant_model: 'llama3.1:8b',
        assistant_api_key: '',
        assistant_show_debug_details: true,
      });
    });

    await act(async () => {
      await result.current.save();
    });

    expect(updateProcessingSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        assistant_model: 'llama3.1:8b',
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

  it('marks unsaved changes and sends the valid consignation period in the payload', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);
    updateProcessingSettingsMock.mockResolvedValue({
      ...settingsResponse,
      valid_consignation_month: 5,
      valid_consignation_year: 2027,
    });

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        valid_consignation_month: 5,
        valid_consignation_year: 2027,
      });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    await act(async () => {
      await result.current.save();
    });

    expect(updateProcessingSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        valid_consignation_month: 5,
        valid_consignation_year: 2027,
      }),
    );
    expect(result.current.values?.valid_consignation_month).toBe(5);
    expect(result.current.values?.valid_consignation_year).toBe(2027);
  });

  it('tracks unsaved changes, clears them after save and updates the baseline', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);
    updateProcessingSettingsMock.mockResolvedValue({
      ...settingsResponse,
      assistant_model: 'qwen2.5:7b',
    });

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        assistant_model: 'qwen2.5:7b',
      });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.values?.assistant_model).toBe('qwen2.5:7b');

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        assistant_model: 'llama3.1:8b',
      });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('restores the last saved values when discarding changes', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        assistant_model: 'qwen2.5:7b',
      });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.discardChanges();
    });

    expect(result.current.values?.assistant_model).toBe('gemma4:e2b');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('keeps the unsaved warning state after a save error', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);
    updateProcessingSettingsMock.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        assistant_model: 'qwen2.5:7b',
      });
    });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(toastErrorMock).toHaveBeenCalledWith('Save failed');
  });

  it('registers beforeunload only while unsaved changes exist', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);
    getOllamaModelsMock.mockResolvedValue(ollamaModelsResponse);

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));

    act(() => {
      result.current.setValues({
        ...(result.current.values as NonNullable<typeof result.current.values>),
        assistant_model: 'qwen2.5:7b',
      });
    });

    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    act(() => {
      result.current.discardChanges();
    });

    await waitFor(() => {
      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
