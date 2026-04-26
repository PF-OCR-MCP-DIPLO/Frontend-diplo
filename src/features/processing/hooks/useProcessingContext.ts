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
  reprocessFailedJob: (jobId?: number) => Promise<ProcessedFile | null>;
  deleteJobResult: (jobId: number) => Promise<void>;
  saveCurrentCorrections: (rows: ProcessedFile['data'], jobId?: number) => Promise<ProcessedFile | null>;
  refreshJob: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshHistory: () => Promise<void>;
  exportCurrentJob: (jobId?: number) => Promise<ProcessedFile | null>;
  selectResult: (id: string) => Promise<ProcessedFile | null>;
  selectResultByJobId: (jobId: number) => Promise<ProcessedFile | null>;
}

export interface ProcessingHistoryContextValue {
  isLoadingHistory: boolean;
  historyError: string | null;
  processedFiles: ProcessedFile[];
}

export interface ProcessingCurrentResultContextValue {
  currentResults: ProcessedFile | null;
}

export interface ProcessingFlagsContextValue {
  isProcessing: boolean;
  isExporting: boolean;
  isSavingCorrections: boolean;
  isRefreshing: boolean;
}

export interface ProcessingActionsContextValue {
  processFile: (file: File) => Promise<ProcessedFile>;
  runProcessing: (jobId?: number) => Promise<ProcessedFile | null>;
  reprocessFailedJob: (jobId?: number) => Promise<ProcessedFile | null>;
  deleteJobResult: (jobId: number) => Promise<void>;
  saveCurrentCorrections: (rows: ProcessedFile['data'], jobId?: number) => Promise<ProcessedFile | null>;
  refreshJob: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshHistory: () => Promise<void>;
  exportCurrentJob: (jobId?: number) => Promise<ProcessedFile | null>;
  selectResult: (id: string) => Promise<ProcessedFile | null>;
  selectResultByJobId: (jobId: number) => Promise<ProcessedFile | null>;
}

export const ProcessingHistoryContext = createContext<ProcessingHistoryContextValue | null>(null);
export const ProcessingCurrentResultContext = createContext<ProcessingCurrentResultContextValue | null>(null);
export const ProcessingFlagsContext = createContext<ProcessingFlagsContextValue | null>(null);
export const ProcessingActionsContext = createContext<ProcessingActionsContextValue | null>(null);

export function useProcessingHistoryContext() {
  const context = useContext(ProcessingHistoryContext);
  if (!context) {
    throw new Error('useProcessingHistoryContext must be used within ProcessingProvider');
  }
  return context;
}

export function useProcessingCurrentResultContext() {
  const context = useContext(ProcessingCurrentResultContext);
  if (!context) {
    throw new Error('useProcessingCurrentResultContext must be used within ProcessingProvider');
  }
  return context;
}

export function useProcessingFlagsContext() {
  const context = useContext(ProcessingFlagsContext);
  if (!context) {
    throw new Error('useProcessingFlagsContext must be used within ProcessingProvider');
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
    ...useProcessingHistoryContext(),
    ...useProcessingCurrentResultContext(),
    ...useProcessingFlagsContext(),
    ...useProcessingActionsContext(),
  };
}
