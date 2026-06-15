"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Briefcase,
  Download,
  Filter,
  LineChart as LineChartIcon,
  PieChart,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { BarChart, HorizontalBarChart, LineChart } from "@/components/ui/simple-chart";
import { AnalyticsKpiCard, AnalyticsSection } from "@/components/features/analytics/AnalyticsCards";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { OpportunityItem } from "@/lib/types/dashboard";
import { CompanyPageContainer } from "@/components/layout/company/CompanyPageContainer";
import { CompanyPageHeader } from "@/components/layout/company/CompanyPageHeader";
import { cn } from "@/lib/utils";

type CompanyAnalytics = {
  totalApplications: number;
  shortlisted: number;
  interviewed: number;
  offersSent: number;
  hired: number;
  applicationsByDay: { label: string; value: number; date: string }[];
  applicationsByWeek: { label: string; value: number; date: string }[];
};

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

function AnalyticsSkeleton() {
  return (
    <CompanyPageContainer className="animate-pulse">
      <div className="h-36 rounded-2xl bg-white" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-24 rounded-2xl bg-white" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 rounded-2xl bg-white lg:col-span-2" />
        <div className="h-80 rounded-2xl bg-white" />
      </div>
      <div className="h-72 rounded-2xl bg-white" />
    </CompanyPageContainer>
  );
}

function PipelineStep({
  label,
  value,
  rate,
  isLast,
}: {
  label: string;
  value: number;
  rate: number;
  isLast?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-center sm:px-4">
        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">
          {label}
        </p>
        <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900 sm:text-2xl">{value}</p>
        {!isLast ? (
          <p className="mt-1 text-[10px] font-semibold text-[#6C5DD3] sm:text-xs">{rate}% → next</p>
        ) : (
          <p className="mt-1 text-[10px] font-semibold text-emerald-600 sm:text-xs">Final stage</p>
        )}
      </div>
      {!isLast ? (
        <div className="hidden h-px w-3 shrink-0 bg-slate-200 sm:block" aria-hidden />
      ) : null}
    </div>
  );
}

