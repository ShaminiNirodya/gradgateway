"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface RegistrationStepperProps {
  currentStep: number;
  steps: string[];
}

export default function RegistrationStepper({ currentStep, steps }: RegistrationStepperProps) {
  const stepCount = Math.max(steps.length, 1);
  const trackLeftPercent = 50 / stepCount;
  const trackWidthPercent = ((stepCount - 1) / stepCount) * 100;
  const progressPercent =
    stepCount <= 1 ? 100 : ((currentStep - 1) / (stepCount - 1)) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 px-4">
      <div
        className="grid items-center relative"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        
        {/* Track Container: anchors exactly from step-1 center to last-step center */}
        <div
          className="absolute top-[19px] h-1.5 -z-10"
          style={{ left: `${trackLeftPercent}%`, width: `${trackWidthPercent}%` }}
        >
          <div className="absolute inset-0 bg-slate-100 rounded-full" />
          <motion.div
            className="absolute left-0 top-0 h-full bg-[#6C5DD3] rounded-full origin-left"
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
            <div key={stepName} className="w-full flex flex-col items-center relative z-10 group cursor-default">
              
              {/* The Bubble */}
              <motion.div
                animate={{
                  backgroundColor: isActive || isCompleted ? "#6C5DD3" : "#FFFFFF",
                  borderColor: isActive || isCompleted ? "#6C5DD3" : "#F1F5F9",
                  scale: 1,
                }}
                className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shadow-sm transition-colors duration-300
                  ${isActive || isCompleted ? 'text-white shadow-indigo-200' : 'text-slate-300'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <span className="font-bold text-sm">{stepNumber}</span>
                )}
              </motion.div>

              {/* The Label */}
              <span 
                className={`absolute -bottom-8 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive ? "text-[#6C5DD3]" : "text-slate-400"
                }`}
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
