import type { ApplicationItem } from "@/lib/types/dashboard";

export type ActivityRange = "week" | "month" | "year";

export type ActivityBucket = {
  key: string;
  label: string;
  value: number;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Monday 00:00:00 of the calendar week containing `date`. */
export function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const weekday = d.getDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  d.setDate(d.getDate() - daysFromMonday);
  return d;
}

export function buildWeeklyBuckets(applications: ApplicationItem[]): ActivityBucket[] {
  const monday = getWeekMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const buckets: ActivityBucket[] = WEEKDAY_LABELS.map((label, index) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + index);
    return {
      key: toLocalDateKey(day),
      label,
      value: 0,
    };
  });

  applications.forEach((row) => {
    const applied = new Date(row.appliedAt);
    if (applied < monday || applied > sunday) return;
    const key = toLocalDateKey(applied);
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  });

  return buckets;
}

export function buildMonthlyBuckets(applications: ApplicationItem[]): ActivityBucket[] {
  const now = new Date();
  const buckets: ActivityBucket[] = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
      label: monthStart.toLocaleDateString("en-LK", { month: "short", year: "2-digit" }),
      value: 0,
    });
  }

  applications.forEach((row) => {
    const applied = new Date(row.appliedAt);
    const key = `${applied.getFullYear()}-${applied.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  });

  return buckets;
}

export function buildYearlyBuckets(applications: ApplicationItem[]): ActivityBucket[] {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 4;
  const buckets: ActivityBucket[] = [];

  for (let year = startYear; year <= currentYear; year += 1) {
    buckets.push({
      key: String(year),
      label: String(year),
      value: 0,
    });
  }

  applications.forEach((row) => {
    const year = new Date(row.appliedAt).getFullYear();
    const bucket = buckets.find((b) => b.key === String(year));
    if (bucket) bucket.value += 1;
  });

  return buckets;
}

export function buildActivityBuckets(
  applications: ApplicationItem[],
  range: ActivityRange
): ActivityBucket[] {
  switch (range) {
    case "week":
      return buildWeeklyBuckets(applications);
    case "month":
      return buildMonthlyBuckets(applications);
    case "year":
      return buildYearlyBuckets(applications);
  }
}

export function getActivityMeta(range: ActivityRange): {
  subtitle: string;
  rangeBadge: string;
  periodSummary: string;
} {
  switch (range) {
    case "week":
      return {
        subtitle: "Applications this calendar week",
        rangeBadge: "Mon – Sun",
        periodSummary: "this week",
      };
    case "month":
      return {
        subtitle: "Applications by month",
        rangeBadge: "Last 12 months",
        periodSummary: "in the last 12 months",
      };
    case "year":
      return {
        subtitle: "Applications by year",
        rangeBadge: "Last 5 years",
        periodSummary: "in the last 5 years",
      };
  }
}
