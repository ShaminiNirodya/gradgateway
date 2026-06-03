"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Eye,
  Calendar,
  Briefcase,
  CalendarClock,
  UserCheck,
  Tags,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { ApplicationItem } from "@/lib/types/dashboard";
import ScheduleInterviewDialog from "@/components/features/company/ScheduleInterviewDialog";
import { useToast } from "@/components/ui/toast";
import {
  applicationStatusBadgeClass,
  applicationStatusLabel,
  getCompanyStatusActionOptions,
  matchesOffersFilter,
  normalizeApplicationStatus,
  HIRED_APPLICATION_FILTER_OPTION,
  OFFERS_APPLICATION_FILTER_OPTION,
  OPENING_APPLICATION_FILTER_OPTIONS,
  type ApplicationStatusFilterKey,
} from "@/lib/constants/application-status";
import { resolveApplicationJobRole } from "@/lib/constants/job-positions";
import { buildCompanyStudentProfileHref } from "@/lib/utils/company-student-profile-link";
import { CompanyPageContainer } from "@/components/layout/company/CompanyPageContainer";
import {
  CompanyPageHeader,
} from "@/components/layout/company/CompanyPageHeader";

export default function ApplicationManagement() {
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("jobId");
  const studentProfileIdParam = searchParams.get("studentProfileId");
  const studentNameParam = searchParams.get("studentName");
  const viewParam = searchParams.get("view");
  const { show } = useToast();

  const [view, setView] = useState<"board" | "list">(
    viewParam === "list" ? "list" : "board"
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilterKey | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setApplications([]);
          return;
        }

        const rows = await DashboardService.getCompanyApplications(token);
        setApplications(rows);
      } catch (error: unknown) {
        setApplications([]);
        const message =
          error instanceof Error ? error.message : "Could not load applications.";
        show({
          title: "Applications unavailable",
          description: message,
          variant: "error",
        });
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    return applications
      .filter((application) => {
        const matchesSearch =
          application.studentName.toLowerCase().includes(search.toLowerCase()) ||
          application.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
          application.studentEmail.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter
          ? statusFilter === "Offers"
            ? matchesOffersFilter(application)
            : normalizeApplicationStatus(application.status) === statusFilter
          : true;
        const matchesJob = jobIdParam ? application.opportunityId === jobIdParam : true;
        const matchesStudent = studentProfileIdParam
          ? application.studentProfileId === studentProfileIdParam
          : true;
        return matchesSearch && matchesStatus && matchesJob && matchesStudent;
      })
      .sort(
        (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );
  }, [applications, search, statusFilter, jobIdParam, studentProfileIdParam]);

  const studentFilterLabel =
    studentNameParam ||
    (studentProfileIdParam
      ? applications.find((a) => a.studentProfileId === studentProfileIdParam)?.studentName
      : null);

  const updateStatus = async (applicationId: string, apiStatus: string, displayLabel: string) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        show({
          title: "Authentication required",
          description: "Please sign in again to update status",
          variant: "warning",
        });
        return;
      }

      const updated = await DashboardService.updateApplicationStatus(token, applicationId, apiStatus);

      setApplications((prev) => prev.map((application) => (application.id === applicationId ? updated : application)));

      show({
        title: "Status updated",
        description: `Application moved to ${displayLabel}`,
        variant: "success",
      });
    } catch (error) {
      show({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update application status.",
        variant: "error",
      });
    }
  };

  const handleScheduleInterview = (application: ApplicationItem) => {
    setSelectedOpportunity({ id: application.opportunityId, title: application.jobTitle });
    setScheduleDialogOpen(true);
  };

  const handleInterviewScheduled = (result: { messagesSent: number; shortlistedCount: number }) => {
    show({
      title: "Interviews scheduled successfully",
      description: `Notification sent to ${result.messagesSent} shortlisted candidate(s)`,
      variant: "success",
    });
  };

  const hiredApplications = useMemo(
    () =>
      applications.filter((a) => normalizeApplicationStatus(a.status) === "Hired"),
    [applications]
  );

  const stats = useMemo(
    () => [
      { label: "Total", value: applications.length, filter: null as ApplicationStatusFilterKey | null },
      {
        label: "In pipeline",
        value: applications.filter(
          (a) => !["Rejected", "Hired"].includes(normalizeApplicationStatus(a.status))
        ).length,
        filter: null,
      },
      {
        label: "Shortlisted",
        value: applications.filter(
          (a) => normalizeApplicationStatus(a.status) === "Shortlisted"
        ).length,
        filter: "Shortlisted" as const,
      },
      {
        label: "Interviewed",
        value: applications.filter(
          (a) => normalizeApplicationStatus(a.status) === "Interviewed"
        ).length,
        filter: "Interviewed" as const,
      },
      {
        label: "Hired",
        value: hiredApplications.length,
        filter: "Hired" as const,
      },
    ],
    [applications, hiredApplications.length]
  );

  const isHiredView = statusFilter === "Hired";

  const headerSubtitle = studentFilterLabel
    ? `Applications from ${studentFilterLabel}`
    : jobIdParam
      ? `Filtered to one job posting`
      : "Review candidates, update status, and schedule interviews";

  return (
    <CompanyPageContainer>
      <CompanyPageHeader
        eyebrow="Hiring"
        title="Application Hub"
        subtitle={headerSubtitle}
        showSearch={false}
        showNotifications={false}
        badge={
          studentProfileIdParam ? (
            <span className="rounded-full bg-[#6C5DD3]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C5DD3]">
              {filtered.length} shown
            </span>
          ) : undefined
        }
        primaryAction={
          <div className="flex gap-1 rounded-xl border border-slate-200/80 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setView("board")}
              aria-label="Board view"
              className={cn(
                "rounded-lg p-2.5 transition-colors",
                view === "board" ? "bg-white text-[#6C5DD3] shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                view === "list" ? "bg-white text-[#6C5DD3] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search candidate, email, or role..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white pl-11 shadow-sm focus-visible:border-[#6C5DD3]/40 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
        {stats.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setStatusFilter(item.filter)}
            className={cn(
              "rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all hover:border-[#6C5DD3]/15",
              item.filter && statusFilter === item.filter && "border-[#6C5DD3]/40 ring-2 ring-[#6C5DD3]/15"
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{item.value}</p>
          </button>
        ))}
      </div>

      {studentProfileIdParam && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#6C5DD3]/20 bg-[#6C5DD3]/5 px-4 py-3">
          <p className="text-sm text-slate-700">
            Showing all applications from{" "}
            <span className="font-bold text-slate-900">{studentFilterLabel}</span>
          </p>
          <Button asChild variant="softSurface" size="sm">
            <Link href="/dashboard/company/applications">View all candidates</Link>
          </Button>
        </div>
      )}

      <div className="neu-filter-bar rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className={cn("btn-neu-fill", statusFilter === null && "btn-neu-fill-active")}
          >
            All
          </button>
          {OPENING_APPLICATION_FILTER_OPTIONS.map((option) => (
            <button
              key={option.filterKey}
              type="button"
              onClick={() => setStatusFilter(option.filterKey)}
              className={cn(
                "btn-neu-fill",
                statusFilter === option.filterKey && "btn-neu-fill-active"
              )}
            >
              {option.label}
            </button>
          ))}

          <span
            className="mx-1 hidden h-7 w-px bg-slate-200 sm:inline-block"
            aria-hidden
          />

          <button
            type="button"
            onClick={() => setStatusFilter(OFFERS_APPLICATION_FILTER_OPTION.filterKey)}
            className={cn(
              "btn-neu-fill",
              statusFilter === OFFERS_APPLICATION_FILTER_OPTION.filterKey && "btn-neu-fill-active"
            )}
          >
            {OFFERS_APPLICATION_FILTER_OPTION.label}
          </button>

          <span
            className="mx-1 hidden h-7 w-px bg-slate-200 sm:inline-block"
            aria-hidden
          />

          <button
            type="button"
            onClick={() => setStatusFilter(HIRED_APPLICATION_FILTER_OPTION.filterKey)}
            className={cn(
              "btn-neu-fill inline-flex items-center gap-1.5",
              statusFilter === HIRED_APPLICATION_FILTER_OPTION.filterKey && "btn-neu-fill-active"
            )}
          >
            <UserCheck className="h-3.5 w-3.5" />
            {HIRED_APPLICATION_FILTER_OPTION.label}
          </button>
        </div>
      </div>

      {isHiredView ? (
        <HiredRoster applications={filtered} view={view} />
      ) : view === "board" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6C5DD3]/20 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{application.studentName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-slate-800">{application.studentName}</h3>
                    <p className="text-xs text-slate-500">{application.studentEmail}</p>
                  </div>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {application.jobTitle}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Applied {new Date(application.appliedAt).toLocaleDateString("en-LK")}</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                  <Link href={buildCompanyStudentProfileHref(application)}>
                    <Eye className="w-4 h-4 mr-2" /> View Profile
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    {normalizeApplicationStatus(application.status) === "Shortlisted" && (
                      <>
                        <DropdownMenuItem onClick={() => handleScheduleInterview(application)}>
                          <CalendarClock className="w-4 h-4 mr-2" />
                          Schedule Interview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {getCompanyStatusActionOptions(application).map((option) => (
                      <DropdownMenuItem
                        key={option.filterKey}
                        onClick={() => updateStatus(application.id, option.apiStatus, option.label)}
                      >
                        Move to {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="font-extrabold text-slate-800">No applications found</p>
              <p className="mt-1 text-sm text-slate-500">Try a different search or status filter.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="p-4">Candidate</th>
                <th className="p-4">Job</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applied</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((application) => (
                <tr key={application.id} className="border-b border-slate-50">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{application.studentName}</div>
                    <div className="text-xs text-slate-500">{application.studentEmail}</div>
                  </td>
                  <td className="p-4">{application.jobTitle}</td>
                  <td className="p-4"><StatusBadge status={application.status} /></td>
                  <td className="p-4">{new Date(application.appliedAt).toLocaleDateString("en-LK")}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={buildCompanyStudentProfileHref(application)}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          {normalizeApplicationStatus(application.status) === "Shortlisted" && (
                            <>
                              <DropdownMenuItem onClick={() => handleScheduleInterview(application)}>
                                <CalendarClock className="w-4 h-4 mr-2" />
                                Schedule Interview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {getCompanyStatusActionOptions(application).map((option) => (
                            <DropdownMenuItem
                              key={option.filterKey}
                              onClick={() => updateStatus(application.id, option.apiStatus, option.label)}
                            >
                              Move to {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOpportunity && (
        <ScheduleInterviewDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          opportunityId={selectedOpportunity.id}
          jobTitle={selectedOpportunity.title}
          onScheduled={handleInterviewScheduled}
        />
      )}
    </CompanyPageContainer>
  );
}

function HiredRosterEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
      <UserCheck className="mx-auto mb-4 h-12 w-12 text-slate-300" />
      <p className="font-extrabold text-slate-800">No hired candidates yet</p>
      <p className="mt-1 text-sm text-slate-500">
        When you mark applicants as Hired, they will appear here with role and profile details.
      </p>
    </div>
  );
}

function HiredRosterCard({ application }: { application: ApplicationItem }) {
  const role = resolveApplicationJobRole(application.jobTitle, application.coverLetter);
  const profileHref = buildCompanyStudentProfileHref(application);

  return (
    <article className="rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-indigo-100">
            <AvatarFallback className="bg-indigo-100 font-bold text-indigo-700">
              {application.studentName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">{application.studentName}</h3>
            <p className="truncate text-xs text-slate-500">{application.studentEmail}</p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5">
          <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Tags className="h-3 w-3" />
            Category
          </dt>
          <dd className="mt-1 font-semibold text-slate-800">{role.categoryLabel}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5">
          <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Briefcase className="h-3 w-3" />
            Position
          </dt>
          <dd className="mt-1 font-semibold text-slate-800">{role.positionTitle}</dd>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          Hired {new Date(application.updatedAt).toLocaleDateString("en-LK")}
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]">
          <Link href={profileHref}>
            <Eye className="mr-2 h-4 w-4" />
            View profile
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
          <Link href={profileHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </Link>
        </Button>
      </div>
    </article>
  );
}

function HiredRosterListRow({ application }: { application: ApplicationItem }) {
  const role = resolveApplicationJobRole(application.jobTitle, application.coverLetter);
  const profileHref = buildCompanyStudentProfileHref(application);

  return (
    <tr className="border-b border-slate-50 transition-colors hover:bg-indigo-50/30">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-indigo-100 text-sm font-bold text-indigo-700">
              {application.studentName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-slate-800">{application.studentName}</div>
            <div className="text-xs text-slate-500">{application.studentEmail}</div>
          </div>
        </div>
      </td>
      <td className="p-4 font-medium text-slate-700">{role.categoryLabel}</td>
      <td className="p-4 text-slate-700">{role.positionTitle}</td>
      <td className="p-4 text-slate-600">
        {new Date(application.updatedAt).toLocaleDateString("en-LK")}
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-lg">
            <Link href={profileHref} title="View profile">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-lg">
            <Link
              href={profileHref}
              target="_blank"
              rel="noopener noreferrer"
              title="Open profile in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function HiredRoster({
  applications,
  view,
}: {
  applications: ApplicationItem[];
  view: "board" | "list";
}) {
  if (!applications.length) {
    return <HiredRosterEmptyState />;
  }

  if (view === "list") {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80">
            <tr>
              <th className="p-4">Candidate</th>
              <th className="p-4">Category</th>
              <th className="p-4">Position</th>
              <th className="p-4">Hired</th>
              <th className="p-4 text-right">Profile</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <HiredRosterListRow key={application.id} application={application} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {applications.map((application) => (
        <HiredRosterCard key={application.id} application={application} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const filterKey = normalizeApplicationStatus(status);
  const label = applicationStatusLabel(status);

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        applicationStatusBadgeClass(filterKey)
      )}
    >
      {label}
    </span>
  );
}
