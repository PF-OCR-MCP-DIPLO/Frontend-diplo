import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";

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
  const actionButton = mobile ? (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cerrar menu"
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
      onClick={onToggle}
      className="shrink-0"
    >
      {collapsed ? (
        <PanelLeftOpen className="size-4" />
      ) : (
        <PanelLeftClose className="size-4" />
      )}
    </Button>
  );

  return (
    <div className="border-b border-sidebar-border px-3 py-3">
      <div
        className={`flex items-center ${
          collapsed && !mobile ? "justify-center" : "justify-between gap-3"
        }`}
      >
        {!collapsed || mobile ? (
          <div
            className={`min-w-0 flex-1 transition-all duration-200 ${
              collapsed && !mobile
                ? "pointer-events-none w-0 opacity-0 overflow-hidden"
                : "opacity-100"
            }`}
          >
            <AppLogo collapsed={collapsed} />
          </div>
        ) : null}

        {actionButton}
      </div>
    </div>
  );
}
