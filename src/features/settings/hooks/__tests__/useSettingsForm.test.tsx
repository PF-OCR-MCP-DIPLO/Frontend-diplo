import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsForm } from '@/features/settings/hooks/useSettingsForm';

const getProcessingSettingsMock = vi.fn();
const getProcessingSettingsOptionsMock = vi.fn();
const updateProcessingSettingsMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('@/features/settings/api/settings.api', () => ({
  getProcessingSettings: () => getProcessingSettingsMock(),
  getProcessingSettingsOptions: () => getProcessingSettingsOptionsMock(),
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
  has_ocr_api_key: true,
  has_llm_api_key: true,
  request_timeout_seconds: 30,
  updated_at: '2025-01-01T00:00:00Z',
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
  },
  provider_requirements: {
    openai: {
      operational: true,
      requires_api_key: true,
    },
  },
} as const;

describe('useSettingsForm', () => {
  beforeEach(() => {
    getProcessingSettingsMock.mockReset();
    getProcessingSettingsOptionsMock.mockReset();
    updateProcessingSettingsMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it('loads settings and options on mount', async () => {
    getProcessingSettingsMock.mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBeNull();
    expect(result.current.settings?.ocr_model).toBe('spa');
    expect(result.current.options?.ocr_modes).toEqual(['tesseract', 'vision', 'auto']);
  });

  it('allows reload after an initial failure', async () => {
    getProcessingSettingsMock
      .mockRejectedValueOnce(new Error('Load failed'))
      .mockResolvedValue(settingsResponse);
    getProcessingSettingsOptionsMock.mockResolvedValue(optionsResponse);

    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe('Load failed');

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.loadError).toBeNull();
    expect(result.current.settings?.llm_model).toBe('gpt-4o-mini');
  });
});
