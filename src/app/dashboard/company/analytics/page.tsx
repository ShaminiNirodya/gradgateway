"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, HorizontalBarChart, LineChart } from "@/components/ui/simple-chart";
import { AnalyticsKpiCard, AnalyticsSection } from "@/components/features/analytics/AnalyticsCards";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { OpportunityItem } from "@/lib/types/dashboard";

type CompanyAnalytics = {
  totalApplications: number;
  shortlisted: number;
  interviewed: number;
  offersSent: number;
  hired: number;
  applicationsByDay: { label: string; value: number; date: string }[];
  applicationsByWeek: { label: string; value: number; date: string }[];
};

export default function CompanyAnalyticsPage() {
  const { show } = useToast();
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;

        const [jobs, data] = await Promise.all([
          DashboardService.getCompanyOpportunities(token),
          DashboardService.getCompanyAnalytics(token),
        ]);

        setOpportunities(jobs);
        setAnalytics(data);
      } catch {
        setAnalytics(null);
        setOpportunities([]);
      }
    };

    void load();
  }, []);

  const total = analytics?.totalApplications ?? 0;
  const shortlisted = analytics?.shortlisted ?? 0;
  const interviewed = analytics?.interviewed ?? 0;
  const offersSent = analytics?.offersSent ?? 0;
  const hired = analytics?.hired ?? 0;

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

  const recentApplications = useMemo(() => {
    const points = analytics?.applicationsByDay ?? [];
    return points.slice(-14).map((p) => ({ label: p.label, value: p.value }));
  }, [analytics]);

  const workModeMix = useMemo(() => {
    const activePosts = opportunities.filter((o) => o.isActive);
    const source = activePosts.length > 0 ? activePosts : opportunities;
    const totalPosts = Math.max(source.length, 1);

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
    ].map((item) => ({ ...item, value: item.value }));
  }, [opportunities]);

  const exportCsv = () => {
    const sections = [
      "Company Analytics Export",
      `Generated,${new Date().toISOString()}`,
      "",
      "KPI,Value",
      `Total applicants,${total}`,
      `Shortlisted,${shortlisted}`,
      `Interview rate,${total ? Math.round((interviewed / total) * 100) : 0}%`,
      `Hire rate,${total ? Math.round((hired / total) * 100) : 0}%`,
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

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold">Recruitment analytics</h1>
            <p className="mt-1 text-sm text-white/90">
              Pipeline health and applicant volume across your active job posts.
            </p>
          </div>
          <Button variant="secondary" className="rounded-xl" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsKpiCard
          label="Total applicants"
          value={total.toString()}
          hint="All applications received across your job posts and direct offers."
        />
        <AnalyticsKpiCard
          label="Shortlisted"
          value={shortlisted.toString()}
          hint="Candidates you marked as worth progressing to the next stage."
        />
        <AnalyticsKpiCard
          label="Interview rate"
          value={`${total ? Math.round((interviewed / total) * 100) : 0}%`}
          hint="Share of applicants who reached an interviewed status."
        />
        <AnalyticsKpiCard
          label="Hire rate"
          value={`${total ? Math.round((hired / total) * 100) : 0}%`}
          hint="Share of applicants who ended in a hired outcome."
        />
      </div>

      <AnalyticsSection
        title="Hiring funnel"
        description="How applicants move from first apply through to hired — use this to spot drop-off stages."
      >
        <BarChart
          data={funnel}
          height={260}
          color="#4f46e5"
          emptyLabel="Applications will populate this funnel once candidates start applying."
        />
      </AnalyticsSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsSection
          title="Applications received"
          description="Daily applicant volume over the last 14 days."
          className="lg:col-span-2"
        >
          <LineChart
            data={recentApplications}
            height={260}
            emptyLabel="New applications will appear here as candidates apply."
          />
        </AnalyticsSection>

        <AnalyticsSection
          title="Active job posts"
          description="How many live openings are currently attracting applicants."
        >
          <p className="text-4xl font-bold text-slate-800">
            {opportunities.filter((o) => o.isActive).length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {opportunities.length} total posts created, including closed roles.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
            <Link href="/dashboard/company/jobs">Manage job posts</Link>
          </Button>
        </AnalyticsSection>
      </div>

      <AnalyticsSection
        title="Role mix across active posts"
        description="Distribution of work modes and role types in your current hiring posts."
      >
        <HorizontalBarChart
          data={workModeMix}
          emptyLabel="Create or activate job posts to see your hiring mix."
        />
      </AnalyticsSection>
    </div>
  );
}
