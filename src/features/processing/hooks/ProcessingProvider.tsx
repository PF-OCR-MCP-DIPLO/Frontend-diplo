import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { ProcessingActionsContext, ProcessingStateContext } from '@/features/processing/hooks/useProcessingContext';
import { useProcessingActions } from '@/features/processing/hooks/useProcessingActions';
import { useProcessingState } from '@/features/processing/hooks/useProcessingState';

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const state = useProcessingState();
  const actions = useProcessingActions(state);

  useEffect(() => {
    actions.refreshHistory().catch(() => {
      state.setIsLoadingHistory(false);
    });
  }, [actions.refreshHistory, state.setIsLoadingHistory]);

  const stateValue = useMemo(
    () => ({
      isProcessing: state.isProcessing,
      isExporting: state.isExporting,
      isLoadingHistory: state.isLoadingHistory,
      isRefreshing: state.isRefreshing,
      historyError: state.historyError,
      processedFiles: state.processedFiles,
      currentResults: state.currentResults,
    }),
    [state.currentResults, state.historyError, state.isExporting, state.isLoadingHistory, state.isProcessing, state.isRefreshing, state.processedFiles]
  );

  return (
    <ProcessingStateContext.Provider value={stateValue}>
      <ProcessingActionsContext.Provider value={actions}>{children}</ProcessingActionsContext.Provider>
    </ProcessingStateContext.Provider>
  );
}
