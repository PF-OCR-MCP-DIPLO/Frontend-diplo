type AppLogoProps = {
  collapsed?: boolean;
};

export function AppLogo({ collapsed = false }: AppLogoProps) {
  return (
    <div
      className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}
    >
      <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-sm font-semibold text-white shadow-lg shadow-teal-900/15'>
        PC
      </div>

      {!collapsed ? (
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-foreground'>
            Procesador de Consignaciones
          </p>
          <p className='text-xs text-muted-foreground'>
            Operacion documental guiada
          </p>
        </div>
      ) : null}
    </div>
  );
}