import { AlertTriangle, FileSearch, Table2 } from 'lucide-react';

interface ResultsSummaryProps {
  errorCount: number;
  totalImages: number;
  totalRecords: number;
}

export function ResultsSummary({ errorCount, totalImages, totalRecords }: ResultsSummaryProps) {
  return (
    <section className='content-block flex flex-wrap items-center gap-2 px-4 py-3 text-sm'>
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium ${errorCount > 0 ? 'bg-danger/10 text-danger' : 'bg-success/12 text-success'}`}>
        <AlertTriangle className='size-4' />
        {errorCount} hallazgos
      </div>
      <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary'>
        <FileSearch className='size-4' />
        {totalImages} imágenes
      </div>
      <div className='inline-flex items-center gap-2 rounded-full bg-secondary/78 px-3 py-1.5 font-medium text-secondary-foreground'>
        <Table2 className='size-4' />
        {totalRecords} registros
      </div>
    </section>
  );
}
