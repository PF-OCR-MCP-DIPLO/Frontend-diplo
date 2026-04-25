import { useNavigate } from 'react-router-dom';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';

export interface AssistantLaunchContext {
  prompt?: string;
  context: AssistantQueryContext;
}

export function useOpenAssistantWithContext() {
  const navigate = useNavigate();

  return (launch: AssistantLaunchContext) => {
    navigate('/assistant', {
      state: {
        assistantQueryContext: launch.context,
        assistantPrompt: launch.prompt ?? '',
      },
    });
  };
}
