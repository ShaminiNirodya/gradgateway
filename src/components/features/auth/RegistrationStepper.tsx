"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface RegistrationStepperProps {
  currentStep: number;
  steps: string[];
}

export default function RegistrationStepper({ currentStep, steps }: RegistrationStepperProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        
        {/* Background Line (Gray) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10" />

        {/* Active Progress Line (Colored) */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-violet-600 rounded-full -z-10"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={stepName} className="flex flex-col items-center relative z-10">
              
              {/* Circle Bubble */}
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive || isCompleted ? "#7c3aed" : "#ffffff", // Violet or White
                  borderColor: isActive || isCompleted ? "#7c3aed" : "#e2e8f0", // Violet or Slate-200
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300
                  ${isActive || isCompleted ? 'text-white shadow-violet-200' : 'text-slate-500 bg-white'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </motion.div>

              {/* Step Label */}
              <span 
                className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-violet-700" : "text-slate-400"
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
