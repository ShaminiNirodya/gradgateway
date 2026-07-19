"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
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
  max,
  isLast,
}: {
  label: string;
  value: number;
  rate: number;
  max: number;
  isLast?: boolean;
}) {
  const width = Math.max(12, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div className="min-w-0 flex-1 rounded-3xl border border-slate-100 bg-slate-50/90 p-4 transition duration-200 ease-out hover:border-[#6C5DD3]/20 hover:bg-white/90">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">
            {label}
          </p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900 sm:text-2xl">{value}</p>
        </div>
        <span className={cn(
          "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
          isLast ? "bg-emerald-100 text-emerald-700" : "bg-[#6C5DD3]/10 text-[#3341c5]"
        )}>
          {isLast ? "Final" : `${rate}% to next`}
        </span>
      </div>
      <div className="mt-4 rounded-full bg-slate-200/80 p-1">
        <div className="h-2 rounded-full bg-[#6C5DD3]" style={{ width: `${width}%` }} />
      </div>
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

  const maxPipelineValue = useMemo(
    () => Math.max(...funnel.map((stage) => stage.value), 1),
    [funnel]
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

  const offerRate = useMemo(() => pct(offersSent, interviewed), [offersSent, interviewed]);
  const hireRate = useMemo(() => pct(hired, total), [hired, total]);

  const recentApplications = useMemo(() => {
    const points = analytics?.applicationsByDay ?? [];
    return points.slice(-14).map((p) => ({ label: p.label, value: p.value }));
  }, [analytics]);

  const applicationsThisPeriod = useMemo(
    () => recentApplications.reduce((sum, point) => sum + point.value, 0),
    [recentApplications]
  );

  const avgDailyApplications = useMemo(
    () => Math.round(applicationsThisPeriod / 14),
    [applicationsThisPeriod]
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#6C5DD3]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C5DD3]">
              {activeJobs} active {activeJobs === 1 ? "role" : "roles"}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {applicationsThisPeriod} apps last 14 days
            </span>
          </div>
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Daily applicant average</p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{avgDailyApplications}</p>
          <p className="mt-2 text-sm text-slate-500">Average new applications over the last 14 days.</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Offer progress</p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{offerRate}%</p>
          <p className="mt-2 text-sm text-slate-500">Interviewed candidates who received an offer.</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Hire efficiency</p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{hireRate}%</p>
          <p className="mt-2 text-sm text-slate-500">Applicants hired from your total applicant pool.</p>
        </div>
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
        <div className="grid gap-3 sm:grid-cols-5">
          {funnel.map((stage, index) => (
            <PipelineStep
              key={stage.label}
              label={stage.label}
              value={stage.value}
              max={maxPipelineValue}
              rate={index < conversionRates.length ? conversionRates[index] : 0}
              isLast={index === funnel.length - 1}
            />
          ))}
        </div>
      </section>

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
            height={210}
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
