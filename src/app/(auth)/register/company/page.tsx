"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationStepper from "@/components/features/auth/RegistrationStepper";
import Step1Company from "@/components/features/auth/company-steps/Step1Company";
import Step2Recruiter from "@/components/features/auth/company-steps/Step2Recruiter";
import Step3Security from "@/components/features/auth/company-steps/Step3Security";
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
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center py-10 px-4">
      {banner && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
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
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Briefcase className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Create Company Account</h1>
      </div>

      <div className="w-full max-w-lg mb-8">
        <RegistrationStepper currentStep={currentStep} steps={steps} />
      </div>

      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-xl shadow-slate-200/60 p-8 sm:p-12 relative">
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

      <p className="mt-8 text-sm font-bold text-slate-400">
        Already registered? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
