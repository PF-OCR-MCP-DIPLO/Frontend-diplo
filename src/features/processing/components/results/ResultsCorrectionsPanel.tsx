import { Button } from '@/components/ui/button';

interface ResultsCorrectionsPanelProps {
  hasUnsavedChanges: boolean;
  canSaveCorrections: boolean;
  isSavingCorrections: boolean;
  onSaveCorrections: () => void;
}

export function ResultsCorrectionsPanel({
  hasUnsavedChanges,
  canSaveCorrections,
  isSavingCorrections,
  onSaveCorrections,
}: ResultsCorrectionsPanelProps) {
  return (
    <section className='content-block p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h4 className='font-semibold text-foreground'>Guardar cambios</h4>
          <p className='text-sm text-muted-foreground'>
            {hasUnsavedChanges
              ? 'Tienes cambios pendientes. Guardalos antes de exportar.'
              : 'La tabla esta sincronizada con el backend.'}
          </p>
        </div>
        <Button
          type='button'
          disabled={!canSaveCorrections}
          onClick={onSaveCorrections}
        >
          {isSavingCorrections ? 'Guardando...' : 'Guardar correcciones'}
        </Button>
      </div>
    </section>
  );
}
