/**
 * Mantiene la caché local de corridas procesadas en orden estable.
 *
 * La UI usa este merge para conservar historial y rehidratar la ejecución
 * activa sin perder el resto de corridas cargadas.
 */
import type { ProcessedFile } from '@/features/processing/types/processing.types';

export function mergeProcessedJob(previous: ProcessedFile[], next: ProcessedFile) {
  return [next, ...previous.filter((item) => item.jobId !== next.jobId)].sort(
    (left, right) => right.date.getTime() - left.date.getTime()
  );
}