export default function CompanyAnalyticsPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setAnalytics(null);
          setOpportunities([]);
          return;
        }

        const [jobs, data] = await Promise.all([
          DashboardService.getCompanyOpportunities(token),
          DashboardService.getCompanyAnalytics(token),
        ]);

        setOpportunities(jobs);
        setAnalytics(data);
      } catch (error: unknown) {
        setAnalytics(null);
        setOpportunities([]);
        show({
          title: "Analytics unavailable",
          description: error instanceof Error ? error.message : "Could not load recruitment analytics.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [show]);

  const total = analytics?.totalApplications ?? 0;
  const shortlisted = analytics?.shortlisted ?? 0;
  const interviewed = analytics?.interviewed ?? 0;
  const offersSent = analytics?.offersSent ?? 0;
  const hired = analytics?.hired ?? 0;

  const activeJobs = useMemo(
    () => opportunities.filter((o) => o.isActive).length,
    [opportunities]
  );

  const funnel = useMemo(
    () => [
      { label: "Applied", value: total },
      { label: "Shortlisted", value: shortlisted },
      { label: "Interviewed", value: interviewed },
      { label: "Offered", value: offersSent },
      { label: "Hired", value: hired },
    ],
    [total, shortlisted, interviewed, offersSent, hired]
  );

  const conversionRates = useMemo(
    () => [
      pct(shortlisted, total),
      pct(interviewed, shortlisted),
      pct(offersSent, interviewed),
      pct(hired, offersSent),
    ],
    [total, shortlisted, interviewed, offersSent, hired]
  );

  const recentApplications = useMemo(() => {
    const points = analytics?.applicationsByDay ?? [];
    return points.slice(-14).map((p) => ({ label: p.label, value: p.value }));
  }, [analytics]);

  const applicationsThisPeriod = useMemo(
    () => recentApplications.reduce((sum, point) => sum + point.value, 0),
    [recentApplications]
  );

  const workModeMix = useMemo(() => {
    const activePosts = opportunities.filter((o) => o.isActive);
    const source = activePosts.length > 0 ? activePosts : opportunities;

    const remote = source.filter((o) => o.workMode.toLowerCase().includes("remote")).length;
    const hybrid = source.filter((o) => o.workMode.toLowerCase().includes("hybrid")).length;
    const onsite = source.filter((o) => o.workMode.toLowerCase().includes("on")).length;

    return [
      { label: "Remote", value: remote },
      { label: "Hybrid", value: hybrid },
      { label: "Onsite", value: onsite },
      {
        label: "Internships",
        value: source.filter((o) => o.opportunityType.toLowerCase().includes("intern")).length,
      },
      {
        label: "Graduate roles",
        value: source.filter((o) => o.opportunityType.toLowerCase().includes("graduate")).length,
      },
    ];
  }, [opportunities]);

  const exportCsv = () => {
    const sections = [
      "Company Analytics Export",
      `Generated,${new Date().toISOString()}`,
      "",
      "KPI,Value",
      `Total applicants,${total}`,
      `Shortlisted,${shortlisted}`,
      `Interview rate,${pct(interviewed, total)}%`,
      `Hire rate,${pct(hired, total)}%`,
      `Active job posts,${activeJobs}`,
      "",
      "Funnel stage,Count",
      ...funnel.map((row) => `"${row.label}",${row.value}`),
    ];

    const blob = new Blob([sections.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `company-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show({ title: "Exported", description: "Analytics saved as CSV.", variant: "success" });
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <CompanyPageContainer className="space-y-6">
      <CompanyPageHeader
        eyebrow="Insights"
        title="Recruitment Analytics"
        subtitle="Pipeline health, applicant volume, and hiring mix across your job posts."
        showSearch={false}
        showNotifications={false}
        badge={
          <span className="rounded-full bg-[#6C5DD3]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C5DD3]">
            {activeJobs} active {activeJobs === 1 ? "role" : "roles"}
          </span>
        }
        primaryAction={
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 bg-white font-semibold hover:bg-slate-50"
            onClick={exportCsv}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsKpiCard
          label="Total applicants"
          value={total.toString()}
          hint="All applications received across your job posts and direct offers."
          icon={<Users className="h-4 w-4" />}
          accent="indigo"
          href="/dashboard/company/applications"
        />
        <AnalyticsKpiCard
          label="Shortlisted"
          value={shortlisted.toString()}
          hint="Candidates marked as worth progressing to the next stage."
          icon={<Sparkles className="h-4 w-4" />}
          accent="violet"
          href="/dashboard/company/applications?filter=Shortlisted"
        />
        <AnalyticsKpiCard
          label="Interview rate"
          value={`${pct(interviewed, total)}%`}
          hint="Share of applicants who reached an interviewed status."
          icon={<TrendingUp className="h-4 w-4" />}
          accent="amber"
          href="/dashboard/company/applications?filter=Interviewed"
        />
        <AnalyticsKpiCard
          label="Hire rate"
          value={`${pct(hired, total)}%`}
          hint="Share of applicants who ended in a hired outcome."
          icon={<UserCheck className="h-4 w-4" />}
          accent="emerald"
          href="/dashboard/company/applications?filter=Hired"
        />
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Pipeline conversion</h2>
            <p className="text-sm text-slate-500">
              Stage-to-stage movement — spot where candidates drop off.
            </p>
          </div>
          <Button asChild variant="softSurface" size="sm" className="rounded-xl">
            <Link href="/dashboard/company/applications">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Review pipeline
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {funnel.map((stage, index) => (
            <PipelineStep
              key={stage.label}
              label={stage.label}
              value={stage.value}
              rate={index < conversionRates.length ? conversionRates[index] : 0}
              isLast={index === funnel.length - 1}
            />
          ))}
        </div>
      </section>

      <AnalyticsSection
        title="Hiring funnel"
        description="Volume at each stage compared side by side."
        icon={<BarChart3 className="h-5 w-5" />}
      >
        <BarChart
          data={funnel}
          height={260}
          color="#6C5DD3"
          emptyLabel="Applications will populate this funnel once candidates start applying."
        />
      </AnalyticsSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsSection
          title="Applications received"
          description="Daily applicant volume over the last 14 days."
          icon={<LineChartIcon className="h-5 w-5" />}
          className="lg:col-span-2"
          action={
            applicationsThisPeriod > 0 ? (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {applicationsThisPeriod} in last 14 days
              </span>
            ) : null
          }
        >
          <LineChart
            data={recentApplications}
            height={260}
            stroke="#6C5DD3"
            fill="#6C5DD3/10"
            emptyLabel="New applications will appear here as candidates apply."
          />
        </AnalyticsSection>

        <AnalyticsSection
          title="Active job posts"
          description="Live openings currently attracting applicants."
          icon={<Briefcase className="h-5 w-5" />}
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live roles
              </p>
              <p className="mt-1 text-4xl font-extrabold tabular-nums text-slate-900">{activeJobs}</p>
              <p className="mt-2 text-sm text-slate-500">
                {opportunities.length} total posts created, including closed roles.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <QuickLink href="/dashboard/company/jobs" label="Manage jobs" />
              <QuickLink href="/dashboard/company/jobs/new" label="Post a role" primary />
            </div>
          </div>
        </AnalyticsSection>
      </div>

      <AnalyticsSection
        title="Role mix across active posts"
        description="Work modes and role types in your current hiring posts."
        icon={<PieChart className="h-5 w-5" />}
        action={
          activeJobs === 0 ? (
            <Button asChild size="sm" className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]">
              <Link href="/dashboard/company/jobs/new">Create first post</Link>
            </Button>
          ) : null
        }
      >
        <HorizontalBarChart
          data={workModeMix}
          emptyLabel="Create or activate job posts to see your hiring mix."
        />
      </AnalyticsSection>
    </CompanyPageContainer>
  );
}

function QuickLink({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Button
      asChild
      variant={primary ? "default" : "outline"}
      size="sm"
      className={cn(
        "rounded-xl",
        primary && "bg-[#6C5DD3] hover:bg-[#5b4eb8]"
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
