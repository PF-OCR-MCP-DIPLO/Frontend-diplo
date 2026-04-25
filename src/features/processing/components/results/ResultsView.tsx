import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ResultsErrorDialog } from '@/features/processing/components/results/ResultsErrorDialog';
import { ResultsImagePreviewDialog } from '@/features/processing/components/results/ResultsImagePreviewDialog';
import { ResultsLogsDialog } from '@/features/processing/components/results/ResultsLogsDialog';
import { ResultsWorkspace } from '@/features/processing/components/results/ResultsWorkspace';
import { ResultsTopBar } from '@/features/processing/components/results/ResultsTopBar';
import { ResultsSidePanel, type ResultsPanel } from '@/features/processing/components/results/ResultsSidePanel';
import { buildResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { useResultsAutosave } from '@/features/processing/components/results/hooks/useResultsAutosave';
import { useResultsViewState } from '@/features/processing/components/results/hooks/useResultsViewState';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type { AssistantLaunchContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';
import type { ConsignmentRow, PreviewImage, ProcessingStatus } from '@/features/processing/types/processing.types';

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
  const [activePanel, setActivePanel] = useState<ResultsPanel>(null);
  const validationMap = buildResultsValidationMap(viewState.data);
  const autosave = useResultsAutosave({
    jobId: props.jobId,
    enabled: !props.isProcessing && props.status !== 'processing',
    onSaved: () => viewState.markSaved(),
  });

  const canExport = (props.status === 'completed' || props.status === 'completed_with_errors' || Boolean(props.excelUrl)) && !viewState.hasUnsavedChanges;

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
      setActivePanel('logs');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron cargar los logs');
      setActivePanel('logs');
    }
  }

  function handleFocusRow(rowId: string) {
    setActivePanel('issues');
    window.setTimeout(() => {
      viewState.handleErrorClick(rowId);
    }, 0);
  }

  function handleDataChange(nextData: ConsignmentRow[]) {
    viewState.setData(nextData);
    autosave.scheduleSave(nextData);
  }

  const autosaveLabel =
    autosave.autosave.status === 'saving'
      ? 'Guardando…'
      : autosave.autosave.status === 'saved'
        ? 'Guardado'
        : autosave.autosave.status === 'error'
          ? `Error al guardar · ${autosave.autosave.error ?? 'Reintentar'}`
          : viewState.hasUnsavedChanges || autosave.autosave.status === 'dirty'
            ? 'Cambios pendientes'
            : 'Sin cambios pendientes';

  return (
    <div className='relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-[24px] border border-border/60 bg-card/90'>
      <ResultsTopBar
        fileName={props.fileName}
        status={props.status}
        totalImages={props.totalImages}
        totalRecords={props.totalRecords}
        errorCount={viewState.errorCount}
        autosaveLabel={autosaveLabel}
        isProcessing={props.isProcessing}
        isRefreshing={props.isRefreshing}
        isExporting={props.isExporting}
        isSavingCorrections={props.isSavingCorrections}
        excelUrl={props.excelUrl}
        canExport={canExport}
        canSaveCorrections={!props.isSavingCorrections && !props.isProcessing && props.status !== 'processing' && viewState.hasUnsavedChanges}
        onProcess={props.onProcess}
        onRefresh={props.onRefresh}
        onExport={props.onExport}
        onSaveCorrections={() => {
          void props
            .onSaveCorrections(viewState.data)
            .then(() => viewState.markSaved())
            .catch(() => undefined);
        }}
        onOpenPanel={(panel) => {
          if (panel === 'logs') {
            void handleOpenLogs();
            return;
          }
          if (panel === 'assistant') {
            props.onOpenAssistant({ context: assistantQueryContext });
          }
          setActivePanel(panel);
        }}
      />

      <main className='min-h-0 p-3'>
        <ResultsWorkspace
          data={viewState.data}
          validationMap={validationMap}
          onDataChange={handleDataChange}
          onRowFocus={handleFocusRow}
          onOpenImage={(image) => {
            viewState.focusImage(image);
            setActivePanel('preview');
          }}
        />
      </main>

      <div className='px-4 pb-4 text-xs text-muted-foreground'>
        <button type='button' className='text-left underline-offset-4 hover:underline' onClick={() => setActivePanel('assistant')}>
          Preguntar al asistente
        </button>
      </div>

      <ResultsSidePanel
        panel={activePanel}
        onClose={() => setActivePanel(null)}
        jobId={props.jobId}
        errors={viewState.errorCount}
        queryContext={assistantQueryContext}
        errorMessage={props.errorMessage}
        logs={viewState.logs}
        logsError={viewState.logsError}
        isLoadingLogs={viewState.isLoadingLogs}
        sourceDocxUrl={props.sourceDocxUrl}
        sourceImages={props.sourceImages}
        onOpenImage={(image) => viewState.focusImage(image)}
      />

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
