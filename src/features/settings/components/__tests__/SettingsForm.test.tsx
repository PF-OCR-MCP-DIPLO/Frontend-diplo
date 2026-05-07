import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { DEFAULT_PROCESSING_SETTINGS, normalizeSettingsOptions } from '@/features/settings/utils/settings-normalizers';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

const baseValues: SettingsFormValues = {
  ocr_mode: 'vision',
  ocr_provider: 'ollama',
  ocr_model: '',
  vision_model: '',
  llm_provider: 'ollama',
  llm_model: '',
  assistant_provider: 'ollama',
  assistant_model: '',
  assistant_show_debug_details: false,
  assistant_temperature: 0.2,
  assistant_num_predict: 256,
  request_timeout_seconds: 320,
  max_images_warning_threshold: 50,
  block_documents_over_image_limit: false,
  valid_consignation_month: 4,
  valid_consignation_year: 2026,
  ocr_api_key: '',
  llm_api_key: '',
  assistant_api_key: '',
  extraction_criteria: DEFAULT_PROCESSING_SETTINGS.extraction_criteria,
};

function renderForm(options = normalizeSettingsOptions(null), values = baseValues) {
  const onSave = vi.fn();
  const onDiscard = vi.fn();
  const onChange = vi.fn();
  return render(
    <SettingsForm
      settings={DEFAULT_PROCESSING_SETTINGS}
      options={options}
      values={values}
      onChange={onChange}
      onSave={onSave}
      onDiscard={onDiscard}
      isSaving={false}
      hasUnsavedChanges={false}
      modelOptions={{ ocr: [], vision: [], llm: [], assistant: [] }}
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

    expect(screen.queryByLabelText('Modelo OCR')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Modelo Vision')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Modelo')).toHaveLength(2);
    expect(screen.getByText(/No hay modelos detectados/i)).toBeInTheDocument();
  });

  it('shows unsaved changes warning and enables save/discard actions', () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();

    render(
      <SettingsForm
        settings={DEFAULT_PROCESSING_SETTINGS}
        options={normalizeSettingsOptions(null)}
        values={baseValues}
        onChange={vi.fn()}
        onSave={onSave}
        onDiscard={onDiscard}
        isSaving={false}
        hasUnsavedChanges
        modelOptions={{ ocr: [], vision: [], llm: [], assistant: [] }}
        onOpenAssistant={vi.fn()}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(/cambios sin guardar/i);
    expect(screen.getByRole('button', { name: /^Guardar$/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Descartar cambios/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /^Guardar$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Descartar cambios/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('renders the valid consignation period controls', () => {
    renderForm();

    expect(screen.getByLabelText('Mes válido de consignación')).toBeInTheDocument();
    expect(screen.getByLabelText('Año válido de consignación')).toBeInTheDocument();
    expect(screen.getByText(/no al mes actual del sistema/i)).toBeInTheDocument();
  });

  it('renders tesseract OCR model as a select with predefined language options', () => {
    renderForm(
      normalizeSettingsOptions(null),
      { ...baseValues, ocr_mode: 'tesseract', ocr_model: 'spa' },
    );

    const modelSelect = screen.getByLabelText('Modelo OCR');
    expect(modelSelect.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'Español' })).toHaveValue('spa');
    expect(screen.getByRole('option', { name: 'Inglés' })).toHaveValue('eng');
    expect(screen.getByRole('option', { name: 'Español + Inglés' })).toHaveValue('spa+eng');
    expect(screen.getByText('Selecciona el idioma instalado para OCR local.')).toBeInTheDocument();
  });

  it('updates ocr_model when selecting a tesseract language', () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    const onChange = vi.fn();

    render(
      <SettingsForm
        settings={DEFAULT_PROCESSING_SETTINGS}
        options={normalizeSettingsOptions(null)}
        values={{ ...baseValues, ocr_mode: 'tesseract', ocr_model: 'spa' }}
        onChange={onChange}
        onSave={onSave}
        onDiscard={onDiscard}
        isSaving={false}
        hasUnsavedChanges={false}
        modelOptions={{ ocr: [], vision: [], llm: [], assistant: [] }}
        onOpenAssistant={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Modelo OCR'), { target: { value: 'spa+eng' } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ocr_model: 'spa+eng' }));
  });

  it('normalizes remote OCR models to spa when switching to tesseract', () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    const onChange = vi.fn();

    render(
      <SettingsForm
        settings={DEFAULT_PROCESSING_SETTINGS}
        options={normalizeSettingsOptions(null)}
        values={{ ...baseValues, ocr_mode: 'vision', ocr_model: 'gemma4:e2b' }}
        onChange={onChange}
        onSave={onSave}
        onDiscard={onDiscard}
        isSaving={false}
        hasUnsavedChanges={false}
        modelOptions={{ ocr: ['spa'], vision: ['gemma4:e2b'], llm: [], assistant: [] }}
        onOpenAssistant={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Modo OCR'), { target: { value: 'tesseract' } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      ocr_mode: 'tesseract',
      ocr_model: 'spa',
    }));
  });

  it('keeps vision model selection separate from OCR model', () => {
    render(
      <SettingsForm
        settings={DEFAULT_PROCESSING_SETTINGS}
        options={normalizeSettingsOptions(null)}
        values={{ ...baseValues, ocr_mode: 'vision', vision_model: 'gemma4:e2b' }}
        onChange={vi.fn()}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        isSaving={false}
        hasUnsavedChanges={false}
        modelOptions={{ ocr: ['spa'], vision: ['gemma4:e2b', 'llava:7b'], llm: [], assistant: [] }}
        onOpenAssistant={vi.fn()}
      />,
    );

    const modelSelect = screen.getByLabelText('Modelo Vision');
    expect(modelSelect.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'gemma4:e2b' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'llava:7b' })).toBeInTheDocument();
  });

  it('shows both OCR and Vision model selectors in auto mode', () => {
    renderForm(
      normalizeSettingsOptions(null),
      { ...baseValues, ocr_mode: 'auto', ocr_model: 'spa', vision_model: 'gemma4:e2b' },
    );

    expect(screen.getByLabelText('Modelo OCR')).toBeInTheDocument();
    expect(screen.getByLabelText('Modelo Vision')).toBeInTheDocument();
  });

  it('edits the recommended image warning threshold without forcing a hard block', () => {
    const onChange = vi.fn();
    render(
      <SettingsForm
        settings={DEFAULT_PROCESSING_SETTINGS}
        options={normalizeSettingsOptions(null)}
        values={baseValues}
        onChange={onChange}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        isSaving={false}
        hasUnsavedChanges={false}
        modelOptions={{ ocr: [], vision: [], llm: [], assistant: [] }}
        onOpenAssistant={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Límite recomendado de imágenes'), {
      target: { value: '53' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Bloquear si supera/i }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      max_images_warning_threshold: 53,
    }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      block_documents_over_image_limit: true,
    }));
  });
});
