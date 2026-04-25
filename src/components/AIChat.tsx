import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Database, Loader2, Send, Sparkles, Trash2, Wrench, BotMessageSquare, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { sendAssistantChat } from '@/features/assistant/api/assistant.api';
import { useAssistantChatContext, type AssistantChatMessage } from '@/features/assistant/hooks/AssistantChatContext';

interface AIChatProps {
  errors: number;
  jobId?: number | null;
  variant?: 'panel' | 'fullscreen';
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

function getSuggestions(jobId: number | null): ChatSuggestion[] {
  const base = [
    { label: '¿Qué puedes hacer?', message: '¿Qué puedes hacer?' },
    { label: 'Listar jobs recientes', message: 'Listar jobs recientes' },
    { label: 'Ver configuración', message: 'Ver configuración' },
    { label: 'Consultar errores del job actual', message: 'Consultar errores del job actual' },
    { label: 'Generar Excel', message: 'Generar Excel' },
  ];

  if (jobId == null) {
    return base.filter((item) => !item.message.toLowerCase().includes('job actual') && !item.message.toLowerCase().includes('generar excel'));
  }

  return [
    { label: '¿Qué puedes hacer?', message: '¿Qué puedes hacer?' },
    { label: 'Ver errores de este job', message: 'Qué errores tuvo este procesamiento' },
    { label: 'Exportar este job', message: 'Genera el Excel' },
    { label: 'Resume este procesamiento', message: 'Resume este archivo actual' },
    { label: 'Listar jobs recientes', message: 'Listar jobs recientes' },
  ];
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
            {tools.map((tool) => <Badge key={String(tool)} variant='outline'>{String(tool)}</Badge>)}
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
          <Badge variant='outline'>{data.length} jobs</Badge>
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

export function AIChat({ errors, jobId = null, variant = 'panel' }: AIChatProps) {
  const { messages, setMessages, clearChat, input, setInput, isSending, setIsSending, queryContext, setQueryContext } = useAssistantChatContext();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const suggestions = useMemo(() => getSuggestions(jobId), [jobId]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
        { jobId, errors, queryContext },
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

  return (
    <Card className={variant === 'fullscreen' ? 'flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-border/72 bg-white/92 shadow-[var(--shadow-panel)]' : 'flex h-full min-h-0 flex-col overflow-hidden'}>
      <div className='border-b border-border/72 bg-gradient-to-r from-surface-subtle via-white to-surface-subtle px-5 py-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <div className='flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary'>
              <Sparkles className='size-5' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground' aria-label='Asistente IA'>Asistente IA</h3>
              <p className='mt-1 text-sm text-muted-foreground'>Consulta jobs, logs, configuraciones y correcciones en lenguaje natural.</p>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <Badge variant='outline'>Chat conversacional</Badge>
                {jobId != null ? <Badge variant='muted'>Contexto: Job #{jobId}</Badge> : <Badge variant='muted'>Sin job seleccionado</Badge>}
                {errors > 0 ? <Badge variant='warning'>{errors} errores detectados</Badge> : <Badge variant='success'>Sin errores detectados</Badge>}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button type='button' variant='ghost' size='sm' className='gap-2' onClick={clearChat} disabled={isSending}>
              <Trash2 className='size-4' />
              Limpiar conversación
            </Button>
          </div>
        </div>
        <div className='mt-4 flex flex-wrap gap-2'>
          {suggestions.map((suggestion) => (
            <Button key={suggestion.label} type='button' variant='outline' size='sm' className='rounded-full' onClick={() => void sendMessage(suggestion.message)} disabled={isSending}>
              {suggestion.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className='min-h-0 flex-1 overflow-hidden px-4 py-4' viewportRef={viewportRef}>
        <div className='space-y-4 pr-2'>
          {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
          {isSending ? <ThinkingBubble /> : null}
        </div>
      </ScrollArea>

      <div className='border-t border-border/72 bg-white/95 p-4'>
        <div className='rounded-[24px] border border-border/72 bg-surface-subtle p-3 shadow-[var(--shadow-soft)]'>
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
            placeholder={jobId != null ? 'Escribe sobre este job o pregunta por la configuración...' : 'Escribe tu pregunta...'}
            className='min-h-28 w-full resize-none border-0 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground'
            disabled={isSending}
          />
          <div className='mt-3 flex items-center justify-between gap-3'>
            <p className='text-xs text-muted-foreground'>Enter envía, Shift+Enter agrega salto de línea.</p>
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
