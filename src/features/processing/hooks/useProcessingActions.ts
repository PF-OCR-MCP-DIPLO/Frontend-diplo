import { useCallback, useMemo } from 'react';
import { exportJob, getJob, listJobs, processJob, uploadDocument } from '@/features/processing/api/processing.api';
import type { ProcessingState } from '@/features/processing/hooks/useProcessingState';
import { mapJobListItemToPlaceholder, mapJobToProcessedFile } from '@/features/processing/mappers/processing.mappers';
import { mergeProcessedJob } from '@/features/processing/utils/processing-store';

export function useProcessingActions({
  currentResults,
  setCurrentResults,
  setIsExporting,
  setIsLoadingHistory,
  setIsProcessing,
  setIsRefreshing,
  setProcessedFiles,
}: ProcessingState) {
  const currentJobId = currentResults?.jobId;

  const upsertCurrentJob = useCallback((job: ReturnType<typeof mapJobToProcessedFile>) => {
    setProcessedFiles((previous) => mergeProcessedJob(previous, job));
    setCurrentResults(job);
    return job;
  }, [setCurrentResults, setProcessedFiles]);

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const jobs = await listJobs();
      setProcessedFiles((previous) => {
        const preserved = new Map(previous.map((item) => [item.jobId, item]));
        return jobs.map((job) => preserved.get(job.id) ?? mapJobListItemToPlaceholder(job));
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [setIsLoadingHistory, setProcessedFiles]);

  const selectResultByJobId = useCallback(async (jobId: number) => {
    setIsRefreshing(true);
    try {
      const job = mapJobToProcessedFile(await getJob(jobId));
      return upsertCurrentJob(job);
    } finally {
      setIsRefreshing(false);
    }
  }, [setIsRefreshing, upsertCurrentJob]);

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
      refreshJob,
      exportCurrentJob,
      selectResult,
    }),
    [exportCurrentJob, processFile, refreshHistory, refreshJob, runProcessing, selectResult, selectResultByJobId]
  );
}
