import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AIChat } from '@/components/AIChat';
import { areAssistantContextsEqual, useAssistantChatContext } from '@/features/assistant/hooks/AssistantChatContext';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import { readSettingsAssistantContext } from '@/features/settings/hooks/openSettingsAssistant';

type AssistantLocationState = {
  assistantQueryContext?: AssistantQueryContext;
  assistantPrompt?: string;
};

export function AssistantPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as AssistantLocationState | null;
  const storedSettingsContext = readSettingsAssistantContext();
  const { queryContext, setQueryContext } = useAssistantChatContext();

  const incomingContext = useMemo(
    () => state?.assistantQueryContext ?? storedSettingsContext?.assistantQueryContext ?? {},
    [state?.assistantQueryContext, storedSettingsContext?.assistantQueryContext],
  );

  const [oneShotInitialPrompt] = useState(
    () => state?.assistantPrompt ?? storedSettingsContext?.assistantPrompt ?? '',
  );

  useEffect(() => {
    if (!state?.assistantPrompt) return;

    navigate('/assistant', {
      replace: true,
      state: {
        assistantQueryContext: state.assistantQueryContext,
      },
    });
  }, [navigate, state?.assistantPrompt, state?.assistantQueryContext]);

  const activeContext = useMemo(() => {
    const merged = { ...queryContext, ...incomingContext };
    return areAssistantContextsEqual(queryContext, merged) ? queryContext : merged;
  }, [incomingContext, queryContext]);

  const handleClearContext = () => {
    setQueryContext({ page: 'assistant', contextScope: 'general' });
  };

  const showBackButton =
    state?.assistantQueryContext?.page === 'results' ||
    storedSettingsContext?.assistantQueryContext?.page === 'results';

  const handleBack = () => navigate('/results');

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-3">
      <div className="max-h flex">
        <AIChat
          errors={0}
          jobId={activeContext.jobId ?? null}
          variant="fullscreen"
          queryContext={activeContext}
          initialPrompt={oneShotInitialPrompt}
          onClearContext={handleClearContext}
          showBackButton={showBackButton}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}