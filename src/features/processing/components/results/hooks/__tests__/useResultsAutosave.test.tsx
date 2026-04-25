import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResultsAutosave } from '@/features/processing/components/results/hooks/useResultsAutosave';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

const saveJobCorrectionsMock = vi.fn();

vi.mock('@/features/processing/api/processing.api', () => ({
  saveJobCorrections: (...args: unknown[]) => saveJobCorrectionsMock(...args),
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

describe('useResultsAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    saveJobCorrectionsMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces saves and marks the state as dirty, saving and saved', async () => {
    saveJobCorrectionsMock.mockResolvedValueOnce({
      id: 42,
      original_filename: 'consignaciones.docx',
      status: 'completed_with_errors',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 1,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });

    const { result } = renderHook(() => useResultsAutosave({ jobId: 42, debounceMs: 500 }), {
    });

    expect(result.current.autosave.status).toBe('idle');

    act(() => {
      result.current.scheduleSave([{ ...baseRows[0], referencia: 'REF-002' }]);
    });
    expect(result.current.autosave.status).toBe('dirty');

    await act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(saveJobCorrectionsMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(saveJobCorrectionsMock).toHaveBeenCalledTimes(1);
    expect(saveJobCorrectionsMock).toHaveBeenCalledWith(42, {
      items: [
        {
          id: 10,
          fecha_consignacion: '2026-03-01',
          hora_consignacion: '09:30',
          referencia: 'REF-002',
          valor: '125000.00',
        },
      ],
    });

    expect(result.current.autosave.status).toBe('saved');
  });

  it('keeps the latest edit when multiple changes happen quickly', async () => {
    saveJobCorrectionsMock.mockResolvedValue({
      id: 42,
      original_filename: 'consignaciones.docx',
      status: 'completed_with_errors',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 1,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });

    const { result } = renderHook(() => useResultsAutosave({ jobId: 42, debounceMs: 500 }), {
    });

    act(() => {
      result.current.scheduleSave([{ ...baseRows[0], referencia: 'REF-002' }]);
      result.current.scheduleSave([{ ...baseRows[0], referencia: 'REF-003' }]);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(saveJobCorrectionsMock).toHaveBeenCalledTimes(1);
    expect(saveJobCorrectionsMock.mock.calls[0][1]).toMatchObject({
      items: [{ referencia: 'REF-003' }],
    });
    expect(result.current.autosave.status).toBe('saved');
  });

  it('marks the state as error and allows retry after a failed save', async () => {
    saveJobCorrectionsMock.mockRejectedValueOnce(new Error('Network down'));
    saveJobCorrectionsMock.mockResolvedValueOnce({
      id: 42,
      original_filename: 'consignaciones.docx',
      status: 'completed_with_errors',
      source_docx: '',
      excel_file: null,
      total_images: 1,
      total_records: 1,
      error_message: '',
      provider_config_snapshot: {},
      started_at: null,
      finished_at: null,
      created_at: '2026-04-21T00:00:00Z',
      updated_at: '2026-04-21T00:00:00Z',
      source_images: [],
    });

    const { result } = renderHook(() => useResultsAutosave({ jobId: 42, debounceMs: 500 }), {
    });

    act(() => {
      result.current.scheduleSave([{ ...baseRows[0], monto: '200000.00' }]);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.autosave.status).toBe('error');
    expect(result.current.autosave.error).toBe('Network down');

    await act(async () => {
      result.current.retry();
    });

    expect(saveJobCorrectionsMock).toHaveBeenCalledTimes(2);
    expect(result.current.autosave.status).toBe('saved');
  });
});
