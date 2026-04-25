import { DocumentPreview } from '@/features/processing/components/document-preview/DocumentPreview';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { PreviewImage } from '@/features/processing/types/processing.types';
import type { ResultRowId } from '@/features/processing/types/processing.types';

interface ResultsPreviewPanelProps {
  fileName: string;
  sourceDocxUrl: string;
  sourceImages: PreviewImage[];
  validationMap: ResultsValidationMap;
  selectedRowId?: ResultRowId | null;
  onOpenImage: (image: PreviewImage) => void;
}

export function ResultsPreviewPanel({ fileName, sourceDocxUrl, sourceImages, validationMap, selectedRowId, onOpenImage }: ResultsPreviewPanelProps) {
  const filteredImages = selectedRowId ? sourceImages.filter((image) => validationMap.imageIssuesById[image.id]?.some((issue) => issue.rowId === selectedRowId)) : sourceImages;
  return (
    <DocumentPreview
      fileName={fileName}
      sourceDocxUrl={sourceDocxUrl}
      images={filteredImages.length > 0 ? filteredImages : sourceImages}
      validationMap={validationMap}
      onOpenImage={onOpenImage}
    />
  );
}
