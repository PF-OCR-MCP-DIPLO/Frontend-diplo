import { Modal } from '@/components/shared/Modal';

interface ResultsImagePreviewDialogProps {
  open: boolean;
  image: { url: string; name: string } | null;
  onClose: () => void;
}

export function ResultsImagePreviewDialog({ open, image, onClose }: ResultsImagePreviewDialogProps) {
  return (
    <Modal open={open && Boolean(image)} onClose={onClose} title={image?.name ?? 'Vista ampliada'} size='xl'>
      {image ? (
        <div className='flex max-h-[80vh] items-center justify-center overflow-auto rounded-3xl bg-slate-100 p-4'>
          <img src={image.url} alt={image.name} className='max-h-[76vh] rounded-3xl bg-white shadow-lg' />
        </div>
      ) : null}
    </Modal>
  );
}
