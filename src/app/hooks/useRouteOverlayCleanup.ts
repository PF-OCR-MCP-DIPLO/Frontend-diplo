/**
 * Registra limpiezas globales que deben correr al cambiar de ruta.
 *
 * Este mecanismo evita dejar abiertos overlays, paneles o listeners
 * pertenecientes a una pantalla anterior.
 *
 * @remarks
 * La limpieza es best-effort: un error en un handler no debe impedir que los
 * demás se ejecuten.
 */
import { useEffect } from 'react';

type CleanupFn = () => void;

const cleanupHandlers = new Set<CleanupFn>();

export function registerRouteOverlayCleanup(handler: CleanupFn) {
  cleanupHandlers.add(handler);
  return () => cleanupHandlers.delete(handler);
}

export function runRouteOverlayCleanups() {
  for (const handler of cleanupHandlers) {
    try {
      handler();
    } catch {
      // Best-effort cleanup only.
    }
  }
}

export function useRouteOverlayCleanup(handler: CleanupFn) {
  useEffect(() => {
    const unregister = registerRouteOverlayCleanup(handler);
    return () => {
      unregister();
    };
  }, [handler]);
}
