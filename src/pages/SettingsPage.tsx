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

type SettingsPayload = {
  ocr_mode: ApiProcessingSettings["ocr_mode"];
  ocr_provider: ApiProcessingSettings["ocr_provider"];
  ocr_model: string;
  llm_provider: ApiProcessingSettings["llm_provider"];
  llm_model: string;
  request_timeout_seconds: number;
  ocr_api_key: string;
  llm_api_key: string;
};

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ApiProcessingSettings | null>(null);
  const [payload, setPayload] = useState<SettingsPayload | null>(null);
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
        setPayload({
          ocr_mode: loadedSettings.ocr_mode,
          ocr_provider: loadedSettings.ocr_provider,
          ocr_model: loadedSettings.ocr_model,
          llm_provider: loadedSettings.llm_provider,
          llm_model: loadedSettings.llm_model,
          request_timeout_seconds: loadedSettings.request_timeout_seconds,
          ocr_api_key: "",
          llm_api_key: "",
        });
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
    if (!options || !payload) {
      return { ocr: [], llm: [] };
    }
    const ocr = options.provider_models[payload.ocr_provider]?.ocr ?? [];
    const llm = options.provider_models[payload.llm_provider]?.llm ?? [];
    return { ocr, llm };
  }, [options, payload]);

  const shouldShowOcrProvider = payload?.ocr_mode !== "tesseract";
  const ocrRequirements = payload && options ? options.provider_requirements[payload.ocr_provider] : null;
  const llmRequirements = payload && options ? options.provider_requirements[payload.llm_provider] : null;

  const handleSave = async () => {
    if (!payload) {
      return;
    }
    setIsSaving(true);
    try {
      const next = await updateProcessingSettings(payload);
      setSettings(next);
      setPayload({
        ...payload,
        ocr_api_key: "",
        llm_api_key: "",
      });
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings || !payload || !options) {
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
            <p className="text-gray-600">Define OCR y extracción estructurada de forma explícita</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Card className="max-w-4xl p-6">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">OCR</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ocr-mode">OCR mode</Label>
                  <select
                    id="ocr-mode"
                    className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                    value={payload.ocr_mode}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        ocr_mode: e.target.value as ApiProcessingSettings["ocr_mode"],
                      })
                    }
                  >
                    {options.ocr_modes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">tesseract usa OCR local, vision usa proveedor visual, auto decide por configuración.</p>
                </div>

                {shouldShowOcrProvider && (
                  <div className="space-y-2">
                    <Label htmlFor="ocr-provider">OCR provider (vision/auto)</Label>
                    <select
                      id="ocr-provider"
                      className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                      value={payload.ocr_provider}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          ocr_provider: e.target.value as ApiProcessingSettings["ocr_provider"],
                        })
                      }
                    >
                      {options.providers.ocr.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ocr-model">OCR model</Label>
                  <Input
                    id="ocr-model"
                    value={payload.ocr_model}
                    onChange={(e) => setPayload({ ...payload, ocr_model: e.target.value })}
                    placeholder={payload.ocr_mode === "tesseract" ? "spa" : modelOptions.ocr[0] ?? "model"}
                  />
                  {payload.ocr_mode === "tesseract" ? (
                    <p className="text-xs text-gray-500">Idioma/modelo de Tesseract (ejemplo: spa, eng, spa+eng).</p>
                  ) : (
                    modelOptions.ocr.length > 0 && <p className="text-xs text-gray-500">Sugeridos: {modelOptions.ocr.join(", ")}</p>
                  )}
                </div>

                {shouldShowOcrProvider && ocrRequirements?.requires_api_key && (
                  <div className="space-y-2">
                    <Label htmlFor="ocr-api-key">OCR provider API key</Label>
                    <Input
                      id="ocr-api-key"
                      type="password"
                      value={payload.ocr_api_key}
                      onChange={(e) => setPayload({ ...payload, ocr_api_key: e.target.value })}
                      placeholder={settings.has_ocr_api_key ? "API key configurada" : "Ingresa API key"}
                    />
                  </div>
                )}
              </div>

              {shouldShowOcrProvider && ocrRequirements && !ocrRequirements.operational && (
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  El provider OCR seleccionado aún no está operativo en este MVP.
                </p>
              )}
            </section>

            <section className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Extracción estructurada (LLM)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="llm-provider">LLM provider</Label>
                  <select
                    id="llm-provider"
                    className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                    value={payload.llm_provider}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        llm_provider: e.target.value as ApiProcessingSettings["llm_provider"],
                      })
                    }
                  >
                    {options.providers.llm.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="llm-model">LLM model</Label>
                  <Input
                    id="llm-model"
                    value={payload.llm_model}
                    onChange={(e) => setPayload({ ...payload, llm_model: e.target.value })}
                    placeholder={modelOptions.llm[0] ?? "model"}
                  />
                  {modelOptions.llm.length > 0 && <p className="text-xs text-gray-500">Sugeridos: {modelOptions.llm.join(", ")}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {llmRequirements?.requires_api_key && (
                  <div className="space-y-2">
                    <Label htmlFor="llm-api-key">LLM provider API key</Label>
                    <Input
                      id="llm-api-key"
                      type="password"
                      value={payload.llm_api_key}
                      onChange={(e) => setPayload({ ...payload, llm_api_key: e.target.value })}
                      placeholder={settings.has_llm_api_key ? "API key configurada" : "Ingresa API key"}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="timeout">Request timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min={30}
                    value={payload.request_timeout_seconds}
                    onChange={(e) => setPayload({ ...payload, request_timeout_seconds: Number(e.target.value) || 30 })}
                  />
                  <p className="text-xs text-gray-500">Aplica a proveedores remotos y extracción LLM.</p>
                </div>
              </div>

              {llmRequirements && !llmRequirements.operational && (
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  El provider LLM seleccionado aún no está operativo en este MVP.
                </p>
              )}
            </section>

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
