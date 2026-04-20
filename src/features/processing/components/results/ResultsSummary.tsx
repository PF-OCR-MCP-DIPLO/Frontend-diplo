interface ResultsSummaryProps {
  errorCount: number;
  totalImages: number;
  totalRecords: number;
}

export function ResultsSummary({ errorCount, totalImages, totalRecords }: ResultsSummaryProps) {
  const cards = [
    { label: 'Errores detectados', value: String(errorCount), tone: errorCount > 0 ? 'text-red-600' : 'text-emerald-600' },
    { label: 'Imagenes analizadas', value: String(totalImages), tone: 'text-slate-900' },
    { label: 'Registros extraidos', value: String(totalRecords), tone: 'text-slate-900' },
  ];

  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {cards.map((card) => (
        <div key={card.label} className='rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'>
          <p className='text-sm text-slate-500'>{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
