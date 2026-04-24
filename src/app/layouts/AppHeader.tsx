import { Menu, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationItem } from "@/types/navigation";
import { Link, useLocation } from "react-router-dom";

type AppHeaderProps = {
  currentNavigationItem: NavigationItem;
  onOpenMobileSidebar: () => void;
  showAssistant: boolean;
  onToggleAssistant: () => void;
};

export function AppHeader({
  currentNavigationItem,
  onOpenMobileSidebar,
  showAssistant,
  onToggleAssistant,
}: AppHeaderProps) {
  const location = useLocation();
  const isSettings = location.pathname === "/settings";

  return (
    <header className="sticky top-0 z-30 h-[93px] border-b border-border/70 bg-card/82 backdrop-blur-xl">
      <div className="page-shell flex h-full items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Abrir menu de navegacion"
            className="lg:hidden"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="size-4" />
          </Button>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground sm:text-base">
              {currentNavigationItem.label}
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {currentNavigationItem.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={showAssistant ? "Ocultar asistente" : "Mostrar asistente"}
            title={showAssistant ? "Ocultar asistente" : "Mostrar asistente"}
            className={
              showAssistant
                ? "rounded-full border-primary/20 bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                : "rounded-full"
            }
            onClick={onToggleAssistant}
          >
            <MessageSquare className="size-4" />
          </Button>
          <Link to="/settings" aria-label="Configuracion" title="Configuracion">
            <Button
              variant="outline"
              size="icon"
              className={
                isSettings
                  ? "rounded-full border-primary/20 bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "rounded-full"
              }
            >
              <Settings className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
