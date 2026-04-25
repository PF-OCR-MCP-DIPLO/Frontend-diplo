import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, CheckCircle2, ChevronDown, ChevronUp, Database, Loader2, Send, Sparkles, Trash2, Wrench, BotMessageSquare, User, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AssistantContextSelector } from '@/features/assistant/components/AssistantContextSelector';
import { sendAssistantChat } from '@/features/assistant/api/assistant.api';
import { useAssistantChatContext, type AssistantChatMessage } from '@/features/assistant/hooks/AssistantChatContext';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';

interface AIChatProps {
  errors: number;
  jobId?: number | null;
  variant?: 'panel' | 'fullscreen' | 'compact';
  queryContext?: AssistantQueryContext;
  initialPrompt?: string;
}

type ChatSuggestion = {
  label: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatValue(value: unknown) {
  if (value == null) return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.join(', ');
  return JSON.stringify(value);
}

function hasRows(toolData: unknown): toolData is { rows: unknown[] } {
  return isRecord(toolData) && Array.isArray(toolData.rows);
}

function getSuggestions(_jobId: number | null, queryContext?: AssistantQueryContext): ChatSuggestion[] {
  const scope = queryContext?.contextScope ?? (queryContext?.selectedField ? 'cell' : queryContext?.selectedRowId ? 'row' : queryContext?.currentImageId ? 'image' : queryContext?.visibleIssueIds?.length ? 'issues' : 'general');
  if (scope === 'cell') return [{ label: 'Por qué falla', message: 'Por qué falla este campo' }, { label: 'Valor válido', message: 'Propón un valor válido' }, { label: 'Cómo corregir', message: 'Cómo corregirlo' }];
  if (scope === 'row') return [{ label: 'Explicar fila', message: 'Explica esta fila' }, { label: 'Campos', message: 'Qué campos debo corregir' }, { label: 'Corregir', message: 'Propón correcciones' }];
  if (scope === 'image') return [{ label: 'Ver imagen', message: 'Qué se ve en esta imagen' }, { label: 'Inconsistencias', message: 'Detecta inconsistencias' }, { label: 'Relacionar', message: 'Relaciona imagen con filas' }];
  if (scope === 'issues') return [{ label: 'Priorizar', message: 'Prioriza errores' }, { label: 'Agrupar', message: 'Agrupa por causa' }, { label: 'Rápido', message: 'Qué puedo corregir rápido' }];
  return [{ label: 'Resumen', message: 'Resume el resultado' }, { label: 'Prioridad', message: 'Qué debo revisar primero' }, { label: 'Hallazgos', message: 'Explica los hallazgos' }];
}

function getCompactContextLabel(queryContext?: AssistantQueryContext, jobId: number | null = null, errors = 0) {
  const parts = [`Contexto: Job #${queryContext?.jobId ?? jobId ?? '—'}`, queryContext?.page === 'results' ? 'Results' : queryContext?.page ?? '—', `${queryContext?.errorCount ?? errors} hallazgos`];
  return parts.filter(Boolean).join(' · ');
}

function getContextDetails(queryContext?: AssistantQueryContext) {
  if (!queryContext) return [];
  return [
    queryContext.jobName ? `Job: ${queryContext.jobName}` : null,
    queryContext.jobStatus ? `Estado: ${queryContext.jobStatus}` : null,
    queryContext.selectedRowId ? `Fila: ${queryContext.selectedRowId}` : 'Sin fila seleccionada',
    queryContext.selectedField ? `Campo: ${queryContext.selectedField}` : null,
    queryContext.sourceImageId ? `Imagen origen: ${queryContext.sourceImageId}` : null,
    queryContext.currentImageId ? `Imagen actual: ${queryContext.currentImageId}` : null,
    queryContext.visibleIssueIds?.length ? `Hallazgos visibles: ${queryContext.visibleIssueIds.length}` : null,
    queryContext.intentHint ? `Intento: ${queryContext.intentHint}` : null,
    queryContext.depositId ? `DepositId: ${queryContext.depositId}` : null,
  ].filter(Boolean) as string[];
}

function summarizeSettings(toolData: unknown) {
  if (!isRecord(toolData)) return null;
  const lines: Array<{ label: string; value: string }> = [];
  if (isRecord(toolData.ocr_mode) || typeof toolData.ocr_mode === 'string') {
    lines.push({ label: 'OCR', value: `${formatValue(toolData.ocr_provider)} / ${formatValue(toolData.ocr_model)} (${formatValue(toolData.ocr_mode)})` });
  }
  if (toolData.llm_provider || toolData.llm_model) {
    lines.push({ label: 'LLM', value: `${formatValue(toolData.llm_provider)} / ${formatValue(toolData.llm_model)}` });
  }
  if (toolData.assistant_provider || toolData.assistant_model) {
    lines.push({ label: 'Chatbot', value: `${formatValue(toolData.assistant_provider)} / ${formatValue(toolData.assistant_model)}` });
  }
  if (toolData.request_timeout_seconds) {
    lines.push({ label: 'Timeout', value: `${formatValue(toolData.request_timeout_seconds)} s` });
  }
  return lines;
}

function formatToolItem(tool: unknown) {
  if (isRecord(tool)) {
    const name = typeof tool.tool === 'string' ? tool.tool : 'tool';
    const riskLevel = typeof tool.risk_level === 'string' ? tool.risk_level : null;
    return riskLevel ? `${name} (${riskLevel})` : name;
  }
  return formatValue(tool);
}

function AssistantToolSummary({ message }: { message: AssistantChatMessage }) {
  if (!message.tool || message.tool === 'none') return null;

  const data = message.toolData;
  const detail = isRecord(data) ? (data.detail || data.error || data.message) : null;
  const rows = hasRows(data) ? data.rows.filter(isRecord) : Array.isArray(data) ? data.filter(isRecord) : [];
  const settingsSummary = summarizeSettings(data);

  if (message.tool === 'explain_capabilities' || message.tool === 'help' || message.tool === 'list_available_tools') {
    const capabilities = isRecord(data) && Array.isArray(data.capabilities) ? data.capabilities : [];
    const tools = isRecord(data) && Array.isArray(data.tools) ? data.tools : [];
    return (
      <div className='mt-3 space-y-3 rounded-2xl border border-border/72 bg-white/88 p-4 text-sm shadow-[var(--shadow-soft)]'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Wrench className='size-4' />
          <span className='font-semibold uppercase tracking-[0.14em]'>Capacidades</span>
        </div>
        {Array.isArray(capabilities) && capabilities.length > 0 ? (
          <ul className='list-disc space-y-1 pl-5 text-foreground'>
            {capabilities.map((item, index) => <li key={index}>{formatValue(item)}</li>)}
          </ul>
        ) : null}
        {tools.length > 0 ? (
          <div className='flex flex-wrap gap-2'>
            {tools.map((tool) => <Badge key={formatToolItem(tool)} variant='outline'>{formatToolItem(tool)}</Badge>)}
          </div>
        ) : null}
      </div>
    );
  }

  if (message.tool === 'get_processing_settings' && settingsSummary) {
    return (
      <div className='mt-3 space-y-2 rounded-2xl border border-border/72 bg-white/88 p-4 text-sm shadow-[var(--shadow-soft)]'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <BotMessageSquare className='size-4' />
          <span className='font-semibold uppercase tracking-[0.14em]'>Configuración</span>
        </div>
        <div className='grid gap-2 sm:grid-cols-2'>
          {settingsSummary.map((item) => (
            <div key={item.label} className='rounded-xl border border-border/70 bg-surface-subtle px-3 py-2'>
              <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>{item.label}</p>
              <p className='mt-1 text-sm text-foreground'>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (message.tool === 'query_database' && rows.length > 0) {
    const columns = Object.keys(rows[0]).slice(0, 6);
    return (
      <div className='mt-3 rounded-2xl border border-border/72 bg-white/88 p-3 text-sm shadow-[var(--shadow-soft)]'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Database className='size-4' />
            <span className='font-semibold uppercase tracking-[0.14em]'>Resultados</span>
          </div>
          <Badge variant='outline'>{rows.length} filas</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 6).map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => <TableCell key={`${index}-${column}`}>{formatValue(row[column])}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (Array.isArray(data) && data.length > 0 && data.every(isRecord)) {
    const columns = ['id', 'original_filename', 'status', 'total_images', 'total_records', 'created_at']
      .filter((column) => column in data[0]);
    return (
      <div className='mt-3 rounded-2xl border border-border/72 bg-white/88 p-3 text-sm shadow-[var(--shadow-soft)]'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Database className='size-4' />
            <span className='font-semibold uppercase tracking-[0.14em]'>Jobs</span>
          </div>
          <span className='rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground'>{data.length} jobs</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 6).map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => <TableCell key={`${index}-${column}`}>{formatValue(row[column])}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (detail) {
    return (
      <div className='mt-3 rounded-2xl border border-warning/25 bg-warning/10 p-3 text-sm text-foreground'>
        <p className='font-semibold text-warning'>Aviso</p>
        <p className='mt-1'>{formatValue(detail)}</p>
      </div>
    );
  }

  return null;
}

function AssistantMessageDetails({ toolData }: { toolData: unknown }) {
  const [expanded, setExpanded] = useState(false);
  if (toolData == null) return null;

  return (
    <div className='mt-3'>
      <Button type='button' variant='ghost' size='sm' className='gap-2 px-0 text-muted-foreground' onClick={() => setExpanded((prev) => !prev)}>
        {expanded ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
        Ver detalles técnicos
      </Button>
      {expanded ? (
        <pre className='mt-2 max-h-64 overflow-auto rounded-2xl bg-surface-subtle p-3 font-mono text-[0.72rem] leading-relaxed text-muted-foreground'>
          {JSON.stringify(toolData, null, 2)}
        </pre>
      ) : null}
    </div>
  );
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
  if (!isRecord(message.toolData) || !message.toolData.requires_confirmation) {
    return null;
  }

  const detail = typeof message.toolData.detail === 'string' ? message.toolData.detail : 'La accion solicitada requiere confirmacion.';

  return (
    <div className='mt-3 rounded-2xl border border-warning/25 bg-warning/10 p-4 text-sm text-foreground shadow-[var(--shadow-soft)]'>
      <div className='flex items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning'>
          <Wrench className='size-5' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='font-semibold text-warning'>Accion pendiente de confirmacion</p>
          <p className='mt-1 text-muted-foreground'>{detail}</p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Button type='button' size='sm' className='gap-2' onClick={onConfirm}>
              <CheckCircle2 className='size-4' />
              Confirmar y ejecutar
            </Button>
            <Button type='button' size='sm' variant='outline' className='gap-2' onClick={onCancel}>
              <XCircle className='size-4' />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: AssistantChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary'>
          <Bot className='size-5' />
        </div>
      ) : null}
      <div className={`max-w-[min(720px,92%)] rounded-[24px] px-4 py-3 shadow-[var(--shadow-soft)] ${isUser ? 'bg-primary text-primary-foreground' : 'border border-border/72 bg-white/92 text-foreground'}`}>
        <p className='whitespace-pre-wrap leading-relaxed'>{message.content}</p>
        {!isUser ? (
          <>
            <AssistantToolSummary message={message} />
            {message.showDebugDetails ? <AssistantMessageDetails toolData={message.toolData} /> : null}
          </>
        ) : null}
      </div>
      {isUser ? (
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground/90 text-background'>
          <User className='size-5' />
          <span className='sr-only'>Usuario</span>
        </div>
      ) : null}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className='flex justify-start gap-3'>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary'>
        <Loader2 className='size-5 animate-spin' />
      </div>
      <div className='rounded-[24px] border border-border/72 bg-white/92 px-4 py-3 text-sm text-muted-foreground shadow-[var(--shadow-soft)]'>
        Pensando...
      </div>
    </div>
  );
}

export function AIChat({ errors, jobId = null, variant = 'panel', queryContext, initialPrompt }: AIChatProps) {
  const { messages, setMessages, clearChat, input, setInput, isSending, setIsSending, queryContext: assistantQueryContext, setQueryContext } = useAssistantChatContext();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const suggestions = useMemo(() => getSuggestions(jobId, queryContext ?? assistantQueryContext), [assistantQueryContext, jobId, queryContext]);
  const contextLabel = getCompactContextLabel(queryContext ?? assistantQueryContext, jobId, errors);
  const contextDetails = getContextDetails(queryContext ?? assistantQueryContext);
  const activeContext = queryContext ?? assistantQueryContext;
  const scope = activeContext?.contextScope ?? (activeContext?.selectedField ? 'cell' : activeContext?.selectedRowId ? 'row' : activeContext?.currentImageId ? 'image' : activeContext?.visibleIssueIds?.length ? 'issues' : activeContext?.jobId ? 'job' : 'general');
  const placeholderMap: Record<string, string> = {
    general: 'Pregunta algo…',
    job: 'Pregunta sobre este resultado…',
    row: 'Pregunta sobre la fila seleccionada…',
    cell: 'Pregunta cómo corregir este campo…',
    image: 'Pregunta sobre la imagen actual…',
    issues: 'Pregunta sobre los hallazgos visibles…',
  };
  const placeholder = placeholderMap[scope] ?? 'Pregunta algo…';
  const showSuggestions = messages.length < 3;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (queryContext) {
      setQueryContext(queryContext);
    }
  }, [queryContext, setQueryContext]);

  useEffect(() => {
    if (initialPrompt && !input) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, input, setInput]);

  const sendMessage = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || isSending) return;

    const userMessage: AssistantChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await sendAssistantChat(
        nextMessages.map((message) => ({ role: message.role, content: message.content })),
        { jobId, errors, queryContext: assistantQueryContext },
      );

      setQueryContext(response.query_context ?? {});
      setMessages((currentMessages) => [
        ...currentMessages,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message || response.reply,
            tool: response.tool,
            toolData: response.data,
            showDebugDetails: response.show_debug_details,
            timestamp: new Date().toISOString(),
          },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'No pude conectar con el asistente en este momento.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const isCompact = variant === 'compact';
  const isFullscreen = variant === 'fullscreen';

  return (
    <Card className={`flex h-full min-h-0 flex-col overflow-hidden border border-border/70 bg-card/95 ${isFullscreen ? 'rounded-[28px] shadow-[var(--shadow-panel)]' : isCompact ? 'rounded-2xl shadow-none' : 'rounded-[24px] shadow-[var(--shadow-soft)]'}`}>
      {!isCompact ? (
        <div className={`border-b border-border/70 px-4 ${isFullscreen ? 'py-4' : 'py-3'}`}>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex min-w-0 items-start gap-3'>
              <div className='flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <Sparkles className='size-5' />
              </div>
              <div className='min-w-0'>
                <h3 className={`${isFullscreen ? 'text-lg' : 'text-sm'} font-semibold text-foreground`} aria-label='Asistente IA'>Asistente IA</h3>
                {isFullscreen ? <p className='mt-1 text-sm text-muted-foreground'>Pregunta con contexto, sin salirte del flujo conversacional.</p> : null}
              </div>
            </div>
            <Button type='button' variant='ghost' size='sm' className='gap-2 text-muted-foreground' onClick={clearChat} disabled={isSending}>
              <Trash2 className='size-4' />
              Limpiar
            </Button>
          </div>
          {isFullscreen ? (
            <div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
              {jobId != null ? <span className='rounded-full border border-border/70 px-2.5 py-1'>Job #{jobId}</span> : null}
              <span className='rounded-full border border-border/70 px-2.5 py-1'>{errors > 0 ? `${errors} errores` : 'Sin errores'}</span>
            </div>
          ) : null}
          <div className='mt-3'>
            <AssistantContextSelector
              context={activeContext ?? {}}
              onChange={setQueryContext}
              visibleIssueIds={activeContext?.visibleIssueIds}
            />
          </div>
        </div>
      ) : (
        <div className='border-b border-border/70 px-4 py-3'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>{contextLabel}</p>
              <p className='mt-1 truncate text-sm text-foreground'>
                {(queryContext ?? assistantQueryContext)?.selectedRowId ? `Fila: ${(queryContext ?? assistantQueryContext)?.selectedRowId}` : `Job #${(queryContext ?? assistantQueryContext)?.jobId ?? jobId ?? '—'}`}
                {(queryContext ?? assistantQueryContext)?.selectedField ? ` · Campo: ${(queryContext ?? assistantQueryContext)?.selectedField}` : ''}
                {(queryContext ?? assistantQueryContext)?.sourceImageId ? ` · Imagen: ${(queryContext ?? assistantQueryContext)?.sourceImageId}` : ''}
              </p>
            </div>
            <details className='shrink-0'>
              <summary className='cursor-pointer list-none rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground'>Ver contexto</summary>
              <div className='mt-2 max-w-[280px] rounded-2xl border border-border/70 bg-background p-3 text-xs text-muted-foreground shadow-[var(--shadow-soft)]'>
                {contextDetails.length > 0 ? (
                  <ul className='space-y-1'>
                    {contextDetails.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p>Sin contexto adicional.</p>
                )}
              </div>
            </details>
          </div>
          <div className='mt-3'>
            <AssistantContextSelector
              context={activeContext ?? {}}
              onChange={setQueryContext}
              visibleIssueIds={activeContext?.visibleIssueIds}
            />
          </div>
        </div>
      )}

      <ScrollArea className='min-h-0 flex-1 overflow-hidden px-3 py-3' viewportRef={viewportRef}>
        <div className={`space-y-3 ${isCompact ? 'pr-1' : 'pr-2'}`}>
          {messages.map((message) => (
            <div key={message.id}>
              <ChatBubble message={message} />
              {message.role === 'assistant' ? (
                <PendingActionCard
                  message={message}
                  onConfirm={() => void sendMessage('confirmar')}
                  onCancel={() => void sendMessage('cancelar')}
                />
              ) : null}
            </div>
          ))}
          {isSending ? <ThinkingBubble /> : null}
        </div>
      </ScrollArea>

      <div className='border-t border-border/70 bg-card/98 p-3'>
        {showSuggestions ? (
          <div className='mb-2 flex flex-wrap gap-2'>
            {suggestions.slice(0, 3).map((suggestion) => (
              <Button key={suggestion.label} type='button' variant='ghost' size='sm' className='rounded-full px-3 text-xs text-muted-foreground' onClick={() => void sendMessage(suggestion.message)} disabled={isSending}>
                {suggestion.label}
              </Button>
            ))}
          </div>
        ) : null}
        <div className='rounded-2xl border border-border/70 bg-surface-subtle p-2'>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder={placeholder}
            className={`${isCompact ? 'min-h-20' : 'min-h-24'} w-full resize-none border-0 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground`}
            disabled={isSending}
          />
          <div className='mt-2 flex items-center justify-between gap-3 px-1'>
            <p className='text-xs text-muted-foreground'>{isCompact ? 'Enter envía' : 'Enter envía, Shift+Enter agrega salto de línea.'}</p>
            <Button onClick={() => void sendMessage()} size='sm' disabled={isSending || !input.trim()} className='gap-2'>
              {isSending ? <Loader2 className='size-4 animate-spin' /> : <Send className='size-4' />}
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
