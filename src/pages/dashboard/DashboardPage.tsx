import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileSearch, FileUp, Loader2, RefreshCw } from 'lucide-react';
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
  const totalRuns = processedFiles.length;
  const completedRuns = processedFiles.filter((file) => file.status === 'completed' || file.status === 'completed_with_errors').length;
  const pendingRuns = processedFiles.filter((file) => file.status === 'uploaded' || file.status === 'processing').length;
  const runsWithObservations = processedFiles.filter((file) => file.status === 'completed_with_errors' || file.status === 'failed').length;

  const kpiCards = [
    {
      label: 'Ejecuciones totales',
      value: String(totalRuns),
      description: 'Visibilidad general del flujo',
      icon: FileSearch,
      iconClass: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Listas para cierre',
      value: String(completedRuns),
      description: 'Procesamientos con salida disponible',
      icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Con observaciones',
      value: String(runsWithObservations),
      description: 'Ejecuciones que requieren revison',
      icon: AlertTriangle,
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'En curso',
      value: String(pendingRuns),
      description: 'Pendientes de confirmar o completar',
      icon: Clock,
      iconClass: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        eyebrow='Resumen'
        title='Centro de operaciones documentales'
        description='Coordina el recorrido completo de demo: iniciar carga, validar extraccion y cerrar exportacion con evidencia clara.'
        actions={
          <>
            <Button onClick={() => navigate('/upload')} className='gap-2 rounded-2xl'><FileUp className='size-4' />Iniciar nueva carga</Button>
            <Button variant='outline' onClick={() => navigate('/history')} className='gap-2 rounded-2xl'>Ver historial</Button>
          </>
        }
      />

      <Card className='rounded-[32px] border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.82))] p-6 shadow-sm md:p-8'>
        <div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
          <div className='space-y-5'>
            <div className='inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700'>
              Paso 1 de 3 - Inicio del flujo
            </div>
            <div>
              <h2 className='text-3xl font-semibold tracking-tight text-slate-900'>Desde aqui defines el siguiente movimiento operativo.</h2>
              <p className='mt-3 max-w-2xl leading-7 text-slate-600'>
                Inicia una carga para demostrar velocidad de puesta en marcha, o retoma resultados recientes para evidenciar control y trazabilidad.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Button size='lg' className='h-12 gap-2 rounded-2xl px-6' onClick={() => navigate('/upload')}>
                Ir a carga documental
                <ArrowRight className='size-4' />
              </Button>
              <Button size='lg' variant='outline' className='h-12 rounded-2xl px-6' onClick={() => navigate('/history')}>
                Revisar ejecuciones previas
              </Button>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className='rounded-2xl border border-slate-200 bg-white/90 p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-[0.08em] text-slate-500'>{card.label}</p>
                      <p className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>{card.value}</p>
                    </div>
                    <div className={`flex size-10 items-center justify-center rounded-xl ${card.iconClass}`}>
                      <Icon className='size-5' />
                    </div>
                  </div>
                  <p className='mt-2 text-sm text-slate-600'>{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className='grid gap-6 xl:grid-cols-[1.25fr_0.75fr]'>
        <Card className='rounded-[32px] border-slate-200 p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Clock className='size-5 text-slate-500' />
              <h3 className='font-semibold text-slate-900'>Actividad reciente</h3>
            </div>
            <Button variant='ghost' size='sm' onClick={() => navigate('/history')} className='text-teal-700'>Ver todo</Button>
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
            <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-5'>
              <p className='text-sm font-medium text-slate-900'>Aun no hay ejecuciones recientes</p>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                Inicia tu primera carga para habilitar la trazabilidad completa del flujo y mostrar evidencia de punta a punta.
              </p>
              <div className='mt-4 flex flex-wrap gap-2'>
                <Button className='rounded-2xl' onClick={() => navigate('/upload')}>Iniciar flujo ahora</Button>
                <Button variant='outline' className='rounded-2xl' onClick={() => navigate('/history')}>Abrir historial</Button>
              </div>
            </div>
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
                  <div className='flex items-center gap-2'>
                    <div className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass[file.status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                      {statusLabel[file.status] ?? file.status}
                    </div>
                    <ArrowRight className='size-4 text-slate-400' />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className='rounded-[32px] border-slate-200 bg-slate-50/80 p-6 shadow-sm'>
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold tracking-tight text-slate-900'>Recorrido recomendado para demo</h3>
            <ol className='space-y-3 text-sm text-slate-700'>
              <li className='rounded-2xl border border-slate-200 bg-white p-3'>
                <p className='font-medium text-slate-900'>1. Inicia la carga documental</p>
                <p className='mt-1'>Sube un `.docx` y muestra que el sistema crea la ejecucion sin pasos extra.</p>
              </li>
              <li className='rounded-2xl border border-slate-200 bg-white p-3'>
                <p className='font-medium text-slate-900'>2. Valida resultados y hallazgos</p>
                <p className='mt-1'>Entra a `Results` para comparar fuente, tabla editable y panel de observaciones.</p>
              </li>
              <li className='rounded-2xl border border-slate-200 bg-white p-3'>
                <p className='font-medium text-slate-900'>3. Cierra con exportacion</p>
                <p className='mt-1'>Genera y descarga Excel para evidenciar salida util del proceso.</p>
              </li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
