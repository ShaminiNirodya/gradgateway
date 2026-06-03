"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Users,
    MoreHorizontal,
    Briefcase,
    Calendar,
    Bell,
    MapPin,
    Clock,
    ArrowRight,
    UserCheck,
    Send,
    Search,
    LayoutGrid,
    List as ListIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthService } from "@/lib/services/auth.service";

import { DashboardService } from "@/lib/services/dashboard.service";

import ScheduleInterviewDialog from "@/components/features/company/ScheduleInterviewDialog";
import ShareJobAsOfferDialog, { type ShareableJob } from "@/components/features/company/ShareJobAsOfferDialog";

import {

    DropdownMenu,

    DropdownMenuContent,

    DropdownMenuItem,

    DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { NotificationItem } from "@/lib/types/dashboard";
import { DEADLINE_NOTIFICATION_TITLE } from "@/lib/utils/notifications";
import { calendarDaysUntilDeadline, isJobPostDue } from "@/lib/utils/job-deadline";
import { CompanyPageContainer } from "@/components/layout/company/CompanyPageContainer";
import {
    CompanyPageHeader,
    CompanyPostJobButton,
} from "@/components/layout/company/CompanyPageHeader";



type JobView = {
    id: string;
    title: string;
    type: string;
    location: string;
    workMode: string;
    description: string;
    monthlyStipendLkr?: number;
    posted: string;
    deadline: string;
    applicants: number;
    shortlisted: number;
    status: string;
    hasDeadlineAlert: boolean;
};

function formatOpportunityTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        Internship: "Internship",
        GraduateRole: "Graduate Role",
        PartTime: "Part Time",
        Contract: "Full Time",
    };
    return labels[type] ?? type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatWorkModeLabel(mode: string): string {
    if (mode === "Remote") return "Online";
    return mode.replace(/([a-z])([A-Z])/g, "$1 $2");
}




