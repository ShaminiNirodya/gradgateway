"use client";

import { cn } from "@/lib/utils";

type RegistrationStepHeaderProps = {
  title: string;
  description: string;
  accent?: "student" | "company";
};

export default function RegistrationStepHeader({
  title,
  description,
  accent = "student",
}: RegistrationStepHeaderProps) {
  return (
    <div className="mb-8 space-y-2 text-center sm:text-left">
      <p
        className={cn(
          "text-[11px] font-bold uppercase tracking-[0.2em]",
          accent === "student" ? "text-[#6C5DD3]" : "text-blue-600"
        )}
      >
        Current step
      </p>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      <p className="text-sm font-medium leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
