import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiAccent = "indigo" | "violet" | "emerald" | "amber" | "sky";

const accentStyles: Record<KpiAccent, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-600",
};

type AnalyticsKpiCardProps = {
  label: string;
  value: string;
  hint: string;
  icon?: ReactNode;
  accent?: KpiAccent;
  href?: string;
};

export function AnalyticsKpiCard({
  label,
  value,
  hint,
  icon,
  accent = "indigo",
  href,
}: AnalyticsKpiCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                accentStyles[accent]
              )}
            >
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-0.5 text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {value}
            </p>
          </div>
        </div>
        {href ? (
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#6C5DD3]" />
        ) : null}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{hint}</p>
    </>
  );

  const className =
    "group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-[#6C5DD3]/20 hover:shadow-md";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

type AnalyticsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function AnalyticsSection({
  title,
  description,
  children,
  className = "",
  icon,
  action,
}: AnalyticsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3]">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
