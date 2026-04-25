import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantContextSelector } from "@/features/assistant/components/AssistantContextSelector";
import { sendAssistantChat } from "@/features/assistant/api/assistant.api";
import {
  areAssistantContextsEqual,
  useAssistantChatContext,
  type AssistantChatMessage,
} from "@/features/assistant/hooks/AssistantChatContext";
import type { AssistantQueryContext } from "@/features/assistant/types/assistant-query-context.types";

interface AIChatProps {
  errors: number;
  jobId?: number | null;
  variant?: "fullscreen" | "embedded";
  queryContext?: AssistantQueryContext;
  initialPrompt?: string;
}

type ChatSuggestion = { label: string; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSuggestions(
  queryContext?: AssistantQueryContext,
): ChatSuggestion[] {
  const scope =
    queryContext?.contextScope ??
    (queryContext?.selectedField
      ? "cell"
      : queryContext?.selectedRowId
        ? "row"
        : queryContext?.currentImageId
          ? "image"
          : queryContext?.visibleIssueIds?.length
            ? "issues"
            : "job");
  if (scope === "cell")
    return [
      { label: "Por qué falla", message: "Por qué falla este campo" },
      { label: "Corregir", message: "Propón un valor válido" },
      { label: "Explicar", message: "Explícame esta celda" },
    ];
  if (scope === "row")
    return [
      { label: "Explicar fila", message: "Explica esta fila" },
      { label: "Campos", message: "Qué campos debo corregir" },
      { label: "Corregir", message: "Propón correcciones" },
    ];
  if (scope === "image")
    return [
      { label: "Ver imagen", message: "Qué se ve en esta imagen" },
      { label: "Inconsistencias", message: "Detecta inconsistencias" },
      { label: "Relacionar", message: "Relaciona imagen con filas" },
    ];
  if (scope === "issues")
    return [
      { label: "Priorizar", message: "Prioriza errores" },
      { label: "Agrupar", message: "Agrupa los errores" },
      { label: "Rápido", message: "Qué puedo corregir primero" },
    ];
  return [
    { label: "Resumen", message: "Resume el resultado" },
    { label: "Prioridad", message: "Qué debo revisar primero" },
    { label: "Hallazgos", message: "Explica los hallazgos" },
  ];
}

function formatContextLabel(
  queryContext?: AssistantQueryContext,
  jobId?: number | null,
) {
  const parts = [`Contexto: Job #${queryContext?.jobId ?? jobId ?? "—"}`];
  if (queryContext?.selectedRowId)
    parts.push(`Fila ${queryContext.selectedRowId}`);
  if (queryContext?.selectedField)
    parts.push(`Campo ${queryContext.selectedField}`);
  if (queryContext?.currentImageId)
    parts.push(`Imagen ${queryContext.currentImageId}`);
  return parts.join(" · ");
}

function AssistantToolSummary({ message }: { message: AssistantChatMessage }) {
  if (!message.tool || message.tool === "none") return null;
  if (message.showDebugDetails && isRecord(message.toolData)) {
    return (
      <details className="mt-3 rounded-xl border border-border/60 bg-surface-subtle px-3 py-2 text-xs text-muted-foreground">
        <summary className="cursor-pointer list-none">
          Ver contexto técnico
        </summary>
        <pre className="mt-2 overflow-auto whitespace-pre-wrap text-[11px]">
          {JSON.stringify(message.toolData, null, 2)}
        </pre>
      </details>
    );
  }
  return null;
}

function PendingActionCard({
  message,
  onConfirm,
  onCancel,
}: {
  message: AssistantChatMessage;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isRecord(message.toolData) || !message.toolData.requires_confirmation)
    return null;
  return (
    <div className="mt-3 rounded-xl border border-warning/25 bg-warning/10 p-3 text-sm">
      <p className="font-medium text-warning">
        Acción pendiente de confirmación
      </p>
      <p className="mt-1 text-muted-foreground">
        {typeof message.toolData.detail === "string"
          ? message.toolData.detail
          : "Esta acción requiere confirmación."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={onConfirm} className="gap-2">
          <CheckCircle2 className="size-4" />
          Confirmar y ejecutar
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: AssistantChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>
      ) : null}
      <div
        className={`max-w-[min(780px,92%)] rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? "bg-primary text-primary-foreground" : "border border-border/70 bg-background text-foreground"}`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser ? <AssistantToolSummary message={message} /> : null}
      </div>
      {isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <User className="size-4" />
        </div>
      ) : null}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Loader2 className="size-4 animate-spin" />
      </div>
      <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
        Pensando...
      </div>
    </div>
  );
}

