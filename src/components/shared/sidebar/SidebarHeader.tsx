// components/sidebar/SidebarHeader.tsx
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils"; // Asegúrate de tener esta utilidad

type SidebarHeaderProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  mobile?: boolean;
};

export function SidebarHeader({
  collapsed = false,
  onToggle,
  onClose,
  mobile = false,
}: SidebarHeaderProps) {
  const showLogo = !collapsed || mobile;

  return (
    <header className="border-b border-sidebar-border px-3 py-3">
      <div
        className={cn(
          "flex items-center",
          collapsed && !mobile ? "justify-center" : "justify-between gap-3"
        )}
      >
        {/* Logo siempre presente pero animado al colapsar */}
        <div
          className={cn(
            "min-w-0 flex-1 transition-all duration-0 ease-in-out",
            showLogo
              ? "opacity-100 max-w-full delay-50"
              : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
          )}
          aria-hidden={!showLogo}
        >
          <AppLogo collapsed={mobile ? false : collapsed} />
        </div>

        {/* Botón: cerrar en móvil, toggle en escritorio */}
        {mobile ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar menú"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            aria-expanded={!collapsed}
            onClick={onToggle}
            className="shrink-0"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose
                className={cn(
                  "size-4 transition-transform duration-200",
                  collapsed && "rotate-180"
                )}
              />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}