import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileUpload } from "../components/FileUpload";
import { useProcessing } from "../hooks/useProcessing";

export function UploadPage() {
  const navigate = useNavigate();
  const { processFile, isProcessing } = useProcessing();

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".docx")) {
        toast.error("Solo se permiten archivos .docx");
        return;
      }
      try {
        const job = await processFile(file);
        toast.success(`Job ${job.jobId} creado correctamente`);
        navigate("/results");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo subir el documento");
      }
    },
    [navigate, processFile]
  );

  return <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />;
}
