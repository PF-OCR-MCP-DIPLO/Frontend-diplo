import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  getProcessingSettings,
  getProcessingSettingsOptions,
  updateProcessingSettings,
  type ApiProcessingSettings,
  type ApiProcessingSettingsOptions,
} from "../lib/api";

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ApiProcessingSettings | null>(null);
  const [options, setOptions] = useState<ApiProcessingSettingsOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [loadedSettings, loadedOptions] = await Promise.all([
          getProcessingSettings(),
          getProcessingSettingsOptions(),
        ]);
        setSettings(loadedSettings);
        setOptions(loadedOptions);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo cargar la configuración");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const modelOptions = useMemo(() => {
    if (!options || !settings) {
      return { ocr: [], llm: [] };
    }
    const entry = options.provider_models[settings.ocr_provider] ?? { ocr: [], llm: [] };
    const llmEntry = options.provider_models[settings.llm_provider] ?? { ocr: [], llm: [] };
    return { ocr: entry.ocr, llm: llmEntry.llm };
  }, [options, settings]);

  const handleSave = async () => {
    if (!settings) {
      return;
    }
    setIsSaving(true);
    try {
      const next = await updateProcessingSettings(settings);
      setSettings(next);
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings || !options) {
    return (
      <div className="flex h-full flex-col p-4 sm:p-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="flex flex-1 items-center justify-center text-gray-600">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="flex items-center gap-3">
          <SettingsIcon className="size-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Configuración de procesamiento</h2>
            <p className="text-gray-600">Controla OCR, proveedor y modelo LLM del backend</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Card className="max-w-3xl p-6">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ocr-mode">OCR mode</Label>
                <select
                  id="ocr-mode"
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  value={settings.ocr_mode}
                  onChange={(e) => setSettings({ ...settings, ocr_mode: e.target.value as ApiProcessingSettings["ocr_mode"] })}
                >
                  {options.ocr_modes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ocr-provider">OCR provider</Label>
                <select
                  id="ocr-provider"
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  value={settings.ocr_provider}
                  onChange={(e) => setSettings({ ...settings, ocr_provider: e.target.value as ApiProcessingSettings["ocr_provider"] })}
                >
                  {options.providers.ocr.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ocr-model">OCR model</Label>
                <Input
                  id="ocr-model"
                  value={settings.ocr_model}
                  onChange={(e) => setSettings({ ...settings, ocr_model: e.target.value })}
                  placeholder={modelOptions.ocr[0] ?? "model"}
                />
                {modelOptions.ocr.length > 0 && <p className="text-xs text-gray-500">Sugeridos: {modelOptions.ocr.join(", ")}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="llm-provider">LLM provider</Label>
                <select
                  id="llm-provider"
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  value={settings.llm_provider}
                  onChange={(e) => setSettings({ ...settings, llm_provider: e.target.value as ApiProcessingSettings["llm_provider"] })}
                >
                  {options.providers.llm.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="llm-model">LLM model</Label>
                <Input
                  id="llm-model"
                  value={settings.llm_model}
                  onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })}
                  placeholder={modelOptions.llm[0] ?? "model"}
                />
                {modelOptions.llm.length > 0 && <p className="text-xs text-gray-500">Sugeridos: {modelOptions.llm.join(", ")}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min={30}
                  value={settings.request_timeout_seconds}
                  onChange={(e) => setSettings({ ...settings, request_timeout_seconds: Number(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              Última actualización: {new Date(settings.updated_at).toLocaleString("es-CO")}
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => navigate("/")}>Cancelar</Button>
              <Button onClick={() => void handleSave()} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
