import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useProcessingActions } from '@/features/processing/hooks/useProcessingActions';
import type { ProcessingState } from '@/features/processing/hooks/useProcessingState';

const uploadDocumentMock = vi.fn();
const processJobMock = vi.fn();
const reprocessFailedMock = vi.fn();
const saveJobCorrectionsMock = vi.fn();
const deleteJobMock = vi.fn();
const getJobMock = vi.fn();
const getProcessingStateMock = vi.fn();
const getJobDiagnosticsMock = vi.fn();

vi.mock('@/features/processing/api/processing.api', () => ({
  uploadDocument: (...args: unknown[]) => uploadDocumentMock(...args),
  processJob: (...args: unknown[]) => processJobMock(...args),
  reprocessFailed: (...args: unknown[]) => reprocessFailedMock(...args),
  deleteJob: (...args: unknown[]) => deleteJobMock(...args),
  saveJobCorrections: (...args: unknown[]) => saveJobCorrectionsMock(...args),
  getJob: (...args: unknown[]) => getJobMock(...args),
  listJobs: vi.fn(),
  exportJob: vi.fn(),
  getJobLogs: vi.fn(),
  getProcessingState: (...args: unknown[]) => getProcessingStateMock(...args),
  getJobDiagnostics: (...args: unknown[]) => getJobDiagnosticsMock(...args),
}));

