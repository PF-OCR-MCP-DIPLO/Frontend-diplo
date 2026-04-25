import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HistoryPage } from '@/pages/history/HistoryPage';

const navigateMock = vi.fn();
const refreshHistoryMock = vi.fn();
const runProcessingMock = vi.fn();
const exportCurrentJobMock = vi.fn();
const deleteJobResultMock = vi.fn();
const openResultMock = vi.fn();

const historyState = {
  processedFiles: [] as Array<{
    id: string;
    jobId: number;
    name: string;
    date: Date;
    status: 'uploaded' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
    displayStatus: 'success' | 'error';
  }>,
  isLoadingHistory: false,
  historyError: null as string | null,
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/processing/hooks/useOpenResult', () => ({
  useOpenResult: () => openResultMock,
}));

vi.mock('@/features/processing/hooks/useProcessingContext', () => ({
  useProcessingActionsContext: () => ({
    refreshHistory: refreshHistoryMock,
    runProcessing: runProcessingMock,
    exportCurrentJob: exportCurrentJobMock,
    deleteJobResult: deleteJobResultMock,
  }),
  useProcessingHistoryContext: () => historyState,
}));

describe('HistoryPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    refreshHistoryMock.mockReset();
    runProcessingMock.mockReset();
    exportCurrentJobMock.mockReset();
    deleteJobResultMock.mockReset();
    openResultMock.mockReset();
    historyState.processedFiles = [];
    historyState.isLoadingHistory = false;
    historyState.historyError = null;
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('shows empty state when there are no jobs', () => {
    render(<HistoryPage />);
    expect(screen.getByText(/Todavía no hay ejecuciones/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Procesar un archivo/i })).toBeInTheDocument();
  });

  it('navigates to upload from empty state CTA', () => {
    render(<HistoryPage />);
    fireEvent.click(screen.getByRole('button', { name: /Procesar un archivo/i }));
    expect(navigateMock).toHaveBeenCalledWith('/upload');
  });

  it('renders history rows and action buttons', () => {
    historyState.processedFiles = [
      {
        id: '7',
        jobId: 7,
        name: 'marzo.docx',
        date: new Date('2026-04-21T00:00:00Z'),
        status: 'completed',
        displayStatus: 'success',
      },
    ];

    render(<HistoryPage />);

    expect(screen.getByText('marzo.docx')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Borrar job marzo\.docx/i })).toBeInTheDocument();
  });

  it('does not call delete api when confirmation is cancelled', () => {
    historyState.processedFiles = [
      {
        id: '7',
        jobId: 7,
        name: 'marzo.docx',
        date: new Date('2026-04-21T00:00:00Z'),
        status: 'completed',
        displayStatus: 'success',
      },
    ];
    vi.stubGlobal('confirm', vi.fn(() => false));

    render(<HistoryPage />);
    fireEvent.click(screen.getByRole('button', { name: /Borrar job marzo\.docx/i }));

    expect(deleteJobResultMock).not.toHaveBeenCalled();
  });

  it('calls delete api with the right id when confirmed', async () => {
    historyState.processedFiles = [
      {
        id: '7',
        jobId: 7,
        name: 'marzo.docx',
        date: new Date('2026-04-21T00:00:00Z'),
        status: 'completed',
        displayStatus: 'success',
      },
    ];
    deleteJobResultMock.mockResolvedValue(undefined);

    render(<HistoryPage />);
    fireEvent.click(screen.getByRole('button', { name: /Borrar job marzo\.docx/i }));

    await waitFor(() => {
      expect(deleteJobResultMock).toHaveBeenCalledWith(7);
    });
  });

  it('shows delete errors and keeps the row available', async () => {
    historyState.processedFiles = [
      {
        id: '7',
        jobId: 7,
        name: 'marzo.docx',
        date: new Date('2026-04-21T00:00:00Z'),
        status: 'completed',
        displayStatus: 'success',
      },
    ];
    deleteJobResultMock.mockRejectedValue(new Error('No se pudo borrar la ejecución'));

    render(<HistoryPage />);
    fireEvent.click(screen.getByRole('button', { name: /Borrar job marzo\.docx/i }));

    await waitFor(() => {
      expect(deleteJobResultMock).toHaveBeenCalledWith(7);
    });
    expect(screen.getByText('marzo.docx')).toBeInTheDocument();
  });

  it('triggers process and refreshes the history after success', async () => {
    historyState.processedFiles = [
      {
        id: '7',
        jobId: 7,
        name: 'marzo.docx',
        date: new Date('2026-04-21T00:00:00Z'),
        status: 'uploaded',
        displayStatus: 'success',
      },
    ];
    runProcessingMock.mockResolvedValue({ jobId: 7, status: 'completed' });
    refreshHistoryMock.mockResolvedValue(undefined);

    render(<HistoryPage />);
    fireEvent.click(screen.getByRole('button', { name: /Procesar job marzo\.docx/i }));

    await waitFor(() => {
      expect(runProcessingMock).toHaveBeenCalledWith(7);
      expect(refreshHistoryMock).toHaveBeenCalled();
    });
  });

  it('keeps process disabled for processing jobs', () => {
    historyState.processedFiles = [
      {
        id: '8',
        jobId: 8,
        name: 'abril.docx',
        date: new Date('2026-04-21T00:00:00Z'),
        status: 'processing',
        displayStatus: 'success',
      },
    ];

    render(<HistoryPage />);

    expect(screen.getByRole('button', { name: /Procesar job abril\.docx/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Borrar job abril\.docx/i })).toBeDisabled();
  });
});
