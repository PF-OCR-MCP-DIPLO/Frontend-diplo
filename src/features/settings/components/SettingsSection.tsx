import type { ReactNode } from 'react';

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5'>
      <h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
      {children}
    </section>
  );
}
