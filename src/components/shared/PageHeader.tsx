import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
      <div className='space-y-1'>
        {eyebrow ? <p className='text-xs font-semibold uppercase tracking-[0.2em] text-teal-700'>{eyebrow}</p> : null}
        <h1 className='text-2xl font-semibold text-slate-900 md:text-3xl'>{title}</h1>
        <p className='max-w-2xl text-sm text-slate-600 md:text-base'>{description}</p>
      </div>
      {actions ? <div className='flex flex-wrap items-center gap-3'>{actions}</div> : null}
    </div>
  );
}
