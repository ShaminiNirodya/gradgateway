"use client";

import { useState } from "react";
import RegistrationStepper from "@/components/features/auth/RegistrationStepper";
import Step1Personal from "@/components/features/auth/student-steps/Step1Personal";
import Step2Academic from "@/components/features/auth/student-steps/Step2Academic";
import Step3Security from "@/components/features/auth/student-steps/Step3Security";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function StudentRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNextStep = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };
  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);
  const handleFinalSubmit = (data: any) => console.log({ ...formData, ...data });

  const steps = ["Personal", "Academic", "Security"];

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center py-10 px-4">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-[#6C5DD3] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
      </div>

      <div className="w-full max-w-lg mb-8">
        <RegistrationStepper currentStep={currentStep} steps={steps} />
      </div>

      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-xl shadow-slate-200/60 p-8 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <AnimatePresence mode="wait">
          {currentStep === 1 && <Step1Personal key="step1" onNext={handleNextStep} />}
          {currentStep === 2 && <Step2Academic key="step2" onNext={handleNextStep} onBack={handlePrevStep} />}
          {currentStep === 3 && <Step3Security key="step3" onComplete={handleFinalSubmit} onBack={handlePrevStep} />}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-sm font-bold text-slate-400">
        Already have an account? <Link href="/login" className="text-[#6C5DD3] hover:underline">Log in</Link>
      </p>
    </div>
  );
}
