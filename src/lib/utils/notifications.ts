import { ApplicationItem, NotificationItem } from "@/lib/types/dashboard";
import { parseApiUtcDate, SRI_LANKA_TIME_ZONE } from "@/lib/utils/datetime";
import {
  matchesApplicationFilter,
  normalizeApplicationStatus,
  OFFERS_APPLICATION_FILTER_OPTION,
} from "@/lib/constants/application-status";

export const DEADLINE_NOTIFICATION_TITLE = "Application deadline passed";
export const STUDENT_HIRED_NOTIFICATION_TITLE = "Congratulations — you're hired!";

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

function readOptionalId(raw: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = raw[key];
    if (value != null && value !== "") return String(value);
  }
  return null;
}

export function normalizeNotification(raw: Record<string, unknown>): NotificationItem {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    type: String(raw.type ?? raw.Type ?? "System"),
    title: String(raw.title ?? raw.Title ?? ""),
    body: String(raw.body ?? raw.Body ?? ""),
    isRead: Boolean(raw.isRead ?? raw.IsRead ?? false),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
    relatedOpportunityId: readOptionalId(raw, "relatedOpportunityId", "RelatedOpportunityId"),
    relatedApplicationId: readOptionalId(raw, "relatedApplicationId", "RelatedApplicationId"),
    relatedConversationId: readOptionalId(raw, "relatedConversationId", "RelatedConversationId"),
    relatedStudentProfileId: readOptionalId(raw, "relatedStudentProfileId", "RelatedStudentProfileId"),
  };
}

