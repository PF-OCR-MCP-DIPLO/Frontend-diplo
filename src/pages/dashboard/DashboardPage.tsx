import { AlertTriangle, Clock, FileUp, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOpenResult } from '@/features/processing/hooks/useOpenResult';
import { useProcessingActionsContext, useProcessingStateContext } from '@/features/processing/hooks/useProcessingContext';
import { statusClass, statusLabel } from '@/lib/constants/status';

export function DashboardPage() {
  const navigate = useNavigate();
  const openResult = useOpenResult();
  const { refreshHistory } = useProcessingActionsContext();
  const { processedFiles, isLoadingHistory, historyError } = useProcessingStateContext();

  return (
    <div className='space-y-6'>
      <PageHeader
        eyebrow='Overview'
        title='Dashboard de procesamiento'
        description='Gestiona cargas, monitorea jobs recientes y entra rapido al ultimo resultado relevante.'
        actions={<Button onClick={() => navigate('/upload')} className='gap-2'><FileUp className='size-4' />Cargar .docx</Button>}
      />

      <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
        <Card className='rounded-[32px] border-slate-200 p-8 shadow-sm'>
          <div className='max-w-xl space-y-5'>
            <div className='flex size-20 items-center justify-center rounded-[28px] bg-teal-50'>
              <FileUp className='size-10 text-teal-700' />
            </div>
            <div>
              <h2 className='text-3xl font-semibold text-slate-900'>Carga y procesa consignaciones con un flujo mas claro.</h2>
              <p className='mt-3 text-slate-600'>La app ahora separa mejor la navegacion, resultados, configuracion y capa de datos para facilitar mantenimiento y extension.</p>
            </div>
            <Button size='lg' className='h-14 rounded-2xl px-6' onClick={() => navigate('/upload')}>Subir documento</Button>
          </div>
        </Card>

        <Card className='rounded-[32px] border-slate-200 p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Clock className='size-5 text-slate-500' />
              <h3 className='font-semibold text-slate-900'>Jobs recientes</h3>
            </div>
            <Button variant='ghost' size='sm' onClick={() => navigate('/history')} className='text-teal-700'>Ver historial</Button>
          </div>
          {isLoadingHistory ? (
            <div className='flex items-center justify-center py-10 text-slate-600'>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Cargando jobs...
            </div>
          ) : historyError ? (
            <div className='rounded-3xl border border-amber-200 bg-amber-50 p-4'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 size-5 text-amber-600' />
                <div className='space-y-3'>
                  <div>
                    <p className='font-medium text-slate-900'>No pudimos cargar el historial</p>
                    <p className='text-sm text-slate-700'>{historyError}</p>
                  </div>
                  <Button variant='outline' onClick={() => void refreshHistory()} className='gap-2'>
                    <RefreshCw className='size-4' />
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          ) : processedFiles.length === 0 ? (
            <p className='text-sm text-slate-600'>Todavia no hay jobs creados en el backend.</p>
          ) : (
            <div className='space-y-3'>
              {processedFiles.slice(0, 5).map((file) => (
                <button
                  key={file.id}
                  onClick={() => void openResult(file.id, 'No se pudo cargar el job')}
                  className='flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50/40'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium text-slate-900'>{file.name}</p>
                    <p className='text-sm text-slate-500'>{file.date.toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass[file.status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                    {statusLabel[file.status] ?? file.status}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
