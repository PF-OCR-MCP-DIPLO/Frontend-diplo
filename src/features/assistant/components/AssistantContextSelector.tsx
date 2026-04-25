import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';

type ContextScope = NonNullable<AssistantQueryContext['page']> | 'general' | 'job' | 'row' | 'cell' | 'image' | 'issues';

interface AssistantContextSelectorProps {
  context: AssistantQueryContext;
  onChange: (context: AssistantQueryContext) => void;
  selectedRow?: ConsignmentRow | null;
  selectedImage?: PreviewImage | null;
  visibleIssueIds?: string[];
}

const OPTIONS: Array<{ scope: ContextScope; label: string; hint: string }> = [
  { scope: 'general', label: 'General', hint: 'Pregunta sin contexto específico.' },
  { scope: 'job', label: 'Job', hint: 'Usa el resultado completo.' },
  { scope: 'row', label: 'Fila', hint: 'Usa la fila seleccionada.' },
  { scope: 'cell', label: 'Celda', hint: 'Usa el campo seleccionado.' },
  { scope: 'image', label: 'Imagen', hint: 'Usa la imagen actual.' },
  { scope: 'issues', label: 'Hallazgos', hint: 'Usa solo los hallazgos visibles.' },
];

export function AssistantContextSelector({ context, onChange, selectedRow, selectedImage, visibleIssueIds }: AssistantContextSelectorProps) {
  const activeLabel = useMemo(() => {
    if (context.selectedField && context.selectedRowId) return `Celda: ${context.selectedField} de ${context.selectedRowId}`;
    if (context.selectedRowId) return `Fila: ${context.selectedRowId}`;
    if (context.currentImageId) return `Imagen: ${context.currentImageId}`;
    if (context.visibleIssueIds?.length) return 'Hallazgos visibles';
    if (context.jobId) return 'Todo el job';
    return 'General';
  }, [context]);

  const setScope = (scope: ContextScope) => {
    if (scope === 'general') onChange({ ...context, selectedRowId: undefined, selectedField: undefined, currentImageId: undefined, visibleIssueIds: undefined, depositId: undefined, sourceImageId: undefined, intentHint: 'general_question' });
    if (scope === 'job') onChange({ ...context, selectedRowId: undefined, selectedField: undefined, currentImageId: undefined, visibleIssueIds: undefined, intentHint: 'job_question' });
    if (scope === 'row' && (context.selectedRowId || selectedRow)) onChange({ ...context, selectedRowId: context.selectedRowId ?? selectedRow?.id, selectedField: undefined, depositId: context.depositId ?? selectedRow?.depositId, sourceImageId: context.sourceImageId ?? selectedRow?.sourceImageId, currentImageId: context.currentImageId ?? selectedRow?.sourceImageId, intentHint: 'row_question' });
    if (scope === 'cell' && (context.selectedRowId || selectedRow) && context.selectedField) onChange({ ...context, selectedRowId: context.selectedRowId ?? selectedRow?.id, depositId: context.depositId ?? selectedRow?.depositId, sourceImageId: context.sourceImageId ?? selectedRow?.sourceImageId, currentImageId: context.currentImageId ?? selectedRow?.sourceImageId, intentHint: 'cell_question' });
    if (scope === 'image' && (context.currentImageId || selectedImage)) onChange({ ...context, currentImageId: context.currentImageId ?? selectedImage?.id, sourceImageId: context.sourceImageId ?? selectedImage?.id, visibleIssueIds, intentHint: 'image_question' });
    if (scope === 'issues') onChange({ ...context, visibleIssueIds, intentHint: 'issues_question' });
  };

  return (
    <div className='rounded-2xl border border-border/70 bg-surface-subtle p-2'>
      <div className='mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground'>
        <span>Contexto: {activeLabel}</span>
        <span className='inline-flex items-center gap-1'><ChevronDown className='size-3' /> Cambiar</span>
      </div>
      <div className='flex flex-wrap gap-2'>
        {OPTIONS.map((option) => {
          const disabled =
            (option.scope === 'row' || option.scope === 'cell') && !selectedRow ||
            option.scope === 'image' && !selectedImage ||
            option.scope === 'issues' && !(visibleIssueIds?.length);
          return (
            <Button key={option.scope} type='button' size='sm' variant='outline' className='rounded-full' onClick={() => setScope(option.scope)} disabled={disabled}>
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
