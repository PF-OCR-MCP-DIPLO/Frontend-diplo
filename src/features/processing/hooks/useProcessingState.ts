import { useState } from 'react';
import type { ProcessedFile } from '@/features/processing/types/processing.types';

export function useProcessingState() {
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
