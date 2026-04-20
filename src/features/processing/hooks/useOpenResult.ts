import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useProcessingActionsContext } from '@/features/processing/hooks/useProcessingContext';

export function useOpenResult() {
  const navigate = useNavigate();
  const { selectResult } = useProcessingActionsContext();

  return async (id: string, errorMessage: string) => {
    try {
      const selected = await selectResult(id);
      if (selected) {
        navigate('/results');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage);
    }
  };
}
