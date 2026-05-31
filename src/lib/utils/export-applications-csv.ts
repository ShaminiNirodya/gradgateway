import { ApplicationItem } from "@/lib/types/dashboard";

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value == null) return "";
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toISOString();
  } catch {
    return value;
  }
}

export function buildApplicationsCsv(
  applications: ApplicationItem[],
  normalizeStatus: (status: string) => string
): string {
  const headers = [
    "Application ID",
    "Opportunity ID",
    "Student Profile ID",
    "Job Title",
    "Company Name",
    "Student Name",
    "Student Email",
    "Cover Letter",
    "Status",
    "Normalized Status",
    "Applied At",
    "Updated At",
  ];

  const rows = applications.map((app) => [
    app.id,
    app.opportunityId,
    app.studentProfileId,
    app.jobTitle,
    app.companyName,
    app.studentName,
    app.studentEmail,
    app.coverLetter ?? "",
    app.status,
    normalizeStatus(app.status),
    formatDate(app.appliedAt),
    formatDate(app.updatedAt),
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}

export function downloadApplicationsCsv(
  applications: ApplicationItem[],
  normalizeStatus: (status: string) => string
): void {
  const csv = buildApplicationsCsv(applications, normalizeStatus);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `gradgateway-applications-${date}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
