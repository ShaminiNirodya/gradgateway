import { ApplicationItem } from "@/lib/types/dashboard";

export function buildCompanyStudentProfileHref(application: ApplicationItem): string {
  const slug = encodeURIComponent(
    application.studentName.toLowerCase().replace(/\s+/g, "-")
  );
  const params = new URLSearchParams({
    id: application.studentProfileId,
    email: application.studentEmail,
  });
  return `/dashboard/company/student-dashboard/${slug}?${params.toString()}`;
}
