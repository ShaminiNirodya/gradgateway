"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  LayoutList,
  Loader2,
  MapPin,
  Monitor,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService, type StudentInterviewItem } from "@/lib/services/student.service";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ModeIcon({ mode }: { mode: string }) {
  if (mode === "Onsite") return <MapPin className="h-4 w-4" />;
  if (mode === "Phone") return <Phone className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("en-LK", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-LK", { hour: "numeric", minute: "2-digit" }),
  };
}

function statusStyles(status: string, isPast: boolean) {
  if (status === "Cancelled") return "bg-red-50 text-red-700 ring-red-200/60";
  if (status === "Completed") return "bg-emerald-50 text-emerald-700 ring-emerald-200/60";
  if (isPast) return "bg-slate-100 text-slate-600 ring-slate-200/60";
  return "bg-indigo-50 text-indigo-700 ring-indigo-200/60";
}

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getCalendarDays(viewMonth: Date) {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const leading = (first.getDay() + 6) % 7;

  const days: { date: Date; inMonth: boolean }[] = [];

  for (let i = leading - 1; i >= 0; i--) {
    const d = new Date(first);
    d.setDate(first.getDate() - (i + 1));
    days.push({ date: d, inMonth: false });
  }

  for (let day = 1; day <= last.getDate(); day++) {
    days.push({ date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day), inMonth: true });
  }

  while (days.length % 7 !== 0) {
    const prev = days[days.length - 1].date;
    const next = new Date(prev);
    next.setDate(prev.getDate() + 1);
    days.push({ date: next, inMonth: false });
  }

  return days;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState<StudentInterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setError("Please sign in again.");
          return;
        }
        const rows = await StudentService.getMyInterviews(token);
        if (!cancelled) setInterviews(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load interviews.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const upcoming = interviews
      .filter((i) => new Date(i.scheduledAt).getTime() >= now && i.status !== "Cancelled")
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    const past = interviews
      .filter((i) => new Date(i.scheduledAt).getTime() < now || i.status === "Cancelled")
      .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));
    return { upcoming, past };
  }, [interviews, now]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#6C5DD3]">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Interviews</h1>
            <p className="text-sm font-medium text-slate-500">
              Your scheduled interviews from companies, all in one place
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading interviews...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{error}</div>
      ) : interviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
          <p className="font-bold text-slate-700">No interviews scheduled yet</p>
          <p className="mt-1 text-sm text-slate-500">
            When a company schedules an interview with you, it will appear here and in your messages.
          </p>
          <Button asChild variant="soft" className="mt-4">
            <Link href="/dashboard/student/applications">View my applications</Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="list" className="gap-4">
          <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="list" className="rounded-lg px-4 data-[state=active]:bg-white">
              <LayoutList className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg px-4 data-[state=active]:bg-white">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0 space-y-6">
            <InterviewSection title="Upcoming" items={upcoming} emptyText="No upcoming interviews." isPast={false} />
            <InterviewSection title="Past" items={past} emptyText="No past interviews." isPast />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <InterviewCalendar interviews={interviews} now={now} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function InterviewCalendar({ interviews, now }: { interviews: StudentInterviewItem[]; now: number }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(() => dateKey(today));

  const interviewsByDay = useMemo(() => {
    const map = new Map<string, StudentInterviewItem[]>();
    for (const interview of interviews) {
      const key = dateKey(new Date(interview.scheduledAt));
      const list = map.get(key) ?? [];
      list.push(interview);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    }
    return map;
  }, [interviews]);

  const calendarDays = useMemo(() => getCalendarDays(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString("en-LK", { month: "long", year: "numeric" });
  const selectedInterviews = interviewsByDay.get(selectedKey) ?? [];
  const nextInterview = useMemo(() => {
    return (
      interviews
        .filter((i) => new Date(i.scheduledAt).getTime() >= now && i.status !== "Cancelled")
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))[0] ?? null
    );
  }, [interviews, now]);

  const goToMonth = (offset: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-visible rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        {nextInterview ? (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/60 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Next interview</p>
            <p className="mt-1 text-base font-extrabold text-slate-800">
              {new Date(nextInterview.scheduledAt).toLocaleDateString("en-LK", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {nextInterview.jobTitle} · {nextInterview.companyName}
              <span className="text-slate-400">
                {" "}
                · {formatDateTime(nextInterview.scheduledAt).time}
              </span>
            </p>
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-500">
            No upcoming interviews scheduled.
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-800">{monthLabel}</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="soft"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                const t = new Date();
                setViewMonth(new Date(t.getFullYear(), t.getMonth(), 1));
                setSelectedKey(dateKey(t));
              }}
            >
              Today
            </Button>
            <Button type="button" variant="soft" size="icon" className="rounded-xl" onClick={() => goToMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="soft" size="icon" className="rounded-xl" onClick={() => goToMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-visible grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
              {label}
            </div>
          ))}

          {calendarDays.map(({ date, inMonth }, index) => {
            const key = dateKey(date);
            const dayInterviews = interviewsByDay.get(key) ?? [];
            const isToday = dateKey(date) === dateKey(today);
            const isSelected = key === selectedKey;
            const hasUpcoming = dayInterviews.some(
              (i) => new Date(i.scheduledAt).getTime() >= now && i.status !== "Cancelled"
            );
            const hasCancelled = dayInterviews.some((i) => i.status === "Cancelled");
            const row = Math.floor(index / 7);
            const col = index % 7;
            const popoverAbove = row >= 4;

            return (
              <div
                key={key + (inMonth ? "" : "-pad")}
                className={cn("relative group/day", !inMonth && "opacity-40")}
              >
                <button
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={cn(
                    "flex min-h-[52px] w-full flex-col items-center rounded-xl border p-1.5 text-left transition-colors sm:min-h-[72px] sm:p-2",
                    inMonth
                      ? "border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50/40"
                      : "border-transparent bg-transparent",
                    isSelected && inMonth && !isToday && "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200/60",
                    isSelected && inMonth && isToday && "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200/60",
                    isToday && "ring-2 ring-emerald-400/40",
                    dayInterviews.length > 0 && inMonth && "hover:z-20"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm",
                      isToday ? "bg-emerald-500 text-white" : "text-slate-700"
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {dayInterviews.length > 0 && (
                    <div className="mt-1 flex w-full flex-col gap-0.5">
                      {dayInterviews.slice(0, 2).map((interview) => (
                        <span
                          key={interview.id}
                          className={cn(
                            "hidden w-full truncate rounded px-1 py-0.5 text-[9px] font-semibold sm:block",
                            interview.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : hasUpcoming
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {interview.jobTitle}
                        </span>
                      ))}
                      <span
                        className={cn(
                          "mx-auto mt-0.5 h-1.5 w-1.5 rounded-full sm:hidden",
                          hasCancelled && !hasUpcoming
                            ? "bg-red-400"
                            : hasUpcoming
                              ? "bg-[#6C5DD3]"
                              : "bg-slate-400"
                        )}
                      />
                      {dayInterviews.length > 2 && (
                        <span className="hidden text-[9px] font-semibold text-slate-500 sm:block">
                          +{dayInterviews.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {dayInterviews.length > 0 && inMonth && (
                  <InterviewDayHoverPanel
                    date={date}
                    interviews={dayInterviews}
                    now={now}
                    popoverAbove={popoverAbove}
                    align={col <= 1 ? "left" : col >= 5 ? "right" : "center"}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          {selectedInterviews.length > 0
            ? new Date(selectedInterviews[0].scheduledAt).toLocaleDateString("en-LK", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "No interviews on this day"}
        </h3>
        {selectedInterviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-6 text-sm text-slate-500">
            Select a highlighted day to see interview details.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedInterviews.map((interview) => {
              const isPast =
                new Date(interview.scheduledAt).getTime() < now || interview.status === "Cancelled";
              return (
                <InterviewCard key={interview.id} interview={interview} isPast={isPast} />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function InterviewDayHoverPanel({
  date,
  interviews,
  now,
  popoverAbove,
  align,
}: {
  date: Date;
  interviews: StudentInterviewItem[];
  now: number;
  popoverAbove: boolean;
  align: "left" | "center" | "right";
}) {
  const dateLabel = date.toLocaleDateString("en-LK", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50 hidden w-[min(18rem,calc(100vw-2rem))] opacity-0 transition-all duration-150 sm:block",
        "group-hover/day:pointer-events-auto group-hover/day:opacity-100 group-focus-within/day:pointer-events-auto group-focus-within/day:opacity-100",
        popoverAbove ? "bottom-full mb-2 group-hover/day:translate-y-0" : "top-full mt-2",
        !popoverAbove && "translate-y-1 group-hover/day:translate-y-0 group-focus-within/day:translate-y-0",
        popoverAbove && "translate-y-1 group-hover/day:translate-y-0 group-focus-within/day:translate-y-0",
        align === "left" && "left-0",
        align === "right" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2 group-hover/day:-translate-x-1/2 group-focus-within/day:-translate-x-1/2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl ring-1 ring-black/5">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#6C5DD3] shadow-sm">
              <CalendarDays className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-slate-800">{dateLabel}</p>
              <p className="text-[10px] font-semibold text-slate-500">
                {interviews.length} interview{interviews.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto p-2">
          {interviews.map((interview) => {
            const { time } = formatDateTime(interview.scheduledAt);
            const isPast =
              new Date(interview.scheduledAt).getTime() < now || interview.status === "Cancelled";

            return (
              <div
                key={interview.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold leading-snug text-slate-800">{interview.jobTitle}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1",
                      statusStyles(interview.status, isPast)
                    )}
                  >
                    {interview.status === "Scheduled" && isPast ? "Past" : interview.status}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{interview.companyName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ModeIcon mode={interview.mode} />
                    {interview.mode === "Remote" ? "Online" : interview.mode}
                  </span>
                </div>
                {interview.location && interview.mode === "Onsite" && (
                  <p className="mt-1 text-[10px] text-slate-500">{interview.location}</p>
                )}
                {interview.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-500">
                    {interview.notes}
                  </p>
                )}
                {interview.meetingLink && !isPast && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#6C5DD3] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#5b4eb8]"
                  >
                    Join meeting
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InterviewCard({ interview, isPast }: { interview: StudentInterviewItem; isPast: boolean }) {
  const { date, time } = formatDateTime(interview.scheduledAt);

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200/80 sm:flex-row sm:items-center sm:justify-between",
        isPast && "opacity-80"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-[#6C5DD3] ring-1 ring-indigo-100/80">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-800">{interview.jobTitle}</h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                statusStyles(interview.status, isPast)
              )}
            >
              {interview.status === "Scheduled" && isPast ? "Past" : interview.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-slate-500">{interview.companyName}</p>
          {interview.notes && (
            <p className="mt-2 line-clamp-2 text-xs text-slate-500">{interview.notes}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-4 text-sm sm:gap-6">
        <div className="text-right">
          <p className="flex items-center gap-1.5 font-bold text-slate-700">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {date}
          </p>
          <p className="mt-0.5 flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {time}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <ModeIcon mode={interview.mode} />
          {interview.mode === "Remote" ? "Online" : interview.mode}
          {interview.location && interview.mode === "Onsite" && (
            <span className="text-slate-400">· {interview.location}</span>
          )}
        </div>
        {interview.meetingLink && !isPast && (
          <Button asChild size="sm" className="rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
              Join
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </article>
  );
}

function InterviewSection({
  title,
  items,
  emptyText,
  isPast,
}: {
  title: string;
  items: StudentInterviewItem[];
  emptyText: string;
  isPast: boolean;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-6 text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} isPast={isPast} />
          ))}
        </div>
      )}
    </section>
  );
}
