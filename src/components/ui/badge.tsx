import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        solid: "border-transparent bg-primary text-primary-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        // Status variants stay on the SHARED status palette, never the god
        // accent (ux-standards §4) — and every use pairs them with text.
        up: "border-status-up/40 bg-status-up/10 text-status-up",
        warn: "border-status-warn/40 bg-status-warn/10 text-status-warn",
        down: "border-status-down/40 bg-status-down/10 text-status-down",
        unknown: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
