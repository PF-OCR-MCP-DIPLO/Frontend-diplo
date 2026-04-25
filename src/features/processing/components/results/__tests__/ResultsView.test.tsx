import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssistantChatProvider } from '@/features/assistant/hooks/AssistantChatContext';
import { ResultsView } from '@/features/processing/components/results/ResultsView';
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';

const baseRows: ConsignmentRow[] = [
  {
    id: '1-10',
    depositId: 10,
    sourceImageId: 1,
    fecha: '2026-03-01',
    hora: '09:30',
    monto: '125000.00',
    referencia: 'REF-001',
    sourceName: 'pagina-1.png',
    estado: 'error',
    errors: ['La fecha no corresponde al mes actual'],
  },
];

const baseImages: PreviewImage[] = [
  {
    id: 1,
    url: 'https://example.test/pagina-1.png',
    name: 'pagina-1.png',
    status: 'processed',
  },
];

function renderResultsView(overrides: Partial<ComponentProps<typeof ResultsView>> = {}) {
  const props: ComponentProps<typeof ResultsView> = {
    jobId: 42,
    fileName: 'consignaciones.docx',
    sourceDocxUrl: 'https://example.test/consignaciones.docx',
    sourceImages: baseImages,
    initialData: baseRows,
    status: 'completed_with_errors',
    totalImages: 1,
    totalRecords: 1,
    errorMessage: 'Hay hallazgos por revisar',
    excelUrl: 'https://example.test/export.xlsx',
    isProcessing: false,
    isRefreshing: false,
    isExporting: false,
    isSavingCorrections: false,
    onProcess: vi.fn(),
    onRefresh: vi.fn(),
    onExport: vi.fn(),
    onSaveCorrections: vi.fn().mockResolvedValue(undefined),
    onOpenAssistant: vi.fn(),
    ...overrides,
  };

  return {
    props,
    ...render(
      <AssistantChatProvider>
        <ResultsView {...props} />
      </AssistantChatProvider>,
    ),
  };
}

describe('ResultsView', () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  it('renders the current result table, findings and primary actions', () => {
    renderResultsView();

    expect(screen.getAllByText('consignaciones.docx').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Procesar de nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exportar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Descargar/i })).toHaveAttribute('href', 'https://example.test/export.xlsx');
    expect(screen.getByRole('columnheader', { name: /Referencia/i })).toBeInTheDocument();
    expect(screen.getAllByText('REF-001').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /1 hallazgos/i })).toBeInTheDocument();
  });

  it('opens the assistant panel from results', () => {
    renderResultsView();

    fireEvent.click(screen.getAllByRole('button', { name: /Asistente/i })[0]);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders safely with empty results and no source images', () => {
    renderResultsView({
      sourceImages: [],
      initialData: [],
      totalImages: 0,
      totalRecords: 0,
      errorMessage: '',
      excelUrl: null,
      status: 'uploaded',
    });

    expect(screen.getAllByText('consignaciones.docx').length).toBeGreaterThan(0);
    expect(screen.getByRole('columnheader', { name: /Referencia/i })).toBeInTheDocument();
  });
});
