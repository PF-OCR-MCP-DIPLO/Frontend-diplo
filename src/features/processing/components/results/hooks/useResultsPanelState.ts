/**
 * Encapsula el estado de paneles laterales de la pantalla de resultados.
 *
 * Solo coordina UI local; no conoce red ni persistencia.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ResultFieldKey } from '@/features/processing/types/processing.types';

export type ResultsPanelMode = 'preview' | 'logs' | 'issues' | 'error' | 'field-detail';

export interface ResultsFieldDetailState {
  rowId: string;
  field: ResultFieldKey;
}

export interface ResultsPanelState {
  mode: ResultsPanelMode | null;
  minimized: boolean;
  detailCell: ResultsFieldDetailState | null;
}

const initialPanelState: ResultsPanelState = {
  mode: null,
  minimized: false,
  detailCell: null,
};

export function useResultsPanelState(jobId: number) {
  const [panelState, setPanelState] = useState<ResultsPanelState>(initialPanelState);

  useEffect(() => {
    setPanelState(initialPanelState);
  }, [jobId]);

  const openPanel = useCallback((mode: Exclude<ResultsPanelMode, 'field-detail'>) => {
    setPanelState({
      mode,
      minimized: false,
      detailCell: null,
    });
  }, []);

  const closePanel = useCallback(() => {
    setPanelState(initialPanelState);
  }, []);

  const minimizePanel = useCallback(() => {
    setPanelState((current) => (current.mode ? { ...current, minimized: true } : current));
  }, []);

  const restorePanel = useCallback(() => {
    setPanelState((current) => (current.mode ? { ...current, minimized: false } : current));
  }, []);

  const setFieldDetail = useCallback((rowId: string, field: ResultFieldKey) => {
    setPanelState({
      mode: 'field-detail',
      minimized: false,
      detailCell: { rowId, field },
    });
  }, []);

  return {
    panelState,
    openPanel,
    closePanel,
    minimizePanel,
    restorePanel,
    setFieldDetail,
  };
}
