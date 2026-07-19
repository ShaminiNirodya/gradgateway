export const JOB_POSITION_OTHER_CATEGORY_ID = "other";

export type JobPositionCategory = {
  id: string;
  label: string;
  positions: string[];
};

function ensureInternPosition(categoryLabel: string, positions: string[]): string[] {
  if (positions.some((p) => /\bintern\b|\btrainee\b/i.test(p))) {
    return positions;
  }
  return [`${categoryLabel} Intern / Trainee`, ...positions];
}

function category(id: string, label: string, positions: string[]): JobPositionCategory {
  return { id, label, positions: ensureInternPosition(label, positions) };
}

const RAW_CATEGORIES: JobPositionCategory[] = [
  category("core-software-engineering", "Core Software Engineering", [
    "Software Engineering Intern / Trainee",
    "Junior Software Engineer",
    "Associate Software Engineer",
    "Software Engineer (Mid-Level)",
    "Senior Software Engineer",
    "Staff Software Engineer",
  ]),
  category("front-end-engineering", "Front-End Engineering", [
    "Junior Front-End Developer",
    "Front-End Developer",
    "Senior Front-End Developer",
    "Staff Front-End Engineer",
    "Principal Front-End Engineer",
  ]),
  category("back-end-engineering", "Back-End Engineering", [
    "Junior Back-End Developer",
    "Back-End Developer",
    "Senior Back-End Developer",
    "Staff Back-End Engineer",
    "Principal Back-End Engineer",
  ]),
  category("full-stack-engineering", "Full-Stack Engineering", [
    "Junior Full-Stack Developer",
    "Full-Stack Developer",
    "Senior Full-Stack Developer",
    "Staff Full-Stack Engineer",
    "Principal Full-Stack Engineer",
  ]),
  category("mobile-application-engineering", "Mobile Application Engineering", [
    "Junior Mobile Developer (iOS/Android)",
    "Mobile Developer",
    "Senior Mobile Developer",
    "Staff Mobile Engineer",
    "Principal Mobile Engineer",
  ]),
  category("devops-cloud-infrastructure", "DevOps, Cloud & Infrastructure", [
    "DevOps Intern / Trainee",
    "Junior DevOps Engineer",
    "DevOps Engineer",
    "Senior DevOps Engineer",
    "Cloud Engineer",
  ]),
  category("site-reliability-engineering", "Site Reliability Engineering (SRE)", [
    "Associate SRE",
    "Site Reliability Engineer",
  ]),
  category("data-engineering-analytics", "Data Engineering & Analytics", [
    "Data Analytics Intern / Trainee",
    "Junior Data Engineer",
    "Data Analyst",
    "Data Engineer",
    "Senior Data Engineer",
  ]),
  category("ai-ml-data-science", "AI, Machine Learning & Data Science", [
    "Data Science Intern",
    "Junior Data Scientist",
    "Data Scientist",
    "Machine Learning Engineer (MLE)",
    "Senior ML Engineer",
  ]),
  category("cyber-information-security", "Cyber & Information Security", [
    "Cybersecurity Intern / Trainee",
    "Junior Security Analyst",
    "Junior Security Engineer",
    "Information Security Engineer",
    "Application Security (AppSec) Engineer",
    "Application Security Engineer",
    "Penetration Tester / Ethical Hacker",
    "Senior Security Engineer",
  ]),
  category("quality-assurance-testing", "Quality Assurance (QA) & Testing", [
    "QA Intern / Trainee",
    "Junior QA Analyst (Manual)",
    "Junior QA Engineer (Manual)",
    "QA Automation Engineer",
    "Software Development Engineer in Test (SDET)",
    "Senior QA / Senior SDET",
    "Senior SDET",
    "QA Lead",
  ]),
  category("embedded-systems-iot", "Embedded Systems & IoT Engineering", [
    "Junior Embedded Systems Developer",
    "Embedded Software Engineer",
    "Senior Embedded Engineer",
    "Staff Systems Engineer",
  ]),
  category("database-administration", "Database Administration (DBA)", [
    "Junior Database Administrator",
    "Database Administrator",
  ]),
  category("technical-leadership-architecture", "Technical Leadership & Architecture", [
    "Lead Developer / Tech Lead",
    "Solutions Architect",
    "System Architect",
  ]),
  category("engineering-management-executives", "Engineering Management & Executives", [
    "Engineering Supervisor / Team Lead",
    "Engineering Manager",
    "Senior Engineering Manager",
  ]),
  category("business-analysis-product-tech", "Business Analysis & Product Tech", [
    "Business Analyst Intern / Trainee",
    "Junior Business Analyst (BA)",
    "Business Analyst",
    "Technical Business Analyst",
    "Senior Business Analyst",
  ]),
  category("product-project-management", "Product & Project Management (Technical)", [
    "Project Coordinator",
    "Scrum Master / Agile Coach",
    "Technical Project Manager (TPM)",
    "Technical Product Manager",
  ]),
  {
    id: JOB_POSITION_OTHER_CATEGORY_ID,
    label: "Other",
    positions: [],
  },
];

