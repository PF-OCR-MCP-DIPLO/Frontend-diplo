/**
 * Muestra el estado resumido del job y sus acciones principales.
 *
 * Incluye estados de autosave, exportación, logs y apertura del asistente para
 * que la pantalla de resultados concentre la navegación de alto nivel.
 */
import {
  Download,
  FileDown,
  MessageSquare,
  RefreshCw,
  ScrollText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ApiJobDiagnosticsSummary } from '@/features/processing/types/processing.api';
import type { ProcessingStatus } from '@/features/processing/types/processing.types';

interface ResultsTopBarProps {
  fileName: string;
  status: ProcessingStatus;
  totalImages: number;
  totalRecords: number;
  diagnosticsSummary: ApiJobDiagnosticsSummary | null;
  errorCount: number;
  autosaveLabel: string;
  autosaveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  isSavingCorrections: boolean;
  excelUrl: string | null;
  canExport: boolean;
  canSaveCorrections: boolean;
  canRetryAutosave: boolean;
  onProcess: () => void;
  onReprocessFailed: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onSaveCorrections: () => void;
  onRetryAutosave: () => void;
  onOpenPanel: (panel: 'issues' | 'logs' | 'preview') => void;
  onOpenAssistant: () => void;
}

function getPrimaryLabel(status: ProcessingStatus) {
  return status === 'completed' || status === 'completed_with_errors'
    ? 'Procesar de nuevo'
    : 'Procesar';
}

export function ResultsTopBar({
  fileName,
  status,
  totalImages,
  totalRecords,
  diagnosticsSummary,
  errorCount,
  autosaveLabel,
  autosaveStatus,
  isProcessing,
  isRefreshing,
  isExporting,
  isSavingCorrections,
  excelUrl,
  canExport,
  canSaveCorrections,
  canRetryAutosave,
  onProcess,
  onRefresh,
  onExport,
  onSaveCorrections,
  onRetryAutosave,
  onReprocessFailed,
  onOpenPanel,
  onOpenAssistant,
}: ResultsTopBarProps) {
  const slowestLabel = diagnosticsSummary?.slowest_stage
    ? `Etapa lenta: ${diagnosticsSummary.slowest_stage}${
        diagnosticsSummary.slowest_source_image_id
          ? ` · imagen ${diagnosticsSummary.slowest_source_image_id}`
          : ''
      }`
    : null;

  return (
    <div className='flex flex-col gap-3 border-b border-border/60 px-4 py-3 md:flex-row md:items-center md:justify-between'>
      <div className='min-w-0'>
        <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
          <span className='max-w-[34ch] truncate font-medium text-foreground'>
            {fileName}
          </span>
          <span>·</span>
          <span className='capitalize'>{status.replace('_', ' ')}</span>
          <span>·</span>
          <span>{totalRecords} registros</span>
          <span>·</span>
          <span>{totalImages} imágenes</span>
          <span>·</span>
          <button
            type='button'
            className='text-muted-foreground transition hover:text-foreground'
            onClick={() => onOpenPanel('issues')}
          >
            {errorCount} hallazgos
          </button>
        </div>

        <div className='mt-1 text-xs text-muted-foreground'>{autosaveLabel}</div>

        {slowestLabel ? (
          <div className='mt-1 text-xs text-muted-foreground'>{slowestLabel}</div>
        ) : null}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='gap-2 text-muted-foreground'
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='gap-2 text-muted-foreground'
          onClick={onSaveCorrections}
          disabled={!canSaveCorrections || isSavingCorrections}
        >
          Guardar
        </Button>

        {autosaveStatus === 'error' ? (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={onRetryAutosave}
            disabled={!canRetryAutosave}
          >
            Reintentar
          </Button>
        ) : null}

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='gap-2 text-muted-foreground'
          onClick={() => onOpenPanel('logs')}
        >
          <ScrollText className='size-4' />
          {status === 'failed' || status === 'completed_with_errors'
            ? 'Diagnóstico'
            : 'Logs'}
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2'
          onClick={onOpenAssistant}
        >
          <MessageSquare className='size-4' />
          Abrir asistente
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2'
          onClick={() => onOpenPanel('preview')}
        >
          Previsualizar
        </Button>

        {status !== 'completed_with_errors' ? (
          <Button
            type='button'
            size='sm'
            className='gap-2'
            onClick={onProcess}
            disabled={isProcessing || status === 'processing'}
          >
            {getPrimaryLabel(status)}
          </Button>
        ) : null}

        {(status === 'completed_with_errors' || status === 'failed') && errorCount > 0 ? (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={onReprocessFailed}
            disabled={isProcessing}
          >
            Reprocesar fallidos
          </Button>
        ) : null}

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2'
          onClick={onExport}
          disabled={isExporting || !canExport}
        >
          <Download className='size-4' />
          {excelUrl ? 'Exportar' : isExporting ? 'Generando...' : 'Excel'}
        </Button>

        {excelUrl ? (
          <Button asChild variant='ghost' size='sm' className='gap-2 text-muted-foreground'>
            <a href={excelUrl} target='_blank' rel='noreferrer'>
              <FileDown className='size-4' />
              Descargar
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}