type AppLogoProps = {
  collapsed?: boolean;
};

function AppSymbol() {
  return (
    <div className="app-symbol" aria-hidden="true">
      <span className="app-symbol-ring app-symbol-ring-1" />
      <span className="app-symbol-ring app-symbol-ring-2" />
      <span className="app-symbol-ring app-symbol-ring-3" />
      <span className="app-symbol-center" />
    </div>
  );
}

export function AppLogo({ collapsed = false }: AppLogoProps) {
  return (
    <div
      className={
        collapsed ? "app-logo app-logo-collapsed" : "app-logo app-logo-expanded"
      }
      aria-label="Procesador de Consignaciones"
    >
      <div
        className={
          collapsed
            ? "brand-mark app-logo-mark-collapsed"
            : "brand-mark app-logo-mark-expanded"
        }
      >
        <AppSymbol />
      </div>

      {!collapsed ? (
        <div className="app-logo-copy">
          <p className="app-logo-title">CONDI</p>
        </div>
      ) : null}
    </div>
  );
}
