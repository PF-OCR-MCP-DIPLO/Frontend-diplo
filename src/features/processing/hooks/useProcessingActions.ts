import { useCallback, useMemo } from 'react';
import { HttpError } from '@/services/http/client';
import { deleteJob, exportJob, getJob, listJobs, processJob, reprocessFailed, saveJobCorrections, uploadDocument } from '@/features/processing/api/processing.api';
import type { ProcessingState } from '@/features/processing/hooks/useProcessingState';
import { mapJobListItemToPlaceholder, mapJobToProcessedFile } from '@/features/processing/mappers/processing.mappers';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';
import { mergeProcessedJob } from '@/features/processing/utils/processing-store';

const TERMINAL_STATUSES = new Set(['completed', 'completed_with_errors', 'failed']);
const PROCESSING_POLL_INTERVAL_MS = 1500;
const PROCESSING_POLL_TIMEOUT_MS = 90_000;
export const ACTIVE_JOB_STORAGE_KEY = 'diplo.active-job-id';

export function useProcessingActions({
  currentResults,
  setCurrentResults,
  setIsExporting,
  setIsLoadingHistory,
  setIsProcessing,
  setIsRefreshing,
  setIsSavingCorrections,
  setProcessedFiles,
  setHistoryError,
}: ProcessingState) {
  const currentJobId = currentResults?.jobId;

  const upsertCurrentJob = useCallback((job: ReturnType<typeof mapJobToProcessedFile>) => {
    setProcessedFiles((previous) => mergeProcessedJob(previous, job));
    setCurrentResults(job);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_JOB_STORAGE_KEY, String(job.jobId));
    }
    return job;
  }, [setCurrentResults, setProcessedFiles]);

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const jobs = await listJobs();
      setProcessedFiles((previous) => {
        const preserved = new Map(previous.map((item) => [item.jobId, item]));
        return jobs.map((job) => preserved.get(job.id) ?? mapJobListItemToPlaceholder(job));
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el historial';
      setHistoryError(message);
      throw error;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [setHistoryError, setIsLoadingHistory, setProcessedFiles]);

  const selectResultByJobId = useCallback(async (jobId: number) => {
    setIsRefreshing(true);
    try {
      const job = mapJobToProcessedFile(await getJob(jobId));
      return upsertCurrentJob(job);
    } finally {
      setIsRefreshing(false);
    }
  }, [setIsRefreshing, upsertCurrentJob]);

  const deleteJobResult = useCallback(async (jobId: number) => {
    await deleteJob(jobId);
    setProcessedFiles((previous) => previous.filter((item) => item.jobId !== jobId));
    setCurrentResults((previous) => {
      if (previous?.jobId === jobId) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
        }
        return null;
      }
      return previous;
    });
  }, [setCurrentResults, setProcessedFiles]);

  const pollJobUntilSettled = useCallback(async (jobId: number) => {
    const startedAt = Date.now();
    let latestJob = await selectResultByJobId(jobId);

    while (latestJob && !TERMINAL_STATUSES.has(latestJob.status)) {
      if (Date.now() - startedAt >= PROCESSING_POLL_TIMEOUT_MS) {
        throw new Error('El procesamiento sigue en curso. Usa "Actualizar estado" para consultar el resultado final.');
      }
      await new Promise((resolve) => window.setTimeout(resolve, PROCESSING_POLL_INTERVAL_MS));
      try {
        latestJob = await selectResultByJobId(jobId);
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          setProcessedFiles((previous) => previous.filter((item) => item.jobId !== jobId));
          setCurrentResults((previous) => previous?.jobId === jobId ? null : previous);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
          }
          throw new Error('La ejecución fue eliminada mientras se consultaba el estado.');
        }
        throw error;
      }
    }

    return latestJob;
  }, [selectResultByJobId, setCurrentResults, setProcessedFiles]);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const job = mapJobToProcessedFile(await uploadDocument(file));
      return upsertCurrentJob(job);
    } finally {
      setIsProcessing(false);
    }
  }, [setIsProcessing, upsertCurrentJob]);

  const runProcessing = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? currentJobId;
    if (!targetJobId) {
      return null;
    }

    setIsProcessing(true);
    try {
      const job = mapJobToProcessedFile(await processJob(targetJobId));
      const updatedJob = upsertCurrentJob(job);
      if (TERMINAL_STATUSES.has(updatedJob.status)) {
        return updatedJob;
      }
      return await pollJobUntilSettled(targetJobId);
    } finally {
      setIsProcessing(false);
    }
  }, [currentJobId, pollJobUntilSettled, setIsProcessing, upsertCurrentJob]);

  const reprocessFailedJob = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? currentJobId;
    if (!targetJobId) {
      return null;
    }

    setIsProcessing(true);
    try {
      const job = mapJobToProcessedFile(await reprocessFailed(targetJobId));
      return upsertCurrentJob(job);
    } finally {
      setIsProcessing(false);
    }
  }, [currentJobId, setIsProcessing, upsertCurrentJob]);

  const refreshJob = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? currentJobId;
    if (!targetJobId) {
      return null;
    }
    return selectResultByJobId(targetJobId);
  }, [currentJobId, selectResultByJobId]);

  const exportCurrentJob = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? currentJobId;
    if (!targetJobId) {
      return null;
    }

    setIsExporting(true);
    try {
      const job = mapJobToProcessedFile(await exportJob(targetJobId));
      return upsertCurrentJob(job);
    } finally {
      setIsExporting(false);
    }
  }, [currentJobId, setIsExporting, upsertCurrentJob]);

  const saveCurrentCorrections = useCallback(async (rows: ConsignmentRow[], jobId?: number) => {
    const targetJobId = jobId ?? currentJobId;
    if (!targetJobId) {
      return null;
    }

    setIsSavingCorrections(true);
    try {
      const job = mapJobToProcessedFile(
        await saveJobCorrections(targetJobId, {
          items: rows.map((row) => ({
            id: row.depositId,
            fecha_consignacion: row.fecha === 'Sin fecha' ? '' : row.fecha,
            hora_consignacion: row.hora,
            referencia: row.referencia,
            valor: row.monto,
          })),
        })
      );
      return upsertCurrentJob(job);
    } finally {
      setIsSavingCorrections(false);
    }
  }, [currentJobId, setIsSavingCorrections, upsertCurrentJob]);

  const selectResult = useCallback(async (id: string) => {
    const jobId = Number(id);
    if (Number.isNaN(jobId)) {
      return null;
    }
    return selectResultByJobId(jobId);
  }, [selectResultByJobId]);

  return useMemo(
    () => ({
      refreshHistory,
      selectResultByJobId,
      processFile,
      runProcessing,
      reprocessFailedJob,
      deleteJobResult,
      saveCurrentCorrections,
      refreshJob,
      exportCurrentJob,
      selectResult,
    }),
    [deleteJobResult, exportCurrentJob, processFile, refreshHistory, refreshJob, reprocessFailedJob, runProcessing, saveCurrentCorrections, selectResult, selectResultByJobId]
  );
}
