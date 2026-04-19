import { Card } from "./ui/card";
import { FileText, ExternalLink, ChevronLeft, ChevronRight, Minimize2, Maximize2, Expand } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";

interface PreviewImage {
  id: number;
  url: string;
  name: string;
  status: string;
}

interface DocumentPreviewProps {
  sourceDocxUrl: string;
  fileName: string;
  images: PreviewImage[];
  onOpenImage: (image: PreviewImage) => void;
}

export function DocumentPreview({ sourceDocxUrl, fileName, images, onOpenImage }: DocumentPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const safeIndex = useMemo(() => {
    if (images.length === 0) {
      return 0;
    }
    return Math.min(currentIndex, images.length - 1);
  }, [currentIndex, images.length]);

  const currentImage = images[safeIndex];

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Documento</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCollapsed((value) => !value)}>
            {collapsed ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
            {collapsed ? "Expandir" : "Minimizar"}
          </Button>
          {sourceDocxUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={sourceDocxUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Abrir .docx
              </a>
            </Button>
          )}
        </div>
      </div>

      {!collapsed && <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {currentImage ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{currentImage.name}</p>
                <p className="text-sm text-gray-600">Estado OCR: {currentImage.status}</p>
              </div>
              {images.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                    disabled={safeIndex === 0}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {safeIndex + 1} / {images.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex((index) => Math.min(images.length - 1, index + 1))}
                    disabled={safeIndex === images.length - 1}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button onClick={() => onOpenImage(currentImage)} className="group relative">
                <img src={currentImage.url} alt={currentImage.name} className="max-h-[520px] rounded-lg bg-white shadow-lg" />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  <Expand className="size-3" />
                  Ampliar
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-white p-12 shadow-lg">
            <div className="text-center">
              <FileText className="mx-auto mb-4 size-16 text-gray-400" />
              <p className="text-gray-600">El backend creó el job, pero aún no hay imágenes para mostrar.</p>
              <p className="mt-2 text-sm text-gray-500">{fileName}</p>
            </div>
          </div>
        )}
      </div>}
    </Card>
  );
}
