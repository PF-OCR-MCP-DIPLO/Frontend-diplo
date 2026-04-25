import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ResultsErrorDialog } from '@/features/processing/components/results/ResultsErrorDialog';
import { ResultsFieldDetailPanel } from '@/features/processing/components/results/ResultsFieldDetailPanel';
import { ResultsImagePreviewDialog } from '@/features/processing/components/results/ResultsImagePreviewDialog';
import { ResultsLogsDialog } from '@/features/processing/components/results/ResultsLogsDialog';
import { ResultsWorkspace } from '@/features/processing/components/results/ResultsWorkspace';
import { ResultsTopBar } from '@/features/processing/components/results/ResultsTopBar';
import { ResultsSidePanel, type ResultsPanel } from '@/features/processing/components/results/ResultsSidePanel';
import { buildResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { reprocessDeposit } from '@/features/processing/api/processing.api';
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
  const [detailCell, setDetailCell] = useState<{ rowId: string; field: keyof ConsignmentRow } | null>(null);
  const [reprocessingDepositId, setReprocessingDepositId] = useState<number | null>(null);
  const validationMap = buildResultsValidationMap(viewState.data);
  const selectedRow = useMemo(() => viewState.data.find((row) => row.id === viewState.selectedRowId) ?? null, [viewState.data, viewState.selectedRowId]);
  const selectedIssues = useMemo(() => {
    if (!selectedRow) return [];
    return validationMap.fieldIssuesByRow[selectedRow.id]
      ? Object.values(validationMap.fieldIssuesByRow[selectedRow.id] ?? {}).flat().map((issue) => issue.id)
      : [];
  }, [selectedRow, validationMap.fieldIssuesByRow]);
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
    selectedField: viewState.selectedField ?? undefined,
    depositId: selectedRow?.depositId,
    sourceImageId: selectedRow?.sourceImageId,
    currentImageId: viewState.currentImage?.id ?? selectedRow?.sourceImageId,
    visibleIssueIds: selectedIssues.length > 0 ? selectedIssues : viewState.data.filter((row) => row.estado === 'error').map((row) => row.id),
    errorCount: viewState.errorCount,
    autosaveStatus: autosave.autosave.status,
    intentHint: viewState.selectedField ? 'explain_cell_issue' : viewState.selectedRowId ? 'explain_row_issue' : props.errorMessage ? 'explain_results' : 'review_results',
    contextScope: viewState.selectedField ? 'cell' : viewState.selectedRowId ? 'row' : viewState.currentImage ? 'image' : viewState.data.some((row) => row.estado === 'error') ? 'issues' : 'job',
    pendingAction: undefined,
  }), [
    autosave.autosave.status,
    props.errorMessage,
    props.fileName,
    props.jobId,
    props.status,
    selectedIssues,
    selectedRow,
    viewState.currentImage,
    viewState.data,
    viewState.errorCount,
    viewState.selectedField,
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

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActivePanel(null);
        setDetailCell(null);
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  function handleFocusRow(rowId: string) {
    setActivePanel('issues');
    window.setTimeout(() => {
      viewState.handleErrorClick(rowId);
    }, 0);
  }

  function handleFocusCell(rowId: string, field: keyof ConsignmentRow) {
    viewState.focusCell(rowId, field);
    setDetailCell({ rowId, field });
  }

  function handleAskAssistant(rowId: string, field: keyof ConsignmentRow) {
    viewState.focusCell(rowId, field);
    props.onOpenAssistant({
      prompt: `Explícame cómo corregir ${String(field)} en la fila ${rowId}.`,
      context: {
        ...assistantQueryContext,
        selectedRowId: rowId,
        selectedField: String(field),
        intentHint: 'explain_cell_issue',
      },
    });
  }

  async function handleReprocessDeposit(depositId: number) {
    setReprocessingDepositId(depositId);
    try {
      await reprocessDeposit(props.jobId, depositId);
      props.onRefresh();
      toast.success('Consignación reprocesada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo reprocesar la consignación');
    } finally {
      setReprocessingDepositId(null);
    }
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
        onOpenAssistant={() => {
          setActivePanel(null);
          setDetailCell(null);
          props.onOpenAssistant({ context: assistantQueryContext });
        }}
        onOpenPanel={(panel) => {
          if (panel === 'logs') {
            void handleOpenLogs();
            return;
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
          selectedRowId={viewState.selectedRowId}
          selectedField={viewState.selectedField}
          onCellFocus={handleFocusCell}
          onAskAssistant={handleAskAssistant}
        />
      </main>

      <div className='flex items-center justify-between px-4 pb-4 text-xs text-muted-foreground'>
        <button
          type='button'
          className='text-left underline-offset-4 hover:underline'
          onClick={() => {
            setActivePanel(null);
            setDetailCell(null);
            props.onOpenAssistant({ context: assistantQueryContext });
          }}
        >
          Abrir asistente
        </button>
        <button type='button' className='text-left underline-offset-4 hover:underline' onClick={() => setActivePanel('preview')}>
          Ver preview
        </button>
      </div>

      <ResultsSidePanel
        panel={activePanel}
        onClose={() => setActivePanel(null)}
        errorMessage={props.errorMessage}
        logs={viewState.logs}
        logsError={viewState.logsError}
        isLoadingLogs={viewState.isLoadingLogs}
        sourceDocxUrl={props.sourceDocxUrl}
        sourceImages={props.sourceImages}
        data={viewState.data}
        validationMap={validationMap}
        selectedRowId={viewState.selectedRowId}
        selectedField={viewState.selectedField}
        onOpenImage={(image) => viewState.focusImage(image)}
        onFocusRow={handleFocusRow}
        onFocusCell={handleFocusCell}
        reprocessingDepositId={reprocessingDepositId}
      />

      <ResultsFieldDetailPanel
        open={Boolean(detailCell)}
        jobId={props.jobId}
        row={detailCell ? viewState.data.find((row) => row.id === detailCell.rowId) ?? null : null}
        field={detailCell?.field ?? null}
        validationMap={validationMap}
        reprocessingDepositId={reprocessingDepositId}
        onClose={() => setDetailCell(null)}
        onEdit={(rowId, field) => {
          viewState.focusCell(rowId, field);
          setDetailCell(null);
        }}
        onAskAssistant={(launch) => props.onOpenAssistant(launch)}
        onReprocessDeposit={(depositId) => void handleReprocessDeposit(depositId)}
      />

      <ResultsErrorDialog
        open={viewState.showErrorDialog}
        errorMessage={props.errorMessage}
        data={viewState.data}
        validationMap={validationMap}
        selectedRowId={viewState.selectedRowId}
        selectedField={viewState.selectedField}
        onClose={() => viewState.setShowErrorDialog(false)}
        onErrorClick={handleFocusRow}
        onFocusCell={handleFocusCell}
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
