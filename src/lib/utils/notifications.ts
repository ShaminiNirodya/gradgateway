import { NotificationItem } from "@/lib/types/dashboard";
import { parseApiUtcDate, SRI_LANKA_TIME_ZONE } from "@/lib/utils/datetime";

export const DEADLINE_NOTIFICATION_TITLE = "Application deadline passed";

export function isMessageNotification(notification: NotificationItem): boolean {
  const type = notification.type.toLowerCase();
  const title = notification.title.trim();
  return (
    type.includes("message") ||
    title === "New message" ||
    title === "Interview invitation"
  );
}

export function countUnreadMessageAlerts(notifications: NotificationItem[]): number {
  return notifications.filter((n) => !n.isRead && isMessageNotification(n)).length;
}

export function normalizeNotification(raw: Record<string, unknown>): NotificationItem {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    type: String(raw.type ?? raw.Type ?? "System"),
    title: String(raw.title ?? raw.Title ?? ""),
    body: String(raw.body ?? raw.Body ?? ""),
    isRead: Boolean(raw.isRead ?? raw.IsRead ?? false),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
    relatedOpportunityId:
      (raw.relatedOpportunityId ?? raw.RelatedOpportunityId ?? null) as string | null | undefined,
  };
}

/** Company dashboard route for a notification click. */
export function getCompanyNotificationHref(notification: NotificationItem): string {
  const type = notification.type.toLowerCase();
  const title = notification.title.trim();

  if (title === DEADLINE_NOTIFICATION_TITLE || type === "opportunity") {
    if (notification.relatedOpportunityId) {
      return `/dashboard/company/jobs?jobId=${notification.relatedOpportunityId}`;
    }
    return "/dashboard/company/jobs";
  }

  if (
    type === "message" ||
    title === "New message" ||
    title === "Interview invitation"
  ) {
    return "/dashboard/company/messages";
  }

  if (type === "application" || title === "New Application") {
    if (notification.relatedOpportunityId) {
      return `/dashboard/company/applications?jobId=${notification.relatedOpportunityId}`;
    }
    return "/dashboard/company/applications";
  }

  return "/dashboard/company";
}

/** Student dashboard route for a notification click. */
export function getStudentNotificationHref(notification: NotificationItem): string {
  const type = notification.type.toLowerCase();
  const title = notification.title.trim();

  if (
    type === "message" ||
    title === "New message" ||
    title === "Interview invitation"
  ) {
    return "/dashboard/student/messages";
  }

  if (
    type === "application" ||
    title === "Application Status Updated" ||
    title === "Job Offer Received"
  ) {
    return "/dashboard/student/applications";
  }

  if (type === "opportunity") {
    return "/dashboard/student/openings";
  }

  return "/dashboard/student";
}

export function formatNotificationTime(iso: string): string {
  const date = parseApiUtcDate(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-LK", {
    timeZone: SRI_LANKA_TIME_ZONE,
    month: "short",
    day: "numeric",
  });
}
