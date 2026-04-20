import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { useSettingsForm } from '@/features/settings/hooks/useSettingsForm';

export function SettingsPage() {
  const settingsForm = useSettingsForm();

  if (settingsForm.isLoading) {
    return <div className='flex h-full items-center justify-center text-slate-600'>Cargando configuracion...</div>;
  }

  if (settingsForm.loadError || !settingsForm.settings || !settingsForm.options || !settingsForm.values) {
    return (
      <div className='space-y-6'>
        <PageHeader
          eyebrow='Settings'
          title='Configuracion de procesamiento'
          description='Ajusta OCR, proveedor visual, LLM y tiempos de respuesta sin mezclar esta logica con el resto de la app.'
          actions={<div className='flex size-12 items-center justify-center rounded-2xl bg-teal-50'><Settings className='size-6 text-teal-700' /></div>}
        />
        <div className='max-w-3xl rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-sm'>
          <div className='flex items-start gap-4'>
            <div className='flex size-12 items-center justify-center rounded-2xl bg-white'>
              <AlertTriangle className='size-6 text-amber-600' />
            </div>
            <div className='space-y-4'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>No pudimos cargar la configuracion</h2>
                <p className='mt-1 text-sm text-slate-700'>{settingsForm.loadError ?? 'Intenta nuevamente en unos segundos.'}</p>
              </div>
              <Button onClick={() => void settingsForm.reload()} className='gap-2'>
                <RefreshCw className='size-4' />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
