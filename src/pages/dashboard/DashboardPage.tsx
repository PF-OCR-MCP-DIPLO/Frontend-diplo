import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileSearch, FileUp, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from '@/components/shared/MetricCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatePanel } from '@/components/shared/StatePanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOpenResult } from '@/features/processing/hooks/useOpenResult';
import { useProcessingActionsContext, useProcessingHistoryContext } from '@/features/processing/hooks/useProcessingContext';

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
      tone: 'primary' as const,
    },
    {
      label: 'Listas para cierre',
      value: String(completedRuns),
      description: 'Procesamientos con salida disponible',
      icon: CheckCircle2,
      tone: 'success' as const,
    },
    {
      label: 'Con observaciones',
      value: String(runsWithObservations),
      description: 'Ejecuciones que requieren revison',
      icon: AlertTriangle,
      tone: 'warning' as const,
    },
    {
      label: 'En curso',
      value: String(pendingRuns),
      description: 'Pendientes de confirmar o completar',
      icon: Clock,
      tone: 'neutral' as const,
    },
  ];

  return (
    <div className='page-stack'>
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

      <Card className='surface-card-hero p-6 md:p-8'>
        <div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
          <div className='space-y-5'>
            <div className='eyebrow-chip-accent'>
              Paso 1 de 3 - Inicio del flujo
            </div>
            <div>
              <h2 className='section-title max-w-3xl text-[clamp(1.85rem,1.65rem+0.65vw,2.5rem)]'>
                Desde aqui defines el siguiente movimiento operativo.
              </h2>
              <p className='section-body mt-3 max-w-2xl'>
                Inicia una carga para demostrar velocidad de puesta en marcha, o retoma resultados recientes para evidenciar control y trazabilidad.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Button size='lg' className='gap-2' onClick={() => navigate('/upload')}>
                Ir a carga documental
                <ArrowRight className='size-4' />
              </Button>
              <Button size='lg' variant='outline' onClick={() => navigate('/history')}>
                Revisar ejecuciones previas
              </Button>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            {kpiCards.map((card) => {
              return (
                <MetricCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  description={card.description}
                  icon={card.icon}
                  tone={card.tone}
                />
              );
            })}
          </div>
        </div>
      </Card>

      <div className='grid gap-6 xl:grid-cols-[1.25fr_0.75fr]'>
        <Card className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Clock className='size-5 text-muted-foreground' />
              <h3 className='font-semibold text-foreground'>Actividad reciente</h3>
            </div>
            <Button variant='ghost' size='sm' onClick={() => navigate('/history')} className='text-primary'>Ver todo</Button>
          </div>
          {isLoadingHistory ? (
            <div className='flex items-center justify-center py-10 text-muted-foreground'>
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
            <div className='content-block-subtle'>
              <p className='text-sm font-semibold text-foreground'>Aun no hay ejecuciones recientes</p>
              <p className='mt-1 text-body text-muted-foreground'>
                Inicia tu primera carga para habilitar la trazabilidad completa del flujo y mostrar evidencia de punta a punta.
              </p>
              <div className='mt-4 flex flex-wrap gap-2'>
                <Button onClick={() => navigate('/upload')}>Iniciar flujo ahora</Button>
                <Button variant='outline' onClick={() => navigate('/history')}>Abrir historial</Button>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              {processedFiles.slice(0, 5).map((file) => (
                <button
                  key={file.id}
                  onClick={() => void openResult(file.id, 'No se pudo cargar la ejecucion')}
                  className='focus-ring flex w-full items-center justify-between gap-3 rounded-2xl border border-border/72 bg-white/82 p-4 text-left transition hover:border-primary/18 hover:bg-primary/5'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium text-foreground'>{file.name}</p>
                    <p className='text-sm text-muted-foreground'>{file.date.toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <StatusBadge status={file.status} />
                    <ArrowRight className='size-4 text-muted-foreground' />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className='surface-card-subtle p-6'>
          <div className='space-y-4'>
            <div>
              <p className='section-kicker'>Recorrido sugerido</p>
              <h3 className='mt-2 text-lg font-semibold tracking-tight text-foreground'>Recorrido recomendado para demo</h3>
            </div>
            <ol className='space-y-3 text-sm text-surface-foreground'>
              <li className='rounded-2xl border border-border/72 bg-white/90 p-3'>
                <p className='font-medium text-foreground'>1. Inicia la carga documental</p>
                <p className='mt-1'>Sube un `.docx` y muestra que el sistema crea la ejecucion sin pasos extra.</p>
              </li>
              <li className='rounded-2xl border border-border/72 bg-white/90 p-3'>
                <p className='font-medium text-foreground'>2. Valida resultados y hallazgos</p>
                <p className='mt-1'>Entra a `Results` para comparar fuente, tabla editable y panel de observaciones.</p>
              </li>
              <li className='rounded-2xl border border-border/72 bg-white/90 p-3'>
                <p className='font-medium text-foreground'>3. Cierra con exportacion</p>
                <p className='mt-1'>Genera y descarga Excel para evidenciar salida util del proceso.</p>
              </li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
