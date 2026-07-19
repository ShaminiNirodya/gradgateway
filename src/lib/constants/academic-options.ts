export const GRADUATION_YEAR_MIN = 2020;
export const GRADUATION_YEAR_MAX = 2040;

export const GRADUATION_YEARS = Array.from(
  { length: GRADUATION_YEAR_MAX - GRADUATION_YEAR_MIN + 1 },
  (_, i) => GRADUATION_YEAR_MIN + i
);

export const GPA_MIN = 0;
export const GPA_MAX = 4;
export const GPA_STEP = 0.1;

export function formatGpa(value: number): string {
  return value.toFixed(1);
}

export const GPA_OPTIONS = Array.from(
  { length: Math.round((GPA_MAX - GPA_MIN) / GPA_STEP) + 1 },
  (_, i) => {
    const value = Math.round((GPA_MIN + i * GPA_STEP) * 10) / 10;
    const label = formatGpa(value);
    return { value: label, label };
  }
);

export function normalizeGpaOption(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const num = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (Number.isNaN(num)) return "";
  const clamped = Math.min(GPA_MAX, Math.max(GPA_MIN, num));
  return formatGpa(Math.round(clamped * 10) / 10);
}

export function normalizeGraduationYear(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const year = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (Number.isNaN(year)) return "";
  if (year < GRADUATION_YEAR_MIN || year > GRADUATION_YEAR_MAX) return String(year);
  return String(year);
}
