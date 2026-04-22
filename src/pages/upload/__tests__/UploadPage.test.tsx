import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UploadPage } from '@/pages/upload/UploadPage';

const navigateMock = vi.fn();
const processFileMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

type DropzoneOptions = {
  onDrop: (files: File[]) => void;
  onDropRejected?: (rejections: unknown[]) => void;
};

let dropzoneOptions: DropzoneOptions | null;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

vi.mock('react-dropzone', () => ({
  useDropzone: (options: unknown) => {
    dropzoneOptions = options as DropzoneOptions;
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragAccept: false,
      isDragReject: false,
      isDragActive: false,
    };
  },
}));

vi.mock('@/features/processing/hooks/useProcessingContext', () => ({
  useProcessingActionsContext: () => ({
    processFile: processFileMock,
  }),
  useProcessingFlagsContext: () => ({
    isProcessing: false,
    isSavingCorrections: false,
  }),
}));

describe('UploadPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    processFileMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    dropzoneOptions = null;
  });

  it('rejects non-docx files before hitting the backend', async () => {
    render(<UploadPage />);
    expect(dropzoneOptions).not.toBeNull();
    const file = new File(['x'], 'nota.pdf', { type: 'application/pdf' });

    await dropzoneOptions!.onDrop([file]);

    expect(processFileMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith('Solo se permiten archivos .docx');
  });

  it('uploads docx and navigates to results', async () => {
    processFileMock.mockResolvedValue({ jobId: 123 });

    render(<UploadPage />);
    expect(dropzoneOptions).not.toBeNull();
    const file = new File(['x'], 'consignaciones.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    await dropzoneOptions!.onDrop([file]);

    expect(processFileMock).toHaveBeenCalledWith(file);
    expect(toastSuccessMock).toHaveBeenCalledWith('Ejecucion 123 creada correctamente');
    expect(navigateMock).toHaveBeenCalledWith('/results');
  });
});
