import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageNavigatorProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function ImageNavigator({ currentIndex, total, onPrevious, onNext }: ImageNavigatorProps) {
  if (total <= 1) {
    return null;
  }

  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' onClick={onPrevious} disabled={currentIndex === 0}>
        <ChevronLeft className='size-4' />
      </Button>
      <span className='text-sm text-slate-500'>
        {currentIndex + 1} / {total}
      </span>
      <Button variant='outline' size='sm' onClick={onNext} disabled={currentIndex === total - 1}>
        <ChevronRight className='size-4' />
      </Button>
    </div>
  );
}
