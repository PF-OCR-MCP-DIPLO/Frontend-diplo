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
    <div className='space-y-6'>
      <PageHeader
        eyebrow='Carga'
        title='Carga documental guiada'
        description='Paso 2 de 3: sube un `.docx`, crea la ejecucion y avanza directo a la revision operativa de resultados.'
      />
      <Card className='rounded-[36px] border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 shadow-sm sm:p-8'>
        <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
          <div
            {...dropzone.getRootProps()}
            className={`flex min-h-[420px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed px-6 text-center transition ${
              dropzone.isDragAccept
                ? 'border-emerald-400 bg-emerald-50'
                : dropzone.isDragReject
                  ? 'border-red-400 bg-red-50'
                  : dropzone.isDragActive
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
            } ${isProcessing ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
          >
            <input {...dropzone.getInputProps()} />
            <div className='mb-6 flex size-24 items-center justify-center rounded-full bg-white shadow-sm'>
              {isProcessing ? <Loader2 className='size-12 animate-spin text-teal-700' /> : <FileText className='size-12 text-slate-400' />}
            </div>
            {isProcessing ? (
              <div>
                <p className='text-xl font-semibold text-slate-900'>Subiendo documento...</p>
                <p className='mt-2 text-slate-600'>Estamos creando la ejecucion en el backend para llevarte al tablero de revision.</p>
                <p className='mt-3 text-sm font-medium text-teal-700'>Siguiente paso: abrir resultados para validar extraccion.</p>
              </div>
            ) : (
              <div>
                <div className='mb-3 flex flex-wrap justify-center gap-2'>
                  <span className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600'>Formato admitido: .docx</span>
                  <span className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600'>1 archivo por carga</span>
                </div>
                <p className='text-xl font-semibold text-slate-900'>
                  {dropzone.isDragReject
                    ? 'Archivo no compatible'
                    : dropzone.isDragAccept
                      ? 'Archivo listo para cargar'
                      : dropzone.isDragActive
                        ? 'Suelta el archivo aqui'
                        : 'Arrastra tu archivo .docx o haz clic para seleccionarlo'}
                </p>
                <p className='mt-2 text-slate-600'>
                  {dropzone.isDragReject
                    ? 'Solo se admiten documentos Word (.docx).'
                    : 'Tu documento se enviara y quedara listo para revision en la siguiente pantalla.'}
                </p>
                <Button type='button' size='lg' className='mt-6 rounded-2xl'>
                  <Upload className='mr-2 size-5' />
                  Seleccionar archivo
                </Button>
              </div>
            )}
          </div>

          <aside className='space-y-4 rounded-[28px] border border-slate-200 bg-white p-5'>
            <div className='rounded-2xl border border-teal-200 bg-teal-50/70 p-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-teal-700'>Estado del paso 2</p>
              <p className='mt-1 text-sm font-semibold text-slate-900'>{uploadStageLabel}</p>
              <p className='mt-1 text-sm text-slate-600'>
                {isProcessing ? 'La ejecucion se esta creando. En breve pasaras al paso 3: resultados.' : 'Carga un archivo valido para continuar al paso de resultados.'}
              </p>
            </div>

            <h3 className='text-base font-semibold text-slate-900'>Checklist de confianza</h3>
            <ul className='space-y-3 text-sm text-slate-700'>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 text-emerald-600' />
                <span>Entrada controlada: solo `.docx`.</span>
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 text-emerald-600' />
                <span>Creacion inmediata de ejecucion para continuar sin friccion.</span>
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 text-emerald-600' />
                <span>Transicion directa a resultados para validar y corregir.</span>
              </li>
            </ul>
            <div className='rounded-2xl border border-slate-200 bg-white p-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-slate-500'>Continuidad del flujo</p>
              <div className='mt-2 space-y-2 text-sm text-slate-700'>
                <p><span className='font-medium text-slate-900'>1. Dashboard:</span> define la accion y prepara la demo.</p>
                <p><span className='font-medium text-slate-900'>2. Upload:</span> valida entrada y crea la ejecucion.</p>
                <p><span className='font-medium text-slate-900'>3. Results:</span> demuestra valor con revision y exportacion.</p>
              </div>
            </div>
            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600'>
              Consejo para demo: usa un archivo con varias consignaciones para mostrar validacion y exportacion en un solo recorrido.
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
