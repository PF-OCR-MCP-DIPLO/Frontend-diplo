/**
 * Permite cambiar el alcance del contexto que se enviará al asistente.
 *
 * El selector ayuda a acotar la conversación a job, fila, celda, imagen o
 * hallazgos visibles sin reconstruir contexto manualmente.
 */
import { Button } from '@/components/ui/button';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';

type ContextScope = NonNullable<AssistantQueryContext['contextScope']>;

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
  { scope: 'cell', label: 'Celda', hint: 'Usa la celda seleccionada.' },
  { scope: 'image', label: 'Imagen', hint: 'Usa la imagen activa.' },
  { scope: 'issues', label: 'Hallazgos', hint: 'Usa solo los hallazgos visibles.' },
];

/**
 * Selector de alcance conversacional para el asistente.
 *
 * @remarks
 * No consulta red ni estado global: solo deriva contexto utilizable para
 * enviar al backend según selección de fila/celda/imagen/hallazgos.
 */
export function AssistantContextSelector({ context, onChange, selectedRow, selectedImage, visibleIssueIds }: AssistantContextSelectorProps) {
  const activeScope = context.contextScope ?? (context.selectedField ? 'cell' : context.selectedRowId ? 'row' : context.currentImageId ? 'image' : context.visibleIssueIds?.length ? 'issues' : 'general');

  const setScope = (scope: ContextScope) => {
    // Cada scope limpia campos incompatibles para no enviar contexto ambiguo.
    const base = { ...context, contextScope: scope };
    if (scope === 'general') onChange({ ...base, selectedRowId: undefined, selectedField: undefined, currentImageId: undefined, visibleIssueIds: undefined, sourceImageId: undefined, depositId: undefined, intentHint: 'general_question' });
    if (scope === 'job') onChange({ ...base, selectedRowId: undefined, selectedField: undefined, currentImageId: undefined, visibleIssueIds: undefined, intentHint: 'job_question' });
    if (scope === 'row' && (context.selectedRowId || selectedRow)) onChange({ ...base, selectedRowId: context.selectedRowId ?? selectedRow?.id, selectedField: undefined, depositId: context.depositId ?? selectedRow?.depositId, sourceImageId: context.sourceImageId ?? selectedRow?.sourceImageId, currentImageId: context.currentImageId ?? selectedRow?.sourceImageId, intentHint: 'row_question' });
    if (scope === 'cell' && (context.selectedRowId || selectedRow) && context.selectedField) onChange({ ...base, selectedRowId: context.selectedRowId ?? selectedRow?.id, depositId: context.depositId ?? selectedRow?.depositId, sourceImageId: context.sourceImageId ?? selectedRow?.sourceImageId, currentImageId: context.currentImageId ?? selectedRow?.sourceImageId, intentHint: 'cell_question' });
    if (scope === 'image' && (context.currentImageId || selectedImage)) onChange({ ...base, currentImageId: context.currentImageId ?? selectedImage?.id, sourceImageId: context.sourceImageId ?? selectedImage?.id, visibleIssueIds, intentHint: 'image_question' });
    if (scope === 'issues') onChange({ ...base, visibleIssueIds, intentHint: 'issues_question' });
  };

  const contextLabel =
    context.selectedField && context.selectedRowId ? `Celda: ${context.selectedField} · Fila ${context.selectedRowId}` :
    context.selectedRowId ? `Fila: ${context.selectedRowId}` :
    context.currentImageId ? `Imagen: ${context.currentImageId}` :
    context.visibleIssueIds?.length ? 'Hallazgos visibles' :
    context.jobId ? `Job #${context.jobId}` :
    'General';

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
        <span>{contextLabel}</span>
        <button type='button' className='text-primary hover:underline' onClick={() => onChange({ page: context.page, jobId: context.jobId, jobName: context.jobName, contextScope: 'general' })}>
          Limpiar contexto
        </button>
      </div>
      <div className='flex flex-wrap gap-2'>
        {OPTIONS.map((option) => {
          const disabled =
            (option.scope === 'row' || option.scope === 'cell') && !selectedRow && !context.selectedRowId ||
            option.scope === 'image' && !selectedImage && !context.currentImageId ||
            option.scope === 'issues' && !(visibleIssueIds?.length ?? context.visibleIssueIds?.length);
          const active = activeScope === option.scope;
          return (
            <Button key={option.scope} type='button' size='sm' variant={active ? 'default' : 'outline'} className='h-8 rounded-full px-3 text-xs' disabled={disabled} onClick={() => setScope(option.scope)}>
              {option.label}
            </Button>
          );
        })}
      </div>
      <p className='text-[11px] text-muted-foreground'>{OPTIONS.find((option) => option.scope === activeScope)?.hint}</p>
    </div>
  );
}
