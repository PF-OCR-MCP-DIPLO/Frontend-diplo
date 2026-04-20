import { AlertTriangle, FileSearch, Table2 } from 'lucide-react';

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
      tone: errorCount > 0 ? 'text-red-600' : 'text-emerald-600',
      description: errorCount > 0 ? 'Prioriza estas filas antes de cerrar la revision.' : 'La tabla no tiene errores pendientes.',
      icon: AlertTriangle,
      iconTone: errorCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Imagenes disponibles',
      value: String(totalImages),
      tone: 'text-slate-900',
      description: 'Material fuente listo para validar OCR y contexto documental.',
      icon: FileSearch,
      iconTone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Registros extraidos',
      value: String(totalRecords),
      tone: 'text-slate-900',
      description: 'Filas listas para revisar, ajustar y preparar para exportacion.',
      icon: Table2,
      iconTone: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className='rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-200/60'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm font-medium text-slate-500'>{card.label}</p>
                <p className={`mt-3 text-3xl font-semibold tracking-tight ${card.tone}`}>{card.value}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-2xl ${card.iconTone}`}>
                <Icon className='size-5' />
              </div>
            </div>
            <p className='mt-4 text-sm leading-6 text-slate-600'>{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
