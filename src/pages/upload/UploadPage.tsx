import { useCallback } from 'react';
import { CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
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
      toast.success(`Ejecucion ${job.jobId} creada correctamente`);
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
        title='Carga documental guiada'
        description='Paso 2 de 3: sube un `.docx`, crea la ejecucion y avanza directo a la revision operativa de resultados.'
      />
      <Card className='surface-card-hero p-6 sm:p-8'>
        <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
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
            {isProcessing ? (
              <div>
                <p className='text-xl font-semibold text-foreground'>Subiendo documento...</p>
                <p className='mt-2 text-body text-muted-foreground'>Estamos creando la ejecucion en el backend para llevarte al tablero de revision.</p>
                <p className='mt-3 text-sm font-semibold text-primary'>Siguiente paso: abrir resultados para validar extraccion.</p>
              </div>
            ) : (
              <div>
                <div className='mb-3 flex flex-wrap justify-center gap-2'>
                  <span className='meta-pill'>Formato admitido: .docx</span>
                  <span className='meta-pill'>1 archivo por carga</span>
                </div>
                <p className='text-xl font-semibold text-foreground'>
                  {dropzone.isDragReject
                    ? 'Archivo no compatible'
                    : dropzone.isDragAccept
                      ? 'Archivo listo para cargar'
                      : dropzone.isDragActive
                        ? 'Suelta el archivo aqui'
                        : 'Arrastra tu archivo .docx o haz clic para seleccionarlo'}
                </p>
                <p className='mt-2 text-body text-muted-foreground'>
                  {dropzone.isDragReject
                    ? 'Solo se admiten documentos Word (.docx).'
                    : 'Tu documento se enviara y quedara listo para revision en la siguiente pantalla.'}
                </p>
                <Button type='button' size='lg' className='mt-6'>
                  <Upload className='mr-2 size-5' />
                  Seleccionar archivo
                </Button>
              </div>
            )}
          </div>

          <aside className='space-y-4 surface-card p-5'>
            <div className='content-block-accent p-4'>
              <p className='section-eyebrow text-accent'>Estado del paso 2</p>
              <p className='mt-1 text-sm font-semibold text-foreground'>{uploadStageLabel}</p>
              <p className='mt-1 text-sm text-surface-accent-foreground/82'>
                {isProcessing ? 'La ejecucion se esta creando. En breve pasaras al paso 3: resultados.' : 'Carga un archivo valido para continuar al paso de resultados.'}
              </p>
            </div>

            <h3 className='text-base font-semibold text-foreground'>Checklist de confianza</h3>
            <ul className='feature-list'>
              <li className='feature-list-item'>
                <CheckCircle2 className='mt-0.5 size-4 text-success' />
                <span>Entrada controlada: solo `.docx`.</span>
              </li>
              <li className='feature-list-item'>
                <CheckCircle2 className='mt-0.5 size-4 text-success' />
                <span>Creacion inmediata de ejecucion para continuar sin friccion.</span>
              </li>
              <li className='feature-list-item'>
                <CheckCircle2 className='mt-0.5 size-4 text-success' />
                <span>Transicion directa a resultados para validar y corregir.</span>
              </li>
            </ul>
            <div className='content-block p-4'>
              <p className='section-kicker'>Continuidad del flujo</p>
              <div className='mt-2 space-y-2 text-sm text-surface-foreground'>
                <p><span className='font-medium text-foreground'>1. Dashboard:</span> define la accion y prepara la demo.</p>
                <p><span className='font-medium text-foreground'>2. Upload:</span> valida entrada y crea la ejecucion.</p>
                <p><span className='font-medium text-foreground'>3. Results:</span> demuestra valor con revision y exportacion.</p>
              </div>
            </div>
            <div className='info-strip'>
              Consejo para demo: usa un archivo con varias consignaciones para mostrar validacion y exportacion en un solo recorrido.
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
