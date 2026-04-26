/**
 * Despacha el contenido lateral de resultados según el panel activo.
 *
 * Este componente une errores, logs, detalle de campo y preview del documento
 * en un único contenedor acoplado al layout.
 */
import { ResultsDockPanel } from '@/features/processing/components/results/ResultsDockPanel';
import { ResultsErrorPanel } from '@/features/processing/components/results/ResultsErrorPanel';
import { ResultsFieldDetailContent } from '@/features/processing/components/results/ResultsFieldDetailPanel';
import { ResultsPreviewPanel } from '@/features/processing/components/results/ResultsPreviewPanel';
import type { AssistantLaunchContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';
import type { ResultsFieldDetailState, ResultsPanelMode, ResultsPanelState } from '@/features/processing/components/results/hooks/useResultsPanelState';
import { getFieldLabel } from '@/features/processing/components/results/results-validation';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
import type { ConsignmentRow, PreviewImage, ResultFieldKey } from '@/features/processing/types/processing.types';

interface ResultsSidePanelProps {
  panelState: ResultsPanelState;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  jobId: number;
  errorMessage: string;
  logs: ApiExtractionLog[];
  logsError: string | null;
  isLoadingLogs: boolean;
  sourceDocxUrl: string;
  sourceImages: PreviewImage[];
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  selectedRowId?: string | null;
  selectedField?: string | null;
  reprocessingDepositId?: number | null;
  onOpenImage: (image: PreviewImage) => void;
  onFocusRow: (rowId: string) => void;
  onFocusCell: (rowId: string, field: ResultFieldKey) => void;
  onEditField: (rowId: string, field: ResultFieldKey) => void;
  onAskAssistant: (launch: AssistantLaunchContext) => void;
  onReprocessDeposit: (depositId: number) => void;
}

function resolveTitle(mode: ResultsPanelMode, detailCell: ResultsFieldDetailState | null) {
  if (mode === 'issues') return 'Hallazgos';
  if (mode === 'logs') return 'Logs';
  if (mode === 'error') return 'Errores';
  if (mode === 'field-detail') return detailCell ? `Detalle de ${getFieldLabel(detailCell.field)}` : 'Detalle del campo';
  return 'Preview';
}

function resolveDescription(mode: ResultsPanelMode) {
  if (mode === 'preview') return 'Compara el resultado con el documento fuente.';
  if (mode === 'logs') return 'Traza técnica del procesamiento ejecutado.';
  if (mode === 'issues' || mode === 'error') return 'Revisa hallazgos y navega a la fila afectada.';
  return 'Inspecciona, corrige o reprocesa el dato seleccionado.';
}

export function ResultsSidePanel({
  panelState,
  onClose,
  onMinimize,
  onRestore,
  jobId,
  errorMessage,
  logs,
  logsError,
  isLoadingLogs,
  sourceDocxUrl,
  sourceImages,
  data,
  validationMap,
  selectedRowId,
  selectedField,
  reprocessingDepositId,
  onOpenImage,
  onFocusRow,
  onFocusCell,
  onEditField,
  onAskAssistant,
  onReprocessDeposit,
}: ResultsSidePanelProps) {
  if (!panelState.mode) return null;

  const detailRow = panelState.detailCell ? data.find((row) => row.id === panelState.detailCell?.rowId) ?? null : null;
  const detailField = panelState.detailCell?.field ?? null;

  return (
    <ResultsDockPanel
      panel={panelState.mode}
      state={panelState.minimized ? 'minimized' : 'open'}
      title={resolveTitle(panelState.mode, panelState.detailCell)}
      description={resolveDescription(panelState.mode)}
      onMinimize={onMinimize}
      onRestore={onRestore}
      onClose={onClose}
    >
      {panelState.mode === 'issues' || panelState.mode === 'error' ? (
        <div className='space-y-3 text-sm'>
          {errorMessage ? <p className='rounded-xl border border-border/60 bg-surface-subtle p-3 text-foreground'>{errorMessage}</p> : null}
          <ResultsErrorPanel
            data={data}
            validationMap={validationMap}
            selectedRowId={selectedRowId}
            selectedField={selectedField}
            onErrorClick={onFocusRow}
            onFocusCell={onFocusCell}
          />
        </div>
      ) : null}

      {panelState.mode === 'logs' ? (
        <div className='space-y-3 text-sm'>
          {isLoadingLogs ? <p className='text-muted-foreground'>Cargando logs...</p> : null}
          {logsError ? <p className='text-danger'>{logsError}</p> : null}
          {logs.map((log) => (
            <div key={log.id} className='rounded-xl border border-border/60 bg-surface-subtle p-3'>
              <p className='font-medium text-foreground'>#{log.sequence_index} · {log.stage}</p>
              <p className='mt-1 text-muted-foreground'>{log.notes || 'Sin notas adicionales.'}</p>
            </div>
          ))}
        </div>
      ) : null}

      {panelState.mode === 'field-detail' ? (
        <ResultsFieldDetailContent
          jobId={jobId}
          row={detailRow}
          field={detailField}
          validationMap={validationMap}
          reprocessingDepositId={reprocessingDepositId}
          onEdit={onEditField}
          onAskAssistant={onAskAssistant}
          onReprocessDeposit={onReprocessDeposit}
        />
      ) : null}

      {panelState.mode === 'preview' ? (
        <ResultsPreviewPanel
          fileName={sourceDocxUrl ? sourceDocxUrl.split('/').pop() ?? 'Documento' : 'Documento fuente'}
          sourceDocxUrl={sourceDocxUrl}
          sourceImages={sourceImages}
          validationMap={validationMap}
          selectedRowId={selectedRowId}
          onOpenImage={onOpenImage}
        />
      ) : null}
    </ResultsDockPanel>
  );
}
