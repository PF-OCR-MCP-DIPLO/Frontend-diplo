import { useMemo, useRef, useState } from 'react';
import { getJobLogs } from '@/features/processing/api/processing.api';
import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

export function useResultsViewState(jobId: number, initialData: ConsignmentRow[]) {
  const [data, setData] = useState<ConsignmentRow[]>(initialData);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);
  const [logs, setLogs] = useState<ApiExtractionLog[]>([]);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const logsCacheRef = useRef(new Map<number, ApiExtractionLog[]>());

  const errorCount = useMemo(() => data.filter((row) => row.estado === 'error').length, [data]);

  function handleErrorClick(rowId: string) {
    const element = document.getElementById(rowId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function openLogs() {
    if (isLoadingLogs) {
      return;
    }

    const cachedLogs = logsCacheRef.current.get(jobId);
    if (cachedLogs) {
      setLogs(cachedLogs);
      setLogsError(null);
      setShowLogsDialog(true);
      return;
    }

    setIsLoadingLogs(true);
    setLogsError(null);
    try {
      const payload = await getJobLogs(jobId);
      logsCacheRef.current.set(jobId, payload);
      setLogs(payload);
      setShowLogsDialog(true);
    } catch (error) {
      setLogsError(error instanceof Error ? error.message : 'No se pudieron cargar los logs');
      throw error;
    } finally {
      setIsLoadingLogs(false);
    }
  }

  return {
    data,
    setData,
    errorCount,
    showErrorDialog,
    setShowErrorDialog,
    expandedImage,
    setExpandedImage,
    logs,
    showLogsDialog,
    setShowLogsDialog,
    isLoadingLogs,
    logsError,
    handleErrorClick,
    openLogs,
  };
}
