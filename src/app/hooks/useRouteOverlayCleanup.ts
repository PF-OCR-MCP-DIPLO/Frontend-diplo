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
  useEffect(() => registerRouteOverlayCleanup(handler), [handler]);
}
