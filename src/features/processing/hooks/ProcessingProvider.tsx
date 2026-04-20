import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { ProcessingContext } from '@/features/processing/hooks/useProcessingContext';
import { useProcessingActions } from '@/features/processing/hooks/useProcessingActions';
import { useProcessingState } from '@/features/processing/hooks/useProcessingState';

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const state = useProcessingState();
  const actions = useProcessingActions(state);

  useEffect(() => {
    actions.refreshHistory().catch(() => {
      state.setIsLoadingHistory(false);
    });
  }, [actions, state]);

  const value = useMemo(
    () => ({
      isProcessing: state.isProcessing,
      isExporting: state.isExporting,
      isLoadingHistory: state.isLoadingHistory,
      isRefreshing: state.isRefreshing,
      processedFiles: state.processedFiles,
      currentResults: state.currentResults,
      processFile: actions.processFile,
      runProcessing: actions.runProcessing,
      refreshJob: actions.refreshJob,
      refreshHistory: actions.refreshHistory,
      exportCurrentJob: actions.exportCurrentJob,
      selectResult: actions.selectResult,
      selectResultByJobId: actions.selectResultByJobId,
    }),
    [actions, state.currentResults, state.isExporting, state.isLoadingHistory, state.isProcessing, state.isRefreshing, state.processedFiles]
  );

  return <ProcessingContext.Provider value={value}>{children}</ProcessingContext.Provider>;
}
