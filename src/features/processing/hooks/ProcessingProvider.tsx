import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import {
  ProcessingActionsContext,
  ProcessingCurrentResultContext,
  ProcessingFlagsContext,
  ProcessingHistoryContext,
} from '@/features/processing/hooks/useProcessingContext';
import { ACTIVE_JOB_STORAGE_KEY, useProcessingActions } from '@/features/processing/hooks/useProcessingActions';
import { useProcessingState } from '@/features/processing/hooks/useProcessingState';

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const state = useProcessingState();
  const actions = useProcessingActions(state);
  const { refreshHistory, selectResultByJobId } = actions;
  const { setIsLoadingHistory } = state;

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await refreshHistory();
        if (cancelled || typeof window === 'undefined') {
          return;
        }
        const storedJobId = window.localStorage.getItem(ACTIVE_JOB_STORAGE_KEY);
        if (!storedJobId) {
          return;
        }
        const parsedJobId = Number(storedJobId);
        if (!Number.isNaN(parsedJobId)) {
          await selectResultByJobId(parsedJobId).catch(() => {
            window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
          });
        }
      } catch {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshHistory, selectResultByJobId, setIsLoadingHistory]);

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
      isSavingCorrections: state.isSavingCorrections,
      isRefreshing: state.isRefreshing,
    }),
    [state.isExporting, state.isProcessing, state.isRefreshing, state.isSavingCorrections]
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
