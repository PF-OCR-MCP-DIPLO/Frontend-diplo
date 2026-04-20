import { useCallback } from 'react';
import { exportJob, getJob, listJobs, processJob, uploadDocument } from '@/features/processing/api/processing.api';
import type { ProcessingState } from '@/features/processing/hooks/useProcessingState';
import { mapJobListItemToPlaceholder, mapJobToProcessedFile } from '@/features/processing/mappers/processing.mappers';
import { mergeProcessedJob } from '@/features/processing/utils/processing-store';

export function useProcessingActions(state: ProcessingState) {
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

  const upsertCurrentJob = useCallback((job: ReturnType<typeof mapJobToProcessedFile>) => {
    state.setProcessedFiles((previous) => mergeProcessedJob(previous, job));
    state.setCurrentResults(job);
    return job;
  }, [state]);

  const selectResultByJobId = useCallback(async (jobId: number) => {
    state.setIsRefreshing(true);
    try {
      const job = mapJobToProcessedFile(await getJob(jobId));
      return upsertCurrentJob(job);
    } finally {
      state.setIsRefreshing(false);
    }
  }, [state, upsertCurrentJob]);

  const processFile = useCallback(async (file: File) => {
    state.setIsProcessing(true);
    try {
      const job = mapJobToProcessedFile(await uploadDocument(file));
      return upsertCurrentJob(job);
    } finally {
      state.setIsProcessing(false);
    }
  }, [state, upsertCurrentJob]);

  const runProcessing = useCallback(async (jobId?: number) => {
    const targetJobId = jobId ?? state.currentResults?.jobId;
    if (!targetJobId) {
      return null;
    }

    state.setIsProcessing(true);
    try {
      const job = mapJobToProcessedFile(await processJob(targetJobId));
      return upsertCurrentJob(job);
    } finally {
      state.setIsProcessing(false);
    }
  }, [state, upsertCurrentJob]);

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
      return upsertCurrentJob(job);
    } finally {
      state.setIsExporting(false);
    }
  }, [state, upsertCurrentJob]);

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
    processFile,
    runProcessing,
    refreshJob,
    exportCurrentJob,
    selectResult,
  };
}
