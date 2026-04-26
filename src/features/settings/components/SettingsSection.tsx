/**
 * Agrupa visualmente una sección del formulario de configuración.
 *
 * Sirve como contenedor semántico para dividir proveedores, criterios y
 * parámetros del asistente sin repetir estructura.
 */
import type { ReactNode } from 'react';

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className='form-section space-y-5'>
      <div>
        <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
        {description ? <p className='mt-1 text-sm text-muted-foreground'>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
