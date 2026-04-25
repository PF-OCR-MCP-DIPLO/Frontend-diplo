import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AssistantLaunchContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';
import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
import type { ConsignmentRow, PreviewImage, ResultFieldKey } from '@/features/processing/types/processing.types';
import type { FieldValidationIssue, ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { ResultsErrorPanel } from '@/features/processing/components/results/ResultsErrorPanel';
import { getCellIssueSummary, getFieldLabel, getRowFieldIssues } from '@/features/processing/components/results/results-validation';
import { ResultsPreviewPanel } from '@/features/processing/components/results/ResultsPreviewPanel';

export type ResultsPanel = 'issues' | 'logs' | 'preview' | 'fieldDetail' | null;

interface DetailCellState {
  rowId: string;
  field: ResultFieldKey;
}

interface ResultsSidePanelProps {
  panel: ResultsPanel;
  onClose: () => void;
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
  detailCell: DetailCellState | null;
  reprocessingDepositId?: number | null;
  onOpenImage: (image: PreviewImage) => void;
  onFocusRow: (rowId: string) => void;
  onFocusCell: (rowId: string, field: ResultFieldKey) => void;
  onEditField: (rowId: string, field: ResultFieldKey) => void;
  onAskAssistant: (launch: AssistantLaunchContext) => void;
  onReprocessDeposit: (depositId: number) => void;
}

function issueSummary(issues: FieldValidationIssue[]) {
  return issues.length > 0 ? issues.map((issue) => issue.message).join(' ') : 'Sin errores detectados.';
}

export function ResultsSidePanel({
  panel,
  onClose,
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
  detailCell,
  reprocessingDepositId,
  onOpenImage,
  onFocusRow,
  onFocusCell,
  onEditField,
  onAskAssistant,
  onReprocessDeposit,
}: ResultsSidePanelProps) {
  if (!panel) return null;

  const detailRow = detailCell ? data.find((row) => row.id === detailCell.rowId) ?? null : null;
  const detailField = detailCell?.field ?? null;
  const detailIssues = detailRow && detailField ? getRowFieldIssues(validationMap, detailRow.id, detailField as ResultFieldKey, detailRow) : [];
  const detailSummary = detailRow && detailField ? getCellIssueSummary(detailRow, detailField as ResultFieldKey, detailIssues) : null;
  const title = panel === 'issues' ? 'Hallazgos' : panel === 'logs' ? 'Logs' : panel === 'fieldDetail' ? 'Detalle del campo' : 'Preview';

  return (
    <aside
      className='fixed inset-y-0 right-0 z-40 flex w-full max-w-[min(100vw,440px)] flex-col border-l border-border/70 bg-background/96 shadow-[var(--shadow-floating)] backdrop-blur lg:absolute lg:inset-y-0 lg:z-20 lg:max-w-none'
      aria-label={`Panel ${title}`}
      data-testid='results-side-panel'
      data-panel={panel}
    >
      <div className='flex items-center justify-between border-b border-border/60 px-4 py-3'>
        <p className='text-sm font-medium text-foreground'>{title}</p>
        <Button type='button' variant='ghost' size='icon' onClick={onClose} aria-label='Cerrar panel'>
          <X className='size-4' />
        </Button>
      </div>
      <div className='min-h-0 flex-1'>
        {panel === 'issues' ? (
          <ScrollArea className='h-full p-4'>
            <div className='space-y-3 text-sm'>
              {errorMessage ? <p className='rounded-xl border border-border/60 bg-surface-subtle p-3 text-foreground'>{errorMessage}</p> : null}
              <ResultsErrorPanel data={data} validationMap={validationMap} selectedRowId={selectedRowId} selectedField={selectedField} onErrorClick={onFocusRow} onFocusCell={onFocusCell} />
            </div>
          </ScrollArea>
        ) : panel === 'logs' ? (
          <ScrollArea className='h-full p-4'>
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
          </ScrollArea>
        ) : panel === 'fieldDetail' && detailRow && detailField && detailSummary ? (
          <ScrollArea className='h-full p-4'>
            <div className='space-y-4 text-sm'>
              <section className='rounded-2xl border border-border/60 bg-surface-subtle p-3'>
                <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Campo</p>
                <p className='mt-1 text-foreground'>{getFieldLabel(detailField as ResultFieldKey)} · Fila {detailRow.referencia || detailRow.id}</p>
              </section>
              <section className='rounded-2xl border border-border/60 bg-surface-subtle p-3'>
                <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Valor actual</p>
                <p className='mt-1 text-foreground'>{String(detailRow[detailField]) || '—'}</p>
              </section>
              <section className='rounded-2xl border border-danger/20 bg-surface-danger p-3'>
                <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Error</p>
                <p className='mt-1 text-danger'>{issueSummary(detailIssues)}</p>
              </section>
              <section className='rounded-2xl border border-border/60 bg-surface-subtle p-3'>
                <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Sugerencia</p>
                <p className='mt-1 text-foreground'>{detailSummary.correctionHint}</p>
              </section>
              <div className='grid gap-2'>
                <Button type='button' className='w-full justify-start' variant='outline' onClick={() => onEditField(detailRow.id, detailField)}>
                  Editar
                </Button>
                <Button
                  type='button'
                  className='w-full justify-start'
                  variant='outline'
                  onClick={() =>
                    onAskAssistant({
                      prompt: `Explícame cómo corregir ${String(detailField)} en la fila ${detailRow.id}.`,
                      context: {
                        page: 'results',
                        jobId,
                        selectedRowId: detailRow.id,
                        selectedField: String(detailField),
                        depositId: detailRow.depositId,
                        sourceImageId: detailRow.sourceImageId,
                        currentImageId: detailRow.sourceImageId,
                        contextScope: 'cell',
                        intentHint: 'explain_cell_issue',
                      },
                    })
                  }
                >
                  Preguntar al asistente
                </Button>
                <Button type='button' className='w-full justify-start' onClick={() => onReprocessDeposit(detailRow.depositId)} disabled={reprocessingDepositId === detailRow.depositId}>
                  {reprocessingDepositId === detailRow.depositId ? 'Reprocesando…' : 'Reprocesar esta consignación'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className='h-full p-4'>
            <ResultsPreviewPanel
              fileName={sourceDocxUrl ? sourceDocxUrl.split('/').pop() ?? 'Documento' : 'Documento fuente'}
              sourceDocxUrl={sourceDocxUrl}
              sourceImages={sourceImages}
              validationMap={validationMap}
              selectedRowId={selectedRowId}
              onOpenImage={onOpenImage}
            />
          </ScrollArea>
        )}
      </div>
    </aside>
  );
}
