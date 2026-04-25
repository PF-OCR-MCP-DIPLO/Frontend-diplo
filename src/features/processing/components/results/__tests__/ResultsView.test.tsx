import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AssistantChatProvider } from '@/features/assistant/hooks/AssistantChatContext';
import { ResultsView } from '@/features/processing/components/results/ResultsView';
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';

const getJobLogsMock = vi.fn();

vi.mock('@/features/processing/api/processing.api', async () => {
  const actual = await vi.importActual<typeof import('@/features/processing/api/processing.api')>('@/features/processing/api/processing.api');
  return {
    ...actual,
    getJobLogs: (...args: Parameters<typeof actual.getJobLogs>) => getJobLogsMock(...args),
  };
});

vi.mock('@/features/processing/components/results/ResultsPreviewPanel', () => ({
  ResultsPreviewPanel: ({ onOpenImage }: { onOpenImage: (image: PreviewImage) => void }) => (
    <div>
      <p>Preview lateral</p>
      <button type='button' onClick={() => onOpenImage({ id: 1, url: 'https://example.test/pagina-1.png', name: 'pagina-1.png', status: 'processed' })}>
        Abrir imagen completa
      </button>
    </div>
  ),
}));

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
        <MemoryRouter initialEntries={['/results']}>
          <AssistantChatProvider>
            <ResultsView {...props} />
          </AssistantChatProvider>
        </MemoryRouter>,
      ),
    };
  }

describe('ResultsView', () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLElement.prototype.scrollTo = vi.fn();
    getJobLogsMock.mockReset();
    getJobLogsMock.mockResolvedValue([
      { id: 1, sequence_index: 1, stage: 'ocr', provider: 'ollama', model: 'qwen3:1.7b', ocr_mode: 'vision', notes: 'OCR completo', raw_payload: {}, raw_text: '', is_error: false, source_image_id: 1, created_at: '2026-04-25T00:00:00Z' },
    ]);
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

  it('opens the assistant from results', () => {
    const { props } = renderResultsView();

    fireEvent.click(screen.getAllByRole('button', { name: /Abrir asistente/i })[0]);
    expect(props.onOpenAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ page: 'results', jobId: 42 }),
      }),
    );
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

  it('keeps only one main panel active when switching from preview to logs', async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole('button', { name: /Previsualizar/i }));
    expect(await screen.findByTestId('results-side-panel')).toHaveAttribute('data-panel', 'preview');
    expect(await screen.findByText('Preview lateral')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Logs$/i }));

    expect(await screen.findByTestId('results-side-panel')).toHaveAttribute('data-panel', 'logs');
    expect(screen.queryByText('Preview lateral')).not.toBeInTheDocument();
    expect(screen.getByText('OCR completo')).toBeInTheDocument();
  });

  it('switches from issues to preview without rendering two overlay surfaces', async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole('button', { name: /1 hallazgos/i }));
    expect(await screen.findByTestId('results-side-panel')).toHaveAttribute('data-panel', 'issues');
    expect(await screen.findByText('Hay hallazgos por revisar')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Previsualizar/i }));

    expect(await screen.findByTestId('results-side-panel')).toHaveAttribute('data-panel', 'preview');
    expect(screen.queryByText('Hay hallazgos por revisar')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('results-side-panel')).toHaveLength(1);
  });

  it('clears the active panel when the user closes it', async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole('button', { name: /Previsualizar/i }));
    expect(await screen.findByTestId('results-side-panel')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cerrar panel/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('results-side-panel')).not.toBeInTheDocument();
    });
  });

  it('closes the fullscreen image preview when logs are opened', async () => {
    renderResultsView();

    fireEvent.click(screen.getByRole('button', { name: /Previsualizar/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Abrir imagen completa/i }));

    expect(screen.getByRole('dialog', { name: /pagina-1\.png/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Logs$/i }));

    expect(await screen.findByTestId('results-side-panel')).toHaveAttribute('data-panel', 'logs');
    expect(screen.queryByRole('dialog', { name: /pagina-1\.png/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /Logs del procesamiento/i })).not.toBeInTheDocument();
  });
});
