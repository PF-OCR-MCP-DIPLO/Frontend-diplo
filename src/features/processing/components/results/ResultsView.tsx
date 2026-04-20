import { MessageSquare, ScrollText, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DocumentPreview } from '@/features/processing/components/document-preview/DocumentPreview';
import { EditableTable } from '@/features/processing/components/editable-table/EditableTable';
import { ResultsActions } from '@/features/processing/components/results/ResultsActions';
import { ResultsChatPanel } from '@/features/processing/components/results/ResultsChatPanel';
import { ResultsErrorDialog } from '@/features/processing/components/results/ResultsErrorDialog';
import { ResultsErrorPanel } from '@/features/processing/components/results/ResultsErrorPanel';
import { ResultsHeader } from '@/features/processing/components/results/ResultsHeader';
import { ResultsImagePreviewDialog } from '@/features/processing/components/results/ResultsImagePreviewDialog';
import { ResultsLogsDialog } from '@/features/processing/components/results/ResultsLogsDialog';
import { ResultsSummary } from '@/features/processing/components/results/ResultsSummary';
import { useResultsViewState } from '@/features/processing/components/results/hooks/useResultsViewState';
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
  onProcess: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export function ResultsView(props: ResultsViewProps) {
  const viewState = useResultsViewState(props.jobId, props.initialData);
  const [workspaceSection, setWorkspaceSection] = useState<'review' | 'tools'>('review');
  const canExport = props.status === 'completed' || props.status === 'completed_with_errors' || Boolean(props.excelUrl);
  const errorRows = viewState.data.filter((row) => row.estado === 'error');
  const topErrorRows = errorRows.slice(0, 4);

  async function handleOpenLogs() {
    try {
      await viewState.openLogs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron cargar los logs');
      viewState.setShowLogsDialog(true);
    }
  }

  return (
    <div className='space-y-6'>
      <section className='rounded-[36px] border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/70 backdrop-blur'>
        <div className='flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between'>
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

      <section className='rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-slate-600'>Flujo de trabajo recomendado: revisar evidencia visual, ajustar tabla, resolver hallazgos y cerrar exportacion.</p>
          <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant={workspaceSection === 'review' ? 'default' : 'outline'}
            className='rounded-2xl'
            onClick={() => setWorkspaceSection('review')}
            aria-pressed={workspaceSection === 'review'}
          >
            Flujo principal de revision
          </Button>
          <Button
            type='button'
            variant={workspaceSection === 'tools' ? 'default' : 'outline'}
            className='rounded-2xl'
            onClick={() => setWorkspaceSection('tools')}
            aria-pressed={workspaceSection === 'tools'}
          >
            Hallazgos y herramientas tecnicas
          </Button>
          </div>
        </div>
      </section>

      {workspaceSection === 'review' ? (
        <div className='grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]'>
          <section className='flex min-h-[680px] flex-col gap-4' aria-label='Validacion visual del documento'>
            <div className='px-1'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Bloque 1</p>
              <h3 className='mt-1 text-lg font-semibold tracking-tight text-slate-900'>Revisa el documento fuente</h3>
              <p className='text-sm text-slate-600'>Confirma origen, calidad OCR y coherencia visual antes de editar datos.</p>
            </div>
            <div className='rounded-[28px] border border-slate-200 bg-white/90 p-3 shadow-sm'>
              <DocumentPreview
                fileName={props.fileName}
                sourceDocxUrl={props.sourceDocxUrl}
                images={props.sourceImages}
                onOpenImage={(image) => viewState.setExpandedImage({ url: image.url, name: image.name })}
              />
            </div>
          </section>

          <section className='flex min-h-[680px] flex-col gap-4' aria-label='Revision tabular de datos'>
            <div className='px-1'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Bloque 2</p>
              <h3 className='mt-1 text-lg font-semibold tracking-tight text-slate-900'>Edita y valida registros</h3>
              <p className='text-sm text-slate-600'>Ajusta filas, resuelve errores y prepara salida exportable.</p>
            </div>
            <div className='rounded-[28px] border border-slate-200 bg-white/90 p-3 shadow-sm'>
              <EditableTable data={viewState.data} onDataChange={viewState.setData} onRowClick={(row) => viewState.handleErrorClick(row.id)} />
            </div>
            <section className='rounded-[24px] border border-slate-200 bg-slate-50/80 p-4'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.14em] text-slate-400'>Bloque 3</p>
                  <h4 className='mt-1 font-semibold text-slate-900'>Hallazgos prioritarios</h4>
                  <p className='text-sm text-slate-600'>Resuelve primero estos puntos para reducir retrabajo antes de exportar.</p>
                </div>
                <Button variant='outline' className='rounded-2xl' onClick={() => setWorkspaceSection('tools')}>
                  Abrir panel tecnico
                </Button>
              </div>
              {topErrorRows.length > 0 ? (
                <div className='mt-4 space-y-2'>
                  {topErrorRows.map((row) => (
                    <button
                      key={row.id}
                      type='button'
                      className='flex w-full items-center justify-between rounded-2xl border border-red-200 bg-white px-3 py-2 text-left transition hover:bg-red-50/60'
                      onClick={() => viewState.handleErrorClick(row.id)}
                    >
                      <span className='truncate text-sm font-medium text-slate-900'>{row.referencia || 'Fila sin referencia'}</span>
                      <span className='text-xs font-semibold text-red-700'>{row.errors.length} observaciones</span>
                    </button>
                  ))}
                  {errorRows.length > topErrorRows.length ? (
                    <p className='pt-1 text-xs text-slate-500'>+{errorRows.length - topErrorRows.length} hallazgos adicionales en el panel tecnico.</p>
                  ) : null}
                </div>
              ) : (
                <div className='mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800'>
                  No hay hallazgos pendientes en la tabla actual.
                </div>
              )}
            </section>
          </section>
        </div>
      ) : (
        <section className='grid gap-6 xl:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]' aria-label='Herramientas tecnicas y hallazgos'>
          <div className='space-y-6'>
            {viewState.errorCount > 0 || props.errorMessage ? (
              <ResultsErrorPanel data={viewState.data} onErrorClick={viewState.handleErrorClick} />
            ) : (
              <section className='rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-5'>
                <h3 className='text-lg font-semibold text-emerald-900'>Sin hallazgos pendientes</h3>
                <p className='mt-2 text-sm text-emerald-800'>La tabla actual no reporta errores. Puedes continuar con validacion final y exportacion.</p>
              </section>
            )}
            {viewState.showChat ? <ResultsChatPanel errors={viewState.errorCount} /> : null}
          </div>

          <aside className='space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.16em] text-slate-400'>Herramientas secundarias</p>
              <h3 className='mt-1 text-lg font-semibold tracking-tight text-slate-900'>Evidencia y apoyo tecnico</h3>
              <p className='mt-1 text-sm text-slate-600'>Abre logs, inspecciona hallazgos y usa asistencia solo cuando haga falta.</p>
            </div>
            <div className='space-y-2'>
              <Button variant='outline' className='w-full justify-start gap-2 rounded-2xl' onClick={() => viewState.setShowErrorDialog(true)} disabled={viewState.errorCount === 0 && !props.errorMessage}>
                <XCircle className='size-4' />
                Ver hallazgos en detalle
              </Button>
              <Button variant='outline' className='w-full justify-start gap-2 rounded-2xl' onClick={() => void handleOpenLogs()} disabled={viewState.isLoadingLogs}>
                <ScrollText className='size-4' />
                {viewState.isLoadingLogs ? 'Cargando logs...' : 'Consultar logs'}
              </Button>
              <Button variant='outline' className='w-full justify-start gap-2 rounded-2xl' onClick={() => setWorkspaceSection('review')}>
                <MessageSquare className='size-4' />
                Volver a revision principal
              </Button>
              <Button className='w-full gap-2 rounded-2xl' onClick={() => viewState.setShowChat((value) => !value)}>
                <MessageSquare className='size-4' />
                {viewState.showChat ? 'Ocultar asistente' : 'Mostrar asistente'}
              </Button>
            </div>
          </aside>
        </section>
      )}

      <ResultsErrorDialog
        open={viewState.showErrorDialog}
        errorMessage={props.errorMessage}
        data={viewState.data}
        onClose={() => viewState.setShowErrorDialog(false)}
        onErrorClick={viewState.handleErrorClick}
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
