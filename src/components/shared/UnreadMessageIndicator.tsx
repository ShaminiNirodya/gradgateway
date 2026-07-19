"use client";

import { cn } from "@/lib/utils";

type UnreadMessageIndicatorProps = {
  className?: string;
  size?: "sm" | "md";
  ringClassName?: string;
};

export function UnreadMessageIndicator({
  className,
  size = "sm",
  ringClassName = "ring-white",
}: UnreadMessageIndicatorProps) {
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      aria-label="Unread messages"
      role="status"
    >
      <span
        className={cn(
          "absolute inline-flex rounded-full bg-emerald-400 opacity-70 animate-ping",
          dotSize
        )}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full bg-emerald-500 unread-indicator-glow",
          dotSize,
          ringClassName && `ring-2 ${ringClassName}`
        )}
      />
    </span>
  );
}
