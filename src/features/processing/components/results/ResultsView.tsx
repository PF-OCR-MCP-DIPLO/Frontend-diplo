import { toast } from 'sonner';
import { DocumentPreview } from '@/features/processing/components/document-preview/DocumentPreview';
import { EditableTable } from '@/features/processing/components/editable-table/EditableTable';
import { ResultsActions } from '@/features/processing/components/results/ResultsActions';
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
      <section className='rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
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
            isLoadingLogs={viewState.isLoadingLogs}
            status={props.status}
            excelUrl={props.excelUrl}
            canShowErrors={viewState.errorCount > 0 || Boolean(props.errorMessage)}
            canExport={canExport}
            onRefresh={props.onRefresh}
            onProcess={props.onProcess}
            onExport={props.onExport}
            onOpenLogs={() => void handleOpenLogs()}
            onOpenErrors={() => viewState.setShowErrorDialog(true)}
          />
        </div>
      </section>

      <ResultsSummary errorCount={viewState.errorCount} totalImages={props.totalImages} totalRecords={props.totalRecords} />

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
        <div className='flex min-h-[720px] flex-col gap-6'>
          <div className='flex-1'>
            <DocumentPreview
              fileName={props.fileName}
              sourceDocxUrl={props.sourceDocxUrl}
              images={props.sourceImages}
              onOpenImage={(image) => viewState.setExpandedImage({ url: image.url, name: image.name })}
            />
          </div>
          {viewState.errorCount > 0 || props.errorMessage ? (
            <ResultsErrorPanel data={viewState.data} onErrorClick={viewState.handleErrorClick} />
          ) : null}
        </div>

        <div className='flex min-h-[720px] flex-col gap-6'>
          <div className='flex-1'>
            <EditableTable data={viewState.data} onDataChange={viewState.setData} />
          </div>
        </div>
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
