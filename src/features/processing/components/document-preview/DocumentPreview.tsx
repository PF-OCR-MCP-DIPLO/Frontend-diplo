import { FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DocumentImageViewer } from '@/features/processing/components/document-preview/DocumentImageViewer';
import { DocumentPreviewToolbar } from '@/features/processing/components/document-preview/DocumentPreviewToolbar';
import { ImageNavigator } from '@/features/processing/components/document-preview/ImageNavigator';
import type { PreviewImage } from '@/features/processing/types/processing.types';

interface DocumentPreviewProps {
  sourceDocxUrl: string;
  fileName: string;
  images: PreviewImage[];
  onOpenImage: (image: PreviewImage) => void;
}

export function DocumentPreview({ sourceDocxUrl, fileName, images, onOpenImage }: DocumentPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const safeIndex = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.min(currentIndex, images.length - 1);
  }, [currentIndex, images.length]);

  const currentImage = images[safeIndex];

  return (
    <Card className='flex h-full flex-col overflow-hidden rounded-3xl border-slate-200 shadow-sm'>
      <div className='flex items-center justify-between gap-4 border-b border-slate-200 p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-2xl bg-slate-100'>
            <FileText className='size-5 text-slate-500' />
          </div>
          <div>
            <h3 className='font-semibold text-slate-900'>Documento</h3>
            <p className='text-sm text-slate-500'>Navega el material fuente del job.</p>
          </div>
        </div>
        <DocumentPreviewToolbar
          collapsed={collapsed}
          sourceDocxUrl={sourceDocxUrl}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />
      </div>

      {!collapsed ? (
        <div className='flex-1 overflow-auto bg-slate-100/80 p-4'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <div className='text-sm text-slate-500'>Vista principal del documento procesado</div>
            <ImageNavigator
              currentIndex={safeIndex}
              total={images.length}
              onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              onNext={() => setCurrentIndex((index) => Math.min(images.length - 1, index + 1))}
            />
          </div>
          <DocumentImageViewer image={currentImage} fileName={fileName} onOpenImage={onOpenImage} />
        </div>
      ) : null}
    </Card>
  );
}
