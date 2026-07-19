"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
  variant = "default",
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
  variant?: "default" | "slate" | "purple";
}) {
  const gradients = {
    default: "from-slate-800 via-[#3d4f6f] to-[#6C5DD3]",
    slate: "from-slate-700 to-slate-800",
    purple: "from-[#5b4ec4] to-[#6C5DD3]",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-gradient-to-br px-6 py-7 text-white shadow-md",
        gradients[variant]
      )}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
              {badge && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-xl text-sm text-white/80">{subtitle}</p>
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </section>
  );
}
