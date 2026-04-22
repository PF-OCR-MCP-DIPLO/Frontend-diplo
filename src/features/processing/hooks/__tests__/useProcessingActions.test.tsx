import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useProcessingActions } from '@/features/processing/hooks/useProcessingActions';
import type { ProcessingState } from '@/features/processing/hooks/useProcessingState';

const uploadDocumentMock = vi.fn();
const processJobMock = vi.fn();
const saveJobCorrectionsMock = vi.fn();

vi.mock('@/features/processing/api/processing.api', () => ({
  uploadDocument: (...args: unknown[]) => uploadDocumentMock(...args),
  processJob: (...args: unknown[]) => processJobMock(...args),
  saveJobCorrections: (...args: unknown[]) => saveJobCorrectionsMock(...args),
  getJob: vi.fn(),
  listJobs: vi.fn(),
  exportJob: vi.fn(),
  getJobLogs: vi.fn(),
}));

describe('useProcessingActions', () => {
  beforeEach(() => {
    uploadDocumentMock.mockReset();
    processJobMock.mockReset();
  });

  it('runProcessing returns null when there is no current job id', async () => {
    const state: ProcessingState = {
      isProcessing: false,
      currentResults: null,
      processedFiles: [],
      historyError: null,
      isExporting: false,
      isSavingCorrections: false,
      isLoadingHistory: false,
      isRefreshing: false,
      setCurrentResults: vi.fn() as unknown as ProcessingState['setCurrentResults'],
      setIsExporting: vi.fn() as unknown as ProcessingState['setIsExporting'],
      setIsLoadingHistory: vi.fn() as unknown as ProcessingState['setIsLoadingHistory'],
      setIsProcessing: vi.fn() as unknown as ProcessingState['setIsProcessing'],
      setIsRefreshing: vi.fn() as unknown as ProcessingState['setIsRefreshing'],
      setIsSavingCorrections: vi.fn() as unknown as ProcessingState['setIsSavingCorrections'],
      setProcessedFiles: vi.fn() as unknown as ProcessingState['setProcessedFiles'],
      setHistoryError: vi.fn() as unknown as ProcessingState['setHistoryError'],
    } satisfies ProcessingState;

    const { result } = renderHook(() => useProcessingActions(state));
    const value = await result.current.runProcessing();

    expect(value).toBeNull();
    expect(processJobMock).not.toHaveBeenCalled();
  });

  it('processFile uploads and toggles processing flag', async () => {
    uploadDocumentMock.mockResolvedValueOnce({
      id: 1,
      original_filename: 'file.docx',
      status: 'uploaded',
      source_docx: '',
      excel_file: null,
      total_images: 0,
      total_records: 0,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });

    const setIsProcessingMock = vi.fn();
    const state: ProcessingState = {
      isProcessing: false,
      currentResults: null,
      processedFiles: [],
      historyError: null,
      isExporting: false,
      isSavingCorrections: false,
      isLoadingHistory: false,
      isRefreshing: false,
      setCurrentResults: vi.fn() as unknown as ProcessingState['setCurrentResults'],
      setIsExporting: vi.fn() as unknown as ProcessingState['setIsExporting'],
      setIsLoadingHistory: vi.fn() as unknown as ProcessingState['setIsLoadingHistory'],
      setIsProcessing: setIsProcessingMock as unknown as ProcessingState['setIsProcessing'],
      setIsRefreshing: vi.fn() as unknown as ProcessingState['setIsRefreshing'],
      setIsSavingCorrections: vi.fn() as unknown as ProcessingState['setIsSavingCorrections'],
      setProcessedFiles: vi.fn() as unknown as ProcessingState['setProcessedFiles'],
      setHistoryError: vi.fn() as unknown as ProcessingState['setHistoryError'],
    } satisfies ProcessingState;

    const { result } = renderHook(() => useProcessingActions(state));
    const file = new File(['x'], 'file.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    const processed = await result.current.processFile(file);

    expect(uploadDocumentMock).toHaveBeenCalledWith(file);
    expect(setIsProcessingMock.mock.calls[0][0]).toBe(true);
    expect(setIsProcessingMock.mock.calls.at(-1)?.[0]).toBe(false);
    expect(processed).toMatchObject({ jobId: 1 });
  });
});
