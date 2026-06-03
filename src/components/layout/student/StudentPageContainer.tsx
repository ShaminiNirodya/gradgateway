import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StudentPageContainerProps = {
  children: ReactNode;
  className?: string;
  /** Fills viewport below layout padding (e.g. messages inbox). */
  fillViewport?: boolean;
};

/** Matches `student/layout.tsx` padding: `p-4 lg:p-8`. */
export function StudentPageContainer({
  children,
  className,
  fillViewport,
}: StudentPageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl space-y-6 pb-4",
        fillViewport &&
          "flex min-h-[calc(100dvh-2rem)] flex-col lg:min-h-[calc(100dvh-4rem)]",
        className
      )}
    >
      {children}
    </div>
  );
}
