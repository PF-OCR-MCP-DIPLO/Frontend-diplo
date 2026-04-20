import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { useSettingsForm } from '@/features/settings/hooks/useSettingsForm';

export function SettingsPage() {
  const settingsForm = useSettingsForm();

  if (settingsForm.isLoading || !settingsForm.settings || !settingsForm.options || !settingsForm.values) {
    return <div className='flex h-full items-center justify-center text-slate-600'>Cargando configuracion...</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        eyebrow='Settings'
        title='Configuracion de procesamiento'
        description='Ajusta OCR, proveedor visual, LLM y tiempos de respuesta sin mezclar esta logica con el resto de la app.'
        actions={<div className='flex size-12 items-center justify-center rounded-2xl bg-teal-50'><Settings className='size-6 text-teal-700' /></div>}
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
