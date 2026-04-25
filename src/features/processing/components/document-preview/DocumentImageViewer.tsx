import { Expand, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FieldValidationIssue } from '@/features/processing/components/results/results-validation';
import type { PreviewImage } from '@/features/processing/types/processing.types';
import type { ResultVisualStatus } from '@/features/processing/components/results/results-validation';

interface DocumentImageViewerProps {
  image?: PreviewImage;
  issues: FieldValidationIssue[];
  fileName: string;
  onOpenImage: (image: PreviewImage) => void;
  status?: ResultVisualStatus;
  selectedRowId?: string | null;
}

export function DocumentImageViewer({ image, issues, fileName, onOpenImage, status = 'neutral', selectedRowId }: DocumentImageViewerProps) {
  if (!image) {
    return (
      <div className='surface-card flex h-full items-center justify-center p-12'>
        <div className='text-center'>
          <FileText className='mx-auto mb-4 size-16 text-muted-foreground/55' />
          <p className='text-muted-foreground'>La ejecucion existe, pero todavia no hay imagenes disponibles para validar el documento.</p>
          <p className='mt-2 text-sm text-muted-foreground'>{fileName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div>
          <p className='font-medium text-foreground'>{image.name}</p>
          <p className='text-sm text-muted-foreground'>Estado OCR: {image.status}</p>
        </div>
        {issues.length > 0 ? <Badge variant='outline' className='border-danger/20 bg-danger/8 text-danger'>{issues.length} hallazgo{issues.length === 1 ? '' : 's'}</Badge> : <Badge variant='outline' className='border-success/20 bg-success/5 text-success'>{status === 'valid' ? 'Sin hallazgos' : 'Sin validación'}</Badge>}
        {selectedRowId ? <Badge variant='outline' className='text-muted-foreground'>Fila: {selectedRowId}</Badge> : null}
      </div>
      {issues.length > 0 ? (
        <div className='space-y-2 rounded-2xl border border-border/60 bg-surface-subtle p-3'>
          {issues.slice(0, 3).map((issue) => (
            <div key={issue.id} className='text-sm text-foreground' title={issue.message}>
              {issue.message}
            </div>
          ))}
          {issues.length > 3 ? <p className='text-xs text-muted-foreground'>Hay mas hallazgos asociados a esta imagen.</p> : null}
        </div>
      ) : null}
      <div className='flex justify-center'>
        <button onClick={() => onOpenImage(image)} className='group focus-ring relative overflow-hidden rounded-[28px] border border-border/72 bg-white p-2 shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-panel)]'>
          <img src={image.url} alt={image.name} className='max-h-[520px] rounded-[24px] bg-white' />
          <span className='absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/72 px-3 py-1 text-xs font-semibold text-white'>
            <Expand className='size-3' />
            Ampliar
          </span>
        </button>
      </div>
    </div>
  );
}
