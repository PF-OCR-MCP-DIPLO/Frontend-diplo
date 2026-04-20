import type { ProcessedFile } from '@/features/processing/types/processing.types';

export function mergeProcessedJob(previous: ProcessedFile[], next: ProcessedFile) {
  return [next, ...previous.filter((item) => item.jobId !== next.jobId)].sort(
    (left, right) => right.date.getTime() - left.date.getTime()
  );
}
