import { useEffect, useMemo, useRef, useState } from 'react';
import { getJobLogs } from '@/features/processing/api/processing.api';
import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';

export function useResultsViewState(jobId: number, initialData: ConsignmentRow[]) {
  const [data, setData] = useState<ConsignmentRow[]>(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<PreviewImage | null>(null);
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);
  const [logs, setLogs] = useState<ApiExtractionLog[]>([]);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const logsCacheRef = useRef(new Map<number, ApiExtractionLog[]>());

  const errorCount = useMemo(() => data.filter((row) => row.estado === 'error').length, [data]);

  useEffect(() => {
    setData(initialData);
    setHasUnsavedChanges(false);
  }, [initialData, jobId]);

  function updateData(nextData: ConsignmentRow[]) {
    setData(nextData);
    setHasUnsavedChanges(true);
  }

  function markSaved() {
    setHasUnsavedChanges(false);
  }

  function handleErrorClick(rowId: string, field?: string) {
    setSelectedRowId(rowId);
    setSelectedField(field ?? null);
    const element = document.getElementById(rowId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function focusCell(rowId: string, field: string) {
    setSelectedRowId(rowId);
    setSelectedField(field);
    const element = document.querySelector<HTMLElement>(`[data-cell-id="${rowId}-${field}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function focusImage(image: PreviewImage | null) {
    setCurrentImage(image);
    setExpandedImage(image ? { url: image.url, name: image.name } : null);
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
    setData: updateData,
    hasUnsavedChanges,
    markSaved,
    errorCount,
    showChat,
    setShowChat,
    showErrorDialog,
    setShowErrorDialog,
    selectedRowId,
    selectedField,
    currentImage,
    expandedImage,
    setExpandedImage,
    focusImage,
    logs,
    showLogsDialog,
    setShowLogsDialog,
    isLoadingLogs,
    logsError,
    handleErrorClick,
    focusCell,
    openLogs,
  };
}
