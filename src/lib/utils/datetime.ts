/** Sri Lanka (Asia/Colombo, UTC+5:30) — used for displaying API timestamps. */
export const SRI_LANKA_TIME_ZONE = "Asia/Colombo";

/**
 * Parse datetimes from the .NET API. Values are stored in UTC but often serialized
 * without a timezone suffix (e.g. "2026-06-02T18:26:00"), which JS would treat as local.
 */
export function parseApiUtcDate(iso: string): Date {
  const trimmed = iso?.trim();
  if (!trimmed) return new Date(NaN);
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }
  return new Date(`${trimmed}Z`);
}

export function formatMessageDateTime(iso: string): string {
  return parseApiUtcDate(iso).toLocaleString("en-LK", {
    timeZone: SRI_LANKA_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Compact time shown under chat bubbles (Sri Lanka). */
export function formatChatMessageTime(iso: string, now = new Date()): string {
  const date = parseApiUtcDate(iso);
  const formatter = new Intl.DateTimeFormat("en-LK", {
    timeZone: SRI_LANKA_TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateFormatter = new Intl.DateTimeFormat("en-LK", {
    timeZone: SRI_LANKA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const messageDay = dateFormatter.format(date);
  const todayDay = dateFormatter.format(now);
  if (messageDay === todayDay) {
    return date.toLocaleString("en-LK", {
      timeZone: SRI_LANKA_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return formatter.format(date);
}

export function formatConversationListDate(iso: string): string {
  return parseApiUtcDate(iso).toLocaleDateString("en-LK", {
    timeZone: SRI_LANKA_TIME_ZONE,
    month: "short",
    day: "numeric",
  });
}