function buildQuery(params: Record<string, string | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function jobTitlesMatch(a: string, b: string): boolean {
  const left = a.toLowerCase().trim();
  const right = b.toLowerCase().trim();
  return left === right || left.includes(right) || right.includes(left);
}

/** Parse "Your application for {job} is now {status}." */
export function parseApplicationStatusUpdatedBody(body: string): { jobTitle?: string } {
  const match = body.match(/^Your application for (.+?) is now .+?\.?$/i);
  if (!match) return {};
  return { jobTitle: match[1].trim() };
}

/** Parse "{company} hired you for {job}." */
export function parseHiredNotificationBody(body: string): {
  companyName?: string;
  jobTitle?: string;
} {
  const match = body.match(/^(.+?) hired you for (.+?)\./i);
  if (!match) return {};
  return { companyName: match[1].trim(), jobTitle: match[2].trim() };
}

/** Parse "Name is open for an interview for Job." or decline variants from notification body. */
export function parseOfferNotificationBody(body: string): {
  studentName?: string;
  jobTitle?: string;
} {
  const accepted = body.match(/^(.+?) is open for an interview for (.+?)\.?$/i);
  if (accepted) {
    return { studentName: accepted[1].trim(), jobTitle: accepted[2].trim() };
  }
  const declined = body.match(/^(.+?) declined the offer for (.+?)\.?$/i);
  if (declined) {
    return { studentName: declined[1].trim(), jobTitle: declined[2].trim() };
  }
  return {};
}

/** Parse "Name applied for Job." from new-application notifications. */
export function parseNewApplicationBody(body: string): {
  studentName?: string;
  jobTitle?: string;
} {
  const match = body.match(/^(.+?) applied for (.+?)\.?$/i);
  if (!match) return {};
  return { studentName: match[1].trim(), jobTitle: match[2].trim() };
}

function findApplicationByJobMeta(
  applications: ApplicationItem[],
  options: {
    jobTitle?: string;
    companyName?: string;
    studentName?: string;
    opportunityId?: string | null;
    studentProfileId?: string | null;
  }
): ApplicationItem | undefined {
  return applications.find((app) => {
    const nameOk = options.studentName
      ? app.studentName.toLowerCase() === options.studentName.toLowerCase()
      : true;
    const studentOk = options.studentProfileId
      ? app.studentProfileId === options.studentProfileId
      : true;
    const jobOk = options.jobTitle ? jobTitlesMatch(app.jobTitle, options.jobTitle) : true;
    const companyOk = options.companyName
      ? app.companyName.toLowerCase() === options.companyName.toLowerCase()
      : true;
    const opportunityOk = options.opportunityId
      ? app.opportunityId === options.opportunityId
      : true;
    return nameOk && studentOk && jobOk && companyOk && opportunityOk;
  });
}

/** Tab key on student Applications page where this application is visible. */
export function studentApplicationsTabForApp(app: ApplicationItem): string {
  if (normalizeApplicationStatus(app.status) === "Hired") return "Hired";
  if (matchesApplicationFilter(app, "Offers")) return "Offers";
  if (normalizeApplicationStatus(app.status) === "Interviewed") return "Interviewed";
  if (normalizeApplicationStatus(app.status) === "Shortlisted") return "Shortlisted";
  if (normalizeApplicationStatus(app.status) === "Rejected") return "Rejected";
  if (normalizeApplicationStatus(app.status) === "New") return "New";
  return "All";
}

/** Resolve application id for legacy notifications that only have body text. */
export function resolveApplicationIdFromNotification(
  notification: NotificationItem,
  applications: ApplicationItem[]
): string | null {
  if (notification.relatedApplicationId) return notification.relatedApplicationId;

  const title = notification.title.trim();
  let studentName: string | undefined;
  let jobTitle: string | undefined;
  let companyName: string | undefined;

  if (title === "Offer accepted" || title === "Offer declined") {
    ({ studentName, jobTitle } = parseOfferNotificationBody(notification.body));
  } else if (title === "New Application") {
    ({ studentName, jobTitle } = parseNewApplicationBody(notification.body));
  } else if (title === "Application Status Updated") {
    ({ jobTitle } = parseApplicationStatusUpdatedBody(notification.body));
  } else if (title === STUDENT_HIRED_NOTIFICATION_TITLE) {
    ({ companyName, jobTitle } = parseHiredNotificationBody(notification.body));
  } else if (title === "Job Offer Received") {
    const match = notification.body.match(/job offer for (.+?)\.?$/i);
    if (match) jobTitle = match[1].trim();
  } else if (title === "Application update") {
    const match = notification.body.match(/application for (.+?)\. Open Messages/i);
    if (match) jobTitle = match[1].trim();
  }

  if (!studentName && !jobTitle && !companyName && !notification.relatedStudentProfileId) {
    return null;
  }

  return (
    findApplicationByJobMeta(applications, {
      studentName,
      jobTitle,
      companyName,
      opportunityId: notification.relatedOpportunityId,
      studentProfileId: notification.relatedStudentProfileId,
    })?.id ?? null
  );
}

function studentApplicationsDeepLink(
  notification: NotificationItem,
  options?: { filter?: string }
): string {
  const title = notification.title.trim();
  const params: Record<string, string | undefined> = { highlight: "1" };

  if (notification.relatedApplicationId) {
    params.applicationId = notification.relatedApplicationId;
  }
  if (notification.relatedOpportunityId) {
    params.opportunityId = notification.relatedOpportunityId;
  }

  if (!notification.relatedApplicationId) {
    if (title === "Application Status Updated") {
      const { jobTitle } = parseApplicationStatusUpdatedBody(notification.body);
      if (jobTitle) params.jobTitle = jobTitle;
    } else if (title === STUDENT_HIRED_NOTIFICATION_TITLE) {
      const { jobTitle } = parseHiredNotificationBody(notification.body);
      if (jobTitle) params.jobTitle = jobTitle;
      params.filter = "Hired";
    } else if (title === "Job Offer Received") {
      const match = notification.body.match(/job offer for (.+?)\.?$/i);
      if (match) params.jobTitle = match[1].trim();
      params.filter = OFFERS_APPLICATION_FILTER_OPTION.filterKey;
    } else if (title === "Application update") {
      const match = notification.body.match(/application for (.+?)\. Open Messages/i);
      if (match) params.jobTitle = match[1].trim();
    }
  }

  if (options?.filter) params.filter = options.filter;

  return `/dashboard/student/applications${buildQuery(params)}`;
}

/** Company dashboard route for a notification click. */
export function getCompanyNotificationHref(notification: NotificationItem): string {
  const type = notification.type.toLowerCase();
  const title = notification.title.trim();

  if (title === DEADLINE_NOTIFICATION_TITLE || type === "opportunity") {
    const base = "/dashboard/company/jobs";
    if (notification.relatedOpportunityId) {
      return `${base}${buildQuery({ jobId: notification.relatedOpportunityId })}`;
    }
    return base;
  }

  if (
    type === "message" ||
    title === "New message" ||
    title === "Interview invitation"
  ) {
    return `/dashboard/company/messages${buildQuery({
      conversationId: notification.relatedConversationId,
      opportunityId: notification.relatedOpportunityId,
      studentProfileId: notification.relatedStudentProfileId,
      highlight: notification.relatedConversationId ? "1" : undefined,
    })}`;
  }

  if (title === "Offer accepted" || title === "Offer declined") {
    const params: Record<string, string | undefined> = {
      highlight: "1",
      filter: OFFERS_APPLICATION_FILTER_OPTION.filterKey,
    };
    if (notification.relatedApplicationId) {
      params.applicationId = notification.relatedApplicationId;
    }
    if (notification.relatedStudentProfileId) {
      params.studentProfileId = notification.relatedStudentProfileId;
    }
    if (!notification.relatedApplicationId) {
      const parsed = parseOfferNotificationBody(notification.body);
      if (parsed.studentName) params.studentName = parsed.studentName;
      if (parsed.jobTitle) params.jobTitle = parsed.jobTitle;
    }
    return `/dashboard/company/applications${buildQuery(params)}`;
  }

  if (type === "application" || title === "New Application") {
    const params: Record<string, string | undefined> = { highlight: "1" };
    if (notification.relatedApplicationId) {
      params.applicationId = notification.relatedApplicationId;
    }
    if (notification.relatedOpportunityId) {
      params.jobId = notification.relatedOpportunityId;
    }
    if (notification.relatedStudentProfileId) {
      params.studentProfileId = notification.relatedStudentProfileId;
    }
    if (!notification.relatedApplicationId && title === "New Application") {
      const parsed = parseNewApplicationBody(notification.body);
      if (parsed.studentName) params.studentName = parsed.studentName;
      if (parsed.jobTitle) params.jobTitle = parsed.jobTitle;
    }
    return `/dashboard/company/applications${buildQuery(params)}`;
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
    return `/dashboard/student/messages${buildQuery({
      conversationId: notification.relatedConversationId,
      opportunityId: notification.relatedOpportunityId,
      highlight: notification.relatedConversationId ? "1" : "1",
    })}`;
  }

  if (title === STUDENT_HIRED_NOTIFICATION_TITLE) {
    return studentApplicationsDeepLink(notification, { filter: "Hired" });
  }

  if (
    type === "application" ||
    title === "Application Status Updated" ||
    title === "Job Offer Received"
  ) {
    return studentApplicationsDeepLink(notification);
  }

  if (title === "Application update") {
    if (notification.relatedConversationId) {
      return `/dashboard/student/messages${buildQuery({
        conversationId: notification.relatedConversationId,
        opportunityId: notification.relatedOpportunityId,
        highlight: "1",
      })}`;
    }
    return studentApplicationsDeepLink(notification);
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
