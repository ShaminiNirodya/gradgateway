"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Step1Personal from "@/components/features/auth/student-steps/Step1Personal";
import Step2Academic from "@/components/features/auth/student-steps/Step2Academic";
import Step3Security from "@/components/features/auth/student-steps/Step3Security";
import RegistrationShell from "@/components/features/auth/RegistrationShell";
import { Compass } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { StorageService } from "@/lib/services/storage.service";
import { auth } from "@/lib/firebase";
import { getFieldOfMajorById } from "@/lib/constants/field-of-major";

const STUDENT_BENEFITS = [
  { title: "Showcase your work", description: "Build a portfolio employers can browse before they message you." },
  { title: "Apply in one place", description: "Track internships and graduate roles without juggling spreadsheets." },
  { title: "Talk to recruiters", description: "Message companies directly about roles, offers, and interviews." },
  { title: "Stay organized", description: "See applications, interviews, and analytics from a single dashboard." },
];

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [banner, setBanner] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = (data: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };
  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  const handleFinalSubmit = async (data: Record<string, unknown>) => {
    const payload = { ...formData, ...data };
    setIsSubmitting(true);

    try {
      await AuthService.register(payload.email as string, payload.password as string, "Student");

      const token = await AuthService.getIdToken();
      const firebaseUid = auth.currentUser?.uid;
      const email = auth.currentUser?.email;

      if (!token || !firebaseUid || !email) {
        throw new Error("Failed to authenticate. Please try again.");
      }

      let photoUrl = "";
      if (payload.photoFile) {
        try {
          photoUrl = await StorageService.uploadProfilePicture(payload.photoFile as File, firebaseUid);
        } catch {
          photoUrl = (payload.photoDataUrl as string) || "";
        }
      } else {
        photoUrl = (payload.photoDataUrl as string) || "";
      }

      await StudentService.registerStudent(token, {
        email,
        firebaseUid,
        fullName: payload.fullName as string,
        phone: payload.phone as string,
        photoDataUrl: photoUrl,
        university: payload.university as string,
        studentId: payload.studentId as string,
        degree: payload.degree as string,
        fieldOfMajor: getFieldOfMajorById(payload.fieldOfMajor as string)?.label ?? (payload.fieldOfMajor as string) ?? "",
        gradYear: payload.gradYear as number,
        currentYear: payload.currentYear as number,
        gpa: payload.gpa as number,
      });

      setBanner({
        type: "success",
        message: "Registration successful! Redirecting to login...",
      });

      setTimeout(async () => {
        try {
          await AuthService.signOut();
          router.push("/login");
        } catch {
          router.push("/login");
        }
      }, 2000);
    } catch (error: unknown) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Registration failed. Please try again.",
      });

      if (auth.currentUser) {
        try {
          await AuthService.signOut();
        } catch {}
      }
    } finally {
      setIsSubmitting(false);
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
    }
  };

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  const steps = ["Personal", "Academic", "Security"];

  return (
    <RegistrationShell
      variant="student"
      icon={Compass}
      title="Create your account"
      subtitle="Join thousands of students building careers through GradGateway."
      steps={steps}
      currentStep={currentStep}
      benefits={STUDENT_BENEFITS}
      banner={banner}
      onDismissBanner={() => setBanner(null)}
      footerPrimary={{
        prefix: "Already have an account?",
        link: "Log in",
        href: "/login",
        className: "text-[#6C5DD3] hover:text-[#5b4eb8]",
      }}
      footerSecondary={{
        prefix: "Registering as an employer?",
        link: "Create company account",
        href: "/register/company",
        className: "text-blue-600 hover:text-blue-700",
      }}
    >
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <Step1Personal key="step1" onNext={handleNextStep} defaultValues={formData} />
        )}
        {currentStep === 2 && (
          <Step2Academic key="step2" onNext={handleNextStep} onBack={handlePrevStep} defaultValues={formData} />
        )}
        {currentStep === 3 && (
          <Step3Security
            key="step3"
            onComplete={handleFinalSubmit}
            onBack={handlePrevStep}
            defaultValues={formData}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </RegistrationShell>
  );
}
