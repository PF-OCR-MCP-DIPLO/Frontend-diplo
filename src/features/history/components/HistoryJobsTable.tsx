import { AlertCircle, CheckCircle2, Eye, FileDown, FileText, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils/format';
import type { HistoryListItem } from '@/features/history/types/history.types';

interface HistoryJobsTableProps {
  items: HistoryListItem[];
  deletingJobId?: number | null;
  processingJobId?: number | null;
  exportingJobId?: number | null;
  onOpenResult: (id: string) => void;
  onProcessJob: (jobId: number) => void;
  onReprocessFailedJob: (jobId: number) => void;
  onExportJob: (jobId: number) => void;
  onDeleteJob: (jobId: number) => void;
}

function canExport(status: HistoryListItem['status']) {
  return status === 'completed' || status === 'completed_with_errors';
}

export function HistoryJobsTable({
  items,
  deletingJobId,
  processingJobId,
  exportingJobId,
  onOpenResult,
  onProcessJob,
  onReprocessFailedJob,
  onExportJob,
  onDeleteJob,
}: HistoryJobsTableProps) {
  return (
    <Card className='overflow-hidden'>
      <div className='border-b border-border/70 px-5 py-4'>
        <h2 className='font-semibold text-foreground'>Ejecuciones</h2>
        <p className='text-sm text-muted-foreground'>{items.length} resultado{items.length === 1 ? '' : 's'} disponible{items.length === 1 ? '' : 's'}.</p>
      </div>
      <div className='max-h-[calc(100vh-20rem)] overflow-auto'>
        <Table className='min-w-[860px]'>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isDeleting = deletingJobId === item.jobId;
              const isProcessing = processingJobId === item.jobId;
              const isExporting = exportingJobId === item.jobId;
              const isBusy = isDeleting || isProcessing || isExporting;
              const processingLabel = item.status === 'completed_with_errors' ? 'Reprocesar fallidos' : item.status === 'completed' ? 'Procesar de nuevo' : 'Procesar';

              return (
                <TableRow key={item.id} className='cursor-pointer' onClick={() => onOpenResult(item.id)}>
                  <TableCell className='min-w-0'>
                    <div className='flex items-center gap-3'>
                      <div className='icon-chip-primary size-9 shrink-0'>
                        <FileText className='size-4' />
                      </div>
                      <span className='block truncate font-medium text-foreground'>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <span className='text-muted-foreground'>{formatDateTime(item.date)}</span>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      {item.displayStatus === 'success' ? <CheckCircle2 className='size-3' /> : <AlertCircle className='size-3' />}
                      <StatusBadge status={item.status} />
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2 whitespace-nowrap'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenResult(item.id);
                        }}
                        className='gap-2'
                        disabled={isBusy}
                      >
                        <Eye className='size-4' />
                        Abrir
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={(event) => {
                          event.stopPropagation();
                          if (item.status === 'completed_with_errors') {
                            onReprocessFailedJob(item.jobId);
                          } else {
                            onProcessJob(item.jobId);
                          }
                        }}
                        className='gap-2'
                        disabled={isBusy || item.status === 'processing'}
                        aria-label={`${processingLabel} ejecución ${item.name || item.jobId}`}
                      >
                        <Play className='size-4' />
                        {isProcessing ? 'Procesando…' : processingLabel}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={(event) => {
                          event.stopPropagation();
                          onExportJob(item.jobId);
                        }}
                        className='gap-2'
                        disabled={isBusy || !canExport(item.status)}
                        aria-label={`Exportar ejecución ${item.name || item.jobId}`}
                      >
                        <FileDown className='size-4' />
                        {isExporting ? 'Exportando…' : 'Exportar'}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteJob(item.jobId);
                        }}
                        className='gap-2 text-danger hover:text-danger'
                        disabled={isDeleting || item.status === 'processing'}
                        aria-label={`Eliminar ejecución ${item.name || item.jobId}`}
                      >
                        <Trash2 className='size-4' />
                        {isDeleting ? 'Eliminando…' : 'Eliminar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
