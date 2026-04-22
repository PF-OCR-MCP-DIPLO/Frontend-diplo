import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProcessingProvider } from '@/features/processing/hooks/ProcessingProvider';
import { useProcessingHistoryContext } from '@/features/processing/hooks/useProcessingContext';
import { ACTIVE_JOB_STORAGE_KEY } from '@/features/processing/hooks/useProcessingActions';

const listJobsMock = vi.fn();

vi.mock('@/features/processing/api/processing.api', async () => {
  const actual = await vi.importActual<typeof import('@/features/processing/api/processing.api')>('@/features/processing/api/processing.api');
  return {
    ...actual,
    listJobs: () => listJobsMock(),
  };
});

function Consumer() {
  const { processedFiles, isLoadingHistory, historyError } = useProcessingHistoryContext();
  return (
    <div>
      <span data-testid='loading'>{String(isLoadingHistory)}</span>
      <span data-testid='count'>{processedFiles.length}</span>
      <span data-testid='error'>{historyError ?? ''}</span>
    </div>
  );
}

describe('ProcessingProvider', () => {
  beforeEach(() => {
    listJobsMock.mockReset();
    window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
  });

  it('loads history once on mount and exposes jobs', async () => {
    listJobsMock.mockResolvedValue([
      {
        id: 1,
        original_filename: 'consignacion.docx',
        status: 'uploaded',
        total_images: 1,
        total_records: 0,
        started_at: null,
        finished_at: null,
        created_at: '2025-01-01T00:00:00Z',
      },
    ]);

    render(
      <ProcessingProvider>
        <Consumer />
      </ProcessingProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(listJobsMock).toHaveBeenCalledTimes(1);
  });

  it('stores a history error when initial load fails', async () => {
    listJobsMock.mockRejectedValue(new Error('Backend unavailable'));

    render(
      <ProcessingProvider>
        <Consumer />
      </ProcessingProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('error')).toHaveTextContent('Backend unavailable');
  });
});
