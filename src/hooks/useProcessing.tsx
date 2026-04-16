import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ConsignmentRow } from "../components/EditableTable";

type ProcessingStatus = "success" | "error";

export interface ProcessedFile {
  id: string;
  name: string;
  date: Date;
  status: ProcessingStatus;
  fileUrl?: string;
  fileType?: "pdf" | "image";
  data?: ConsignmentRow[];
  errorCount?: number;
}

interface ProcessingContextValue {
  isProcessing: boolean;
  currentFile: File | null;
  processedFiles: ProcessedFile[];
  currentResults: ProcessedFile | null;
  processFile: (file: File) => Promise<ProcessedFile>;
  reprocess: () => Promise<ProcessedFile | null>;
  selectResult: (id: string) => ProcessedFile | null;
}

const ProcessingContext = createContext<ProcessingContextValue | null>(null);
const historyStorageKey = "procesador-history";

const generateMockData = (): ConsignmentRow[] => {
  const montos = [
    "$100,000",
    "$250,500",
    "abc123",
    "$75,000",
    "$180,000",
    "N/A",
    "$320,000",
  ];
  const bancos = [
    "BBVA",
    "Bancolombia",
    "Davivienda",
    "???",
    "Nequi",
    "Banco Popular",
    "Colpatria",
  ];
  const referencias = ["12345", "54321", "98765", "11111", "22222", "33333", "44444"];

  return Array.from({ length: 7 }, (_, i) => {
    const monto = montos[i];
    const isValidMonto = !isNaN(parseFloat(monto.replace(/[^\d.-]/g, "")));

    return {
      id: `row-${i + 1}`,
      fecha: new Date(2026, 2, 12 + i).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      }),
      monto,
      referencia: referencias[i],
      banco: bancos[i],
      estado: isValidMonto ? "valid" : "error",
      errors: isValidMonto ? [] : ["No es numérico"],
    };
  });
};

const hydrateHistory = (raw: string | null): ProcessedFile[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProcessedFile[];
    return parsed.map((item) => {
      const data = item.data ?? [];
      const errorCount =
        typeof item.errorCount === "number"
          ? item.errorCount
          : data.filter((row) => row.estado === "error").length;

      return { ...item, date: new Date(item.date), errorCount };
    });
  } catch (error) {
    console.error("No se pudo leer el historial guardado.", error);
    return [];
  }
};

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [currentResults, setCurrentResults] = useState<ProcessedFile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(historyStorageKey);
    const hydrated = hydrateHistory(saved);
    setProcessedFiles(hydrated);
  }, []);

  useEffect(() => {
    if (processedFiles.length === 0) {
      localStorage.removeItem(historyStorageKey);
      return;
    }

    localStorage.setItem(historyStorageKey, JSON.stringify(processedFiles));
  }, [processedFiles]);

  /**
   * Simula el procesamiento OCR de un archivo y devuelve el resultado generado.
   */
  const processFile = useCallback((file: File) => {
    setCurrentFile(file);
    setIsProcessing(true);

    return new Promise<ProcessedFile>((resolve) => {
      window.setTimeout(() => {
        const fileUrl = URL.createObjectURL(file);
        const fileType = file.type.startsWith("image/") ? "image" : "pdf";
        const data = generateMockData();
        const errorCount = data.filter((row) => row.estado === "error").length;

        const processedFile: ProcessedFile = {
          id: Date.now().toString(),
          name: file.name,
          date: new Date(),
          status: errorCount > 0 ? "error" : "success",
          fileUrl,
          fileType,
          data,
          errorCount,
        };

        setProcessedFiles((prev) => [processedFile, ...prev]);
        setCurrentResults(processedFile);
        setIsProcessing(false);
        resolve(processedFile);
      }, 3000);
    });
  }, []);

  /**
   * Reprocesa el archivo actual, si existe.
   */
  const reprocess = useCallback(async () => {
    if (!currentFile) {
      return null;
    }

    return processFile(currentFile);
  }, [currentFile, processFile]);

  const selectResult = useCallback(
    (id: string) => {
      const file = processedFiles.find((item) => item.id === id) ?? null;
      if (file) {
        setCurrentResults(file);
      }
      return file;
    },
    [processedFiles]
  );

  const value = useMemo(
    () => ({
      isProcessing,
      currentFile,
      processedFiles,
      currentResults,
      processFile,
      reprocess,
      selectResult,
    }),
    [isProcessing, currentFile, processedFiles, currentResults, processFile, reprocess, selectResult]
  );

  return (
    <ProcessingContext.Provider value={value}>{children}</ProcessingContext.Provider>
  );
}

export function useProcessing() {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error("useProcessing debe usarse dentro de ProcessingProvider.");
  }
  return context;
}