export function AIChat({
  errors,
  jobId = null,
  queryContext,
  initialPrompt,
}: AIChatProps) {
  const {
    messages,
    setMessages,
    clearChat,
    input,
    setInput,
    isSending,
    setIsSending,
    queryContext: storedContext,
    setQueryContext,
  } = useAssistantChatContext();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const activeContext = queryContext ?? storedContext;
  const suggestions = useMemo(
    () => getSuggestions(activeContext),
    [activeContext],
  );
  const [showContext, setShowContext] = useState(false);

  // 👇 Función para ajustar la altura del textarea dinámicamente
  const adjustTextareaHeight = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    // Resetear altura para obtener el scrollHeight real
    textarea.style.height = "auto";
    const maxHeight = 200; // Altura máxima en píxeles
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    // Mostrar scroll solo si el contenido supera la altura máxima
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  // 👇 Ajustar la altura cada vez que cambia el texto
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // 👇 Ajustar al montar y al redimensionar la ventana (por si cambia el ancho)
  useEffect(() => {
    adjustTextareaHeight();
    window.addEventListener("resize", adjustTextareaHeight);
    return () => window.removeEventListener("resize", adjustTextareaHeight);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      if (typeof viewport.scrollTo === "function") {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      } else {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isSending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (queryContext && !areAssistantContextsEqual(queryContext, storedContext)) {
      setQueryContext(queryContext);
    }
  }, [queryContext, setQueryContext, storedContext]);

  useEffect(() => {
    if (initialPrompt && !input) setInput(initialPrompt);
  }, [initialPrompt, input, setInput]);

  const sendMessage = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || isSending) return;
    const userMessage: AssistantChatMessage = {
      id: `${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    try {
      const response = await sendAssistantChat(
        nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { jobId, errors, queryContext: activeContext },
      );
      if (!areAssistantContextsEqual(response.query_context, storedContext)) {
        setQueryContext(response.query_context ?? {});
      }
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now() + 1}`,
          role: "assistant",
          content: response.message || response.reply,
          tool: response.tool,
          toolData: response.data,
          showDebugDetails: response.show_debug_details,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now() + 1}`,
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "No pude conectar con el asistente.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <Card className="mx-auto flex h-full min-h-0 w-full max-w flex-col overflow-hidden border border-border/70 bg-card/95 shadow-[var(--shadow-soft)]">
      <div className="border-b border-border/70 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <h1 className="text-base font-semibold text-foreground">
                Asistente
              </h1>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {formatContextLabel(activeContext, jobId)} ·{" "}
              {errors > 0 ? `${errors} errores` : "Sin errores"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={() => setShowContext((value) => !value)}
            >
              {showContext ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              Ver contexto
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={clearChat}
              disabled={isSending}
            >
              <Trash2 className="size-4" />
              Limpiar
            </Button>
          </div>
        </div>
        {showContext ? (
          <div className="mt-1 rounded-xl border border-border/60 bg-surface-subtle p-3">
            <AssistantContextSelector
              context={activeContext ?? {}}
              onChange={setQueryContext}
              visibleIssueIds={activeContext?.visibleIssueIds}
            />
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full px-3 py-4" viewportRef={viewportRef}>
          <div className="mx-auto space-y-3">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-[720px] rounded-2xl border border-dashed border-border/70 bg-surface-subtle p-5 text-center">
                <p className="text-lg font-medium text-foreground">
                  ¿Qué quieres revisar?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Haz una pregunta concreta sobre el resultado, una fila o una
                  celda.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <Button
                      key={suggestion.label}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={() => void sendMessage(suggestion.message)}
                      disabled={isSending}
                    >
                      {suggestion.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            {messages.map((message) => (
              <div key={message.id}>
                <ChatBubble message={message} />
                {message.role === "assistant" ? (
                  <PendingActionCard
                    message={message}
                    onConfirm={() => void sendMessage("confirmar")}
                    onCancel={() => void sendMessage("cancelar")}
                  />
                ) : null}
              </div>
            ))}
            {isSending ? <ThinkingBubble /> : null}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border/70 bg-card px-3 py-3">
        <div className="mx-auto max-w rounded-2xl border border-border/70 bg-surface-subtle p-1.5">
          {" "}
          {/* antes p-2 */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Pregunta algo…"
            className="min-h-[12px] w-full resize-none border-0 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground" // py-1 en vez de py-1.5, min-h-[36px]
            disabled={isSending}
            style={{ overflowY: "hidden" }}
          />
          <div className="flex items-center justify-between px-1">
            {" "}
            {/* mt-1 en vez de mt-2 */}
            <p className="text-xs text-muted-foreground">
              Enter envía, Shift+Enter salto
            </p>{" "}
            {/* texto más corto */}
            <Button
              type="button"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => void sendMessage()}
              disabled={isSending || !input.trim()}
            >
              {" "}
              {/* botón más compacto */}
              {isSending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
