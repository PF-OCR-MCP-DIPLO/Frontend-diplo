import type { ProcessedFile } from '@/features/processing/types/processing.types';

export type HistoryListItem = Pick<
  ProcessedFile,
  'id' | 'jobId' | 'name' | 'date' | 'status' | 'displayStatus'
>;
