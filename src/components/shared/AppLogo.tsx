type AppLogoProps = {
  collapsed?: boolean;
};

export function AppLogo({ collapsed = false }: AppLogoProps) {
  if (collapsed) {
    return (
      <div className='flex items-center justify-center'>
        <div className='brand-mark'>
          PC
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='brand-mark shrink-0'>
        PC
      </div>

      <div className='min-w-0'>
        <p className='truncate text-sm font-semibold text-foreground'>
          Procesador de Consignaciones
        </p>
        <p className='text-xs text-muted-foreground'>
          Centro operativo documental
        </p>
      </div>
    </div>
  );
}