export const JOB_POSITION_CATEGORIES: JobPositionCategory[] = RAW_CATEGORIES;

export function isOtherJobCategory(categoryId: string): boolean {
  return categoryId === JOB_POSITION_OTHER_CATEGORY_ID;
}

export function getJobCategoryById(categoryId: string): JobPositionCategory | undefined {
  return JOB_POSITION_CATEGORIES.find((c) => c.id === categoryId);
}

export function getAllJobPositionTitles(): string[] {
  const titles = new Set<string>();
  for (const cat of JOB_POSITION_CATEGORIES) {
    for (const position of cat.positions) {
      titles.add(position);
    }
  }
  return Array.from(titles);
}

export function normalizeJobTitle(value: string): string {
  return value.trim().toLowerCase();
}

export function jobTitleMatchesPosition(jobTitle: string, position: string): boolean {
  const title = normalizeJobTitle(jobTitle);
  const pos = normalizeJobTitle(position);
  return title === pos || title.includes(pos) || pos.includes(title);
}

export function jobMatchesOtherCategory(description: string): boolean {
  return /position category:\s*other/i.test(description);
}

export function jobTitleMatchesCategory(
  jobTitle: string,
  categoryId: string,
  description = ""
): boolean {
  if (!categoryId) {
    return false;
  }
  if (isOtherJobCategory(categoryId)) {
    return jobMatchesOtherCategory(description);
  }
  const cat = getJobCategoryById(categoryId);
  if (!cat) return false;
  return cat.positions.some((position) => jobTitleMatchesPosition(jobTitle, position));
}

export function buildPostedJobTitle(
  categoryId: string,
  position: string,
  otherPositionName: string
): string {
  if (isOtherJobCategory(categoryId)) {
    return otherPositionName.trim();
  }
  return position.trim();
}

export type ResolvedApplicationRole = {
  categoryLabel: string;
  positionTitle: string;
};

export function parsePositionCategoryFromDescription(
  description?: string | null
): string | null {
  if (!description?.trim()) return null;
  const match = description.match(/position category:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

/** Best-effort category + position for display (e.g. hired roster). */
export function resolveApplicationJobRole(
  jobTitle: string,
  description?: string | null
): ResolvedApplicationRole {
  const title = jobTitle.trim() || "Role not specified";
  const categoryFromDesc = parsePositionCategoryFromDescription(description);

  if (categoryFromDesc) {
    const cat = JOB_POSITION_CATEGORIES.find(
      (c) => c.label.toLowerCase() === categoryFromDesc.toLowerCase()
    );
    if (cat && !isOtherJobCategory(cat.id)) {
      const matchedPosition = cat.positions.find((p) => jobTitleMatchesPosition(title, p));
      return {
        categoryLabel: cat.label,
        positionTitle: matchedPosition ?? title,
      };
    }
    if (/other/i.test(categoryFromDesc) || jobMatchesOtherCategory(description ?? "")) {
      return { categoryLabel: "Other", positionTitle: title };
    }
    return { categoryLabel: categoryFromDesc, positionTitle: title };
  }

  for (const cat of JOB_POSITION_CATEGORIES) {
    if (isOtherJobCategory(cat.id)) continue;
    const matchedPosition = cat.positions.find((p) => jobTitleMatchesPosition(title, p));
    if (matchedPosition) {
      return { categoryLabel: cat.label, positionTitle: matchedPosition };
    }
  }

  if (jobMatchesOtherCategory(description ?? "")) {
    return { categoryLabel: "Other", positionTitle: title };
  }

  return { categoryLabel: "General", positionTitle: title };
}

export function appendJobCategoryToDescription(
  description: string,
  categoryId: string,
  otherPositionDetails?: string
): string {
  const cat = getJobCategoryById(categoryId);
  const categoryLine = cat ? `Position category: ${cat.label}` : "";
  const otherLine =
    isOtherJobCategory(categoryId) && otherPositionDetails?.trim()
      ? `Custom role details:\n${otherPositionDetails.trim()}`
      : "";
  const parts = [description.trim(), categoryLine, otherLine].filter(Boolean);
  return parts.join("\n\n");
}
