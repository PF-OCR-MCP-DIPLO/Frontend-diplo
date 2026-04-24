import { DocumentPreview } from '@/features/processing/components/document-preview/DocumentPreview';
import type { PreviewImage } from '@/features/processing/types/processing.types';

interface ResultsPreviewPanelProps {
  fileName: string;
  sourceDocxUrl: string;
  sourceImages: PreviewImage[];
  onOpenImage: (image: PreviewImage) => void;
}

export function ResultsPreviewPanel({ fileName, sourceDocxUrl, sourceImages, onOpenImage }: ResultsPreviewPanelProps) {
  return (
    <DocumentPreview
      fileName={fileName}
      sourceDocxUrl={sourceDocxUrl}
      images={sourceImages}
      onOpenImage={onOpenImage}
    />
  );
}
