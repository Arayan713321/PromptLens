import type * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary";
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        variant === "secondary"
          ? "border-border bg-foreground/5 text-muted"
          : "border-accent/20 bg-accent/8 text-accent",
        className,
      )}
      {...props}
    />
  );
}
