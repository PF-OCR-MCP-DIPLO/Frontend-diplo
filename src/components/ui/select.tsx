import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "./utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "focus-ring border-border/82 bg-input-background text-foreground hover:border-primary/22 flex h-11 w-full appearance-none rounded-xl border px-3.5 pr-10 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-[background-color,border-color,box-shadow,color] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { Select };
