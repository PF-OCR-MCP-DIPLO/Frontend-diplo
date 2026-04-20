import { statusClass, statusLabel } from '@/lib/constants/status';

interface ResultsHeaderProps {
  fileName: string;
  status: string;
  totalImages: number;
  totalRecords: number;
  errorMessage: string;
}

export function ResultsHeader({ fileName, status, totalImages, totalRecords, errorMessage }: ResultsHeaderProps) {
  return (
    <div>
      <h2 className='text-xl font-semibold text-slate-900'>Resultados del procesamiento</h2>
      <p className='text-sm text-slate-600'>{fileName}</p>
      <div className='mt-3 flex flex-wrap gap-2 text-xs text-slate-600'>
        <span className={`rounded-full border px-3 py-1 ${statusClass[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
          Estado: {statusLabel[status] ?? status}
        </span>
        <span className='rounded-full bg-slate-100 px-3 py-1'>Imagenes: {totalImages}</span>
        <span className='rounded-full bg-slate-100 px-3 py-1'>Registros: {totalRecords}</span>
      </div>
      {errorMessage ? <p className='mt-3 text-sm text-red-600'>{errorMessage}</p> : null}
    </div>
  );
}
