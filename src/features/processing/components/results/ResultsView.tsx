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
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';

interface ResultsViewProps {
  jobId: number;
  fileName: string;
  sourceDocxUrl: string;
  sourceImages: PreviewImage[];
  initialData: ConsignmentRow[];
  status: string;
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
            showChat={viewState.showChat}
            isProcessing={props.isProcessing}
            isRefreshing={props.isRefreshing}
            isExporting={props.isExporting}
            status={props.status}
            excelUrl={props.excelUrl}
            canShowErrors={viewState.errorCount > 0 || Boolean(props.errorMessage)}
            onToggleChat={() => viewState.setShowChat((value) => !value)}
            onRefresh={props.onRefresh}
            onProcess={props.onProcess}
            onExport={props.onExport}
            onOpenLogs={() => void viewState.openLogs()}
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
          {viewState.showChat ? <ResultsChatPanel errors={viewState.errorCount} /> : null}
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
        onClose={() => viewState.setShowLogsDialog(false)}
      />
    </div>
  );
}
