import { Button } from '@/components/ui/button';
import { ResultsDataPanel } from '@/features/processing/components/results/ResultsDataPanel';
import { ResultsPreviewPanel } from '@/features/processing/components/results/ResultsPreviewPanel';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow, PreviewImage } from '@/features/processing/types/processing.types';

export type ResultsPrimaryView = 'table' | 'preview';

interface ResultsWorkspaceProps {
  primaryView: ResultsPrimaryView;
  onPrimaryViewChange: (view: ResultsPrimaryView) => void;
  data: ConsignmentRow[];
  fileName: string;
  sourceDocxUrl: string;
  sourceImages: PreviewImage[];
  validationMap: ResultsValidationMap;
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowFocus: (rowId: string) => void;
  onOpenImage: (image: PreviewImage) => void;
}

export function ResultsWorkspace({
  primaryView,
  onPrimaryViewChange,
  data,
  fileName,
  sourceDocxUrl,
  sourceImages,
  validationMap,
  onDataChange,
  onRowFocus,
  onOpenImage,
}: ResultsWorkspaceProps) {
  return (
    <section className='surface-card p-4 md:p-5'>
      <div className='flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='section-kicker'>Revision principal</p>
          <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Trabaja sobre una vista a la vez.</h3>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant={primaryView === 'table' ? 'default' : 'outline'}
            onClick={() => onPrimaryViewChange('table')}
            aria-pressed={primaryView === 'table'}
          >
            Tabla
          </Button>
          <Button
            type='button'
            variant={primaryView === 'preview' ? 'default' : 'outline'}
            onClick={() => onPrimaryViewChange('preview')}
            aria-pressed={primaryView === 'preview'}
          >
            Vista previa
          </Button>
        </div>
      </div>
      <div className='grid gap-4 pt-4 xl:grid-cols-[1.25fr_0.95fr] xl:items-start'>
        <div className={primaryView === 'preview' ? 'xl:order-2' : ''}>
          <ResultsDataPanel data={data} validationMap={validationMap} onDataChange={onDataChange} onRowFocus={onRowFocus} />
        </div>
        <div className={primaryView === 'table' ? 'xl:order-2' : ''}>
          <ResultsPreviewPanel
            fileName={fileName}
            sourceDocxUrl={sourceDocxUrl}
            sourceImages={sourceImages}
            validationMap={validationMap}
            onOpenImage={onOpenImage}
          />
        </div>
      </div>
    </section>
  );
}
