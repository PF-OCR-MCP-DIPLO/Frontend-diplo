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
  const latestRun = processedFiles[0];

  const kpiCards = [
    {
      label: 'Ejecuciones',
      value: String(totalRuns),
      icon: FileSearch,
      tone: 'primary' as const,
    },
    {
      label: 'Listas',
      value: String(completedRuns),
      icon: CheckCircle2,
      tone: 'success' as const,
    },
    {
      label: 'Con hallazgos',
      value: String(runsWithObservations),
      icon: AlertTriangle,
      tone: 'warning' as const,
    },
    {
      label: 'En curso',
      value: String(pendingRuns),
      icon: Clock,
      tone: 'neutral' as const,
    },
  ];

  return (
    <div className='page-stack'>
      <PageHeader
        eyebrow='Resumen'
        title='Resumen del flujo'
        description='Empieza una carga nueva o retoma una ejecución reciente.'
        actions={
          <>
            <Button onClick={() => navigate('/upload')} className='gap-2'><FileUp className='size-4' />Nueva carga</Button>
            <Button variant='outline' onClick={() => navigate('/history')} className='gap-2'>Ver historial</Button>
          </>
        }
      />

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'>
        <Card className='surface-card-hero p-6 md:p-7'>
          <div className='space-y-5'>
            <div className='space-y-2'>
              <p className='section-eyebrow'>Siguiente acción</p>
              <h2 className='section-title text-[clamp(1.7rem,1.5rem+0.5vw,2.2rem)]'>Empieza una nueva revisión o vuelve a una ya creada.</h2>
              <p className='section-body max-w-2xl'>La ruta principal es simple: cargar, revisar, exportar.</p>
              <p className='text-sm text-muted-foreground'>
                Para una demo estable, prepara un `.docx` de prueba y conserva una ejecución previa en el historial como plan B.
              </p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Button size='lg' className='gap-2' onClick={() => navigate('/upload')}>
                Cargar archivo
                <ArrowRight className='size-4' />
              </Button>
              <Button size='lg' variant='outline' onClick={() => navigate('/history')}>
                Abrir historial
              </Button>
            </div>

            {latestRun ? (
              <button
                type='button'
                onClick={() => void openResult(latestRun.id, 'No se pudo cargar la ejecución')}
                className='interactive-row'
              >
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>Última ejecución</p>
                  <p className='mt-1 truncate font-medium text-foreground'>{latestRun.name}</p>
                  <p className='text-sm text-muted-foreground'>{latestRun.date.toLocaleDateString('es-ES')}</p>
                  <p className='text-xs text-muted-foreground'>Ideal para retomar la demo sin repetir todo el procesamiento.</p>
                </div>
                <div className='flex items-center gap-2'>
                  <StatusBadge status={latestRun.status} />
                  <ArrowRight className='size-4 text-muted-foreground' />
                </div>
              </button>
            ) : (
              <div className='content-block-subtle p-4'>
                <p className='font-medium text-foreground'>Aún no hay ejecuciones</p>
                <p className='mt-1 text-sm text-muted-foreground'>Sube un `.docx` para crear la primera.</p>
              </div>
            )}
          </div>
        </Card>

        <div className='grid gap-3 sm:grid-cols-2'>
          {kpiCards.map((card) => {
            return (
              <MetricCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                tone={card.tone}
              />
            );
          })}
        </div>
      </div>

      <Card className='p-6'>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <Clock className='size-5 text-muted-foreground' />
            <div>
              <h3 className='font-semibold text-foreground'>Actividad reciente</h3>
              <p className='text-sm text-muted-foreground'>Abre una ejecución para continuar donde la dejaste.</p>
            </div>
          </div>
          <Button variant='ghost' size='sm' onClick={() => navigate('/history')} className='text-primary'>Ver todo</Button>
        </div>
        {isLoadingHistory ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>
            <Loader2 className='mr-2 size-4 animate-spin' />
            Cargando actividad...
          </div>
        ) : historyError ? (
          <StatePanel
            tone='warning'
            icon={AlertTriangle}
            title='No pudimos cargar la actividad'
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
            <p className='panel-title'>No hay ejecuciones recientes</p>
            <p className='mt-1 text-body text-muted-foreground'>Crea una carga para empezar.</p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <Button onClick={() => navigate('/upload')}>Nueva carga</Button>
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            {processedFiles.slice(0, 5).map((file) => (
              <button
                key={file.id}
                onClick={() => void openResult(file.id, 'No se pudo cargar la ejecución')}
                className='interactive-row'
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
    </div>
  );
}
