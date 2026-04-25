import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getOllamaModels, getProcessingSettings, getProcessingSettingsOptions, updateProcessingSettings } from '@/features/settings/api/settings.api';
import { DEFAULT_EXTRACTION_CRITERIA } from '@/features/settings/types/extraction-criteria.types';
import type { ApiOllamaModelsResponse, ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';
import { normalizeSettings, normalizeSettingsOptions } from '@/features/settings/utils/settings-normalizers';

function createFormValues(settings: ApiProcessingSettings): SettingsFormValues {
  return {
    ocr_mode: settings.ocr_mode,
    ocr_provider: settings.ocr_provider,
    ocr_model: settings.ocr_model,
    llm_provider: settings.llm_provider,
    llm_model: settings.llm_model,
    assistant_provider: settings.assistant_provider,
    assistant_model: settings.assistant_model,
    assistant_show_debug_details: settings.assistant_show_debug_details,
    assistant_temperature: settings.assistant_temperature,
    assistant_num_predict: settings.assistant_num_predict,
    request_timeout_seconds: settings.request_timeout_seconds,
    ocr_api_key: '',
    llm_api_key: '',
    assistant_api_key: '',
    extraction_criteria: settings.extraction_criteria ?? DEFAULT_EXTRACTION_CRITERIA,
  };
}

export function useSettingsForm() {
  const [settings, setSettings] = useState<ApiProcessingSettings | null>(null);
  const [options, setOptions] = useState<ApiProcessingSettingsOptions | null>(null);
  const [ollamaModels, setOllamaModels] = useState<ApiOllamaModelsResponse | null>(null);
  const [values, setValues] = useState<SettingsFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [loadedSettings, loadedOptions, loadedOllamaModels] = await Promise.all([
        getProcessingSettings(),
        getProcessingSettingsOptions(),
        getOllamaModels(),
      ]);
      const safeSettings = normalizeSettings(loadedSettings);
      const safeOptions = normalizeSettingsOptions(loadedOptions);
      setSettings(safeSettings);
      setOptions(safeOptions);
      setOllamaModels(loadedOllamaModels);
      setValues(createFormValues(safeSettings));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar la configuracion';
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const modelOptions = useMemo(() => {
    if (!options || !values) {
      return { ocr: [], llm: [], assistant: [] };
    }

    const ollamaSuggestedModels = (ollamaModels?.available ? ollamaModels.models.map((model) => model.name) : []);
    const resolveModels = (provider: string, kind: 'ocr' | 'llm') => {
      const providerModels = options.provider_models[provider];
      const models = providerModels?.[kind] ?? [];
      if (models.length > 0) return models;
      if (provider === 'ollama') {
        return ollamaSuggestedModels.length > 0
          ? ollamaSuggestedModels
          : kind === 'ocr'
            ? ['gemma4:e2b', 'llava:7b', 'moondream']
            : ['gemma4:e2b', 'llama3.2:3b', 'qwen2.5:3b'];
      }
      return models;
    };

    return {
      ocr: resolveModels(values.ocr_provider, 'ocr'),
      llm: resolveModels(values.llm_provider, 'llm'),
      assistant: resolveModels(values.assistant_provider, 'llm'),
    };
  }, [ollamaModels, options, values]);

  async function save() {
    if (!values) return;

    setIsSaving(true);
    try {
      const {
        ocr_api_key,
        llm_api_key,
        assistant_api_key,
        ...rest
      } = values;
      const payload: Record<string, unknown> = { ...rest };
      if (ocr_api_key.trim()) payload.ocr_api_key = ocr_api_key;
      if (llm_api_key.trim()) payload.llm_api_key = llm_api_key;
      if (assistant_api_key.trim()) payload.assistant_api_key = assistant_api_key;
      payload.extraction_criteria = values.extraction_criteria;

      const nextSettings = normalizeSettings(await updateProcessingSettings(payload));
      setSettings(nextSettings);
      setValues(createFormValues(nextSettings));
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
    ollamaModels,
    isLoading,
    isSaving,
    loadError,
    reload: load,
    save,
  };
}
