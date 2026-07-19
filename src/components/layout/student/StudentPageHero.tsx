import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StudentPageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
};

export function StudentPageHero({
  eyebrow,
  title,
  description,
  actions,
  badge,
  className,
}: StudentPageHeroProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#6C5DD3]/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6C5DD3]">
              {eyebrow}
            </p>
            {badge}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="text-sm font-medium text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
