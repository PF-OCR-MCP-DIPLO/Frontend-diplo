import { useCallback, useMemo, useState } from "react";
import type React from "react";

export type ResizableColumn = {
  key: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
};

type WidthMap = Record<string, number>;

function readStoredWidths(storageKey: string): WidthMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as WidthMap) : {};
  } catch {
    return {};
  }
}

function persistWidths(storageKey: string, widths: WidthMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(widths));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useResizableColumns(
  columns: ResizableColumn[],
  storageKey = "diplo.results-table.column-widths.v1",
) {
  const [widths, setWidths] = useState<WidthMap>(() => readStoredWidths(storageKey));

  const resolvedWidths = useMemo(() => {
    return columns.reduce<WidthMap>((acc, column) => {
      acc[column.key] = clamp(
        widths[column.key] ?? column.defaultWidth,
        column.minWidth,
        column.maxWidth,
      );
      return acc;
    }, {});
  }, [columns, widths]);

  const setColumnWidth = useCallback(
    (key: string, nextWidth: number) => {
      const column = columns.find((item) => item.key === key);
      if (!column) return;
      setWidths((previous) => {
        const next = {
          ...previous,
          [key]: clamp(nextWidth, column.minWidth, column.maxWidth),
        };
        persistWidths(storageKey, next);
        return next;
      });
    },
    [columns, storageKey],
  );

  const startResize = useCallback(
    (key: string, event: React.PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startWidth = resolvedWidths[key];

      function handlePointerMove(moveEvent: PointerEvent) {
        setColumnWidth(key, startWidth + moveEvent.clientX - startX);
      }

      function handlePointerUp() {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      }

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [resolvedWidths, setColumnWidth],
  );

  const autoFitColumn = useCallback(
    (key: string, values: string[]) => {
      const column = columns.find((item) => item.key === key);
      if (!column) return;
      const longest = values.reduce(
        (max, value) => Math.max(max, String(value ?? "").length),
        key.length,
      );
      setColumnWidth(key, clamp(56 + longest * 8, column.minWidth, column.maxWidth));
    },
    [columns, setColumnWidth],
  );

  return {
    widths: resolvedWidths,
    totalWidth: columns.reduce((sum, column) => sum + resolvedWidths[column.key], 0),
    startResize,
    autoFitColumn,
  };
}
