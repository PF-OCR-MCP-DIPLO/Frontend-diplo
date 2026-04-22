import { useEffect, useRef } from 'react';
import { Bot, CalendarClock, FileText, Hash, Loader2, Send, Trash2, User } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { sendAssistantChat } from '@/features/assistant/api/assistant.api';
import { useAssistantChatContext, type AssistantChatMessage } from '@/features/assistant/hooks/AssistantChatContext';
import { statusClass, statusLabel } from '@/lib/constants/status';
import type { ApiJobDetail, ApiJobListItem } from '@/features/processing/types/processing.api';

interface AIChatProps {
  errors: number;
  jobId?: number | null;
}

export function AIChat({ errors, jobId = null }: AIChatProps) {
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
      behavior: 'smooth',
    });
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: AssistantChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
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
      const assistantMessage: AssistantChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        tool: response.tool,
        toolData: response.data,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: AssistantChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'No pude conectar con el asistente en este momento. Verifica que Ollama y el backend estén activos.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  function renderToolData(message: AssistantChatMessage) {
    if (message.tool === 'list_jobs' && Array.isArray(message.toolData)) {
      const jobs = message.toolData as ApiJobListItem[];

      return (
        <div className='mt-3 space-y-3'>
          <div className='flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>
                Lista de jobs
              </p>
              <p className='text-sm text-slate-700'>
                {jobs.length} {jobs.length === 1 ? 'registro encontrado' : 'registros encontrados'}
              </p>
            </div>
            <Badge variant='outline' className='rounded-full border-teal-200 bg-teal-50 text-teal-700'>
              {jobs.length}
            </Badge>
          </div>

          <div className='space-y-2'>
            {jobs.map((job) => (
              <div key={job.id} className='rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <FileText className='size-4 shrink-0 text-slate-400' />
                      <p className='truncate text-sm font-semibold text-slate-900'>{job.original_filename}</p>
                    </div>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500'>
                      <span className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1'>
                        <Hash className='size-3' />
                        ID {job.id}
                      </span>
                      <span className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1'>
                        <CalendarClock className='size-3' />
                        {job.created_at ? new Date(job.created_at).toLocaleString('es-ES') : 'Sin fecha'}
                      </span>
                    </div>
                  </div>
                  <Badge variant='outline' className={cn('rounded-full', statusClass[job.status] ?? 'border-slate-200 bg-slate-100 text-slate-700')}>
                    {statusLabel[job.status] ?? job.status}
                  </Badge>
                </div>

                <div className='mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4'>
                  <div className='rounded-xl bg-slate-50 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-[0.16em] text-slate-400'>Imágenes</p>
                    <p className='font-semibold text-slate-900'>{job.total_images}</p>
                  </div>
                  <div className='rounded-xl bg-slate-50 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-[0.16em] text-slate-400'>Registros</p>
                    <p className='font-semibold text-slate-900'>{job.total_records}</p>
                  </div>
                  <div className='rounded-xl bg-slate-50 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-[0.16em] text-slate-400'>Inicio</p>
                    <p className='truncate font-semibold text-slate-900'>
                      {job.started_at ? new Date(job.started_at).toLocaleString('es-ES') : 'Pendiente'}
                    </p>
                  </div>
                  <div className='rounded-xl bg-slate-50 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-[0.16em] text-slate-400'>Fin</p>
                    <p className='truncate font-semibold text-slate-900'>
                      {job.finished_at ? new Date(job.finished_at).toLocaleString('es-ES') : 'Pendiente'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (message.tool === 'get_job_status' && message.toolData && typeof message.toolData === 'object') {
      const job = message.toolData as ApiJobDetail;

      return (
        <div className='mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
          <p className='font-semibold text-slate-900'>
            Estado de {job.original_filename}
          </p>
          <p className='mt-1'>
            {statusLabel[job.status] ?? job.status} · {job.total_images} imágenes · {job.total_records} registros
          </p>
        </div>
      );
    }

    if (message.tool === 'get_last_record_value' && message.toolData && typeof message.toolData === 'object') {
      const payload = message.toolData as {
        job_id?: number;
        original_filename?: string;
        status?: string;
        total_records?: number;
        last_record?: {
          referencia?: string;
          valor?: string;
          fecha_consignacion?: string;
          hora_consignacion?: string;
          sequence_index?: number;
        };
        detail?: string;
      };

      if (payload.detail) {
        return (
          <div className='mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900'>
            {payload.detail}
          </div>
        );
      }

      return (
        <div className='mt-3 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-sm text-slate-800'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-teal-700'>
            Ultimo registro
          </p>
          <p className='mt-1 text-lg font-bold text-slate-900'>
            ${payload.last_record?.valor ?? 'N/D'}
          </p>
          <div className='mt-2 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2'>
            <div className='rounded-xl border border-teal-200 bg-white/80 px-3 py-2'>
              <p className='uppercase tracking-[0.16em] text-slate-400'>Referencia</p>
              <p className='font-semibold text-slate-900'>{payload.last_record?.referencia ?? 'N/D'}</p>
            </div>
            <div className='rounded-xl border border-teal-200 bg-white/80 px-3 py-2'>
              <p className='uppercase tracking-[0.16em] text-slate-400'>Job</p>
              <p className='font-semibold text-slate-900'>#{payload.job_id ?? 'N/D'} · {payload.original_filename ?? 'N/D'}</p>
            </div>
          </div>
        </div>
      );
    }

    if (message.tool === 'get_completed_records_summary' && message.toolData && typeof message.toolData === 'object') {
      const payload = message.toolData as {
        jobs_count?: number;
        total_records?: number;
        total_value?: string;
        currency?: string;
        detail?: string;
      };

      if (payload.detail) {
        return (
          <div className='mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900'>
            {payload.detail}
          </div>
        );
      }

      return (
        <div className='mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>
            Total acumulado
          </p>
          <p className='mt-1 text-lg font-bold text-slate-900'>
            {payload.total_value ?? '0.00'} {payload.currency ?? 'COP'}
          </p>
          <p className='mt-1 text-xs text-slate-500'>
            {payload.total_records ?? 0} registros completados en {payload.jobs_count ?? 0} jobs.
          </p>
        </div>
      );
    }

    if (message.tool === 'describe_database_schema' && message.toolData && typeof message.toolData === 'object') {
      const payload = message.toolData as {
        sources?: Record<string, { fields?: string[] }>;
        supported_filter_ops?: string[];
        supported_aggregations?: string[];
      };

      const sources = payload.sources ?? {};
      const sourceEntries = Object.entries(sources);

      return (
        <div className='mt-3 space-y-2'>
          <div className='rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600'>
            <p className='font-semibold uppercase tracking-[0.16em] text-slate-500'>
              Esquema disponible
            </p>
            <p className='mt-1'>
              {sourceEntries.length} fuente(s) consultables
            </p>
          </div>

          <div className='grid gap-2 sm:grid-cols-2'>
            {sourceEntries.map(([source, sourceInfo]) => (
              <div key={source} className='rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-700'>
                <p className='font-semibold uppercase tracking-[0.12em] text-slate-500'>{source}</p>
                <p className='mt-1 text-slate-600'>
                  Campos: {sourceInfo.fields?.length ?? 0}
                </p>
                <div className='mt-2 flex flex-wrap gap-1'>
                  {(sourceInfo.fields ?? []).slice(0, 8).map((field) => (
                    <Badge key={`${source}-${field}`} variant='outline' className='rounded-full border-slate-200 bg-slate-50 text-[10px] text-slate-600'>
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Array.isArray(payload.supported_filter_ops) ? (
            <div className='rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-700'>
              <p className='font-semibold uppercase tracking-[0.12em] text-slate-500'>Operadores de filtro</p>
              <p className='mt-1'>{payload.supported_filter_ops.join(', ')}</p>
            </div>
          ) : null}

          {Array.isArray(payload.supported_aggregations) ? (
            <div className='rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-700'>
              <p className='font-semibold uppercase tracking-[0.12em] text-slate-500'>Agregaciones</p>
              <p className='mt-1'>{payload.supported_aggregations.join(', ')}</p>
            </div>
          ) : null}
        </div>
      );
    }

    if ((message.tool === 'query_database' || message.tool === 'query_database_sql') && message.toolData && typeof message.toolData === 'object') {
      const payload = message.toolData as {
        detail?: string;
        source?: string;
        sql?: string;
        rows?: Array<Record<string, unknown>>;
        meta?: {
          rows_count?: number;
          limit?: number;
          group_by?: string[];
          has_aggregations?: boolean;
          warnings?: string[];
        };
      };

      if (payload.detail) {
        return (
          <div className='mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900'>
            {payload.detail}
          </div>
        );
      }

      const rows = Array.isArray(payload.rows) ? payload.rows : [];
      const visibleRows = rows.slice(0, 10);
      const columns = visibleRows.length > 0 ? Object.keys(visibleRows[0]) : [];

      return (
        <div className='mt-3 space-y-2'>
          <div className='rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600'>
            <p className='font-semibold uppercase tracking-[0.16em] text-slate-500'>
              {message.tool === 'query_database_sql'
                ? 'Consulta SQL'
                : `Consulta ${payload.source ?? 'DB'}`}
            </p>
            <p className='mt-1'>
              {payload.meta?.rows_count ?? rows.length} resultado(s)
              {payload.meta?.has_aggregations ? ' · agregaciones incluidas' : ''}
            </p>
            {message.tool === 'query_database_sql' && payload.sql ? (
              <p className='mt-1 truncate text-slate-500'>
                SQL: {payload.sql}
              </p>
            ) : null}
            {Array.isArray(payload.meta?.warnings) && payload.meta!.warnings!.length > 0 ? (
              <p className='mt-1 text-amber-700'>
                Advertencias: {payload.meta!.warnings!.slice(0, 2).join(' | ')}
              </p>
            ) : null}
          </div>

          {columns.length > 0 ? (
            <div className='overflow-x-auto rounded-2xl border border-slate-200 bg-white'>
              <table className='min-w-full text-xs text-slate-700'>
                <thead className='bg-slate-50 text-slate-500'>
                  <tr>
                    {columns.map((column) => (
                      <th key={column} className='px-3 py-2 text-left font-semibold uppercase tracking-[0.12em]'>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr key={index} className='border-t border-slate-100'>
                      {columns.map((column) => (
                        <td key={`${index}-${column}`} className='px-3 py-2 align-top'>
                          {row[column] == null ? '—' : String(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500'>
              Sin filas para mostrar.
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <Card className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Asistente IA</h3>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='gap-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            onClick={clearChat}
            disabled={isSending}
            aria-label='Limpiar conversación'
          >
            <Trash2 className='size-4' />
            Limpiar chat
          </Button>
        </div>
      </div>

      <ScrollArea className='flex-1 min-h-0 overflow-hidden p-4' viewportRef={viewportRef}>
        <div className='space-y-4 pr-2'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100'>
                  <Bot className='size-4 text-blue-600' />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {!(message.role === 'assistant' && message.tool === 'list_jobs') ? (
                  <p className='text-sm'>{message.content}</p>
                ) : null}
                {message.role === 'assistant' ? renderToolData(message) : null}
              </div>
              {message.role === 'user' && (
                <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200'>
                  <User className='size-4 text-gray-600' />
                </div>
              )}
            </div>
          ))}

          {isSending ? <ThinkingBubble /> : null}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder='¿Por qué este error?'
            className='flex-1'
            disabled={isSending}
          />
          <Button onClick={() => void handleSend()} size='icon' disabled={isSending}>
            <Send className='size-4' />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ThinkingBubble() {
  return (
    <div className='flex items-end gap-3 justify-start'>
      <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100'>
        <Bot className='size-4 text-blue-600' />
      </div>
      <div className='max-w-[80%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Loader2 className='size-4 animate-spin text-blue-600' />
          <div>
            <p className='text-sm font-medium text-slate-900'>Pensando</p>
            <div className='mt-1 flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.2s]' />
              <span className='size-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.1s]' />
              <span className='size-2 rounded-full bg-blue-300 animate-bounce' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
