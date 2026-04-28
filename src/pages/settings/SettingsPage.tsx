import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { StatePanel } from '@/components/shared/StatePanel';
import { Button } from '@/components/ui/button';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { useSettingsForm } from '@/features/settings/hooks/useSettingsForm';
import { openSettingsAssistant } from '@/features/settings/hooks/openSettingsAssistant';

function useOptionalBlocker(when: boolean) {
  try {
    return useBlocker(when);
  } catch {
    return {
      state: 'unblocked' as const,
      proceed: () => undefined,
      reset: () => undefined,
    };
  }
}

export function SettingsPage() {
  const settingsForm = useSettingsForm();
  const blocker = useOptionalBlocker(settingsForm.hasUnsavedChanges);

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    const shouldLeave = window.confirm(
      'Tienes cambios sin guardar. Si sales ahora, los perderás.',
    );

    if (shouldLeave) {
      blocker.proceed();
      return;
    }

    blocker.reset();
  }, [blocker]);

  if (settingsForm.isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <StatePanel
          centered
          tone='neutral'
          icon={Loader2}
          iconAnimated
          title='Cargando configuracion'
          description='Estamos preparando las preferencias de OCR y extraccion para que puedas ajustarlas con contexto.'
        />
      </div>
    );
  }

  if (
    settingsForm.loadError ||
    !settingsForm.settings ||
    !settingsForm.options ||
    !settingsForm.values
  ) {
    return (
      <div className='page-stack'>
        <StatePanel
          tone='warning'
          icon={AlertTriangle}
          title='No pudimos cargar la configuracion'
          description={
            settingsForm.loadError ?? 'Intenta nuevamente en unos segundos.'
          }
          actions={
            <Button
              onClick={() => void settingsForm.reload()}
              className='gap-2'
            >
              <RefreshCw className='size-4' />
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className='page-stack'>
      <SettingsForm
        settings={settingsForm.settings}
        options={settingsForm.options}
        values={settingsForm.values}
        onChange={settingsForm.setValues}
        onSave={() => void settingsForm.save()}
        onDiscard={settingsForm.discardChanges}
        isSaving={settingsForm.isSaving}
        hasUnsavedChanges={settingsForm.hasUnsavedChanges}
        modelOptions={settingsForm.modelOptions}
        onOpenAssistant={async (context, prompt) => {
          if (settingsForm.hasUnsavedChanges) {
            const saved = await settingsForm.save();

            if (!saved) {
              return;
            }
          }

          openSettingsAssistant(context, prompt);
        }}
      />
    </div>
  );
}