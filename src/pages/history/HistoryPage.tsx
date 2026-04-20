import { AlertCircle, CheckCircle2, Eye, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProcessing } from '@/features/processing/hooks/useProcessingContext';
import { statusClass, statusLabel } from '@/lib/constants/status';
import { formatDateTime } from '@/lib/utils/format';

export function HistoryPage() {
  const navigate = useNavigate();
  const { processedFiles, selectResult, isLoadingHistory, refreshHistory } = useProcessing();

  async function handleViewFile(id: string) {
    try {
      const selected = await selectResult(id);
      if (selected) navigate('/results');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo abrir el job');
    }
  }

  async function handleRefresh() {
    try {
      await refreshHistory();
      toast.success('Historial actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el historial');
    }
  }

  if (isLoadingHistory) {
    return <div className='flex h-full items-center justify-center text-slate-600'><Loader2 className='mr-2 size-4 animate-spin' />Cargando historial...</div>;
  }

  if (processedFiles.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='max-w-md rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm'>
          <h2 className='mb-2 text-lg font-semibold text-slate-900'>Aun no hay jobs procesados</h2>
          <p className='mb-6 text-sm text-slate-600'>Sube tu primer archivo para comenzar.</p>
          <Button onClick={() => navigate('/upload')}>Procesar un archivo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        eyebrow='History'
        title='Historial de jobs'
        description='Revisa documentos anteriores, consulta estado y abre cualquier ejecucion para seguir trabajando.'
        actions={<Button variant='outline' onClick={() => void handleRefresh()}>Actualizar</Button>}
      />
      <Card className='overflow-hidden rounded-[32px] border-slate-200 shadow-sm'>
        <div className='overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className='text-right'>Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedFiles.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <FileText className='size-4 text-slate-500' />
                      <span className='font-medium'>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className='text-slate-600'>{formatDateTime(item.date)}</span></TableCell>
                  <TableCell>
                    <Badge variant='outline' className={`gap-1 ${statusClass[item.status] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                      {item.displayStatus === 'success' ? <CheckCircle2 className='size-3' /> : <AlertCircle className='size-3' />}
                      {statusLabel[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button variant='outline' size='sm' onClick={() => void handleViewFile(item.id)} className='gap-2'>
                      <Eye className='size-4' />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
