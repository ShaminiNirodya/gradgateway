import { normalizeDegreeName, getDegreesForUniversity } from "@/lib/constants/university-degrees";

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
  /** Degrees shown to students when they pick this field */
  subCategories: string[];
  /** Canonical names used to match university degree lists */
  degrees: string[];
}

export const FIELDS_OF_MAJOR: FieldOfMajorOption[] = [
  {
    id: "software-development-computing",
    label: "Software Development & Computing",
    subCategories: [
      "Computer Science",
      "Software Engineering",
      "Computer Science & Technology",
      "Information Technology",
      "ICT",
    ],
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
    subCategories: [
      "Artificial Intelligence",
      "Data Science",
      "Electronic and Intelligent Systems Engineering",
    ],
    degrees: [
      "Artificial Intelligence",
      "Data Science",
      "Electronic and Intelligent Systems Engineering",
    ],
  },
  {
    id: "business-information-systems",
    label: "Business & Information Systems",
    subCategories: [
      "Business Information Systems",
      "Information Systems",
      "Management and Information Technology",
      "Accounting Information Systems",
      "Information Technology & Management",
    ],
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
    subCategories: [
      "Electronics and Computer Science",
      "Electronic and Intelligent Systems Engineering",
    ],
    degrees: [
      "Electronics and Computer Science",
      "Electronic and Intelligent Systems Engineering",
      "Electronics and Telecommunication Engineering",
    ],
  },
  {
    id: "engineering-industrial-technology",
    label: "Engineering & Industrial Technology",
    subCategories: [
      "Engineering",
      "Engineering Technology",
      "Industrial Information Technology",
      "Transport Management & Logistics Engineering",
    ],
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
    subCategories: ["Biosystems Technology", "Science and Technology"],
    degrees: ["Biosystems Technology (BST)", "Science and Technology"],
  },
];

export const FIELD_OF_MAJOR_LABELS = FIELDS_OF_MAJOR.map((f) => f.label);

export function getFieldOfMajorById(id: FieldOfMajorId | string): FieldOfMajorOption | undefined {
  return FIELDS_OF_MAJOR.find((f) => f.id === id);
}

export function getFieldOfMajorByLabel(label: string): FieldOfMajorOption | undefined {
  return FIELDS_OF_MAJOR.find((f) => f.label === label);
}

export function getSubCategoriesForFieldOfMajor(fieldId: FieldOfMajorId | string): string[] {
  return getFieldOfMajorById(fieldId)?.subCategories ?? [];
}

export function getDegreesForFieldOfMajor(fieldId: FieldOfMajorId | string): string[] {
  return getFieldOfMajorById(fieldId)?.degrees ?? [];
}

/** Fields that have at least one degree offered at the given university */
export function getFieldsOfMajorForUniversity(university: string): FieldOfMajorOption[] {
  if (!university) return [];
  const uniDegrees = new Set(getDegreesForUniversity(university).map(normalizeDegreeName));
  return FIELDS_OF_MAJOR.filter((field) =>
    field.degrees.some((degree) => uniDegrees.has(normalizeDegreeName(degree)))
  );
}

/** Degrees for a field that are actually offered at the given university */
export function getDegreesForFieldAtUniversity(
  fieldId: FieldOfMajorId | string,
  university: string
): string[] {
  if (!university || !fieldId) return [];
  const fieldDegrees = new Set(getDegreesForFieldOfMajor(fieldId).map(normalizeDegreeName));
  return getDegreesForUniversity(university).filter((degree) =>
    fieldDegrees.has(normalizeDegreeName(degree))
  );
}

export function inferFieldOfMajorFromDegree(degree: string): FieldOfMajorId | "" {
  if (!degree) return "";
  const normalized = normalizeDegreeName(degree);
  const match = FIELDS_OF_MAJOR.find((field) => field.degrees.includes(normalized));
  return match?.id ?? "";
}

/** When a degree is chosen, set field of major from the degree if it can be inferred */
export function fieldOfMajorFromDegreeSelection(
  degree: string,
  currentFieldId: FieldOfMajorId | "" = ""
): FieldOfMajorId | "" {
  const inferred = inferFieldOfMajorFromDegree(degree);
  if (inferred) return inferred;
  return currentFieldId;
}

export function degreeBelongsToField(degree: string, fieldId: FieldOfMajorId | string): boolean {
  if (!fieldId || !degree) return true;
  const field = getFieldOfMajorById(fieldId);
  return field ? field.degrees.includes(normalizeDegreeName(degree)) : true;
}

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
