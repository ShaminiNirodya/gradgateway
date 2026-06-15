import type { ReactNode } from "react";

type AnalyticsKpiCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function AnalyticsKpiCard({ label, value, hint }: AnalyticsKpiCardProps) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>
    </div>
  );
}

type AnalyticsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function AnalyticsSection({ title, description, children, className = "" }: AnalyticsSectionProps) {
  return (
    <section className={`rounded-[18px] border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-5">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}
