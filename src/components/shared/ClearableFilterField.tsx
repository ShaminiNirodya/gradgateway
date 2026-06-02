"use client";

import { type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Right padding for combobox-style triggers (dropdown buttons, custom selects) */
export const CLEARABLE_FIELD_PADDING = "pr-10";

/** Room for red clear control + gap + native select chevron */
export const CLEARABLE_SELECT_PADDING = "pr-[4.75rem]";

type ClearableFilterFieldProps = {
  children: ReactNode;
  showClear: boolean;
  onClear: () => void;
  clearLabel: string;
  className?: string;
  /** Places the clear control left of the native select chevron */
  variant?: "default" | "select";
};

export function ClearableFilterField({
  children,
  showClear,
  onClear,
  clearLabel,
  className,
  variant = "default",
}: ClearableFilterFieldProps) {
  const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      {showClear && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleClear}
          className={cn(
            "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center",
            variant === "select"
              ? "right-[2.75rem] h-6 w-6"
              : "right-2 h-7 w-7",
            "rounded-full border bg-white shadow-sm",
            "text-red-500 border-red-200/90",
            "transition-all duration-150 ease-out",
            "hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-1",
            "animate-in fade-in zoom-in-95 duration-150",
            "pointer-events-auto"
          )}
          aria-label={`Clear ${clearLabel}`}
          title={`Clear ${clearLabel}`}
        >
          <X
            className={cn("shrink-0", variant === "select" ? "h-3 w-3" : "h-3.5 w-3.5")}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}
