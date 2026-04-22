import { AlertTriangle, FileSearch, Table2 } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';

interface ResultsSummaryProps {
  errorCount: number;
  totalImages: number;
  totalRecords: number;
}

export function ResultsSummary({ errorCount, totalImages, totalRecords }: ResultsSummaryProps) {
  const cards = [
    {
      label: 'Hallazgos por revisar',
      value: String(errorCount),
      description: errorCount > 0 ? 'Prioriza estas filas antes de cerrar la revision.' : 'La tabla no tiene errores pendientes.',
      icon: AlertTriangle,
      tone: errorCount > 0 ? 'danger' as const : 'success' as const,
    },
    {
      label: 'Imagenes disponibles',
      value: String(totalImages),
      description: 'Material fuente listo para validar OCR y contexto documental.',
      icon: FileSearch,
      tone: 'primary' as const,
    },
    {
      label: 'Registros extraidos',
      value: String(totalRecords),
      description: 'Filas listas para revisar, ajustar y preparar para exportacion.',
      icon: Table2,
      tone: 'neutral' as const,
    },
  ];

  return (
    <section className='surface-card p-4'>
      <div className='mb-4 px-2'>
        <p className='section-kicker'>Resumen del resultado</p>
        <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Indicadores para priorizar la revision</h3>
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            description={card.description}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>
    </section>
  );
}
