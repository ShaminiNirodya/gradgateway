"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationStepper from "@/components/features/auth/RegistrationStepper";
import Step1Personal from "@/components/features/auth/student-steps/Step1Personal";
import Step2Academic from "@/components/features/auth/student-steps/Step2Academic";
import Step3Security from "@/components/features/auth/student-steps/Step3Security";
import Navbar from "@/components/layout/Navbar";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-pink-200/25 to-purple-200/25 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 relative z-10">
        {banner && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
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
        <div className="mb-12 flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-purple-300/40 hover:shadow-purple-400/50 transition-all duration-300">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 text-center">Create Your Account</h1>
            <p className="text-slate-600 text-center mt-2 font-medium">Join thousands of students on GradGateway</p>
          </div>
        </div>

        <div className="w-full max-w-lg mb-8 relative z-10">
          <RegistrationStepper currentStep={currentStep} steps={steps} />
        </div>

        <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-purple-200/30 p-8 sm:p-12 relative border border-white/50 hover:shadow-2xl hover:shadow-purple-300/40 transition-all duration-300">
        <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <AnimatePresence mode="wait">
          {currentStep === 1 && <Step1Personal key="step1" onNext={handleNextStep} />}
          {currentStep === 2 && <Step2Academic key="step2" onNext={handleNextStep} onBack={handlePrevStep} />}
          {currentStep === 3 && <Step3Security key="step3" onComplete={handleFinalSubmit} onBack={handlePrevStep} />}
        </AnimatePresence>
      </div>

      <div className="mt-10 text-center relative z-10">
        <p className="text-slate-600 text-sm font-medium">
          Already have an account? <Link href="/login" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">Log in</Link>
        </p>
        <p className="text-slate-600 text-sm font-medium mt-2">
          Registering as an employer? <Link href="/register/company" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Create company account</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
