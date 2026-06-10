"use client";

import {
  Building2,
  Users2,
  Sparkles,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  MapPin,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { CompanyService } from "@/lib/services/company.service";
import { ApplicationItem, ConversationItem, OpportunityItem } from "@/lib/types/dashboard";
import { CompanyProfile } from "@/lib/types/company";
import { cn } from "@/lib/utils";
import {
  buildActivityBuckets,
  getActivityMeta,
  type ActivityRange,
} from "@/lib/utils/applicant-activity";
import {
  CompanyPageHeader,
  CompanyPostJobButton,
} from "@/components/layout/company/CompanyPageHeader";
import { CompanyPageContainer } from "@/components/layout/company/CompanyPageContainer";
import { studentProfilePath } from "@/lib/utils/slug";
export default function CompanyDashboard() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-LK", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;

        const [apps, jobs, chats, profile] = await Promise.all([
          DashboardService.getCompanyApplications(token),
          DashboardService.getCompanyOpportunities(token),
          DashboardService.getMyConversations(token),
          CompanyService.getCurrentCompany(token),
        ]);

        setApplications(apps);
        setOpportunities(jobs);
        setConversations(chats);
        setCompany(profile);
      } catch {
        setApplications([]);
        setOpportunities([]);
        setConversations([]);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openRoles = useMemo(
    () => opportunities.filter((o) => o.isActive).length,
    [opportunities]
  );

  const shortlistedCount = useMemo(
    () => applications.filter((item) => item.status.toLowerCase().includes("short")).length,
    [applications]
  );

  const recentApplicants = useMemo(() => applications.slice(0, 6), [applications]);

  const companyInitial = (company?.companyName || "C").trim().charAt(0).toUpperCase();
  const companyBio = company
    ? `${company.companyName} recruits undergraduate talent for ${company.industry.toLowerCase()} roles. Reach ${company.recruiterName}, ${company.position}.`
    : "Complete your company profile in Settings to showcase your brand to students.";

  const handleTalentSearch = () => {
    if (q.trim()) {
      router.push(`/dashboard/company/talent?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push("/dashboard/company/talent");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-white" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-2xl bg-white" />
          <div className="h-80 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <CompanyPageContainer>
      <CompanyPageHeader
        eyebrow="Recruiter dashboard"
        title={company?.companyName || "Dashboard"}
        subtitle={todayLabel}
        searchValue={q}
        onSearchChange={setQ}
        onSearchSubmit={handleTalentSearch}
        primaryAction={<CompanyPostJobButton />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users2 className="h-4 w-4" />}
          label="Total Applicants"
          value={String(applications.length)}
          href="/dashboard/company/applications"
          accent="indigo"
        />
        <StatCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Shortlisted"
          value={String(shortlistedCount)}
          href="/dashboard/company/applications"
          accent="violet"
        />
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Open Roles"
          value={String(openRoles)}
          href="/dashboard/company/jobs"
          accent="emerald"
        />
        <StatCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Messages"
          value={String(conversations.length)}
          href="/dashboard/company/messages"
          accent="sky"
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <section className="flex min-h-[340px] flex-col rounded-2xl border border-slate-200/80 bg-white p-6">
          <ApplicantActivityChart
            applications={applications}
            totalApplicants={applications.length}
            hasApplications={applications.length > 0}
          />
        </section>

        <section className="flex min-h-[340px] flex-col rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">About company</h2>
            <Button asChild variant="outline" size="sm" className="rounded-lg border-slate-200 text-xs font-semibold">
              <Link href="/dashboard/company/settings">Edit profile</Link>
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-4">
            <Avatar className="h-16 w-16 shrink-0 rounded-xl border border-slate-200">
              {company?.logoDataUrl && (
                <AvatarImage src={company.logoDataUrl} alt={company.companyName} className="object-cover" />
              )}
              <AvatarFallback className="rounded-xl bg-[#6C5DD3] text-lg font-bold text-white">
                {companyInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900">{company?.companyName || "Your company"}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {company?.industry || "Industry"} · Sri Lanka
              </p>
              {company?.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#6C5DD3] hover:underline"
                >
                  Website <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-5 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bio</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-4">{companyBio}</p>
          </div>

          <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <MetricPill label={`${applications.length} applicants`} />
            <MetricPill label={`${opportunities.length} job posts`} />
            <MetricPill label={`${conversations.length} conversations`} />
          </div>
        </section>
      </div>

      <section className="pt-2">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent applicants</h2>
            <p className="text-xs text-slate-500">Latest submissions across your open roles</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-lg font-semibold text-[#6C5DD3]">
            <Link href="/dashboard/company/applications">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recentApplicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
            <Users2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-700">No applicants yet</p>
            <p className="mt-1 text-sm text-slate-500">Post roles or browse talent to start receiving applications.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" className="rounded-lg">
                <Link href="/dashboard/company/jobs/new">Post a job</Link>
              </Button>
              <Button asChild className="rounded-lg bg-[#6C5DD3] hover:bg-[#5b4eb8]">
                <Link href="/dashboard/company/talent">Browse talent</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
            {recentApplicants.map((candidate) => (
              <Link
                key={candidate.id}
                href={studentProfilePath(
                  candidate.studentName,
                  candidate.studentProfileId,
                  candidate.studentEmail
                )}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50"
              >
                <Avatar className="h-10 w-10 shrink-0 border border-slate-200">
                  <AvatarFallback className="bg-slate-100 text-xs font-bold text-[#6C5DD3]">
                    {getInitials(candidate.studentName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{candidate.studentName}</p>
                  <p className="truncate text-sm text-slate-500">{candidate.jobTitle}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Applied {new Date(candidate.appliedAt).toLocaleDateString("en-LK")}
                  </p>
                </div>
                <span
                  className={cn(
                    "hidden shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase sm:inline",
                    applicationStatusClass(candidate.status)
                  )}
                >
                  {candidate.status}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </CompanyPageContainer>
  );
}

type StatAccent = "indigo" | "violet" | "emerald" | "sky";

const RANGE_OPTIONS: { id: ActivityRange; label: string; description: string }[] = [
  { id: "week", label: "Weekly", description: "Mon – Sun (this week)" },
  { id: "month", label: "Monthly", description: "Last 12 months" },
  { id: "year", label: "Yearly", description: "Last 5 years" },
];

function ApplicantActivityChart({
  applications,
  totalApplicants,
  hasApplications,
}: {
  applications: ApplicationItem[];
  totalApplicants: number;
  hasApplications: boolean;
}) {
  const [range, setRange] = useState<ActivityRange>("week");

  const buckets = useMemo(() => buildActivityBuckets(applications, range), [applications, range]);
  const meta = useMemo(() => getActivityMeta(range), [range]);
  const periodCount = useMemo(() => buckets.reduce((sum, b) => sum + b.value, 0), [buckets]);
  const max = Math.max(1, ...buckets.map((d) => d.value));

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Applicant activity</h2>
          <p className="text-xs text-slate-500">{meta.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:inline">
            {meta.rangeBadge}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg border-slate-200 text-xs font-semibold">
                More
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border border-slate-200 bg-white">
              {RANGE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => setRange(option.id)}
                  className="flex cursor-pointer items-start justify-between gap-2 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.description}</p>
                  </div>
                  {range === option.id && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6C5DD3]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-extrabold tabular-nums text-slate-900">{periodCount}</span>
        <span className="text-sm font-medium text-slate-500">
          {periodCount === 1 ? "application" : "applications"} {meta.periodSummary}
          <span className="mx-1.5 text-slate-300">·</span>
          {totalApplicants} all time
        </span>
      </div>

      {!hasApplications ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">No applications yet</p>
          <p className="mt-1 text-xs text-slate-500">Activity will show here once students apply.</p>
        </div>
      ) : (
        <div
          className="mt-6 flex flex-1 flex-col rounded-xl border border-slate-100 bg-slate-50/60 px-2 pb-4 pt-5 sm:px-4"
          role="img"
          aria-label={`Bar chart of applications, ${meta.rangeBadge}`}
        >
          <div
            className={cn(
              "flex h-36 items-end justify-between gap-1 sm:h-40",
              range === "month" && "gap-0.5",
              range === "year" && "gap-2"
            )}
          >
            {buckets.map((bucket) => {
              const heightPct = bucket.value > 0 ? Math.round((bucket.value / max) * 100) : 0;
              return (
                <div
                  key={bucket.key}
                  className="group flex min-w-0 flex-1 flex-col items-center"
                  title={`${bucket.label}: ${bucket.value} application${bucket.value === 1 ? "" : "s"}`}
                >
                  <span
                    className={cn(
                      "mb-1.5 min-h-[14px] text-[10px] font-bold tabular-nums sm:text-xs",
                      bucket.value > 0 ? "text-slate-700" : "text-transparent"
                    )}
                  >
                    {bucket.value > 0 ? bucket.value : ""}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center sm:h-32">
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-300",
                        range === "month" ? "max-w-[1.25rem]" : "max-w-[2rem]",
                        bucket.value > 0
                          ? "bg-[#6C5DD3] group-hover:bg-[#5b4eb8]"
                          : "bg-slate-200"
                      )}
                      style={{
                        height: bucket.value > 0 ? `${Math.max(heightPct, 14)}%` : "3px",
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-2.5 w-full truncate text-center font-medium text-slate-500",
                      range === "month" ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-[11px]"
                    )}
                  >
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  accent: StatAccent;
}) {
  const accentStyles: Record<StatAccent, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-[#6C5DD3]/25 hover:bg-indigo-50/30"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              accentStyles[accent]
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#6C5DD3]" />
      </div>
    </Link>
  );
}

function MetricPill({ label }: { label: string }) {
  return (
    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
      {label}
    </span>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function applicationStatusClass(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("short")) return "bg-violet-100 text-violet-700";
  if (lower.includes("interview")) return "bg-amber-100 text-amber-800";
  if (lower.includes("hire")) return "bg-emerald-100 text-emerald-700";
  if (lower.includes("reject")) return "bg-red-100 text-red-700";
  if (lower.includes("offer")) return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-700";
}
