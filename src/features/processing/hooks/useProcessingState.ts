import { useState } from 'react';
import type { ProcessedFile } from '@/features/processing/types/processing.types';

export interface ProcessingState {
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingHistory: boolean;
  setIsLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>;
  isRefreshing: boolean;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  processedFiles: ProcessedFile[];
  setProcessedFiles: React.Dispatch<React.SetStateAction<ProcessedFile[]>>;
  currentResults: ProcessedFile | null;
  setCurrentResults: React.Dispatch<React.SetStateAction<ProcessedFile | null>>;
}

export function useProcessingState(): ProcessingState {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [currentResults, setCurrentResults] = useState<ProcessedFile | null>(null);

  return {
    isProcessing,
    setIsProcessing,
    isExporting,
    setIsExporting,
    isLoadingHistory,
    setIsLoadingHistory,
    isRefreshing,
    setIsRefreshing,
    processedFiles,
    setProcessedFiles,
    currentResults,
    setCurrentResults,
  };
}
