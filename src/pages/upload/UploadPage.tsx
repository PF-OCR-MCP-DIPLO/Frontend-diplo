import { useCallback } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProcessing } from '@/features/processing/hooks/useProcessingContext';

export function UploadPage() {
  const navigate = useNavigate();
  const { processFile, isProcessing } = useProcessing();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Solo se permiten archivos .docx');
      return;
    }

    try {
      const job = await processFile(file);
      toast.success(`Job ${job.jobId} creado correctamente`);
      navigate('/results');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir el documento');
    }
  }, [navigate, processFile]);

  const dropzone = useDropzone({
    onDrop: (files) => void onDrop(files),
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div className='space-y-6'>
      <PageHeader eyebrow='Upload' title='Cargar nuevo documento' description='Sube archivos Word para crear un job y continuar al tablero de resultados.' />
      <Card className='rounded-[36px] border-slate-200 p-6 shadow-sm sm:p-10'>
        <div
          {...dropzone.getRootProps()}
          className={`flex min-h-[420px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed px-6 text-center transition ${dropzone.isDragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'} ${isProcessing ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
        >
          <input {...dropzone.getInputProps()} />
          <div className='mb-6 flex size-24 items-center justify-center rounded-full bg-white shadow-sm'>
            {isProcessing ? <Loader2 className='size-12 animate-spin text-teal-700' /> : <FileText className='size-12 text-slate-400' />}
          </div>
          {isProcessing ? (
            <div>
              <p className='text-xl font-semibold text-slate-900'>Subiendo documento...</p>
              <p className='mt-2 text-slate-600'>Creando el job en el backend</p>
            </div>
          ) : (
            <div>
              <p className='text-xl font-semibold text-slate-900'>{dropzone.isDragActive ? 'Suelta el archivo aqui' : 'Arrastra tu archivo .docx o haz clic'}</p>
              <p className='mt-2 text-slate-600'>Soporta unicamente documentos Word (.docx)</p>
              <Button type='button' size='lg' className='mt-6 rounded-2xl'>
                <Upload className='mr-2 size-5' />
                Seleccionar archivo
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
