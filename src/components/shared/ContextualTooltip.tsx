import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ContextualTooltipProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  openDelay?: number;
  closeDelay?: number;
}

type TooltipPosition = {
  top: number;
  left: number;
};

const VIEWPORT_MARGIN = 12;
const TOOLTIP_GAP = 8;
const FALLBACK_WIDTH = 320;
const FALLBACK_HEIGHT = 140;

function clearTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ContextualTooltip({
  trigger,
  content,
  className,
  openDelay = 180,
  closeDelay = 180,
}: ContextualTooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
  });

  const id = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    const triggerElement = triggerRef.current;

    if (!triggerElement) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? FALLBACK_WIDTH;
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? FALLBACK_HEIGHT;

    const maxLeft = window.innerWidth - tooltipWidth - VIEWPORT_MARGIN;
    const left = clamp(
      triggerRect.left,
      VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, maxLeft),
    );

    const bottomTop = triggerRect.bottom + TOOLTIP_GAP;
    const wouldOverflowBottom =
      bottomTop + tooltipHeight > window.innerHeight - VIEWPORT_MARGIN;

    const top = wouldOverflowBottom
      ? Math.max(VIEWPORT_MARGIN, triggerRect.top - tooltipHeight - TOOLTIP_GAP)
      : bottomTop;

    setPosition({ top, left });
  }, []);

  const openTooltip = useCallback(() => {
    clearTimer(closeTimerRef);
    clearTimer(openTimerRef);

    openTimerRef.current = window.setTimeout(() => {
      updatePosition();
      setOpen(true);
    }, openDelay);
  }, [openDelay, updatePosition]);

  const closeTooltip = useCallback(() => {
    clearTimer(openTimerRef);
    clearTimer(closeTimerRef);

    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, closeDelay);
  }, [closeDelay]);

  const keepTooltipOpen = useCallback(() => {
    clearTimer(closeTimerRef);
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const animationFrame = window.requestAnimationFrame(updatePosition);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    return () => {
      clearTimer(openTimerRef);
      clearTimer(closeTimerRef);
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-flex w-full max-w-full ${className ?? ""}`}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
      >
        <span
          className="inline-flex w-full max-w-full"
          aria-describedby={open ? id : undefined}
        >
          {trigger}
        </span>
      </span>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={tooltipRef}
              id={id}
              role="tooltip"
              className="fixed z-[9999] w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-border/70 bg-background p-3 text-left text-xs text-foreground opacity-100 shadow-[var(--shadow-floating)] backdrop-blur-xl transition-opacity duration-150"
              style={{
                top: position.top,
                left: position.left,
              }}
              onMouseEnter={keepTooltipOpen}
              onMouseLeave={closeTooltip}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
