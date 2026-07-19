import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CompanyPageContainerProps = {
  children: ReactNode;
  className?: string;
};

/** Spacing shell; width is set in `company/layout.tsx` (`max-w-6xl`). */
export function CompanyPageContainer({ children, className }: CompanyPageContainerProps) {
  return <div className={cn("w-full space-y-6 pb-4", className)}>{children}</div>;
}
