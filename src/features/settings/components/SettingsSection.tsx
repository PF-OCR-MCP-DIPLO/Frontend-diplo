import type { ReactNode } from 'react';

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='form-section space-y-5'>
      <div>
        <p className='section-kicker'>Configuracion</p>
        <h3 className='mt-2 text-lg font-semibold text-foreground'>{title}</h3>
      </div>
      {children}
    </section>
  );
}
