import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function SettingsPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"local" | "cloud">("local");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const savedMode = localStorage.getItem("procesador-mode");
    if (savedMode === "local" || savedMode === "cloud") {
      setMode(savedMode);
    }
    const savedKey = localStorage.getItem("procesador-api-key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("procesador-mode", mode);
    if (apiKey) {
      localStorage.setItem("procesador-api-key", apiKey);
    }
    toast.success("Configuración guardada correctamente");
  };

  const handleModeChange = (value: string) => {
    setMode(value === "cloud" ? "cloud" : "local");
  };

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
            <h2 className="text-2xl font-semibold text-gray-900">Configuración</h2>
            <p className="text-gray-600">Personaliza el comportamiento del procesador</p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Card className="max-w-2xl p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Modo de operación</Label>
              <RadioGroup value={mode} onValueChange={handleModeChange}>
                <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4">
                  <RadioGroupItem value="local" id="local" />
                  <div className="flex-1">
                    <Label htmlFor="local" className="cursor-pointer font-medium">
                      Local
                    </Label>
                    <p className="text-sm text-gray-600">
                      Procesamiento en tu navegador (sin envío de datos)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4">
                  <RadioGroupItem value="cloud" id="cloud" />
                  <div className="flex-1">
                    <Label htmlFor="cloud" className="cursor-pointer font-medium">
                      Cloud
                    </Label>
                    <p className="text-sm text-gray-600">
                      Procesamiento en la nube con mayor precisión
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {mode === "cloud" && (
              <div className="space-y-3">
                <Label htmlFor="api-key" className="text-base font-semibold">
                  API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Ingresa tu API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Necesitas una API key válida para usar el modo cloud
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-base font-semibold">Información</Label>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Versión:</strong> 1.0.0
                </p>
                <p className="text-sm text-blue-900">
                  <strong>Último procesamiento:</strong>{" "}
                  {new Date().toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/")}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar cambios</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
