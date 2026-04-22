import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className='surface-card-hero flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-7'>
      <div className='space-y-1.5'>
        {eyebrow ? <p className='section-eyebrow'>{eyebrow}</p> : null}
        <div className='space-y-1.5'>
          <h1 className='section-title max-w-4xl text-[clamp(1.8rem,1.65rem+0.55vw,2.35rem)]'>{title}</h1>
          {description ? <p className='section-body max-w-2xl'>{description}</p> : null}
        </div>
      </div>
      {actions ? <div className='flex flex-wrap items-center gap-3'>{actions}</div> : null}
    </div>
  );
}
