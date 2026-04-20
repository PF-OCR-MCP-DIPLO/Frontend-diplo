import { toast } from 'sonner';
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
  const canExport = props.status === 'completed' || props.status === 'completed_with_errors' || Boolean(props.excelUrl);

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
            showChat={viewState.showChat}
            isProcessing={props.isProcessing}
            isRefreshing={props.isRefreshing}
            isExporting={props.isExporting}
            isLoadingLogs={viewState.isLoadingLogs}
            status={props.status}
            excelUrl={props.excelUrl}
            canShowErrors={viewState.errorCount > 0 || Boolean(props.errorMessage)}
            canExport={canExport}
            onToggleChat={() => viewState.setShowChat((value) => !value)}
            onRefresh={props.onRefresh}
            onProcess={props.onProcess}
            onExport={props.onExport}
            onOpenLogs={() => void handleOpenLogs()}
            onOpenErrors={() => viewState.setShowErrorDialog(true)}
          />
        </div>
      </section>

      <ResultsSummary errorCount={viewState.errorCount} totalImages={props.totalImages} totalRecords={props.totalRecords} />

      {viewState.errorCount > 0 || props.errorMessage ? (
        <ResultsErrorPanel data={viewState.data} onErrorClick={viewState.handleErrorClick} />
      ) : null}

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]'>
        <section className='flex min-h-[680px] flex-col gap-4' aria-label='Validacion visual del documento'>
          <div className='px-1'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Validacion visual</p>
            <h3 className='mt-1 text-lg font-semibold tracking-tight text-slate-900'>Documento fuente</h3>
            <p className='text-sm text-slate-600'>Compara el material original con lo extraido para detectar inconsistencias.</p>
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
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Revision tabular</p>
            <h3 className='mt-1 text-lg font-semibold tracking-tight text-slate-900'>Datos editables</h3>
            <p className='text-sm text-slate-600'>Ajusta filas, valida campos y deja lista la salida para exportacion.</p>
          </div>
          <div className='rounded-[28px] border border-slate-200 bg-white/90 p-3 shadow-sm'>
            <EditableTable data={viewState.data} onDataChange={viewState.setData} />
          </div>
          {viewState.showChat ? <ResultsChatPanel errors={viewState.errorCount} /> : null}
        </section>
      </div>

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
