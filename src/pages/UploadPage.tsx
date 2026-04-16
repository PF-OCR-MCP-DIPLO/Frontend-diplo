import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "../components/FileUpload";
import { useProcessing } from "../hooks/useProcessing";

export function UploadPage() {
  const navigate = useNavigate();
  const { processFile, isProcessing } = useProcessing();

  const handleFileSelect = useCallback(
    (file: File) => {
      processFile(file).then(() => navigate("/results"));
    },
    [processFile, navigate]
  );

  return <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />;
}
