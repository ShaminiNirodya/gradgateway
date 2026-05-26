"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationStepper from "@/components/features/auth/RegistrationStepper";
import Step1Personal from "@/components/features/auth/student-steps/Step1Personal";
import Step2Academic from "@/components/features/auth/student-steps/Step2Academic";
import Step3Security from "@/components/features/auth/student-steps/Step3Security";
import Link from "next/link";
import { ArrowLeft, Compass, CheckCircle2, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { auth } from "@/lib/firebase";

export default function StudentRegistrationPage() {
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
    console.log("Student registration payload", payload);

    try {
      // Step 1: Create Firebase user
      console.log("Creating Firebase user...");
      const userCredential = await AuthService.register(payload.email, payload.password, "Student");
      console.log("Firebase user created:", userCredential);

      // Step 2: Get token and Firebase UID
      const token = await AuthService.getIdToken();
      const firebaseUid = auth.currentUser?.uid;
      const email = auth.currentUser?.email;

      console.log("Firebase UID:", firebaseUid);
      console.log("Email:", email);

      if (!token || !firebaseUid || !email) {
        throw new Error("Failed to authenticate. Please try again.");
      }

      // Step 3: Register student profile in backend
      console.log("Registering student profile in backend...");
      await StudentService.registerStudent(token, {
        email,
        firebaseUid,
        fullName: payload.fullName,
        phone: payload.phone,
        photoDataUrl: payload.photoDataUrl,
        university: payload.university,
        studentId: payload.studentId,
        degree: payload.degree,
        gradYear: payload.gradYear,
        gpa: payload.gpa,
      });
      console.log("Student profile registered successfully");

      setBanner({
        type: "success",
        message: "Registration successful! Redirecting to login...",
      });

      // Step 4: Sign out and redirect to login after 2 seconds
      setTimeout(async () => {
        try {
          await AuthService.signOut();
          router.push("/login");
        } catch (signOutError) {
          console.error("Sign out error:", signOutError);
          router.push("/login");
        }
      }, 2000);

    } catch (error: any) {
      console.warn("Registration failed");
      setBanner({
        type: "error",
        message: error?.message || "Registration failed. Please try again.",
      });
      
      // If user was created in Firebase but backend failed, sign them out
      if (auth.currentUser) {
        try {
          await AuthService.signOut();
        } catch (signOutError) {
          console.warn("Cleanup sign out failed");
        }
      }
    }

    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  };

  // Auto-dismiss banner after a few seconds
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const steps = ["Personal", "Academic", "Security"];

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center py-10 px-4">
      {banner && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
          banner.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
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
      <p className="mt-2 text-sm font-bold text-slate-400">
        Registering as an employer? <Link href="/register/company" className="text-blue-600 hover:underline">Create company account</Link>
      </p>
    </div>
  );
}
