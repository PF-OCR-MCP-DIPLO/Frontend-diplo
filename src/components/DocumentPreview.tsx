import { Card } from "./ui/card";
import { FileText, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface DocumentPreviewProps {
  fileUrl: string;
  fileName: string;
  fileType: "pdf" | "image";
}

export function DocumentPreview({ fileUrl, fileName, fileType }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Documento</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="min-w-[60px] text-center text-sm text-gray-600">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          {fileType === "image" ? (
            <img
              src={fileUrl}
              alt={fileName}
              style={{ width: `${zoom}%` }}
              className="rounded-lg shadow-lg"
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg bg-white p-12 shadow-lg">
              <div className="text-center">
                <FileText className="mx-auto mb-4 size-16 text-gray-400" />
                <p className="text-gray-600">Vista previa de PDF</p>
                <p className="text-sm text-gray-500">{fileName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
