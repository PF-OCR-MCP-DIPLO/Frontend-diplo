import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { ResultsErrorPanel } from '@/features/processing/components/results/ResultsErrorPanel';
import { ResultsPreviewPanel } from '@/features/processing/components/results/ResultsPreviewPanel';

export type ResultsPanel = 'issues' | 'logs' | 'preview' | null;

interface ResultsSidePanelProps {
  panel: ResultsPanel;
  onClose: () => void;
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
  onOpenImage: (image: PreviewImage) => void;
  onFocusRow: (rowId: string) => void;
  onFocusCell: (rowId: string, field: keyof ConsignmentRow) => void;
}

export function ResultsSidePanel({
  panel,
  onClose,
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
  onOpenImage,
  onFocusRow,
  onFocusCell,
}: ResultsSidePanelProps) {
  if (!panel) return null;

  return (
    <aside className='fixed inset-y-0 right-0 z-40 flex w-full max-w-[min(92vw,440px)] flex-col border-l border-border/70 bg-background/96 shadow-[var(--shadow-floating)] backdrop-blur md:absolute'>
      <div className='flex items-center justify-between border-b border-border/60 px-4 py-3'>
        <p className='text-sm font-medium text-foreground'>
          {panel === 'issues' ? 'Hallazgos' : panel === 'logs' ? 'Logs' : 'Preview'}
        </p>
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
                  <p className='font-medium text-foreground'>{log.message}</p>
                </div>
              ))}
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
