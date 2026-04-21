import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SettingsPage } from '@/pages/settings/SettingsPage';

type SettingsFormMock = {
  isLoading: boolean;
  isSaving: boolean;
  loadError: string | null;
  settings: unknown | null;
  options: unknown | null;
  values: unknown | null;
  modelOptions: { ocr: unknown[]; llm: unknown[] };
  setValues: (next: unknown) => void;
  reload: () => void | Promise<void>;
  save: () => void | Promise<void>;
};

let settingsFormMock: SettingsFormMock;

vi.mock('@/features/settings/hooks/useSettingsForm', () => ({
  useSettingsForm: () => settingsFormMock,
}));

vi.mock('@/features/settings/components/SettingsForm', () => ({
  SettingsForm: () => <div data-testid='settings-form' />,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    settingsFormMock = {
      isLoading: false,
      isSaving: false,
      loadError: null,
      settings: { ocr_mode: 'vision' },
      options: { ocr_modes: ['vision'] },
      values: { ocr_mode: 'vision' },
      modelOptions: { ocr: [], llm: [] },
      setValues: vi.fn(),
      reload: vi.fn(),
      save: vi.fn(),
    };
  });

  it('shows loading state', () => {
    settingsFormMock.isLoading = true;
    render(<SettingsPage />);
    expect(screen.getByText(/Cargando configuracion/i)).toBeInTheDocument();
  });

  it('shows error state with retry', () => {
    settingsFormMock.settings = null;
    settingsFormMock.options = null;
    settingsFormMock.values = null;
    settingsFormMock.loadError = 'Backend caido';
    render(<SettingsPage />);
    expect(screen.getByText(/No pudimos cargar la configuracion/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }));
    expect(settingsFormMock.reload).toHaveBeenCalledTimes(1);
  });

  it('renders settings form when data is ready', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('settings-form')).toBeInTheDocument();
  });
});
