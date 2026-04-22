import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

export interface AssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool?: string;
  toolData?: unknown;
}

interface AssistantChatContextValue {
  messages: AssistantChatMessage[];
  setMessages: Dispatch<SetStateAction<AssistantChatMessage[]>>;
  clearChat: () => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  isSending: boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  queryContext: Record<string, unknown>;
  setQueryContext: Dispatch<SetStateAction<Record<string, unknown>>>;
}

const STORAGE_KEY = 'assistant_chat_state_v1';

const initialMessages: AssistantChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hola! ¿En que puedo ayudarte?',
    timestamp: new Date().toISOString(),
  },
];

const AssistantChatContext = createContext<AssistantChatContextValue | null>(null);

function loadStoredMessages() {
  if (typeof window === 'undefined') {
    return initialMessages;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return initialMessages;
    }

    const parsed = JSON.parse(rawValue) as {
      messages?: AssistantChatMessage[];
      queryContext?: Record<string, unknown>;
    };

    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return initialMessages;
    }

    return parsed.messages;
  } catch {
    return initialMessages;
  }
}

export function AssistantChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>(loadStoredMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [queryContext, setQueryContext] = useState<Record<string, unknown>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);

      if (!rawValue) {
        return {};
      }

      const parsed = JSON.parse(rawValue) as { queryContext?: Record<string, unknown> };
      return parsed.queryContext ?? {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, queryContext }));
  }, [messages, queryContext]);

  const clearChat = () => {
    setMessages(initialMessages);
    setInput('');
    setIsSending(false);
    setQueryContext({});

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      clearChat,
      input,
      setInput,
      isSending,
      setIsSending,
      queryContext,
      setQueryContext,
    }),
    [input, isSending, messages, queryContext],
  );

  return <AssistantChatContext.Provider value={value}>{children}</AssistantChatContext.Provider>;
}

export function useAssistantChatContext() {
  const context = useContext(AssistantChatContext);

  if (!context) {
    throw new Error('useAssistantChatContext must be used within AssistantChatProvider');
  }

  return context;
}