describe('useProcessingActions', () => {
  beforeEach(() => {
    uploadDocumentMock.mockReset();
    processJobMock.mockReset();
    reprocessFailedMock.mockReset();
    deleteJobMock.mockReset();
    getJobMock.mockReset();
    getProcessingStateMock.mockReset();
    getJobDiagnosticsMock.mockReset();
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

  it('runProcessing forces full reprocessing for the current completed job and updates state', async () => {
    processJobMock.mockResolvedValueOnce({
      id: 7,
      original_filename: 'done.docx',
      status: 'completed',
      source_docx: '',
      excel_file: null,
      total_images: 2,
      total_records: 4,
      error_message: '',
      provider_config_snapshot: {},
      started_at: '2026-04-21T00:00:00Z',
      finished_at: '2026-04-21T00:00:03Z',
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:03Z',
      source_images: [],
    });
    const setCurrentResults = vi.fn();
    const setProcessedFiles = vi.fn();
    const state: ProcessingState = {
      isProcessing: false,
      currentResults: {
        jobId: 7,
        status: 'completed',
      } as ProcessingState['currentResults'],
      processedFiles: [],
      historyError: null,
      isExporting: false,
      isSavingCorrections: false,
      isLoadingHistory: false,
      isRefreshing: false,
      setCurrentResults: setCurrentResults as unknown as ProcessingState['setCurrentResults'],
      setIsExporting: vi.fn() as unknown as ProcessingState['setIsExporting'],
      setIsLoadingHistory: vi.fn() as unknown as ProcessingState['setIsLoadingHistory'],
      setIsProcessing: vi.fn() as unknown as ProcessingState['setIsProcessing'],
      setIsRefreshing: vi.fn() as unknown as ProcessingState['setIsRefreshing'],
      setIsSavingCorrections: vi.fn() as unknown as ProcessingState['setIsSavingCorrections'],
      setProcessedFiles: setProcessedFiles as unknown as ProcessingState['setProcessedFiles'],
      setHistoryError: vi.fn() as unknown as ProcessingState['setHistoryError'],
    } satisfies ProcessingState;

    const { result } = renderHook(() => useProcessingActions(state));
    const processed = await result.current.runProcessing();

    expect(processJobMock).toHaveBeenCalledWith(7, { force: true });
    expect(setCurrentResults).toHaveBeenCalledWith(expect.objectContaining({
      jobId: 7,
      status: 'completed',
      totalRecords: 4,
    }));
    expect(setProcessedFiles).toHaveBeenCalledTimes(1);
    expect(processed).toMatchObject({ jobId: 7, status: 'completed' });
  });

  it('runProcessing also forces completed jobs launched from history', async () => {
    processJobMock.mockResolvedValueOnce({
      id: 8,
      original_filename: 'history.docx',
      status: 'completed',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 1,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: '2026-04-21T00:00:00Z',
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });
    const state: ProcessingState = {
      isProcessing: false,
      currentResults: null,
      processedFiles: [
        {
          jobId: 8,
          status: 'completed',
        },
      ] as ProcessingState['processedFiles'],
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
    await result.current.runProcessing(8);

    expect(processJobMock).toHaveBeenCalledWith(8, { force: true });
  });

  it('deleteJobResult removes the active job from state and localStorage', async () => {
    deleteJobMock.mockResolvedValue(undefined);
    window.localStorage.setItem('diplo.active-job-id', '7');
    const setProcessedFiles = vi.fn();
    const setCurrentResults = vi.fn();
    const state: ProcessingState = {
      isProcessing: false,
      currentResults: { jobId: 7 } as ProcessingState['currentResults'],
      processedFiles: [],
      historyError: null,
      isExporting: false,
      isSavingCorrections: false,
      isLoadingHistory: false,
      isRefreshing: false,
      setCurrentResults: setCurrentResults as unknown as ProcessingState['setCurrentResults'],
      setIsExporting: vi.fn() as unknown as ProcessingState['setIsExporting'],
      setIsLoadingHistory: vi.fn() as unknown as ProcessingState['setIsLoadingHistory'],
      setIsProcessing: vi.fn() as unknown as ProcessingState['setIsProcessing'],
      setIsRefreshing: vi.fn() as unknown as ProcessingState['setIsRefreshing'],
      setIsSavingCorrections: vi.fn() as unknown as ProcessingState['setIsSavingCorrections'],
      setProcessedFiles: setProcessedFiles as unknown as ProcessingState['setProcessedFiles'],
      setHistoryError: vi.fn() as unknown as ProcessingState['setHistoryError'],
    } satisfies ProcessingState;

    const { result } = renderHook(() => useProcessingActions(state));

    await act(async () => {
      await result.current.deleteJobResult(7);
    });

    expect(deleteJobMock).toHaveBeenCalledWith(7);
    expect(setProcessedFiles).toHaveBeenCalledTimes(1);
    expect(setCurrentResults).toHaveBeenCalledTimes(1);
  });

  it('reprocessFailedJob calls the partial retry endpoint and updates current job', async () => {
    reprocessFailedMock.mockResolvedValueOnce({
      id: 7,
      original_filename: 'file.docx',
      status: 'completed',
      source_docx: '',
      excel_file: null,
      total_images: 2,
      total_records: 2,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: '2026-04-21T00:00:00Z',
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });
    const state: ProcessingState = {
      isProcessing: false,
      currentResults: { jobId: 7 } as ProcessingState['currentResults'],
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
    const processed = await result.current.reprocessFailedJob();

    expect(reprocessFailedMock).toHaveBeenCalledWith(7);
    expect(processed).toMatchObject({ jobId: 7, status: 'completed' });
  });

  it('runProcessing polls the lightweight processing-state endpoint and then fetches detail once', async () => {
    vi.useFakeTimers();
    processJobMock.mockResolvedValueOnce({
      id: 7,
      original_filename: 'file.docx',
      status: 'processing',
      source_docx: '',
      excel_file: null,
      total_images: 2,
      total_records: 0,
      error_message: '',
      provider_config_snapshot: {},
      started_at: '2026-04-21T00:00:00Z',
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });
    getProcessingStateMock
      .mockResolvedValueOnce({
        job_id: 7,
        status: 'processing',
        current_stage: 'ocr',
        processed_images: 0,
        total_images: 2,
        failed_images: 0,
        total_records: 0,
        last_event_at: '2026-04-21T00:00:01Z',
        elapsed_ms: 1000,
        stale_processing: false,
      })
      .mockResolvedValueOnce({
        job_id: 7,
        status: 'completed',
        current_stage: 'job_finished',
        processed_images: 2,
        total_images: 2,
        failed_images: 0,
        total_records: 2,
        last_event_at: '2026-04-21T00:00:03Z',
        elapsed_ms: 3000,
        stale_processing: false,
      });
    getJobMock.mockResolvedValueOnce({
      id: 7,
      original_filename: 'file.docx',
      status: 'completed',
      source_docx: '',
      excel_file: null,
      total_images: 2,
      total_records: 2,
      error_message: '',
      provider_config_snapshot: {},
      started_at: '2026-04-21T00:00:00Z',
      finished_at: '2026-04-21T00:00:03Z',
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:03Z',
      source_images: [],
    });

    const state: ProcessingState = {
      isProcessing: false,
      currentResults: { jobId: 7 } as ProcessingState['currentResults'],
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
    const promise = result.current.runProcessing();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    const processed = await promise;

    expect(processJobMock).toHaveBeenCalledWith(7);
    expect(getProcessingStateMock).toHaveBeenCalledTimes(2);
    expect(getJobMock).toHaveBeenCalledTimes(1);
    expect(processed).toMatchObject({ jobId: 7, status: 'completed' });
    vi.useRealTimers();
  });

  it('runProcessing reuses an active poll for the same job', async () => {
    vi.useFakeTimers();
    processJobMock.mockResolvedValue({
      id: 7,
      original_filename: 'file.docx',
      status: 'processing',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 0,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });
    getProcessingStateMock
      .mockResolvedValueOnce({
        job_id: 7,
        status: 'processing',
        current_stage: 'ocr',
        processed_images: 0,
        total_images: 1,
        failed_images: 0,
        total_records: 0,
        last_event_at: '2026-04-21T00:00:01Z',
        elapsed_ms: 1000,
        stale_processing: false,
      })
      .mockResolvedValueOnce({
        job_id: 7,
        status: 'completed',
        current_stage: 'job_finished',
        processed_images: 1,
        total_images: 1,
        failed_images: 0,
        total_records: 1,
        last_event_at: '2026-04-21T00:00:03Z',
        elapsed_ms: 3000,
        stale_processing: false,
      });
    getJobMock.mockResolvedValue({
      id: 7,
      original_filename: 'file.docx',
      status: 'completed',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 1,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: '2026-04-21T00:00:03Z',
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:03Z',
      source_images: [],
    });
    const state: ProcessingState = {
      isProcessing: false,
      currentResults: { jobId: 7 } as ProcessingState['currentResults'],
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

    const first = result.current.runProcessing(7);
    const second = result.current.runProcessing(7);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    await Promise.all([first, second]);

    expect(processJobMock).toHaveBeenCalledTimes(1);
    expect(getProcessingStateMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
