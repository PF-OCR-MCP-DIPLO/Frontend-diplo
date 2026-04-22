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
      label: 'Hallazgos',
      value: String(errorCount),
      icon: AlertTriangle,
      tone: errorCount > 0 ? 'danger' as const : 'success' as const,
    },
    {
      label: 'Imagenes',
      value: String(totalImages),
      icon: FileSearch,
      tone: 'primary' as const,
    },
    {
      label: 'Registros',
      value: String(totalRecords),
      icon: Table2,
      tone: 'neutral' as const,
    },
  ];

  return (
    <section className='grid gap-3 md:grid-cols-3'>
      {cards.map((card) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </section>
  );
}
