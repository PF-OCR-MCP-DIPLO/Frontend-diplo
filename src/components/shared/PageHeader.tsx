import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className='surface-card-hero flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between md:p-7'>
      <div className='space-y-2'>
        {eyebrow ? <p className='section-eyebrow'>{eyebrow}</p> : null}
        <div className='space-y-2'>
          <h1 className='section-title max-w-4xl text-[clamp(2rem,1.8rem+0.7vw,2.65rem)]'>{title}</h1>
          <p className='section-body max-w-3xl'>{description}</p>
        </div>
      </div>
      {actions ? <div className='flex flex-wrap items-center gap-3'>{actions}</div> : null}
    </div>
  );
}
