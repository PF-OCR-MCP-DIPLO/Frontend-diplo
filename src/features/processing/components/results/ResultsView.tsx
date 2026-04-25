import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ResultsActions } from '@/features/processing/components/results/ResultsActions';
import { ResultsCorrectionsPanel } from '@/features/processing/components/results/ResultsCorrectionsPanel';
import { ResultsErrorDialog } from '@/features/processing/components/results/ResultsErrorDialog';
import { ResultsHeader } from '@/features/processing/components/results/ResultsHeader';
import { ResultsImagePreviewDialog } from '@/features/processing/components/results/ResultsImagePreviewDialog';
import { ResultsIssuesPanel } from '@/features/processing/components/results/ResultsIssuesPanel';
import { ResultsLogsDialog } from '@/features/processing/components/results/ResultsLogsDialog';
import { ResultsSummary } from '@/features/processing/components/results/ResultsSummary';
import { ResultsAssistantQuickActions } from '@/features/processing/components/results/ResultsAssistantQuickActions';
import { ResultsToolsPanel } from '@/features/processing/components/results/ResultsToolsPanel';
import { buildResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { ResultsWorkspace, type ResultsPrimaryView } from '@/features/processing/components/results/ResultsWorkspace';
import { useResultsAutosave } from '@/features/processing/components/results/hooks/useResultsAutosave';
import { useResultsViewState } from '@/features/processing/components/results/hooks/useResultsViewState';
import type { ConsignmentRow, PreviewImage, ProcessingStatus } from '@/features/processing/types/processing.types';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type { AssistantLaunchContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';

interface ResultsViewProps {
  jobId: number;
  fileName: string;
  sourceDocxUrl: string;
  sourceImages: PreviewImage[];
  initialData: ConsignmentRow[];
  status: ProcessingStatus;
  totalImages: number;
  totalRecords: number;
  errorMessage: string;
  excelUrl: string | null;
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  isSavingCorrections: boolean;
  onProcess: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onSaveCorrections: (rows: ConsignmentRow[]) => Promise<void>;
  onOpenAssistant: (launch: AssistantLaunchContext) => void;
}

export function ResultsView(props: ResultsViewProps) {
  const viewState = useResultsViewState(props.jobId, props.initialData);
  const [primaryView, setPrimaryView] = useState<ResultsPrimaryView>('table');
  const [showIssues, setShowIssues] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const validationMap = buildResultsValidationMap(viewState.data);
  const autosave = useResultsAutosave({
    jobId: props.jobId,
    enabled: !props.isProcessing && props.status !== 'processing',
    onSaved: () => viewState.markSaved(),
  });
  const canExport = (props.status === 'completed' || props.status === 'completed_with_errors' || Boolean(props.excelUrl)) && !viewState.hasUnsavedChanges;
  const canSaveCorrections = !props.isSavingCorrections && !props.isProcessing && props.status !== 'processing' && viewState.hasUnsavedChanges;
  const assistantQueryContext = useMemo<AssistantQueryContext>(() => ({
    page: 'results',
    jobId: props.jobId,
    jobStatus: props.status,
    jobName: props.fileName,
    selectedRowId: viewState.selectedRowId ?? undefined,
    currentImageId: viewState.currentImage?.id,
    visibleIssueIds: viewState.data.filter((row) => row.estado === 'error').map((row) => row.id),
    errorCount: viewState.errorCount,
    autosaveStatus: autosave.autosave.status,
    intentHint: props.errorMessage ? 'explain_results' : 'review_results',
  }), [
    autosave.autosave.status,
    props.errorMessage,
    props.fileName,
    props.jobId,
    props.status,
    viewState.data,
    viewState.currentImage?.id,
    viewState.errorCount,
    viewState.selectedRowId,
  ]);

  async function handleOpenLogs() {
    try {
      await viewState.openLogs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron cargar los logs');
      viewState.setShowLogsDialog(true);
    }
  }

  function handleFocusRow(rowId: string) {
    setPrimaryView('table');
    window.setTimeout(() => {
      viewState.handleErrorClick(rowId);
    }, 0);
  }

  function handleSaveCorrections() {
    void props
      .onSaveCorrections(viewState.data)
      .then(() => viewState.markSaved())
      .catch(() => undefined);
  }

  function handleDataChange(nextData: ConsignmentRow[]) {
    viewState.setData(nextData);
    autosave.scheduleSave(nextData);
  }

  return (
    <div className='page-stack'>
      <section className='surface-card-hero p-6'>
        <div className='grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] xl:items-start'>
          <ResultsHeader
            fileName={props.fileName}
            status={props.status}
            totalImages={props.totalImages}
            totalRecords={props.totalRecords}
            errorMessage={props.errorMessage}
          />
          <ResultsActions
            isProcessing={props.isProcessing}
            isRefreshing={props.isRefreshing}
            isExporting={props.isExporting}
            status={props.status}
            excelUrl={props.excelUrl}
            canExport={canExport}
            onRefresh={props.onRefresh}
            onProcess={props.onProcess}
            onExport={props.onExport}
          />
        </div>
      </section>

      <ResultsSummary errorCount={viewState.errorCount} totalImages={props.totalImages} totalRecords={props.totalRecords} />

      <ResultsAssistantQuickActions
        jobId={props.jobId}
        jobStatus={props.status}
        data={viewState.data}
        sourceImages={props.sourceImages}
        selectedRowId={viewState.selectedRowId}
        currentImage={viewState.currentImage}
        errorCount={viewState.errorCount}
        autosaveStatus={autosave.autosave.status}
        onOpenAssistant={props.onOpenAssistant}
      />

      <ResultsWorkspace
        primaryView={primaryView}
        onPrimaryViewChange={setPrimaryView}
        data={viewState.data}
        fileName={props.fileName}
        sourceDocxUrl={props.sourceDocxUrl}
        sourceImages={props.sourceImages}
        validationMap={validationMap}
        onDataChange={handleDataChange}
        onRowFocus={handleFocusRow}
        onOpenImage={(image) => viewState.focusImage(image)}
      />

        <ResultsCorrectionsPanel
          hasUnsavedChanges={viewState.hasUnsavedChanges}
          canSaveCorrections={canSaveCorrections}
          isSavingCorrections={props.isSavingCorrections}
          autosave={autosave.autosave}
          onSaveCorrections={handleSaveCorrections}
          onRetryAutosave={autosave.retry}
        />

      <div className='grid gap-4 xl:grid-cols-2'>
        <ResultsIssuesPanel
          data={viewState.data}
          errorMessage={props.errorMessage}
          errorCount={viewState.errorCount}
          showIssues={showIssues}
          onToggleIssues={() => setShowIssues((value) => !value)}
          onErrorClick={handleFocusRow}
          onOpenDetails={() => viewState.setShowErrorDialog(true)}
        />

        <ResultsToolsPanel
          errorCount={viewState.errorCount}
          jobId={props.jobId}
          assistantQueryContext={assistantQueryContext}
          showTools={showTools}
          showChat={viewState.showChat}
          isLoadingLogs={viewState.isLoadingLogs}
          onToggleTools={() => setShowTools((value) => !value)}
          onToggleChat={() => viewState.setShowChat((value) => !value)}
          onOpenAssistant={() => props.onOpenAssistant({ context: assistantQueryContext })}
          onOpenLogs={() => void handleOpenLogs()}
        />
      </div>

      <ResultsErrorDialog
        open={viewState.showErrorDialog}
        errorMessage={props.errorMessage}
        data={viewState.data}
        onClose={() => viewState.setShowErrorDialog(false)}
        onErrorClick={handleFocusRow}
      />
      <ResultsImagePreviewDialog
        open={Boolean(viewState.expandedImage)}
        image={viewState.expandedImage}
        onClose={() => viewState.setExpandedImage(null)}
      />
      <ResultsLogsDialog
        open={viewState.showLogsDialog}
        logs={viewState.logs}
        error={viewState.logsError}
        onClose={() => viewState.setShowLogsDialog(false)}
      />
    </div>
  );
}
