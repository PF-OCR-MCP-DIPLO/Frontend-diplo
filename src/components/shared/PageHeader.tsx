import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className='flex flex-col gap-5 rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-sm shadow-slate-200/60 backdrop-blur md:flex-row md:items-end md:justify-between md:p-7'>
      <div className='space-y-2'>
        {eyebrow ? <p className='text-xs font-semibold uppercase tracking-[0.24em] text-teal-700'>{eyebrow}</p> : null}
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl'>{title}</h1>
          <p className='max-w-2xl text-sm leading-6 text-slate-600 md:text-base'>{description}</p>
        </div>
      </div>
      {actions ? <div className='flex flex-wrap items-center gap-3'>{actions}</div> : null}
    </div>
  );
}
