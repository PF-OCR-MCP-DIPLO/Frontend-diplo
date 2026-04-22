import { Expand, FileText } from 'lucide-react';
import type { PreviewImage } from '@/features/processing/types/processing.types';

interface DocumentImageViewerProps {
  image?: PreviewImage;
  fileName: string;
  onOpenImage: (image: PreviewImage) => void;
}

export function DocumentImageViewer({ image, fileName, onOpenImage }: DocumentImageViewerProps) {
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
      <div>
        <p className='font-medium text-foreground'>{image.name}</p>
        <p className='text-sm text-muted-foreground'>Estado OCR: {image.status}</p>
      </div>
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
