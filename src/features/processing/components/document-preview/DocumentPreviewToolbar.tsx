import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentPreviewToolbarProps {
  collapsed: boolean;
  sourceDocxUrl: string;
  onToggleCollapsed: () => void;
}

export function DocumentPreviewToolbar({ collapsed, sourceDocxUrl, onToggleCollapsed }: DocumentPreviewToolbarProps) {
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' onClick={onToggleCollapsed} className='gap-2' aria-label={collapsed ? 'Expandir documento' : 'Minimizar documento'}>
        {collapsed ? <Maximize2 className='size-4' /> : <Minimize2 className='size-4' />}
        {collapsed ? 'Expandir' : 'Ocultar'}
      </Button>
      {sourceDocxUrl ? (
        <Button asChild variant='outline' size='sm'>
          <a href={sourceDocxUrl} target='_blank' rel='noreferrer'>
            <ExternalLink className='size-4' />
            Abrir archivo
          </a>
        </Button>
      ) : null}
    </div>
  );
}