export default function CompanyJobsPage() {
    const searchParams = useSearchParams();
    const highlightJobId = searchParams.get("jobId");

    const [jobs, setJobs] = useState<JobView[]>([]);

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const [scheduleTarget, setScheduleTarget] = useState<{ id: string; title: string } | null>(null);
    const [shareOfferJob, setShareOfferJob] = useState<ShareableJob | null>(null);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"grid" | "list">("grid");



    const loadData = useCallback(async () => {

        try {

            const token = await AuthService.getIdToken();

            if (!token) {

                setJobs([]);

                setNotifications([]);

                return;

            }



            const [opportunities, applications, notifs] = await Promise.all([

                DashboardService.getCompanyOpportunities(token),

                DashboardService.getCompanyApplications(token),

                DashboardService.getMyNotifications(token),

            ]);



            const appCountByOpportunity = applications.reduce((acc, item) => {

                acc.set(item.opportunityId, (acc.get(item.opportunityId) || 0) + 1);

                return acc;

            }, new Map<string, number>());



            const shortlistedByOpportunity = applications.reduce((acc, item) => {

                if (!item.status.toLowerCase().includes("short")) {

                    return acc;

                }

                acc.set(item.opportunityId, (acc.get(item.opportunityId) || 0) + 1);

                return acc;

            }, new Map<string, number>());



            setJobs(

                opportunities.map((opportunity) => ({

                    deadline: opportunity.deadlineAt,

                    id: opportunity.id,

                    title: opportunity.title,

                    type: opportunity.opportunityType,

                    location: opportunity.location,
                    workMode: opportunity.workMode,
                    description: opportunity.description,
                    monthlyStipendLkr: opportunity.monthlyStipendLkr,

                    posted: new Date(opportunity.createdAt).toLocaleDateString("en-LK", {

                        month: "short",

                        day: "numeric",

                    }),

                    applicants: appCountByOpportunity.get(opportunity.id) || 0,

                    shortlisted: shortlistedByOpportunity.get(opportunity.id) || 0,

                    status: isJobPostDue(opportunity.deadlineAt)
                        ? "Due"
                        : !opportunity.isActive
                          ? "Closed"
                          : "Active",

                    hasDeadlineAlert: notifs.some(
                        (n) =>
                            n.title === DEADLINE_NOTIFICATION_TITLE &&
                            n.relatedOpportunityId === opportunity.id &&
                            !n.isRead
                    ),

                }))

            );

            setNotifications(notifs);

        } catch {

            setJobs([]);

            setNotifications([]);

        }

    }, []);



    useEffect(() => {

        loadData();

    }, [loadData]);

    useEffect(() => {
        if (!highlightJobId) return;
        const el = document.getElementById(`job-${highlightJobId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("ring-2", "ring-[#6C5DD3]", "ring-offset-2");
            const timer = window.setTimeout(() => {
                el.classList.remove("ring-2", "ring-[#6C5DD3]", "ring-offset-2");
            }, 3000);
            return () => window.clearTimeout(timer);
        }
    }, [highlightJobId, jobs]);



    const deadlineNotifications = useMemo(

        () =>

            notifications.filter(

                (n) =>

                    n.title === DEADLINE_NOTIFICATION_TITLE &&

                    n.relatedOpportunityId &&

                    !n.isRead

            ),

        [notifications]

    );



    const jobTitleById = useMemo(() => new Map(jobs.map((j) => [j.id, j.title])), [jobs]);

    const jobStats = useMemo(
        () => ({
            total: jobs.length,
            active: jobs.filter((j) => j.status === "Active").length,
            due: jobs.filter((j) => j.status === "Due").length,
            applicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
        }),
        [jobs]
    );

    const filteredJobs = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return jobs;
        return jobs.filter((job) => {
            const haystack = [
                job.title,
                job.type,
                formatOpportunityTypeLabel(job.type),
                job.location,
                job.workMode,
                formatWorkModeLabel(job.workMode),
                job.status,
                job.posted,
                new Date(job.deadline).toLocaleDateString("en-LK"),
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [jobs, search]);



    const handleScheduled = async (opportunityId: string) => {

        const matching = deadlineNotifications.filter((n) => n.relatedOpportunityId === opportunityId);

        try {

            const token = await AuthService.getIdToken();

            if (token) {

                await Promise.all(

                    matching.map((n) => DashboardService.markNotificationRead(token, n.id))

                );

            }

        } catch {

            /* non-blocking */

        }

        await loadData();

    };



    return (
        <CompanyPageContainer>
            <CompanyPageHeader
                eyebrow="Roles"
                title="Job Posts"
                subtitle="Manage open positions, track applicants, and act on deadlines"
                showSearch={false}
                showNotifications={false}
                primaryAction={<CompanyPostJobButton />}
            />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {[
                    { label: "Total posts", value: jobStats.total },
                    { label: "Active", value: jobStats.active },
                    { label: "Past deadline", value: jobStats.due },
                    { label: "Applicants", value: jobStats.applicants },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-[#6C5DD3]/15"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                        <p className="mt-1 text-2xl font-extrabold text-slate-900">{item.value}</p>
                    </div>
                ))}
            </div>

            {deadlineNotifications.length > 0 && (
                <div className="space-y-3">
                    {deadlineNotifications.map((notification) => {
                        const opportunityId = notification.relatedOpportunityId!;
                        const title = jobTitleById.get(opportunityId) || "this job";

                        return (
                            <div
                                key={notification.id}
                                className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 shadow-sm sm:flex-row sm:items-center"
                            >
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{notification.title}</p>
                                        <p className="mt-0.5 text-sm text-slate-600">{notification.body}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-10 shrink-0 rounded-xl bg-[#6C5DD3] px-5 text-sm font-bold hover:bg-[#5b4eb8]"
                                    onClick={() => setScheduleTarget({ id: opportunityId, title })}
                                >
                                    <Calendar className="h-4 w-4" />
                                    Set up interview date
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, location, type, or status..."
                        className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white pl-11 shadow-sm focus-visible:border-[#6C5DD3]/40 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20"
                    />
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-sm font-medium text-slate-500">
                        {filteredJobs.length} of {jobs.length} post{jobs.length === 1 ? "" : "s"}
                    </p>
                    <div className="flex gap-1 rounded-xl border border-slate-200/80 bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => setView("grid")}
                            aria-label="Grid view"
                            className={cn(
                                "rounded-lg p-2.5 transition-colors",
                                view === "grid" ? "bg-white text-[#6C5DD3]" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("list")}
                            aria-label="List view"
                            className={cn(
                                "rounded-lg p-2.5 transition-colors",
                                view === "list" ? "bg-white text-[#6C5DD3]" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <ListIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
                    <p className="font-bold text-slate-700">No job posts match your search</p>
                    <p className="mt-1 text-sm text-slate-500">Try a different keyword or clear the search bar.</p>
                    {search.trim() && (
                        <Button variant="soft" className="mt-4" onClick={() => setSearch("")}>
                            Clear search
                        </Button>
                    )}
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredJobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onScheduleInterview={() => setScheduleTarget({ id: job.id, title: job.title })}
                            onShareAsOffer={() => setShareOfferJob(job)}
                        />
                    ))}
                    {!search.trim() && (
                        <Link
                            href="/dashboard/company/jobs/new"
                            className="flex h-full min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-[#6C5DD3] hover:bg-indigo-50/50 group"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 transition-colors group-hover:bg-[#6C5DD3] group-hover:text-white">
                                <Plus className="h-8 w-8" />
                            </div>
                            <span className="font-bold text-slate-500 group-hover:text-[#6C5DD3]">Create New Job Post</span>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredJobs.map((job) => (
                        <JobListRow
                            key={job.id}
                            job={job}
                            onScheduleInterview={() => setScheduleTarget({ id: job.id, title: job.title })}
                            onShareAsOffer={() => setShareOfferJob(job)}
                        />
                    ))}
                    {!search.trim() && (
                        <Link
                            href="/dashboard/company/jobs/new"
                            className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-5 transition-all hover:border-[#6C5DD3] hover:bg-indigo-50/50 group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 transition-colors group-hover:bg-[#6C5DD3] group-hover:text-white">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-slate-500 group-hover:text-[#6C5DD3]">Create New Job Post</span>
                        </Link>
                    )}
                </div>
            )}



            {scheduleTarget && (

                <ScheduleInterviewDialog

                    open={!!scheduleTarget}

                    onOpenChange={(open) => {

                        if (!open) setScheduleTarget(null);

                    }}

                    opportunityId={scheduleTarget.id}

                    jobTitle={scheduleTarget.title}

                    onScheduled={() => handleScheduled(scheduleTarget.id)}

                />

            )}

            <ShareJobAsOfferDialog
                job={shareOfferJob}
                open={!!shareOfferJob}
                onOpenChange={(open) => {
                    if (!open) setShareOfferJob(null);
                }}
            />
        </CompanyPageContainer>
    );
}



function JobCard({
    job,
    onScheduleInterview,
    onShareAsOffer,
}: {
    job: JobView;
    onScheduleInterview: () => void;
    onShareAsOffer: () => void;
}) {
    const daysLeft = calendarDaysUntilDeadline(job.deadline);
    const due = job.status === "Due" || isJobPostDue(job.deadline);
    const closesToday = !due && daysLeft === 0;
    const isUrgent = job.status === "Active" && daysLeft > 0 && daysLeft <= 7;
    const deadlineLabel = new Date(job.deadline).toLocaleDateString("en-LK", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <article
            id={`job-${job.id}`}
            className={cn(
                "group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300",
                "hover:-translate-y-0.5 hover:border-[#6C5DD3]/25 hover:shadow-md",
                due && "border-amber-200/90",
                job.status === "Closed" && "opacity-90"
            )}
        >
            <div
                className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6C5DD3] via-indigo-400 to-violet-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    job.status === "Active" && "opacity-60",
                    due && "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-80"
                )}
            />

            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-[#6C5DD3] ring-1 ring-indigo-100/80">
                    <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {due ? <DueLabel /> : <StatusBadge status={job.status} />}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#6C5DD3]"
                                aria-label="Job actions"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl border-indigo-100 p-1.5">
                            <DropdownMenuItem
                                className="cursor-pointer gap-2 rounded-[14px] px-3 py-2.5 text-sm font-bold text-[#6C5DD3] focus:bg-indigo-50 focus:text-[#5b4eb8] [&_svg]:text-[#6C5DD3]"
                                onClick={onScheduleInterview}
                            >
                                <Calendar className="h-4 w-4" />
                                Set up interview date
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer gap-2 rounded-[14px] px-3 py-2.5 text-sm font-bold text-slate-700 focus:bg-indigo-50 focus:text-[#5b4eb8]"
                                onClick={onShareAsOffer}
                            >
                                <Send className="h-4 w-4 text-[#6C5DD3]" />
                                Share as an offer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <h3 className="mb-3 line-clamp-2 text-lg font-extrabold leading-snug text-slate-800 transition-colors group-hover:text-[#6C5DD3]">
                {job.title}
            </h3>

            <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    {formatOpportunityTypeLabel(job.type)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {job.location}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <Clock className="h-3 w-3 shrink-0" />
                    {formatWorkModeLabel(job.workMode)}
                </span>
            </div>

            {job.hasDeadlineAlert && job.shortlisted > 0 && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-xs font-semibold leading-relaxed text-amber-900">
                        Deadline passed · {job.shortlisted} shortlisted — schedule interviews
                    </p>
                </div>
            )}

            <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Applicants</span>
                    </div>
                    <p className="text-2xl font-extrabold tabular-nums text-slate-800">{job.applicants}</p>
                </div>
                <div
                    className={cn(
                        "rounded-2xl border px-3 py-3",
                        job.shortlisted > 0
                            ? "border-indigo-100 bg-indigo-50/60"
                            : "border-slate-100 bg-slate-50/50"
                    )}
                >
                    <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Shortlisted</span>
                    </div>
                    <p
                        className={cn(
                            "text-2xl font-extrabold tabular-nums",
                            job.shortlisted > 0 ? "text-[#6C5DD3]" : "text-slate-400"
                        )}
                    >
                        {job.shortlisted}
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        Posted {job.posted}
                    </span>
                    <div className="text-right">
                        <p
                            className={cn(
                                "font-bold",
                                due
                                    ? "text-amber-700"
                                    : closesToday
                                      ? "text-red-600"
                                      : isUrgent
                                        ? "text-amber-600"
                                        : "text-slate-600"
                            )}
                        >
                            {deadlineLabel}
                        </p>
                        <p
                            className={cn(
                                "mt-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                due
                                    ? "text-amber-700"
                                    : closesToday
                                      ? "text-red-600"
                                      : isUrgent
                                        ? "text-amber-600"
                                        : "text-slate-400"
                            )}
                        >
                            {due
                                ? "Due"
                                : daysLeft === 0
                                  ? "Closes today"
                                  : daysLeft === 1
                                    ? "1 day left"
                                    : `${daysLeft} days left`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-2xl border-[#6C5DD3]/30 font-bold text-[#6C5DD3] hover:bg-indigo-50"
                        onClick={onShareAsOffer}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Share as an offer
                    </Button>
                    <Button
                        asChild
                        className="h-11 w-full rounded-2xl bg-[#6C5DD3] font-bold text-white transition-all hover:bg-[#5b4eb8]"
                    >
                        <Link
                            href={`/dashboard/company/applications?jobId=${job.id}`}
                            className="inline-flex items-center justify-center gap-2"
                        >
                            View Applicants
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

function JobListRow({
    job,
    onScheduleInterview,
    onShareAsOffer,
}: {
    job: JobView;
    onScheduleInterview: () => void;
    onShareAsOffer: () => void;
}) {
    const daysLeft = calendarDaysUntilDeadline(job.deadline);
    const due = job.status === "Due" || isJobPostDue(job.deadline);
    const closesToday = !due && daysLeft === 0;
    const isUrgent = job.status === "Active" && daysLeft > 0 && daysLeft <= 7;
    const deadlineLabel = new Date(job.deadline).toLocaleDateString("en-LK", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <article
            id={`job-${job.id}`}
            className={cn(
                "flex flex-col gap-4 rounded-2xl border bg-white p-4 transition-colors hover:border-indigo-200/80 lg:flex-row lg:items-center lg:gap-6 lg:p-5",
                due && "border-amber-200/90",
                job.status === "Closed" && "border-slate-200 opacity-90",
                job.status === "Active" && "border-slate-100"
            )}
        >
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-[#6C5DD3] ring-1 ring-indigo-100/80">
                    <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-bold text-slate-800">{job.title}</h3>
                        {due ? <DueLabel /> : <StatusBadge status={job.status} />}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                            {formatOpportunityTypeLabel(job.type)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                            {formatWorkModeLabel(job.workMode)}
                        </span>
                    </div>
                    {job.hasDeadlineAlert && job.shortlisted > 0 && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                            <Bell className="h-3.5 w-3.5 shrink-0" />
                            Deadline passed · schedule interviews ({job.shortlisted} shortlisted)
                        </p>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-4 text-sm lg:gap-6">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Applicants</p>
                        <p className="text-lg font-extrabold tabular-nums text-slate-800">{job.applicants}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Shortlisted</p>
                        <p
                            className={cn(
                                "text-lg font-extrabold tabular-nums",
                                job.shortlisted > 0 ? "text-[#6C5DD3]" : "text-slate-400"
                            )}
                        >
                            {job.shortlisted}
                        </p>
                    </div>
                </div>
                <div className="min-w-[120px] text-right text-xs">
                    <p className="font-medium text-slate-500">Posted {job.posted}</p>
                    <p
                        className={cn(
                            "mt-0.5 font-bold",
                            due ? "text-amber-700" : closesToday ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-700"
                        )}
                    >
                        {deadlineLabel}
                    </p>
                    <p
                        className={cn(
                            "text-[10px] font-semibold uppercase",
                            due ? "text-amber-700" : closesToday ? "text-red-600" : "text-slate-400"
                        )}
                    >
                        {due ? "Due" : daysLeft === 0 ? "Closes today" : daysLeft === 1 ? "1d left" : `${daysLeft}d left`}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:pl-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#6C5DD3]"
                            aria-label="Job actions"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl border-indigo-100 p-1.5">
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-[14px] px-3 py-2.5 text-sm font-bold text-[#6C5DD3] focus:bg-indigo-50 focus:text-[#5b4eb8] [&_svg]:text-[#6C5DD3]"
                            onClick={onScheduleInterview}
                        >
                            <Calendar className="h-4 w-4" />
                            Set up interview date
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-[14px] px-3 py-2.5 text-sm font-bold text-slate-700 focus:bg-indigo-50 focus:text-[#5b4eb8]"
                            onClick={onShareAsOffer}
                        >
                            <Send className="h-4 w-4 text-[#6C5DD3]" />
                            Share as an offer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-[#6C5DD3]/30 font-bold text-[#6C5DD3] hover:bg-indigo-50"
                    onClick={onShareAsOffer}
                >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Share offer
                </Button>
                <Button asChild size="sm" className="rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
                    <Link
                        href={`/dashboard/company/applications?jobId=${job.id}`}
                        className="inline-flex items-center gap-1.5"
                    >
                        View Applicants
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        </article>
    );
}

function DueLabel() {
    return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200/80">
            Due
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles =
        status === "Active"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
            : status === "Due"
              ? "bg-amber-50 text-amber-800 ring-amber-200/60"
              : "bg-slate-100 text-slate-600 ring-slate-200/60";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1",
                styles
            )}
        >
            {status === "Active" && (
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
            )}
            {status}
        </span>
    );
}

