import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AutosaveEntry } from '@/features/processing/components/results/hooks/useResultsAutosave';

interface ResultsCorrectionsPanelProps {
  hasUnsavedChanges: boolean;
  canSaveCorrections: boolean;
  isSavingCorrections: boolean;
  autosave: AutosaveEntry;
  onSaveCorrections: () => void;
  onRetryAutosave: () => void;
}

export function ResultsCorrectionsPanel({
  hasUnsavedChanges,
  canSaveCorrections,
  isSavingCorrections,
  autosave,
  onSaveCorrections,
  onRetryAutosave,
}: ResultsCorrectionsPanelProps) {
  const statusTone =
    autosave.status === 'error'
      ? 'text-danger'
      : autosave.status === 'saving'
        ? 'text-primary'
        : autosave.status === 'saved'
          ? 'text-success'
          : 'text-muted-foreground';

  return (
    <section className='content-block p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <h4 className='font-semibold text-foreground'>Guardar cambios</h4>
          <p className='text-sm text-muted-foreground'>
            {hasUnsavedChanges
              ? 'Tienes cambios pendientes. Guardalos antes de exportar.'
              : 'La tabla esta sincronizada con el backend.'}
          </p>
          <p className={`text-sm font-medium ${statusTone}`} aria-live='polite'>
            {autosave.status === 'saving'
              ? 'Guardando...'
              : autosave.status === 'saved'
                ? 'Guardado'
                : autosave.status === 'error'
                  ? autosave.error ?? 'Error al guardar'
                  : autosave.status === 'dirty'
                    ? 'Cambios pendientes'
                    : 'Sin cambios pendientes'}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={autosave.status !== 'error'}
            onClick={onRetryAutosave}
            className='gap-2'
          >
            <RotateCcw className='size-4' />
            Reintentar
          </Button>
          <Button type='button' disabled={!canSaveCorrections} onClick={onSaveCorrections}>
            {isSavingCorrections ? 'Guardando...' : 'Guardar correcciones'}
          </Button>
        </div>
      </div>
    </section>
  );
}
