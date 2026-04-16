import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors sm:p-12 ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          } ${isProcessing ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        >
          <input {...getInputProps()} />

          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-white shadow-sm sm:size-24">
            {isProcessing ? (
              <Loader2 className="size-10 animate-spin text-blue-600 sm:size-12" />
            ) : (
              <FileText className="size-10 text-gray-400 sm:size-12" />
            )}
          </div>

          {isProcessing ? (
            <div className="text-center">
              <p className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
                Procesando documento...
              </p>
              <p className="text-gray-600">
                Extrayendo información del archivo
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
                {isDragActive
                  ? "Suelta el archivo aquí"
                  : "Arrastra tu archivo o haz clic"}
              </p>
              <p className="mb-6 text-gray-600">
                Soporta archivos PDF e imágenes (PNG, JPG)
              </p>
              <Button size="lg" className="rounded-xl">
                <Upload className="mr-2 size-5" />
                Seleccionar archivo
              </Button>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="mt-6 text-center">
            <div className="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse bg-blue-600" style={{ width: "70%" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
