import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getProcessingSettings, getProcessingSettingsOptions, updateProcessingSettings } from '@/features/settings/api/settings.api';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

function createFormValues(settings: ApiProcessingSettings): SettingsFormValues {
  return {
    ocr_mode: settings.ocr_mode,
    ocr_provider: settings.ocr_provider,
    ocr_model: settings.ocr_model,
    llm_provider: settings.llm_provider,
    llm_model: settings.llm_model,
    request_timeout_seconds: settings.request_timeout_seconds,
    ocr_api_key: '',
    llm_api_key: '',
  };
}

export function useSettingsForm() {
  const [settings, setSettings] = useState<ApiProcessingSettings | null>(null);
  const [options, setOptions] = useState<ApiProcessingSettingsOptions | null>(null);
  const [values, setValues] = useState<SettingsFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [loadedSettings, loadedOptions] = await Promise.all([
          getProcessingSettings(),
          getProcessingSettingsOptions(),
        ]);
        setSettings(loadedSettings);
        setOptions(loadedOptions);
        setValues(createFormValues(loadedSettings));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo cargar la configuracion');
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const modelOptions = useMemo(() => {
    if (!options || !values) {
      return { ocr: [], llm: [] };
    }

    return {
      ocr: options.provider_models[values.ocr_provider]?.ocr ?? [],
      llm: options.provider_models[values.llm_provider]?.llm ?? [],
    };
  }, [options, values]);

  async function save() {
    if (!values) return;

    setIsSaving(true);
    try {
      const nextSettings = await updateProcessingSettings(values);
      setSettings(nextSettings);
      setValues(createFormValues({ ...nextSettings }));
      toast.success('Configuracion guardada correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la configuracion');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    settings,
    options,
    values,
    setValues,
    modelOptions,
    isLoading,
    isSaving,
    save,
  };
}
