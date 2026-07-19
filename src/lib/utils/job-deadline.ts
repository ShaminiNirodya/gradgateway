/**
 * Deadline calendar rules (local timezone):
 * - Deadline date 2 Jun 2026 → post stays active through end of 2 Jun.
 * - "Due" and deadline-passed notifications apply from 00:00 on 3 Jun 2026.
 */

function calendarDayIndex(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole days from today until the deadline date (0 = last active day). */
export function calendarDaysUntilDeadline(deadlineIso: string, now = new Date()): number {
  const deadline = new Date(deadlineIso);
  const deadlineDay = calendarDayIndex(deadline);
  const todayDay = calendarDayIndex(now);
  return Math.round((deadlineDay - todayDay) / (1000 * 60 * 60 * 24));
}

/** True from local midnight on the day after the deadline date. */
export function isJobPostDue(deadlineIso: string, now = new Date()): boolean {
  return calendarDaysUntilDeadline(deadlineIso, now) < 0;
}

/** Active for students: company post is on and deadline has not passed. */
export function isActiveJobOpening(
  opportunity: { isActive: boolean; deadlineAt: string },
  now = new Date()
): boolean {
  return opportunity.isActive && !isJobPostDue(opportunity.deadlineAt, now);
}

/** Expired: deactivated or deadline has passed (includes applied roles). */
export function isExpiredJobOpening(
  opportunity: { isActive: boolean; deadlineAt: string },
  now = new Date()
): boolean {
  return !isActiveJobOpening(opportunity, now);
}
