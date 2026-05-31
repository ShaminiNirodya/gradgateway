"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationStepper from "@/components/features/auth/RegistrationStepper";
import Step1Company from "@/components/features/auth/company-steps/Step1Company";
import Step2Recruiter from "@/components/features/auth/company-steps/Step2Recruiter";
import Step3Security from "@/components/features/auth/company-steps/Step3Security";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft, Briefcase, CheckCircle2, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AuthService } from "@/lib/services/auth.service";
import { CompanyService } from "@/lib/services/company.service";
import { auth } from "@/lib/firebase";

export default function CompanyRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [banner, setBanner] = useState<null | { type: "success" | "error"; message: string }>(null);

  const handleNextStep = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };
  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);
  const handleFinalSubmit = async (data: any) => {
    const payload = { ...formData, ...data };
    console.log("Company registration payload", payload);

    try {
      await AuthService.register(payload.companyEmail, payload.password, "Company");

      const token = await AuthService.getIdToken();
      const firebaseUid = auth.currentUser?.uid;
      const email = auth.currentUser?.email;

      if (!token || !firebaseUid || !email) {
        throw new Error("Failed to authenticate. Please try again.");
      }

      await CompanyService.registerCompany(token, {
        email,
        firebaseUid,
        companyName: payload.companyName,
        companyEmail: payload.companyEmail,
        phone: payload.phone,
        website: payload.website,
        industry: payload.industry,
        logoDataUrl: payload.logoDataUrl,
        recruiterName: payload.recruiterName,
        recruiterEmail: payload.recruiterEmail,
        recruiterPhone: payload.recruiterPhone,
        position: payload.position,
      });

      setBanner({
        type: "success",
        message: "Company registration successful! Redirecting to login...",
      });

      setTimeout(async () => {
        try {
          await AuthService.signOut();
          router.push("/login");
        } catch {
          router.push("/login");
        }
      }, 2000);
    } catch (error: any) {
      setBanner({
        type: "error",
        message: error?.message || "Company registration failed. Please try again.",
      });

      if (auth.currentUser) {
        try {
          await AuthService.signOut();
        } catch {}
      }
    }

    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  };

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const steps = ["Company", "Contact", "Security"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-slate-200/30 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-blue-200/25 to-slate-200/25 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 relative z-10">
        {banner && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
              banner.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {banner.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">{banner.message}</span>
            <button
              aria-label="Dismiss notification"
              className="ml-2 rounded-md p-1 text-slate-500 hover:text-slate-700"
              onClick={() => setBanner(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="mb-12 flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-cyan-300/40 hover:shadow-cyan-400/50 transition-all duration-300">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 text-center">Create Company Account</h1>
            <p className="text-slate-600 text-center mt-2 font-medium">Connect with top talent and scale your hiring</p>
          </div>
        </div>

        <div className="w-full max-w-lg mb-8 relative z-10">
          <RegistrationStepper currentStep={currentStep} steps={steps} />
        </div>

        <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-cyan-200/30 p-8 sm:p-12 relative border border-white/50 hover:shadow-2xl hover:shadow-cyan-300/40 transition-all duration-300">
        <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1Company key="step1" onNext={handleNextStep} />
          )}
          {currentStep === 2 && (
            <Step2Recruiter key="step2" onNext={handleNextStep} onBack={handlePrevStep} />
          )}
          {currentStep === 3 && (
            <Step3Security key="step3" onComplete={handleFinalSubmit} onBack={handlePrevStep} />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 text-center relative z-10">
        <p className="text-slate-600 text-sm font-medium">
          Already registered? <Link href="/login" className="text-cyan-600 font-bold hover:text-cyan-700 transition-colors">Log in</Link>
        </p>
        <p className="text-slate-600 text-sm font-medium mt-2">
          Looking to join as a student? <Link href="/register/student" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">Create student account</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
