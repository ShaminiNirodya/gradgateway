export function toCompanySlug(name: string): string {
  return encodeURIComponent(
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
  );
}

export function companyProfilePath(companyName: string, companyProfileId: string): string {
  return `/dashboard/student/company/${toCompanySlug(companyName)}?id=${encodeURIComponent(companyProfileId)}`;
}

export function studentProfilePath(
  studentName: string,
  studentProfileId: string,
  email?: string
): string {
  const base = `/dashboard/company/student-dashboard/${toCompanySlug(studentName)}?id=${encodeURIComponent(studentProfileId)}`;
  return email ? `${base}&email=${encodeURIComponent(email)}` : base;
}
