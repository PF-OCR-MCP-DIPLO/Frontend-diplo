import { AlertTriangle, Clock, FileUp, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatePanel } from '@/components/shared/StatePanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOpenResult } from '@/features/processing/hooks/useOpenResult';
import { useProcessingActionsContext, useProcessingHistoryContext } from '@/features/processing/hooks/useProcessingContext';
import { statusClass, statusLabel } from '@/lib/constants/status';

export function DashboardPage() {
  const navigate = useNavigate();
  const openResult = useOpenResult();
  const { refreshHistory } = useProcessingActionsContext();
  const { processedFiles, isLoadingHistory, historyError } = useProcessingHistoryContext();

  return (
    <div className='space-y-6'>
      <PageHeader
        eyebrow='Resumen'
        title='Centro de operaciones documentales'
        description='Inicia nuevas ejecuciones, revisa el estado del flujo y retoma resultados recientes desde un solo tablero.'
        actions={<Button onClick={() => navigate('/upload')} className='gap-2 rounded-2xl'><FileUp className='size-4' />Cargar .docx</Button>}
      />

      <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
        <Card className='rounded-[32px] border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.8))] p-8 shadow-sm'>
          <div className='max-w-xl space-y-5'>
            <div className='flex size-20 items-center justify-center rounded-[28px] bg-teal-50'>
              <FileUp className='size-10 text-teal-700' />
            </div>
            <div>
              <h2 className='text-3xl font-semibold tracking-tight text-slate-900'>Centraliza la carga, revision y exportacion en una sola interfaz.</h2>
              <p className='mt-3 leading-7 text-slate-600'>Usa este panel para iniciar nuevas ejecuciones, retomar revisiones pendientes y detectar rapido cualquier hallazgo antes de exportar.</p>
            </div>
            <Button size='lg' className='h-14 rounded-2xl px-6' onClick={() => navigate('/upload')}>Subir documento</Button>
          </div>
        </Card>

        <Card className='rounded-[32px] border-slate-200 p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Clock className='size-5 text-slate-500' />
              <h3 className='font-semibold text-slate-900'>Actividad reciente</h3>
            </div>
            <Button variant='ghost' size='sm' onClick={() => navigate('/history')} className='text-teal-700'>Ver historial completo</Button>
          </div>
          {isLoadingHistory ? (
            <div className='flex items-center justify-center py-10 text-slate-600'>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Cargando actividad reciente...
            </div>
          ) : historyError ? (
            <StatePanel
              tone='warning'
              icon={AlertTriangle}
              title='No pudimos cargar la actividad reciente'
              description={historyError}
              actions={
                <Button variant='outline' onClick={() => void refreshHistory()} className='gap-2'>
                  <RefreshCw className='size-4' />
                  Reintentar
                </Button>
              }
            />
          ) : processedFiles.length === 0 ? (
            <p className='text-sm leading-6 text-slate-600'>Cuando termines tu primera ejecucion, aqui veras la actividad reciente para retomarla con rapidez.</p>
          ) : (
            <div className='space-y-3'>
              {processedFiles.slice(0, 5).map((file) => (
                <button
                  key={file.id}
                  onClick={() => void openResult(file.id, 'No se pudo cargar la ejecucion')}
                  className='flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50/40'
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
