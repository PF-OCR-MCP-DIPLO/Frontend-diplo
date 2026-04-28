/**
 * Contexto compartido del chat del asistente.
 *
 * Persiste mensajes, contexto de consulta e input actual para que la interfaz
 * del asistente mantenga continuidad entre rutas y recargas.
 */
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
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';

export interface AssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool?: string;
  toolData?: unknown;
  showDebugDetails?: boolean;
}

interface AssistantChatContextValue {
  messages: AssistantChatMessage[];
  setMessages: Dispatch<SetStateAction<AssistantChatMessage[]>>;
  clearChat: () => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  isSending: boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  queryContext: AssistantQueryContext;
  setQueryContext: Dispatch<SetStateAction<AssistantQueryContext>>;
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

function stableStringify(value: unknown): string {
  // La serialización estable evita re-renderizaciones falsas al comparar
  // contextos anidados con el mismo contenido pero distinto orden de claves.
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);
  return `{${entries.join(',')}}`;
}

export function areAssistantContextsEqual(
  left: AssistantQueryContext | undefined,
  right: AssistantQueryContext | undefined,
) {
  return stableStringify(left ?? {}) === stableStringify(right ?? {});
}

function isValidAssistantChatMessage(value: unknown): value is AssistantChatMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as Record<string, unknown>;
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string'
  );
}

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
      messages?: unknown[];
      queryContext?: AssistantQueryContext;
    };

    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return initialMessages;
    }

    const validMessages = parsed.messages.filter(isValidAssistantChatMessage);
    if (validMessages.length === 0) {
      return initialMessages;
    }

    return validMessages;
  } catch {
    return initialMessages;
  }
}

export function AssistantChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>(loadStoredMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [queryContext, setQueryContext] = useState<AssistantQueryContext>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);

      if (!rawValue) {
        return {};
      }

      const parsed = JSON.parse(rawValue) as { queryContext?: AssistantQueryContext };
      return parsed.queryContext ?? {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextValue = JSON.stringify({ messages, queryContext });
    const currentValue = window.localStorage.getItem(STORAGE_KEY);
    if (currentValue === nextValue) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, nextValue);
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
