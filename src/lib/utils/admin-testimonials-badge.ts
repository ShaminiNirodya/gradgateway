const STORAGE_KEY = "gradgateway.admin.testimonials.lastSeenAt";

export function getTestimonialsLastSeenAt(): Date {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Date(raw) : new Date(0);
  } catch {
    return new Date(0);
  }
}

export function markTestimonialsAsSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    // ignore storage errors
  }
}

export function countUnseenTestimonials(
  items: { createdAt: string; status?: string }[]
): number {
  const lastSeenAt = getTestimonialsLastSeenAt();
  return items.filter(
    (item) =>
      (item.status ?? "Pending") === "Pending" &&
      new Date(item.createdAt).getTime() > lastSeenAt.getTime()
  ).length;
}
