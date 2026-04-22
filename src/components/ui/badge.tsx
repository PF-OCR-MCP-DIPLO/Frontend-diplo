import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "focus-ring inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none transition-[background-color,border-color,color,box-shadow]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary-strong",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        success: "border-success/18 bg-success/12 text-success [a&]:hover:bg-success/18",
        warning: "border-warning/20 bg-warning/12 text-warning [a&]:hover:bg-warning/18",
        muted: "border-border/75 bg-white/82 text-muted-foreground [a&]:hover:bg-secondary/55",
        destructive:
          "border-danger/18 bg-danger/12 text-danger [a&]:hover:bg-danger/18 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "border-border/78 bg-white/72 text-foreground [a&]:hover:bg-primary/6 [a&]:hover:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
