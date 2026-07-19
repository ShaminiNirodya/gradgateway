"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RegistrationStepperProps {
  currentStep: number;
  steps: string[];
  variant?: "student" | "company";
}

export default function RegistrationStepper({
  currentStep,
  steps,
  variant = "student",
}: RegistrationStepperProps) {
  const accent = variant === "student" ? "#6C5DD3" : "#2563EB";
  const accentSoft = variant === "student" ? "text-[#6C5DD3]" : "text-blue-600";
  const stepCount = Math.max(steps.length, 1);
  const trackLeftPercent = 50 / stepCount;
  const trackWidthPercent = ((stepCount - 1) / stepCount) * 100;
  const progressPercent = stepCount <= 1 ? 100 : ((currentStep - 1) / (stepCount - 1)) * 100;

  return (
    <div className="mb-10 w-full px-1">
      <div
        className="relative grid items-center"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        <div
          className="absolute top-[19px] h-1.5 -z-10"
          style={{ left: `${trackLeftPercent}%`, width: `${trackWidthPercent}%` }}
        >
          <div className="absolute inset-0 rounded-full bg-slate-100" />
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full origin-left"
            style={{ backgroundColor: accent }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={stepName} className="relative z-10 flex w-full flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: isActive || isCompleted ? accent : "#FFFFFF",
                  borderColor: isActive || isCompleted ? accent : "#E2E8F0",
                  scale: isActive ? 1.05 : 1,
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-[3px] shadow-sm transition-colors duration-300",
                  isActive || isCompleted ? "text-white shadow-indigo-200/60" : "text-slate-300"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold">{stepNumber}</span>
                )}
              </motion.div>

              <span
                className={cn(
                  "absolute -bottom-8 hidden text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 sm:block",
                  isActive ? accentSoft : "text-slate-400",
                  isCompleted && !isActive && "text-slate-500"
                )}
              >
                {stepName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
