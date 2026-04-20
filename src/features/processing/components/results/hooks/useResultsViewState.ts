import { useEffect, useMemo, useState } from 'react';
import { getJobLogs } from '@/features/processing/api/processing.api';
import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

export function useResultsViewState(jobId: number, initialData: ConsignmentRow[]) {
  const [data, setData] = useState<ConsignmentRow[]>(initialData);
  const [showChat, setShowChat] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);
  const [logs, setLogs] = useState<ApiExtractionLog[]>([]);
  const [showLogsDialog, setShowLogsDialog] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const errorCount = useMemo(() => data.filter((row) => row.estado === 'error').length, [data]);

  function handleErrorClick(rowId: string) {
    const element = document.getElementById(rowId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function openLogs() {
    const payload = await getJobLogs(jobId);
    setLogs(payload);
    setShowLogsDialog(true);
  }

  return {
    data,
    setData,
    errorCount,
    showChat,
    setShowChat,
    showErrorDialog,
    setShowErrorDialog,
    expandedImage,
    setExpandedImage,
    logs,
    showLogsDialog,
    setShowLogsDialog,
    handleErrorClick,
    openLogs,
  };
}
