"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Step1Company from "@/components/features/auth/company-steps/Step1Company";
import Step2Recruiter from "@/components/features/auth/company-steps/Step2Recruiter";
import Step3Security from "@/components/features/auth/company-steps/Step3Security";
import RegistrationShell from "@/components/features/auth/RegistrationShell";
import { Briefcase } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AuthService } from "@/lib/services/auth.service";
import { CompanyService } from "@/lib/services/company.service";
import { StorageService } from "@/lib/services/storage.service";
import { auth } from "@/lib/firebase";

const COMPANY_BENEFITS = [
  { title: "Post jobs quickly", description: "Publish internships and graduate roles in minutes." },
  { title: "Search verified talent", description: "Browse student portfolios, skills, and academic backgrounds." },
  { title: "Manage your pipeline", description: "Review applications, shortlist candidates, and schedule interviews." },
  { title: "Message directly", description: "Reach candidates in-app without leaving the platform." },
];

export default function CompanyRegistrationPage() {
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
      await AuthService.register(payload.companyEmail as string, payload.password as string, "Company");

      const token = await AuthService.getIdToken();
      const firebaseUid = auth.currentUser?.uid;
      const email = auth.currentUser?.email;

      if (!token || !firebaseUid || !email) {
        throw new Error("Failed to authenticate. Please try again.");
      }

      let logoUrl = "";
      if (payload.logoFile) {
        try {
          logoUrl = await StorageService.uploadCompanyLogo(payload.logoFile as File, firebaseUid);
        } catch {
          logoUrl = (payload.logoDataUrl as string) || "";
        }
      } else {
        logoUrl = (payload.logoDataUrl as string) || "";
      }

      await CompanyService.registerCompany(token, {
        email,
        firebaseUid,
        companyName: payload.companyName as string,
        companyEmail: payload.companyEmail as string,
        phone: payload.phone as string,
        website: payload.website as string,
        industry: payload.industry as string,
        logoDataUrl: logoUrl,
        recruiterName: payload.recruiterName as string,
        recruiterEmail: payload.recruiterEmail as string,
        recruiterPhone: payload.recruiterPhone as string,
        position: payload.position as string,
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
    } catch (error: unknown) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Company registration failed. Please try again.",
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

  const steps = ["Company", "Contact", "Security"];

  return (
    <RegistrationShell
      variant="company"
      icon={Briefcase}
      title="Create company account"
      subtitle="Connect with top talent and scale your hiring on GradGateway."
      steps={steps}
      currentStep={currentStep}
      benefits={COMPANY_BENEFITS}
      banner={banner}
      onDismissBanner={() => setBanner(null)}
      footerPrimary={{
        prefix: "Already registered?",
        link: "Log in",
        href: "/login",
        className: "text-cyan-600 hover:text-cyan-700",
      }}
      footerSecondary={{
        prefix: "Looking to join as a student?",
        link: "Create student account",
        href: "/register/student",
        className: "text-[#6C5DD3] hover:text-[#5b4eb8]",
      }}
    >
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <Step1Company key="step1" onNext={handleNextStep} defaultValues={formData} />
        )}
        {currentStep === 2 && (
          <Step2Recruiter key="step2" onNext={handleNextStep} onBack={handlePrevStep} defaultValues={formData} />
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
