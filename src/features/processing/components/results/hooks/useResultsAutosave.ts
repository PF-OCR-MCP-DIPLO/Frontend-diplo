import { useCallback, useEffect, useRef, useState } from 'react';
import { saveJobCorrections } from '@/features/processing/api/processing.api';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export type AutosaveEntry = {
  key: string;
  status: AutosaveStatus;
  lastSavedAt?: string;
  error?: string;
  retryCount?: number;
};

type SaveTarget = {
  jobId: number;
  rows: ConsignmentRow[];
  version: number;
  retryCount: number;
};

interface UseResultsAutosaveParams {
  jobId: number;
  enabled?: boolean;
  debounceMs?: number;
  onSaved?: () => void;
}

function buildPayload(rows: ConsignmentRow[]) {
  return {
    items: rows.map((row) => ({
      id: row.depositId,
      fecha_consignacion: row.fecha === 'Sin fecha' ? '' : row.fecha,
      hora_consignacion: row.hora,
      referencia: row.referencia,
      valor: row.monto,
    })),
  };
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudieron guardar los cambios';
}

export function useResultsAutosave({ jobId, enabled = true, debounceMs = 900, onSaved }: UseResultsAutosaveParams) {
  const [entry, setEntry] = useState<AutosaveEntry>({ key: String(jobId), status: 'idle' });
  const timerRef = useRef<number | null>(null);
  const latestVersionRef = useRef(0);
  const pendingTargetRef = useRef<SaveTarget | null>(null);
  const mountedRef = useRef(true);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commitSave = useCallback(async (target: SaveTarget) => {
    setEntry((current) => ({
      ...current,
      key: String(target.jobId),
      status: 'saving',
      retryCount: target.retryCount,
      error: undefined,
    }));

    try {
      await saveJobCorrections(target.jobId, buildPayload(target.rows));
      if (!mountedRef.current || latestVersionRef.current !== target.version) {
        return;
      }
      setEntry({
        key: String(target.jobId),
        status: 'saved',
        lastSavedAt: new Date().toISOString(),
        retryCount: target.retryCount,
      });
      onSaved?.();
    } catch (error) {
      if (!mountedRef.current || latestVersionRef.current !== target.version) {
        return;
      }
      setEntry({
        key: String(target.jobId),
        status: 'error',
        error: normalizeError(error),
        retryCount: target.retryCount,
      });
    }
  }, [onSaved]);

  const scheduleSave = useCallback((nextRows: ConsignmentRow[]) => {
    if (!enabled) {
      return;
    }

    const nextVersion = latestVersionRef.current + 1;
    latestVersionRef.current = nextVersion;
    const target: SaveTarget = {
      jobId,
      rows: nextRows,
      version: nextVersion,
      retryCount: pendingTargetRef.current?.retryCount ?? 0,
    };
    pendingTargetRef.current = target;

    setEntry((current) => ({
      ...current,
      key: String(jobId),
      status: 'dirty',
      error: undefined,
    }));

    clearTimer();
    timerRef.current = window.setTimeout(() => {
      const latestTarget = pendingTargetRef.current;
      if (!latestTarget) {
        return;
      }
      void commitSave(latestTarget);
    }, debounceMs);
  }, [clearTimer, commitSave, debounceMs, enabled, jobId]);

  const retry = useCallback(() => {
    const target = pendingTargetRef.current;
    if (!target) {
      return;
    }

    const retryTarget: SaveTarget = {
      ...target,
      version: latestVersionRef.current + 1,
      retryCount: (target.retryCount ?? 0) + 1,
    };
    latestVersionRef.current = retryTarget.version;
    pendingTargetRef.current = retryTarget;
    clearTimer();
    void commitSave(retryTarget);
  }, [clearTimer, commitSave]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimer();
      latestVersionRef.current += 1;
    };
  }, [clearTimer]);

  useEffect(() => {
    setEntry({ key: String(jobId), status: 'idle' });
    pendingTargetRef.current = null;
    latestVersionRef.current += 1;
    clearTimer();
  }, [clearTimer, jobId]);

  return {
    autosave: entry,
    retry,
    scheduleSave,
  };
}
