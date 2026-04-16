import { Settings } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onSettingsClick?: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="font-semibold text-white">PC</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
            Procesador de Consignaciones
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className="text-gray-600 hover:text-gray-900"
        >
          <Settings className="size-5" />
        </Button>
      </div>
    </header>
  );
}
