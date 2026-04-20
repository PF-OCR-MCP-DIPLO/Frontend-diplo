import { createContext, useContext } from 'react';
import type { ProcessedFile } from '@/features/processing/types/processing.types';

export interface ProcessingContextValue {
  isProcessing: boolean;
  isExporting: boolean;
  isLoadingHistory: boolean;
  isRefreshing: boolean;
  historyError: string | null;
  processedFiles: ProcessedFile[];
  currentResults: ProcessedFile | null;
  processFile: (file: File) => Promise<ProcessedFile>;
  runProcessing: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshJob: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshHistory: () => Promise<void>;
  exportCurrentJob: (jobId?: number) => Promise<ProcessedFile | null>;
  selectResult: (id: string) => Promise<ProcessedFile | null>;
  selectResultByJobId: (jobId: number) => Promise<ProcessedFile | null>;
}

export interface ProcessingStateContextValue {
  isProcessing: boolean;
  isExporting: boolean;
  isLoadingHistory: boolean;
  isRefreshing: boolean;
  historyError: string | null;
  processedFiles: ProcessedFile[];
  currentResults: ProcessedFile | null;
}

export interface ProcessingActionsContextValue {
  processFile: (file: File) => Promise<ProcessedFile>;
  runProcessing: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshJob: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshHistory: () => Promise<void>;
  exportCurrentJob: (jobId?: number) => Promise<ProcessedFile | null>;
  selectResult: (id: string) => Promise<ProcessedFile | null>;
  selectResultByJobId: (jobId: number) => Promise<ProcessedFile | null>;
}

export const ProcessingStateContext = createContext<ProcessingStateContextValue | null>(null);
export const ProcessingActionsContext = createContext<ProcessingActionsContextValue | null>(null);

export function useProcessingStateContext() {
  const context = useContext(ProcessingStateContext);
  if (!context) {
    throw new Error('useProcessingStateContext must be used within ProcessingProvider');
  }
  return context;
}

export function useProcessingActionsContext() {
  const context = useContext(ProcessingActionsContext);
  if (!context) {
    throw new Error('useProcessingActionsContext must be used within ProcessingProvider');
  }
  return context;
}

export function useProcessing() {
  return {
    ...useProcessingStateContext(),
    ...useProcessingActionsContext(),
  };
}
