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

    expect(screen.getByText('consignaciones.docx')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Procesar de nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generar Excel/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Descargar/i })).toHaveAttribute('href', 'https://example.test/export.xlsx');
    expect(screen.getByRole('columnheader', { name: /Referencia/i })).toBeInTheDocument();
    expect(screen.getAllByText('REF-001').length).toBeGreaterThan(0);
    expect(screen.getByText('Hay hallazgos por revisar')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /1 hallazgo/i }));
    expect(screen.getByText(/La fecha no corresponde al mes actual/i)).toBeInTheDocument();
  });

  it('shows the document preview when switching the main workspace view', () => {
    renderResultsView();

    fireEvent.click(screen.getByRole('button', { name: /Vista previa/i }));

    expect(screen.getByText('Documento fuente')).toBeInTheDocument();
    expect(screen.getByText('Estado OCR: processed')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'pagina-1.png' })).toHaveAttribute('src', 'https://example.test/pagina-1.png');
  });

  it('keeps the dedicated assistant panel available from results tools', () => {
    renderResultsView();

    fireEvent.click(screen.getByRole('button', { name: /^Mostrar$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mostrar asistente/i }));

    expect(screen.getByText('Asistente de revision')).toBeInTheDocument();
    expect(screen.getByText('Hola! ¿En que puedo ayudarte?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pregunta por un hallazgo o job')).toBeInTheDocument();
  });
});
