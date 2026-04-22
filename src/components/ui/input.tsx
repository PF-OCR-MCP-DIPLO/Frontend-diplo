import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "focus-ring file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border/82 bg-input-background text-foreground flex h-11 w-full min-w-0 rounded-xl border px-3.5 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-[background-color,border-color,box-shadow,color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 md:text-sm",
        "hover:border-primary/22",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

export { Input };
