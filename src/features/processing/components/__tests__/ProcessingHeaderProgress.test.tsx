import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProcessingHeaderProgress } from '@/features/processing/components/ProcessingHeaderProgress';
import {
  ProcessingCurrentResultContext,
  ProcessingFlagsContext,
} from '@/features/processing/hooks/useProcessingContext';
import type { ProcessedFile } from '@/features/processing/types/processing.types';

const baseResult: ProcessedFile = {
  id: '42',
  jobId: 42,
  name: 'consignaciones.docx',
  date: new Date('2026-04-25T00:00:00Z'),
  status: 'processing',
  displayStatus: 'success',
  sourceDocxUrl: '',
  excelUrl: null,
  totalImages: 3,
  totalRecords: 1,
  errorMessage: '',
  sourceImages: [],
  data: [],
  errorCount: 0,
  processingState: {
    job_id: 42,
    status: 'processing',
    current_stage: 'llm_structuring',
    processed_images: 1,
    total_images: 3,
    failed_images: 0,
    total_records: 1,
    last_event_at: '2026-04-25T00:00:00Z',
    elapsed_ms: 42_000,
    stale_processing: false,
  },
  diagnosticsSummary: null,
};

function renderProgress(currentResults: ProcessedFile | null, isProcessing = true) {
  return render(
    <ProcessingCurrentResultContext.Provider value={{ currentResults }}>
      <ProcessingFlagsContext.Provider
        value={{
          isProcessing,
          isExporting: false,
          isSavingCorrections: false,
          isRefreshing: false,
        }}
      >
        <ProcessingHeaderProgress />
      </ProcessingFlagsContext.Provider>
    </ProcessingCurrentResultContext.Provider>,
  );
}

describe('ProcessingHeaderProgress', () => {
  it('renders centered processing progress from the active job', () => {
    renderProgress(baseResult);

    expect(screen.getByText(/Procesando imagen 2\/3/i)).toBeInTheDocument();
    expect(screen.getByText(/llm_structuring · 42s/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
  });

  it('does not render when there is no processing job', () => {
    renderProgress(
      {
        ...baseResult,
        status: 'completed',
        processingState: null,
      },
      false,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});