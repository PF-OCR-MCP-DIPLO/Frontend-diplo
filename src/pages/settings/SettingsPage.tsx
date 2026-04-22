import { AlertTriangle, Loader2, RefreshCw, Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatePanel } from '@/components/shared/StatePanel';
import { Button } from '@/components/ui/button';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { useSettingsForm } from '@/features/settings/hooks/useSettingsForm';

export function SettingsPage() {
  const settingsForm = useSettingsForm();

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

  if (settingsForm.loadError || !settingsForm.settings || !settingsForm.options || !settingsForm.values) {
    return (
      <div className='page-stack'>
        <PageHeader
          eyebrow='Configuracion'
          title='Configuracion'
          description='Ajusta OCR, modelo y tiempo de espera.'
          actions={<div className='icon-chip-primary size-12'><Settings className='size-6' /></div>}
        />
        <StatePanel
          tone='warning'
          icon={AlertTriangle}
          title='No pudimos cargar la configuracion'
          description={settingsForm.loadError ?? 'Intenta nuevamente en unos segundos.'}
          actions={
            <Button onClick={() => void settingsForm.reload()} className='gap-2'>
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
      <PageHeader
        eyebrow='Configuracion'
        title='Configuracion'
        description='Ajusta OCR, modelo y tiempo de espera.'
        actions={<div className='icon-chip-primary size-12'><Settings className='size-6' /></div>}
      />
      <SettingsForm
        settings={settingsForm.settings}
        options={settingsForm.options}
        values={settingsForm.values}
        onChange={settingsForm.setValues}
        onSave={() => void settingsForm.save()}
        isSaving={settingsForm.isSaving}
        modelOptions={settingsForm.modelOptions}
      />
    </div>
  );
}
