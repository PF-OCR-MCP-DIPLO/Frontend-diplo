import { useCallback } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProcessingActionsContext, useProcessingFlagsContext } from '@/features/processing/hooks/useProcessingContext';

export function UploadPage() {
  const navigate = useNavigate();
  const { processFile } = useProcessingActionsContext();
  const { isProcessing } = useProcessingFlagsContext();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Solo se permiten archivos .docx');
      return;
    }

    try {
      const job = await processFile(file);
      toast.success(`Ejecución ${job.jobId} creada correctamente`);
      navigate('/results');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir el documento');
    }
  }, [navigate, processFile]);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const firstError = rejections[0]?.errors[0];
    if (firstError?.code === 'file-invalid-type') {
      toast.error('Formato no valido. Usa un archivo .docx');
      return;
    }
    toast.error('No pudimos aceptar el archivo. Verifica formato y vuelve a intentar.');
  }, []);

  const dropzone = useDropzone({
    onDrop: (files) => void onDrop(files),
    onDropRejected,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    disabled: isProcessing,
  });
  const uploadStageLabel = isProcessing
    ? 'Procesando carga'
    : dropzone.isDragAccept
      ? 'Archivo validado'
      : dropzone.isDragReject
        ? 'Archivo rechazado'
        : 'Esperando archivo';

  return (
    <div className='page-stack'>
      <PageHeader
        eyebrow='Carga'
        title='Cargar archivo'
        description='Sube un archivo `.docx` para crear una nueva ejecución. El flujo esperado es: cargar, procesar, revisar y exportar.'
      />
      <Card className='surface-card-hero p-6 sm:p-8'>
        <div className='space-y-4'>
          <div
            {...dropzone.getRootProps()}
            className={`flex min-h-[420px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed px-6 text-center transition ${
              dropzone.isDragAccept
                ? 'border-success/60 bg-success/10'
                : dropzone.isDragReject
                  ? 'border-danger/60 bg-danger/10'
                  : dropzone.isDragActive
                    ? 'border-accent/70 bg-accent/8'
                    : 'border-border/82 bg-surface-subtle hover:border-primary/28 hover:bg-white/88'
            } ${isProcessing ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
          >
            <input {...dropzone.getInputProps()} />
            <div className='mb-6 flex size-24 items-center justify-center rounded-full border border-border/70 bg-white/94 shadow-[var(--shadow-soft)]'>
              {isProcessing ? <Loader2 className='size-12 animate-spin text-primary' /> : <FileText className='size-12 text-muted-foreground' />}
            </div>
            <span className='meta-pill'>{uploadStageLabel}</span>
            {isProcessing ? (
              <div>
                <p className='mt-4 text-xl font-semibold text-foreground'>Subiendo documento...</p>
                <p className='mt-2 text-body text-muted-foreground'>En cuanto termine, iras directo a resultados.</p>
              </div>
            ) : (
              <div>
                <p className='mt-4 text-xl font-semibold text-foreground'>
                  {dropzone.isDragReject
                    ? 'Archivo no compatible'
                    : dropzone.isDragAccept
                      ? 'Archivo listo para cargar'
                      : dropzone.isDragActive
                        ? 'Suelta el archivo aqui'
                        : 'Arrastra un .docx o haz clic para seleccionarlo'}
                </p>
                <p className='mt-2 text-body text-muted-foreground'>
                  {dropzone.isDragReject
                    ? 'Solo se admiten documentos Word (.docx).'
                    : 'Se creará una ejecución nueva y pasarás a la revisión.'}
                </p>
                <Button type='button' size='lg' className='mt-6'>
                  <Upload className='mr-2 size-5' />
                  Seleccionar archivo
                </Button>
              </div>
            )}
          </div>

          <div className='grid gap-3 md:grid-cols-3'>
            <div className='content-block-subtle p-4'>
              <p className='section-kicker'>Formato</p>
              <p className='mt-1 font-medium text-foreground'>`.docx`</p>
              <p className='mt-1 text-sm text-muted-foreground'>Debe contener imágenes embebidas para el OCR visual.</p>
            </div>
            <div className='content-block-subtle p-4'>
              <p className='section-kicker'>Cantidad</p>
              <p className='mt-1 font-medium text-foreground'>1 archivo por carga</p>
              <p className='mt-1 text-sm text-muted-foreground'>Ideal para una demo controlada y fácil de seguir.</p>
            </div>
            <div className='content-block-subtle p-4'>
              <p className='section-kicker'>Siguiente paso</p>
              <p className='mt-1 font-medium text-foreground'>Revisar resultados</p>
              <p className='mt-1 text-sm text-muted-foreground'>Luego podrás corregir, consultar logs y exportar a Excel.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
