"use client";

import { useState } from "react";
import RegistrationStepper from "@/components/features/auth/RegistrationStepper";
import Step1Personal from "@/components/features/auth/student-steps/Step1Personal";
import Step2Academic from "@/components/features/auth/student-steps/Step2Academic";
import Step3Security from "@/components/features/auth/student-steps/Step3Security";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function StudentRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({}); // Store data across steps

  const steps = ["Personal Info", "Academic Info", "Security"];

  const handleNextStep = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinalSubmit = (data: any) => {
    const finalData = { ...formData, ...data };
    console.log("FINAL SUBMISSION:", finalData);
    alert("Registration Successful! (Check Console)");
    // Here you would call your API
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decor - Subtle Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] -z-10" />

      {/* 1. Header Navigation */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <Link href="/" className="group flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-violet-300 group-hover:shadow-sm transition-all">
             <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-violet-600" />
          </div>
          Back to Home
        </Link>
        <div className="flex items-center gap-2 opacity-80">
            <GraduationCap className="w-5 h-5 text-violet-600" />
            <span className="font-bold text-slate-800 tracking-tight">GradGateway</span>
        </div>
      </div>

      {/* 2. Title Section */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Student Registration</h1>
        <p className="text-slate-500 text-lg">Join 10,000+ undergraduates showcasing their talent</p>
      </div>

      {/* 3. Stepper (Wider container) */}
      <div className="w-full max-w-2xl mb-10">
        <RegistrationStepper currentStep={currentStep} steps={steps} />
      </div>

      {/* 4. The FORM CARD (Premium Look) */}
      <div className="w-full max-w-xl relative">
        {/* Glow Effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-blue-400 rounded-2xl blur opacity-20" />
        
        <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white p-8 sm:p-12">

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1Personal key="step1" onNext={handleNextStep} />
          )}
          {currentStep === 2 && (
            <Step2Academic key="step2" onNext={handleNextStep} onBack={handlePrevStep} />
          )}
          {currentStep === 3 && (
            <Step3Security key="step3" onComplete={handleFinalSubmit} onBack={handlePrevStep} />
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Footer Text */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
          Login here
        </Link>
      </p>

    </div>
  );
}
