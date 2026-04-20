import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import {
  ProcessingActionsContext,
  ProcessingCurrentResultContext,
  ProcessingFlagsContext,
  ProcessingHistoryContext,
} from '@/features/processing/hooks/useProcessingContext';
import { useProcessingActions } from '@/features/processing/hooks/useProcessingActions';
import { useProcessingState } from '@/features/processing/hooks/useProcessingState';

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const state = useProcessingState();
  const actions = useProcessingActions(state);
  const { refreshHistory } = actions;
  const { setIsLoadingHistory } = state;

  useEffect(() => {
    refreshHistory().catch(() => {
      setIsLoadingHistory(false);
    });
  }, [refreshHistory, setIsLoadingHistory]);

  const historyValue = useMemo(
    () => ({
      isLoadingHistory: state.isLoadingHistory,
      historyError: state.historyError,
      processedFiles: state.processedFiles,
    }),
    [state.historyError, state.isLoadingHistory, state.processedFiles]
  );

  const currentResultValue = useMemo(
    () => ({
      currentResults: state.currentResults,
    }),
    [state.currentResults]
  );

  const flagsValue = useMemo(
    () => ({
      isProcessing: state.isProcessing,
      isExporting: state.isExporting,
      isRefreshing: state.isRefreshing,
    }),
    [state.isExporting, state.isProcessing, state.isRefreshing]
  );

  return (
    <ProcessingHistoryContext.Provider value={historyValue}>
      <ProcessingCurrentResultContext.Provider value={currentResultValue}>
        <ProcessingFlagsContext.Provider value={flagsValue}>
          <ProcessingActionsContext.Provider value={actions}>{children}</ProcessingActionsContext.Provider>
        </ProcessingFlagsContext.Provider>
      </ProcessingCurrentResultContext.Provider>
    </ProcessingHistoryContext.Provider>
  );
}
