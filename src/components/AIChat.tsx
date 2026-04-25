import { useEffect, useRef } from "react";
import { Bot, Database, Loader2, Send, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendAssistantChat } from "@/features/assistant/api/assistant.api";
import {
  useAssistantChatContext,
  type AssistantChatMessage,
} from "@/features/assistant/hooks/AssistantChatContext";

interface AIChatProps {
  errors: number;
  jobId?: number | null;
  variant?: "panel" | "fullscreen";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatToolValue(value: unknown) {
  if (value == null) {
    return "-";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return JSON.stringify(value);
}

function getRows(toolData: unknown) {
  if (Array.isArray(toolData)) {
    return toolData.filter(isRecord);
  }

  if (isRecord(toolData) && Array.isArray(toolData.rows)) {
    return toolData.rows.filter(isRecord);
  }

  return [];
}

function ToolDataPreview({ message }: { message: AssistantChatMessage }) {
  if (!message.tool || message.toolData == null) {
    return null;
  }

  const rows = getRows(message.toolData);
  const visibleRows = rows.slice(0, 6);
  const columns =
    visibleRows.length > 0 ? Object.keys(visibleRows[0]).slice(0, 6) : [];

  return (
    <div className="mt-3 rounded-2xl border border-border/72 bg-white/88 p-3 text-xs text-foreground shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-primary" />
          <p className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {message.tool}
          </p>
        </div>
        {rows.length > 0 ? (
          <Badge variant="outline">{rows.length} filas</Badge>
        ) : null}
      </div>

      {columns.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="min-w-full text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-3 py-2 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={index} className="border-t border-border/60">
                  {columns.map((column) => (
                    <td
                      key={`${index}-${column}`}
                      className="max-w-48 truncate px-3 py-2"
                    >
                      {formatToolValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-muted/45 p-3 font-mono text-[0.72rem] leading-relaxed text-muted-foreground">
          {JSON.stringify(message.toolData, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function AIChat({
  errors,
  jobId = null,
  variant = "panel",
}: AIChatProps) {
  const {
    messages,
    setMessages,
    clearChat,
    input,
    setInput,
    isSending,
    setIsSending,
    queryContext,
    setQueryContext,
  } = useAssistantChatContext();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) {
      return;
    }

    const userMessage: AssistantChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
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
        { jobId, errors, queryContext },
      );

      setQueryContext(response.query_context ?? {});
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.reply,
          tool: response.tool,
          toolData: response.data,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "No pude conectar con el asistente en este momento. Verifica que Ollama y el backend esten activos.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card
      className={
        variant === "fullscreen"
          ? "flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-border/72 bg-white/92 shadow-[var(--shadow-panel)]"
          : "flex h-full flex-col overflow-hidden"
      }
    >
      <div className="panel-header">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="icon-chip-primary size-10 rounded-full">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Asistente IA</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Consulta jobs, estados y datos del procesamiento.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={clearChat}
            disabled={isSending}
          >
            <Trash2 className="size-4" />
            Limpiar
          </Button>
        </div>
      </div>

      <ScrollArea
        className="min-h-0 flex-1 overflow-hidden p-4"
        viewportRef={viewportRef}
      >
        <div className="space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" ? (
                <div className="chat-avatar-assistant">
                  <Bot className="size-4" />
                </div>
              ) : null}
              <div
                className={
                  message.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-assistant"
                }
              >
                <p>{message.content}</p>
                {message.role === "assistant" ? (
                  <ToolDataPreview message={message} />
                ) : null}
              </div>
              {message.role === "user" ? (
                <div className="chat-avatar-user">
                  <User className="size-4" />
                </div>
              ) : null}
            </div>
          ))}

          {isSending ? <ThinkingBubble /> : null}
        </div>
      </ScrollArea>

      <div className="border-t border-border/70 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSend();
              }
            }}
            placeholder={
              variant === "fullscreen"
                ? "Escribe un mensaje para el asistente..."
                : "Pregunta por un hallazgo o job"
            }
            className="flex-1"
            disabled={isSending}
          />
          <Button
            onClick={() => void handleSend()}
            size="icon"
            disabled={isSending || !input.trim()}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start gap-3">
      <div className="chat-avatar-assistant">
        <Bot className="size-4" />
      </div>
      <div className="chat-bubble-assistant">
        <div className="flex items-center gap-3">
          <Loader2 className="size-4 animate-spin text-primary" />
          <p>Pensando...</p>
        </div>
      </div>
    </div>
  );
}
