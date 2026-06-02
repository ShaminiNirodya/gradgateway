import { normalizeDegreeName } from "@/lib/constants/university-degrees";

/** Six specialization areas — canonical degree strings match university-degrees.ts */
export type FieldOfMajorId =
  | "software-development-computing"
  | "artificial-intelligence-data"
  | "business-information-systems"
  | "electronics-embedded-systems"
  | "engineering-industrial-technology"
  | "applied-technology-emerging";

export interface FieldOfMajorOption {
  id: FieldOfMajorId;
  label: string;
  degrees: string[];
}

export const FIELDS_OF_MAJOR: FieldOfMajorOption[] = [
  {
    id: "software-development-computing",
    label: "Software Development & Computing",
    degrees: [
      "Computer Science",
      "Software Engineering",
      "Computer Science & Technology",
      "Information Technology (IT)",
      "Information and Communication Technology (ICT)",
      "Information Communication Technology",
      "Arts - Information Technology",
      "Physical Science - ICT",
    ],
  },
  {
    id: "artificial-intelligence-data",
    label: "Artificial Intelligence & Data",
    degrees: [
      "Artificial Intelligence",
      "Data Science",
      "Electronic and Intelligent Systems Engineering",
    ],
  },
  {
    id: "business-information-systems",
    label: "Business & Information Systems",
    degrees: [
      "Business Information Systems (Honours) (BIS)",
      "Bachelor of Science Honours in Business Information Systems",
      "Information Systems",
      "Management and Information Technology",
      "Management and Information Technology (SEUSL)",
      "Accounting Information Systems",
      "Information Technology & Management",
      "Bachelor of Science Honours in Information Systems",
    ],
  },
  {
    id: "electronics-embedded-systems",
    label: "Electronics & Embedded Systems",
    degrees: [
      "Electronics and Computer Science",
      "Electronic and Intelligent Systems Engineering",
      "Electronics and Telecommunication Engineering",
    ],
  },
  {
    id: "engineering-industrial-technology",
    label: "Engineering & Industrial Technology",
    degrees: [
      "Engineering",
      "Engineering Technology (ET)",
      "Industrial Information Technology",
      "Transport Management & Logistics Engineering (TMLE)",
      "Physical Science",
    ],
  },
  {
    id: "applied-technology-emerging",
    label: "Applied Technology & Emerging Technologies",
    degrees: [
      "Biosystems Technology (BST)",
      "Science and Technology",
    ],
  },
];

export const FIELD_OF_MAJOR_LABELS = FIELDS_OF_MAJOR.map((f) => f.label);

export function getFieldOfMajorById(id: FieldOfMajorId | string): FieldOfMajorOption | undefined {
  return FIELDS_OF_MAJOR.find((f) => f.id === id);
}

export function getFieldOfMajorByLabel(label: string): FieldOfMajorOption | undefined {
  return FIELDS_OF_MAJOR.find((f) => f.label === label);
}

export function getDegreesForFieldOfMajor(fieldId: FieldOfMajorId | string): string[] {
  return getFieldOfMajorById(fieldId)?.degrees ?? [];
}

/** Infer field from a saved degree (for profiles created before this field existed) */
export function inferFieldOfMajorFromDegree(degree: string): FieldOfMajorId | "" {
  if (!degree) return "";
  const normalized = normalizeDegreeName(degree);
  const match = FIELDS_OF_MAJOR.find((field) => field.degrees.includes(normalized));
  return match?.id ?? "";
}

export function degreeBelongsToField(degree: string, fieldId: FieldOfMajorId | string): boolean {
  if (!fieldId || !degree) return true;
  const field = getFieldOfMajorById(fieldId);
  return field ? field.degrees.includes(normalizeDegreeName(degree)) : true;
}

/** Display label from stored field name or inferred from degree */
export function resolveFieldOfMajorLabel(
  fieldOfMajor: string | undefined | null,
  degree?: string
): string {
  if (fieldOfMajor) {
    const byLabel = getFieldOfMajorByLabel(fieldOfMajor);
    if (byLabel) return byLabel.label;
    const byId = getFieldOfMajorById(fieldOfMajor);
    if (byId) return byId.label;
    return fieldOfMajor;
  }
  if (degree) {
    const id = inferFieldOfMajorFromDegree(degree);
    return id ? getFieldOfMajorById(id)?.label ?? "" : "";
  }
  return "";
}

export function candidateMatchesFieldsOfMajor(
  degree: string,
  selectedFieldIds: Iterable<FieldOfMajorId | string>
): boolean {
  const ids = Array.from(selectedFieldIds);
  if (ids.length === 0) return true;
  return ids.some((fieldId) => degreeBelongsToField(degree, fieldId));
}
