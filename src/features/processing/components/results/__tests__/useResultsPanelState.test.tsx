import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useResultsPanelState } from '@/features/processing/components/results/hooks/useResultsPanelState';

describe('useResultsPanelState', () => {
  it('opens, minimizes, restores and closes the main panel', () => {
    const { result } = renderHook(() => useResultsPanelState(42));

    act(() => {
      result.current.openPanel('preview');
    });
    expect(result.current.panelState).toEqual({
      mode: 'preview',
      minimized: false,
      detailCell: null,
    });

    act(() => {
      result.current.minimizePanel();
    });
    expect(result.current.panelState.minimized).toBe(true);

    act(() => {
      result.current.restorePanel();
    });
    expect(result.current.panelState.minimized).toBe(false);

    act(() => {
      result.current.closePanel();
    });
    expect(result.current.panelState.mode).toBeNull();
  });

  it('sets field detail as the active panel', () => {
    const { result } = renderHook(() => useResultsPanelState(42));

    act(() => {
      result.current.setFieldDetail('1-10', 'fecha');
    });

    expect(result.current.panelState).toEqual({
      mode: 'field-detail',
      minimized: false,
      detailCell: { rowId: '1-10', field: 'fecha' },
    });
  });

  it('resets when the job id changes', () => {
    const { result, rerender } = renderHook(({ jobId }) => useResultsPanelState(jobId), {
      initialProps: { jobId: 42 },
    });

    act(() => {
      result.current.openPanel('issues');
    });
    expect(result.current.panelState.mode).toBe('issues');

    rerender({ jobId: 84 });
    expect(result.current.panelState).toEqual({
      mode: null,
      minimized: false,
      detailCell: null,
    });
  });
});
