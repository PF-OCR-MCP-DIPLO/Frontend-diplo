import { DocumentPreview } from '@/features/processing/components/document-preview/DocumentPreview';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { PreviewImage, ResultRowId } from '@/features/processing/types/processing.types';

interface ResultsPreviewPanelProps {
  fileName: string;
  sourceDocxUrl: string;
  sourceImages: PreviewImage[];
  validationMap: ResultsValidationMap;
  selectedRowId?: ResultRowId | null;
  selectedImageId?: number | null;
  onOpenImage: (image: PreviewImage) => void;
}

export function ResultsPreviewPanel({
  fileName,
  sourceDocxUrl,
  sourceImages,
  validationMap,
  selectedRowId,
  selectedImageId,
  onOpenImage,
}: ResultsPreviewPanelProps) {
  return (
    <DocumentPreview
      fileName={fileName}
      sourceDocxUrl={sourceDocxUrl}
      images={sourceImages}
      validationMap={validationMap}
      onOpenImage={onOpenImage}
      selectedRowId={selectedRowId}
      selectedImageId={selectedImageId}
    />
  );
}