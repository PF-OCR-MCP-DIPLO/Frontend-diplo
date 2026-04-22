import { useMemo, useState } from 'react';
import type { ProcessedFile } from '@/features/processing/types/processing.types';

export interface ProcessingState {
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;
  isSavingCorrections: boolean;
  setIsSavingCorrections: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingHistory: boolean;
  setIsLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>;
  isRefreshing: boolean;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  historyError: string | null;
  setHistoryError: React.Dispatch<React.SetStateAction<string | null>>;
  processedFiles: ProcessedFile[];
  setProcessedFiles: React.Dispatch<React.SetStateAction<ProcessedFile[]>>;
  currentResults: ProcessedFile | null;
  setCurrentResults: React.Dispatch<React.SetStateAction<ProcessedFile | null>>;
}

export function useProcessingState(): ProcessingState {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingCorrections, setIsSavingCorrections] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [currentResults, setCurrentResults] = useState<ProcessedFile | null>(null);

  return useMemo(
    () => ({
      isProcessing,
      setIsProcessing,
      isExporting,
      setIsExporting,
      isSavingCorrections,
      setIsSavingCorrections,
      isLoadingHistory,
      setIsLoadingHistory,
      isRefreshing,
      setIsRefreshing,
      historyError,
      setHistoryError,
      processedFiles,
      setProcessedFiles,
      currentResults,
      setCurrentResults,
    }),
    [currentResults, historyError, isExporting, isLoadingHistory, isProcessing, isRefreshing, isSavingCorrections, processedFiles]
  );
}
