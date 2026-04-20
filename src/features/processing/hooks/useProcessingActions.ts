import { useCallback } from 'react';
import { exportJob, getJob, listJobs, processJob, uploadDocument } from '@/features/processing/api/processing.api';
import { mapJobListItemToPlaceholder, mapJobToProcessedFile } from '@/features/processing/mappers/processing.mappers';
import { mergeProcessedJob } from '@/features/processing/utils/processing-store';
import type { useProcessingState } from '@/features/processing/hooks/useProcessingState';

interface ProcessingStateSlice extends ReturnType<typeof useProcessingState> {}

export function useProcessingActions(state: ProcessingStateSlice) {
  const refreshHistory = useCallback(async () => {
    state.setIsLoadingHistory(true);
    try {
      const jobs = await listJobs();
      state.setProcessedFiles((previous) => {
        const preserved = new Map(previous.map((item) => [item.jobId, item]));
        return jobs.map((job) => preserved.get(job.id) ?? mapJobListItemToPlaceholder(job));
      });
    } finally {
      state.setIsLoadingHistory(false);
    }
  }, [state]);

  const selectResultByJobId = useCallback(async (jobId: number) => {
    state.setIsRefreshing(true);
    try {
      const job = mapJobToProcessedFile(await getJob(jobId));
      state.setProcessedFiles((previous) => mergeProcessedJob(previous, job));
      state.setCurrentResults(job);
      return job;
    } finally {
      state.setIsRefreshing(false);
    }
  }, [state]);

  const processFileAction = useCallback(async (file: File) => {
    state.setIsProcessing(true);
    try {
      const job = mapJobToProcessedFile(await uploadDocument(file));
      state.setProcessedFiles((previous) => mergeProcessedJob(previous, job));
      state.setCurrentResults(job);
      return job;
    } finally {
      state.setIsProcessing(false);
    }
  }, [state]);

  const runProcessing = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? state.currentResults?.jobId;
    if (!targetJobId) {
      return null;
    }

    state.setIsProcessing(true);
    try {
      const job = mapJobToProcessedFile(await processJob(targetJobId));
      state.setProcessedFiles((previous) => mergeProcessedJob(previous, job));
      state.setCurrentResults(job);
      return job;
    } finally {
      state.setIsProcessing(false);
    }
  }, [state]);

  const refreshJob = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? state.currentResults?.jobId;
    if (!targetJobId) {
      return null;
    }
    return selectResultByJobId(targetJobId);
  }, [selectResultByJobId, state.currentResults?.jobId]);

  const exportCurrentJob = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? state.currentResults?.jobId;
    if (!targetJobId) {
      return null;
    }

    state.setIsExporting(true);
    try {
      const job = mapJobToProcessedFile(await exportJob(targetJobId));
      state.setProcessedFiles((previous) => mergeProcessedJob(previous, job));
      state.setCurrentResults(job);
      return job;
    } finally {
      state.setIsExporting(false);
    }
  }, [state]);

  const selectResult = useCallback(async (id: string) => {
    const jobId = Number(id);
    if (Number.isNaN(jobId)) {
      return null;
    }
    return selectResultByJobId(jobId);
  }, [selectResultByJobId]);

  return {
    refreshHistory,
    selectResultByJobId,
    processFile: processFileAction,
    runProcessing,
    refreshJob,
    exportCurrentJob,
    selectResult,
  };
}
