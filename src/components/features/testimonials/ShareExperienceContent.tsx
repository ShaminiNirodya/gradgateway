"use client";

import { useEffect, useMemo, useState } from "react";
import { ShareExperienceForm, type ShareExperienceAudience } from "@/components/features/testimonials/ShareExperienceForm";
import { StudentPageContainer } from "@/components/layout/student/StudentPageContainer";
import { StudentPageHero } from "@/components/layout/student/StudentPageHero";
import { CompanyPageContainer } from "@/components/layout/company/CompanyPageContainer";
import { CompanyPageHeader } from "@/components/layout/company/CompanyPageHeader";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { CompanyService } from "@/lib/services/company.service";
import { getFieldOfMajorById, getFieldOfMajorByLabel } from "@/lib/constants/field-of-major";
import type { StudentProfile } from "@/lib/types/student";
import type { CompanyProfile } from "@/lib/types/company";

type ShareExperienceContentProps = {
  audience: ShareExperienceAudience;
};

function studentDisplayName(profile: StudentProfile): string {
  const university = profile.university?.trim() ?? "";
  const lower = university.toLowerCase();

  if (lower.includes("colombo")) return "Undergraduate, Colombo";
  if (lower.includes("moratuwa")) return "Undergraduate, Moratuwa";
  if (lower.includes("peradeniya")) return "Undergraduate, Peradeniya";
  if (lower.includes("kelaniya")) return "Undergraduate, Kelaniya";
  if (lower.includes("ruhuna")) return "Undergraduate, Matara";
  if (lower.includes("jaffna")) return "Undergraduate, Jaffna";

  const shortName = university.split("(")[0]?.trim();
  return shortName ? `Student, ${shortName}` : "Undergraduate";
}

function studentDisplayRole(profile: StudentProfile): string {
  if (profile.fieldOfMajor) {
    const byId = getFieldOfMajorById(profile.fieldOfMajor);
    if (byId?.label) return byId.label;
    const byLabel = getFieldOfMajorByLabel(profile.fieldOfMajor);
    if (byLabel?.label) return byLabel.label;
    return profile.fieldOfMajor;
  }
  return profile.degree?.trim() || "Student";
}

function companyDisplayName(profile: CompanyProfile): string {
  return profile.recruiterName?.trim() || profile.companyName?.trim() || "Recruiter";
}

function companyDisplayRole(profile: CompanyProfile): string {
  return profile.position?.trim() || profile.industry?.trim() || "Hiring partner";
}

export function ShareExperienceContent({ audience }: ShareExperienceContentProps) {
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const token = await AuthService.getIdToken();
        if (!token || cancelled) return;

        if (audience === "Student") {
          const profile = await StudentService.getCurrentStudent(token);
          if (!cancelled) {
            setAuthorName(studentDisplayName(profile));
            setAuthorRole(studentDisplayRole(profile));
          }
        } else {
          const profile = await CompanyService.getCurrentCompany(token);
          if (!cancelled) {
            setAuthorName(companyDisplayName(profile));
            setAuthorRole(companyDisplayRole(profile));
          }
        }
      } catch {
        if (!cancelled) {
          setAuthorName(audience === "Student" ? "Undergraduate" : "Recruiter");
          setAuthorRole(audience === "Student" ? "Student" : "Hiring partner");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [audience]);

  const heroCopy = useMemo(() => {
    if (audience === "Student") {
      return {
        eyebrow: "Community",
        title: "Share your GradGateway story",
        description:
          "Tell future students how the platform helped your job search. Approved quotes appear on the public homepage.",
      };
    }
    return {
      eyebrow: "Community",
      title: "Share your hiring experience",
      description:
        "Tell other recruiters how GradGateway improved your campus hiring. Approved quotes appear on the public homepage.",
    };
  }, [audience]);

  const form = (
    <ShareExperienceForm
      audience={audience}
      defaultAuthorName={authorName}
      defaultAuthorRole={authorRole}
    />
  );

  if (audience === "Student") {
    return (
      <StudentPageContainer>
        <StudentPageHero
          eyebrow={heroCopy.eyebrow}
          title={heroCopy.title}
          description={heroCopy.description}
        />
        {loading ? (
          <p className="text-sm text-slate-500">Loading your profile defaults…</p>
        ) : (
          form
        )}
      </StudentPageContainer>
    );
  }

  return (
    <CompanyPageContainer>
      <CompanyPageHeader
        title={heroCopy.title}
        subtitle={heroCopy.description}
        eyebrow={heroCopy.eyebrow}
        showSearch={false}
        showNotifications={false}
      />
      {loading ? (
        <p className="text-sm text-slate-500">Loading your profile defaults…</p>
      ) : (
        form
      )}
    </CompanyPageContainer>
  );
}
