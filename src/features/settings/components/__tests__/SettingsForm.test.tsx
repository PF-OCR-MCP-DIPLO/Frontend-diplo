import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { DEFAULT_PROCESSING_SETTINGS, normalizeSettingsOptions } from '@/features/settings/utils/settings-normalizers';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

const baseValues: SettingsFormValues = {
  ocr_mode: 'vision',
  ocr_provider: 'ollama',
  ocr_model: '',
  llm_provider: 'ollama',
  llm_model: '',
  assistant_provider: 'ollama',
  assistant_model: '',
  assistant_show_debug_details: false,
  assistant_temperature: 0.2,
  assistant_num_predict: 256,
  request_timeout_seconds: 320,
  ocr_api_key: '',
  llm_api_key: '',
  assistant_api_key: '',
  extraction_criteria: DEFAULT_PROCESSING_SETTINGS.extraction_criteria,
};

function renderForm(options = normalizeSettingsOptions(null), values = baseValues) {
  return render(
    <SettingsForm
      settings={DEFAULT_PROCESSING_SETTINGS}
      options={options}
      values={values}
      onChange={vi.fn()}
      onSave={vi.fn()}
      isSaving={false}
      modelOptions={{ ocr: [], llm: [], assistant: [] }}
      onOpenAssistant={vi.fn()}
    />
  );
}

describe('SettingsForm', () => {
  it('renders with empty provider lists', () => {
    renderForm(normalizeSettingsOptions({
      providers: { ocr: [], llm: [] },
      provider_models: {},
      provider_requirements: {},
    }));

    expect(screen.getByLabelText('Proveedor OCR')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Proveedor')).toHaveLength(2);
  });

  it('renders without provider requirements and falls back to manual models', () => {
    renderForm(normalizeSettingsOptions({
      providers: { ocr: ['ollama'], llm: ['ollama'] },
    }));

    expect(screen.getByLabelText('Modelo OCR')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Modelo')).toHaveLength(2);
    expect(screen.getByText(/No hay modelos detectados/i)).toBeInTheDocument();
  });
});
