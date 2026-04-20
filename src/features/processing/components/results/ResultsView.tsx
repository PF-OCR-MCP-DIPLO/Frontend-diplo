import { useEffect, useMemo, useState } from 'react';
import { getJobLogs } from '@/features/processing/api/processing.api';
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
import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
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

export function ResultsView({
  jobId,
  fileName,
  sourceDocxUrl,
  sourceImages,
  initialData,
  status,
  totalImages,
  totalRecords,
  errorMessage,
  excelUrl,
  isProcessing,
  isRefreshing,
  isExporting,
  onProcess,
  onRefresh,
  onExport,
}: ResultsViewProps) {
  const [data, setData] = useState<ConsignmentRow[]>(initialData);
  const [showChat, setShowChat] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);
  const [logs, setLogs] = useState<ApiExtractionLog[]>([]);
  const [showLogsDialog, setShowLogsDialog] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const errorCount = useMemo(() => data.filter((row) => row.estado === 'error').length, [data]);

  function handleErrorClick(rowId: string) {
    const element = document.getElementById(rowId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function handleOpenLogs() {
    const payload = await getJobLogs(jobId);
    setLogs(payload);
    setShowLogsDialog(true);
  }

  return (
    <div className='space-y-6'>
      <section className='rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <ResultsHeader
            fileName={fileName}
            status={status}
            totalImages={totalImages}
            totalRecords={totalRecords}
            errorMessage={errorMessage}
          />
          <ResultsActions
            showChat={showChat}
            isProcessing={isProcessing}
            isRefreshing={isRefreshing}
            isExporting={isExporting}
            status={status}
            excelUrl={excelUrl}
            canShowErrors={errorCount > 0 || Boolean(errorMessage)}
            onToggleChat={() => setShowChat((value) => !value)}
            onRefresh={onRefresh}
            onProcess={onProcess}
            onExport={onExport}
            onOpenLogs={() => void handleOpenLogs()}
            onOpenErrors={() => setShowErrorDialog(true)}
          />
        </div>
      </section>

      <ResultsSummary errorCount={errorCount} totalImages={totalImages} totalRecords={totalRecords} />

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
        <div className='flex min-h-[720px] flex-col gap-6'>
          <div className='flex-1'>
            <DocumentPreview
              fileName={fileName}
              sourceDocxUrl={sourceDocxUrl}
              images={sourceImages}
              onOpenImage={(image) => setExpandedImage({ url: image.url, name: image.name })}
            />
          </div>
          {(errorCount > 0 || errorMessage) ? <ResultsErrorPanel data={data} onErrorClick={handleErrorClick} /> : null}
        </div>

        <div className='flex min-h-[720px] flex-col gap-6'>
          <div className='flex-1'>
            <EditableTable data={data} onDataChange={setData} />
          </div>
          {showChat ? <ResultsChatPanel errors={errorCount} /> : null}
        </div>
      </div>

      <ResultsErrorDialog
        open={showErrorDialog}
        errorMessage={errorMessage}
        data={data}
        onClose={() => setShowErrorDialog(false)}
        onErrorClick={handleErrorClick}
      />
      <ResultsImagePreviewDialog open={Boolean(expandedImage)} image={expandedImage} onClose={() => setExpandedImage(null)} />
      <ResultsLogsDialog open={showLogsDialog} logs={logs} onClose={() => setShowLogsDialog(false)} />
    </div>
  );
}
