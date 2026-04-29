/**
 * Coordina la vista completa de resultados de procesamiento.
 *
 * Este componente conecta la tabla editable, los paneles laterales, la vista
 * previa del documento y las acciones de reproceso/exportación.
 *
 * @remarks
 * Mantiene la composición de UI separada de la persistencia y del polling
 * para que la pantalla sea legible y testeable.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useRouteOverlayCleanup } from '@/app/hooks/useRouteOverlayCleanup';
import { ResultsImagePreviewDialog } from '@/features/processing/components/results/ResultsImagePreviewDialog';
import { ResultsWorkspace } from '@/features/processing/components/results/ResultsWorkspace';
import { ResultsTopBar } from '@/features/processing/components/results/ResultsTopBar';
import { ResultsSidePanel } from '@/features/processing/components/results/ResultsSidePanel';
import { buildResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { reprocessDeposit } from '@/features/processing/api/processing.api';
import { useResultsAutosave } from '@/features/processing/components/results/hooks/useResultsAutosave';
import { useResultsPanelState } from '@/features/processing/components/results/hooks/useResultsPanelState';
import { useResultsViewState } from '@/features/processing/components/results/hooks/useResultsViewState';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type { AssistantLaunchContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';
import type { ApiJobDiagnosticsSummary } from '@/features/processing/types/processing.api';
import type {
  ConsignmentRow,
  PreviewImage,
  ProcessingStatus,
  ResultFieldKey,
} from '@/features/processing/types/processing.types';

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
  diagnosticsSummary?: ApiJobDiagnosticsSummary | null;
  excelUrl: string | null;
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  isSavingCorrections: boolean;
  onProcess: () => void;
  onReprocessFailed: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onSaveCorrections: (rows: ConsignmentRow[]) => Promise<void>;
  onOpenAssistant: (launch: AssistantLaunchContext) => void;
}

export function ResultsView(props: ResultsViewProps) {
  const location = useLocation();
  const viewState = useResultsViewState(props.jobId, props.initialData);
  const {
    panelState,
    openPanel: openResultsPanel,
    closePanel,
    minimizePanel,
    restorePanel,
    setFieldDetail,
  } = useResultsPanelState(props.jobId);

  const { setExpandedImage } = viewState;
  const [reprocessingDepositId, setReprocessingDepositId] = useState<number | null>(null);

  const validationMap = buildResultsValidationMap(viewState.data);

  const selectedRow = useMemo(
    () => viewState.data.find((row) => row.id === viewState.selectedRowId) ?? null,
    [viewState.data, viewState.selectedRowId],
  );

  const selectedIssues = useMemo(() => {
    if (!selectedRow) return [];

    return validationMap.fieldIssuesByRow[selectedRow.id]
      ? Object.values(validationMap.fieldIssuesByRow[selectedRow.id] ?? {})
          .flat()
          .map((issue) => issue.id)
      : [];
  }, [selectedRow, validationMap.fieldIssuesByRow]);

  const autosave = useResultsAutosave({
    jobId: props.jobId,
    enabled: !props.isProcessing && props.status !== 'processing',
    onSaved: () => viewState.markSaved(),
  });

  const canExport =
    (props.status === 'completed' ||
      props.status === 'completed_with_errors' ||
      Boolean(props.excelUrl)) &&
    !viewState.hasUnsavedChanges;

  const assistantQueryContext = useMemo<AssistantQueryContext>(
    () => ({
      page: 'results',
      jobId: props.jobId,
      jobStatus: props.status,
      jobName: props.fileName,
      selectedRowId: viewState.selectedRowId ?? undefined,
      selectedField: viewState.selectedField ?? undefined,
      depositId: selectedRow?.depositId,
      sourceImageId: selectedRow?.sourceImageId,
      currentImageId: viewState.currentImage?.id ?? selectedRow?.sourceImageId,
      visibleIssueIds:
        selectedIssues.length > 0
          ? selectedIssues
          : viewState.data.filter((row) => row.estado === 'error').map((row) => row.id),
      errorCount: viewState.errorCount,
      autosaveStatus: autosave.autosave.status,
      intentHint: viewState.selectedField
        ? 'explain_cell_issue'
        : viewState.selectedRowId
          ? 'explain_row_issue'
          : props.errorMessage
            ? 'explain_results'
            : 'review_results',
      contextScope: viewState.selectedField
        ? 'cell'
        : viewState.selectedRowId
          ? 'row'
          : selectedIssues.length > 0 || props.errorMessage
            ? 'issues'
            : 'job',
      pendingAction: undefined,
    }),
    [
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
    ],
  );

  const resetOverlays = useCallback(() => {
    closePanel();
    setExpandedImage(null);
  }, [closePanel, setExpandedImage]);

  const openPanel = useCallback(
    (panel: 'issues' | 'logs' | 'preview') => {
      setExpandedImage(null);
      openResultsPanel(panel);
    },
    [openResultsPanel, setExpandedImage],
  );

  async function handleOpenLogs() {
    try {
      await viewState.openLogs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron cargar los logs');
    }

    setExpandedImage(null);
    openResultsPanel('logs');
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        resetOverlays();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [resetOverlays]);

  useEffect(() => {
    resetOverlays();
  }, [location.pathname, resetOverlays]);

  useRouteOverlayCleanup(resetOverlays);

  function handleFocusRow(rowId: string) {
    openPanel('issues');

    window.setTimeout(() => {
      viewState.handleErrorClick(rowId);
    }, 0);
  }

  function handleFocusCell(rowId: string, field: ResultFieldKey) {
    viewState.focusCell(rowId, field);
    setExpandedImage(null);
    setFieldDetail(rowId, field);
  }

  function handleAskAssistant(rowId: string, field: ResultFieldKey) {
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
    <>
      <div className='min-h-[calc(100vh-8rem)] overflow-hidden rounded-[24px] border border-border/60 bg-card/90'>
        <div className='lg:grid lg:grid-cols-[minmax(0,1fr)_auto]'>
          <div className='min-w-0'>
            <ResultsTopBar
              fileName={props.fileName}
              status={props.status}
              totalImages={props.totalImages}
              totalRecords={props.totalRecords}
              diagnosticsSummary={props.diagnosticsSummary ?? null}
              errorCount={viewState.errorCount}
              autosaveLabel={autosaveLabel}
              autosaveStatus={autosave.autosave.status}
              isProcessing={props.isProcessing}
              isRefreshing={props.isRefreshing}
              isExporting={props.isExporting}
              isSavingCorrections={props.isSavingCorrections}
              excelUrl={props.excelUrl}
              canExport={canExport}
              canSaveCorrections={
                !props.isSavingCorrections &&
                !props.isProcessing &&
                props.status !== 'processing' &&
                viewState.hasUnsavedChanges
              }
              canRetryAutosave={autosave.autosave.status === 'error'}
              onProcess={props.onProcess}
              onReprocessFailed={props.onReprocessFailed}
              onRefresh={props.onRefresh}
              onExport={props.onExport}
              onSaveCorrections={() => {
                void props
                  .onSaveCorrections(viewState.data)
                  .then(() => viewState.markSaved())
                  .catch(() => undefined);
              }}
              onRetryAutosave={() => autosave.retry()}
              onOpenAssistant={() => {
                resetOverlays();
                props.onOpenAssistant({ context: assistantQueryContext });
              }}
              onOpenPanel={(panel) => {
                if (panel === 'logs') {
                  void handleOpenLogs();
                  return;
                }

                openPanel(panel);
              }}
            />
          </div>

          <div className='min-w-0 lg:row-span-3'>
            <ResultsSidePanel
              panelState={panelState}
              onClose={resetOverlays}
              onMinimize={minimizePanel}
              onRestore={restorePanel}
              jobId={props.jobId}
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
              reprocessingDepositId={reprocessingDepositId}
              onOpenImage={(image) => viewState.focusImage(image)}
              onFocusRow={handleFocusRow}
              onFocusCell={handleFocusCell}
              onEditField={handleFocusCell}
              onAskAssistant={props.onOpenAssistant}
              onReprocessDeposit={(depositId) => {
                void handleReprocessDeposit(depositId);
              }}
            />
          </div>

          <div className='min-w-0 border-t border-border/60 lg:col-start-1'>
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
          </div>
        </div>
      </div>

      <ResultsImagePreviewDialog
        open={Boolean(viewState.expandedImage)}
        image={viewState.expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </>
  );
}