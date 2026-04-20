import { createContext, useContext } from 'react';
import type { ProcessedFile } from '@/features/processing/types/processing.types';

export interface ProcessingContextValue {
  isProcessing: boolean;
  isExporting: boolean;
  isLoadingHistory: boolean;
  isRefreshing: boolean;
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

export const ProcessingContext = createContext<ProcessingContextValue | null>(null);

export function useProcessing() {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within ProcessingProvider');
  }
  return context;
}
