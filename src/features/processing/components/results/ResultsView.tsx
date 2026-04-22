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
  isSavingCorrections: boolean;
  onProcess: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onSaveCorrections: (rows: ConsignmentRow[]) => Promise<void>;
}

export function ResultsView(props: ResultsViewProps) {
  const viewState = useResultsViewState(props.jobId, props.initialData);
  const [primaryView, setPrimaryView] = useState<'table' | 'preview'>('table');
  const [showIssues, setShowIssues] = useState(props.errorMessage.length > 0 || props.initialData.some((row) => row.estado === 'error'));
  const [showTools, setShowTools] = useState(false);
  const canExport = (props.status === 'completed' || props.status === 'completed_with_errors' || Boolean(props.excelUrl)) && !viewState.hasUnsavedChanges;
  const canSaveCorrections = !props.isSavingCorrections && !props.isProcessing && props.status !== 'processing' && viewState.hasUnsavedChanges;

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

      <section className='surface-card p-4 md:p-5'>
        <div className='flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='section-kicker'>Revision principal</p>
            <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Trabaja sobre una vista a la vez.</h3>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant={primaryView === 'table' ? 'default' : 'outline'}
              onClick={() => setPrimaryView('table')}
              aria-pressed={primaryView === 'table'}
            >
              Tabla
            </Button>
            <Button
              type='button'
              variant={primaryView === 'preview' ? 'default' : 'outline'}
              onClick={() => setPrimaryView('preview')}
              aria-pressed={primaryView === 'preview'}
            >
              Vista previa
            </Button>
          </div>
        </div>
        <div className='pt-4'>
          {primaryView === 'table' ? (
            <EditableTable data={viewState.data} onDataChange={viewState.setData} onRowClick={(row) => handleFocusRow(row.id)} />
          ) : (
            <DocumentPreview
              fileName={props.fileName}
              sourceDocxUrl={props.sourceDocxUrl}
              images={props.sourceImages}
              onOpenImage={(image) => viewState.setExpandedImage({ url: image.url, name: image.name })}
            />
          )}
        </div>
      </section>

      <section className='content-block p-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h4 className='font-semibold text-foreground'>Guardar cambios</h4>
            <p className='text-sm text-muted-foreground'>
              {viewState.hasUnsavedChanges
                ? 'Tienes cambios pendientes. Guardalos antes de exportar.'
                : 'La tabla esta sincronizada con el backend.'}
            </p>
          </div>
          <Button
            type='button'
            disabled={!canSaveCorrections}
            onClick={() =>
              void props
                .onSaveCorrections(viewState.data)
                .then(() => viewState.markSaved())
                .catch(() => undefined)
            }
          >
            {props.isSavingCorrections ? 'Guardando...' : 'Guardar correcciones'}
          </Button>
        </div>
      </section>

      <div className='grid gap-4 xl:grid-cols-2'>
        <section className='surface-card p-5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='section-kicker'>Secundario</p>
              <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Hallazgos</h3>
            </div>
            <Button variant='ghost' size='sm' onClick={() => setShowIssues((value) => !value)}>
              {showIssues ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          {showIssues ? (
            <div className='mt-4 space-y-4'>
              {props.errorMessage ? <div className='notice-warning'>{props.errorMessage}</div> : null}
              {viewState.errorCount > 0 ? (
                <>
                  <ResultsErrorPanel data={viewState.data} onErrorClick={handleFocusRow} />
                  <Button variant='outline' className='gap-2' onClick={() => viewState.setShowErrorDialog(true)}>
                    <XCircle className='size-4' />
                    Ver detalle completo
                  </Button>
                </>
              ) : (
                <div className='notice-success'>No hay hallazgos pendientes.</div>
              )}
            </div>
          ) : null}
        </section>

        <section className='surface-card p-5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='section-kicker'>Secundario</p>
              <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Herramientas</h3>
            </div>
            <Button variant='ghost' size='sm' onClick={() => setShowTools((value) => !value)}>
              {showTools ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          {showTools ? (
            <div className='mt-4 space-y-3'>
              <div className='flex flex-wrap gap-2'>
                <Button variant='outline' className='gap-2' onClick={() => void handleOpenLogs()} disabled={viewState.isLoadingLogs}>
                  <ScrollText className='size-4' />
                  {viewState.isLoadingLogs ? 'Cargando logs...' : 'Ver logs'}
                </Button>
                <Button variant='outline' className='gap-2' onClick={() => viewState.setShowChat((value) => !value)}>
                  <MessageSquare className='size-4' />
                  {viewState.showChat ? 'Ocultar asistente' : 'Mostrar asistente'}
                </Button>
              </div>
              {viewState.showChat ? <ResultsChatPanel errors={viewState.errorCount} /> : null}
            </div>
          ) : null}
        </section>
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
