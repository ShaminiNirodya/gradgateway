"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, LucideIcon, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import RegistrationStepper from "@/components/features/auth/RegistrationStepper";
import { cn } from "@/lib/utils";

export type RegistrationBenefit = {
  title: string;
  description: string;
};

type RegistrationShellProps = {
  variant: "student" | "company";
  icon: LucideIcon;
  title: string;
  subtitle: string;
  steps: string[];
  currentStep: number;
  benefits: RegistrationBenefit[];
  banner: null | { type: "success" | "error"; message: string };
  onDismissBanner: () => void;
  footerPrimary: { prefix: string; link: string; href: string; className: string };
  footerSecondary: { prefix: string; link: string; href: string; className: string };
  children: ReactNode;
};

const VARIANT_STYLES = {
  student: {
    page: "from-[#f4f2ff] via-white to-[#eef4ff]",
    orb1: "from-violet-300/25 to-indigo-300/20",
    orb2: "from-blue-300/20 to-fuchsia-300/15",
    icon: "from-[#6C5DD3] to-indigo-600 shadow-indigo-300/40",
    panel: "from-[#6C5DD3] via-indigo-600 to-violet-700",
    cardShadow: "shadow-indigo-200/25 hover:shadow-indigo-300/30",
    cardBorder: "border-indigo-100/80",
  },
  company: {
    page: "from-[#eef9ff] via-white to-slate-50",
    orb1: "from-cyan-300/25 to-blue-300/20",
    orb2: "from-sky-300/20 to-slate-300/15",
    icon: "from-cyan-600 to-blue-600 shadow-cyan-300/40",
    panel: "from-cyan-600 via-blue-600 to-indigo-700",
    cardShadow: "shadow-cyan-200/25 hover:shadow-cyan-300/30",
    cardBorder: "border-cyan-100/80",
  },
} as const;

export default function RegistrationShell({
  variant,
  icon: Icon,
  title,
  subtitle,
  steps,
  currentStep,
  benefits,
  banner,
  onDismissBanner,
  footerPrimary,
  footerSecondary,
  children,
}: RegistrationShellProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={cn("relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br", styles.page)}>
      <div
        className={cn(
          "pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br blur-3xl",
          styles.orb1
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr blur-3xl",
          styles.orb2
        )}
      />

      <Navbar />

      {banner && (
        <div
          className={cn(
            "fixed left-1/2 top-20 z-50 flex max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl",
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {banner.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <X className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-semibold">{banner.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="ml-auto rounded-md p-1 text-slate-500 hover:text-slate-700"
            onClick={onDismissBanner}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start lg:gap-12 lg:px-8 lg:py-12">
        {/* Left brand panel */}
        <aside className="hidden w-full max-w-sm shrink-0 lg:block lg:sticky lg:top-28">
          <div className={cn("overflow-hidden rounded-[28px] bg-gradient-to-br p-8 text-white shadow-2xl", styles.panel)}>
            <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm")}>
              <Icon className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{title}</h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/85">{subtitle}</p>

            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-bold">{benefit.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/75">{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Estimated time</p>
              <p className="mt-1 text-lg font-extrabold">About 3 minutes</p>
            </div>
          </div>
        </aside>

        {/* Form column */}
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col lg:max-w-xl">
          <div className="mb-8 flex flex-col items-center gap-4 text-center lg:hidden">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg",
                styles.icon
              )}
            >
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
              <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">{subtitle}</p>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step {currentStep} of {steps.length}
            </p>
            <p className="text-xs font-semibold text-slate-400">~3 min to complete</p>
          </div>

          <RegistrationStepper currentStep={currentStep} steps={steps} variant={variant} />

          <div
            className={cn(
              "relative overflow-hidden rounded-[28px] border bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-10",
              styles.cardBorder,
              styles.cardShadow
            )}
          >
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            {children}
          </div>

          <div className="mt-8 space-y-2 text-center text-sm font-medium text-slate-600">
            <p>
              {footerPrimary.prefix}{" "}
              <Link href={footerPrimary.href} className={cn("font-bold transition-colors", footerPrimary.className)}>
                {footerPrimary.link}
              </Link>
            </p>
            <p>
              {footerSecondary.prefix}{" "}
              <Link href={footerSecondary.href} className={cn("font-bold transition-colors", footerSecondary.className)}>
                {footerSecondary.link}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
