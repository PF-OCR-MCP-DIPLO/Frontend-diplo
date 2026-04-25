import { MessageSquarePlus, NotebookText, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AssistantLaunchContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type { ConsignmentRow, PreviewImage, ProcessingStatus } from '@/features/processing/types/processing.types';

interface ResultsAssistantQuickActionsProps {
  jobId: number;
  jobStatus: ProcessingStatus;
  data: ConsignmentRow[];
  sourceImages: PreviewImage[];
  selectedRowId: string | null;
  currentImage: PreviewImage | null;
  errorCount: number;
  autosaveStatus: AssistantQueryContext['autosaveStatus'];
  onOpenAssistant: (launch: AssistantLaunchContext) => void;
}

export function ResultsAssistantQuickActions({
  jobId,
  jobStatus,
  data,
  sourceImages,
  selectedRowId,
  currentImage,
  errorCount,
  autosaveStatus,
  onOpenAssistant,
}: ResultsAssistantQuickActionsProps) {
  const selectedRow = selectedRowId ? data.find((row) => row.id === selectedRowId) : data.find((row) => row.estado === 'error') ?? data[0];
  const issueRow = data.find((row) => row.estado === 'error') ?? selectedRow;
  const fallbackImage = currentImage ?? sourceImages[0] ?? null;
  const currentIssueIds = data.filter((row) => row.estado === 'error').map((row) => row.id);

  const sharedContext = {
    page: 'results' as const,
    jobId,
    jobStatus,
    selectedRowId: selectedRow?.id,
    depositId: selectedRow?.depositId,
    sourceImageId: selectedRow?.sourceImageId,
    currentImageId: fallbackImage?.id,
    visibleIssueIds: currentIssueIds,
    errorCount,
    autosaveStatus,
  };

  const rowPrompt = selectedRow
    ? `Explícame qué está mal en la fila ${selectedRow.referencia || selectedRow.id}.`
    : 'Explícame qué está mal en esta fila.';
  const issuePrompt = issueRow
    ? `Explícame este hallazgo de la fila ${issueRow.referencia || issueRow.id}.`
    : 'Explícame este hallazgo.';
  const imagePrompt = fallbackImage
    ? `Analiza la imagen ${fallbackImage.name} y dime qué revisaría.`
    : 'Analiza el documento actual y dime qué revisaría.';

  return (
    <section className='content-block-subtle flex flex-wrap items-center gap-2 px-4 py-3 text-sm'>
      <span className='section-kicker mr-2'>Acciones rápidas</span>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='gap-2 rounded-full'
        onClick={() => onOpenAssistant({ prompt: rowPrompt, context: { ...sharedContext, intentHint: 'explain_row_issue' } })}
      >
        <MessageSquarePlus className='size-4' />
        Preguntar sobre esta fila
      </Button>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='gap-2 rounded-full'
        onClick={() => onOpenAssistant({ prompt: issuePrompt, context: { ...sharedContext, intentHint: 'explain_job_findings' } })}
        disabled={errorCount === 0}
      >
        <NotebookText className='size-4' />
        Explicar hallazgo
      </Button>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='gap-2 rounded-full'
        onClick={() => onOpenAssistant({ prompt: imagePrompt, context: { ...sharedContext, currentImageId: fallbackImage?.id, intentHint: 'analyze_document' } })}
      >
        <ScanSearch className='size-4' />
        Analizar imagen
      </Button>
    </section>
  );
}
