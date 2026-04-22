import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent text-sm font-semibold tracking-[0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-interactive)] hover:bg-primary-strong",
        accent: "bg-accent text-accent-foreground shadow-[var(--shadow-interactive)] hover:bg-accent-strong",
        destructive:
          "bg-destructive text-white shadow-[var(--shadow-soft)] hover:bg-destructive/92 focus-visible:ring-destructive/18 dark:focus-visible:ring-destructive/36",
        outline:
          "border-border/78 bg-white/86 text-foreground shadow-[var(--shadow-soft)] hover:border-primary/28 hover:bg-primary/6 hover:text-primary dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/88",
        ghost: "text-secondary-foreground hover:bg-primary/7 hover:text-primary dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground shadow-[var(--shadow-soft)] hover:bg-success/92",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 rounded-lg px-3.5 text-[0.8rem] has-[>svg]:px-3",
        lg: "h-12 px-6 text-sm has-[>svg]:px-5",
        icon: "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
