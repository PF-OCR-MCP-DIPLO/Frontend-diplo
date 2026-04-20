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
      <div className='flex h-full items-center justify-center rounded-[28px] bg-white p-12 shadow-sm'>
        <div className='text-center'>
          <FileText className='mx-auto mb-4 size-16 text-slate-300' />
          <p className='text-slate-600'>El backend creo el job, pero aun no hay imagenes para mostrar.</p>
          <p className='mt-2 text-sm text-slate-500'>{fileName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div>
        <p className='font-medium text-slate-900'>{image.name}</p>
        <p className='text-sm text-slate-500'>Estado OCR: {image.status}</p>
      </div>
      <div className='flex justify-center'>
        <button onClick={() => onOpenImage(image)} className='group relative overflow-hidden rounded-[28px]'>
          <img src={image.url} alt={image.name} className='max-h-[520px] rounded-[28px] bg-white shadow-lg' />
          <span className='absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-3 py-1 text-xs text-white'>
            <Expand className='size-3' />
            Ampliar
          </span>
        </button>
      </div>
    </div>
  );
}
