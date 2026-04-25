import { FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DocumentImageViewer } from '@/features/processing/components/document-preview/DocumentImageViewer';
import { DocumentPreviewToolbar } from '@/features/processing/components/document-preview/DocumentPreviewToolbar';
import { ImageNavigator } from '@/features/processing/components/document-preview/ImageNavigator';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { getImageStatus } from '@/features/processing/components/results/results-validation';
import type { PreviewImage } from '@/features/processing/types/processing.types';

interface DocumentPreviewProps {
  sourceDocxUrl: string;
  fileName: string;
  images: PreviewImage[];
  validationMap: ResultsValidationMap;
  onOpenImage: (image: PreviewImage) => void;
  selectedRowId?: string | null;
}

export function DocumentPreview({ sourceDocxUrl, fileName, images, validationMap, onOpenImage, selectedRowId }: DocumentPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const safeIndex = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.min(currentIndex, images.length - 1);
  }, [currentIndex, images.length]);

  const currentImage = images[safeIndex];
  const currentImageIssues = currentImage ? validationMap.imageIssuesById[currentImage.id] ?? [] : [];
  const currentImageStatus = currentImage ? getImageStatus(currentImage.id, validationMap) : 'neutral';

  return (
    <Card className='frame-card'>
      <div className='flex flex-col gap-4 border-b border-border/70 p-5 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='icon-chip-primary'>
            <FileText className='size-5' />
          </div>
          <div>
            <h3 className='font-semibold text-foreground'>Vista previa</h3>
            <p className='text-sm text-muted-foreground'>Compara el resultado con el documento fuente.</p>
          </div>
        </div>
        <DocumentPreviewToolbar
          collapsed={collapsed}
          sourceDocxUrl={sourceDocxUrl}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />
      </div>

      {!collapsed ? (
        <div className='flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(249,251,253,1),rgba(242,246,250,0.9))] p-5'>
          <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-medium text-surface-foreground'>Documento fuente</p>
            <p className='text-sm text-muted-foreground'>{fileName}</p>
          </div>
            <ImageNavigator
              currentIndex={safeIndex}
              total={images.length}
              onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              onNext={() => setCurrentIndex((index) => Math.min(images.length - 1, index + 1))}
            />
          </div>
          <DocumentImageViewer image={currentImage} issues={currentImageIssues} fileName={fileName} onOpenImage={onOpenImage} status={currentImageStatus} selectedRowId={selectedRowId} />
        </div>
      ) : null}
    </Card>
  );
}
