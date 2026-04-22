type AppLogoProps = {
  collapsed?: boolean;
};

export function AppLogo({ collapsed = false }: AppLogoProps) {
  if (collapsed) {
    return (
      <div className='flex items-center justify-center'>
        <div className='flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(11,61,107,1),rgba(15,79,138,0.94),rgba(15,143,115,0.88))] text-sm font-semibold text-white shadow-[var(--shadow-panel)]'>
          PC
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(11,61,107,1),rgba(15,79,138,0.94),rgba(15,143,115,0.88))] text-sm font-semibold text-white shadow-[var(--shadow-panel)]'>
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
