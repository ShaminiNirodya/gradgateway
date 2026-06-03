"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CompanyNotificationBell from "@/components/features/company/CompanyNotificationBell";

export function CompanyPageHeader({
  title,
  subtitle,
  eyebrow,
  badge,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Search candidates, skills, portfolios...",
  showSearch = true,
  showNotifications = true,
  primaryAction,
  className,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  primaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <header
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
          {eyebrow || badge ? (
            <div className="flex flex-wrap items-center gap-2">
              {eyebrow ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6C5DD3]">
                  {eyebrow}
                </p>
              ) : null}
              {badge}
            </div>
          ) : null}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm font-medium text-slate-500">{subtitle}</p> : null}
        </div>
        {(showNotifications || primaryAction) && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {showNotifications ? (
              <CompanyNotificationBell align="end" side="bottom" sideOffset={8} />
            ) : null}
            {primaryAction}
          </div>
        )}
      </div>

      {showSearch && onSearchChange && onSearchSubmit ? (
        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchSubmit();
            }}
            placeholder={searchPlaceholder}
            className="h-12 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-11 shadow-sm focus-visible:border-[#6C5DD3]/40 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20"
          />
        </div>
      ) : null}
    </header>
  );
}

export function CompanyPostJobButton({ className }: { className?: string }) {
  return (
    <Button asChild className={cn("rounded-xl bg-[#6C5DD3] font-semibold hover:bg-[#5b4eb8]", className)}>
      <Link href="/dashboard/company/jobs/new">
        <Briefcase className="mr-2 h-4 w-4" />
        Post a job
      </Link>
    </Button>
  );
}
