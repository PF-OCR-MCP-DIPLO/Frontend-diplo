export type AssistantPageContext =
  | 'dashboard'
  | 'upload'
  | 'results'
  | 'history'
  | 'settings'
  | 'assistant';

export type AssistantAutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface AssistantQueryContext {
  contextScope?: 'general' | 'job' | 'row' | 'cell' | 'image' | 'issues';
  page?: AssistantPageContext;
  jobId?: number;
  jobStatus?: string;
  jobName?: string;
  selectedRowId?: string;
  depositId?: number;
  selectedField?: string;
  sourceImageId?: number;
  currentImageId?: number;
  visibleIssueIds?: string[];
  errorCount?: number;
  autosaveStatus?: AssistantAutosaveStatus;
  intentHint?: string;
  pendingAction?: {
    tool: string;
    arguments?: Record<string, unknown>;
    intentName?: string;
    intentSummary?: string;
    jobId?: number;
  };
}
