import type { ProcessedFile } from '@/features/processing/types/processing.types';

export type HistoryEntry = Pick<
  ProcessedFile,
  'id' | 'jobId' | 'name' | 'date' | 'status' | 'displayStatus' | 'totalImages' | 'totalRecords' | 'errorCount'
>;
