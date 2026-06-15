"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsKpiCard, AnalyticsSection } from "@/components/features/analytics/AnalyticsCards";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminAnalytics } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";

export default function AdminAnalyticsPage() {
  const { show } = useToast();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      try {
        setData(await AdminService.getAnalytics(token));
      } catch {
        const dashboard = await AdminService.getDashboard(token);
        setData({
          totalStudents: dashboard.totalStudents,
          totalCompanies: dashboard.totalCompanies,
          totalApplications: dashboard.totalApplications,
          hiredApplications: dashboard.hiredApplications,
          activeJobPosts: dashboard.activeJobPosts,
          signupsLast7Days: dashboard.signupsLast7Days,
          openSupportInquiries: dashboard.openSupportInquiries,
          pendingTestimonials: dashboard.pendingTestimonials,
          publishedTestimonials: 0,
          hiringRate: dashboard.hiringRate,
          signupsByWeek: [],
          applicationsByWeek: [],
          applicationsByStatus: [],
          topIndustries: [],
        });
        show({
          title: "Limited analytics",
          description: "Showing summary metrics. Restart the API to load full platform charts.",
          variant: "error",
        });
      }
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load platform analytics.",
        variant: "error",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    void load();
  }, [load]);

  const hireRate = useMemo(() => {
    if (!data || data.totalApplications === 0) return 0;
    return Math.round((data.hiredApplications / data.totalApplications) * 100);
  }, [data]);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      "Platform Analytics Export",
      `Generated,${new Date().toISOString()}`,
      "",
      "Metric,Value",
      `Students,${data.totalStudents}`,
      `Companies,${data.totalCompanies}`,
      `Applications,${data.totalApplications}`,
      `Hired applications,${data.hiredApplications}`,
      `Hire rate,${hireRate}%`,
      `Signups last 7 days,${data.signupsLast7Days}`,
      `Open inquiries,${data.openSupportInquiries}`,
      `Pending testimonials,${data.pendingTestimonials}`,
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return <p className="text-sm text-slate-500">Loading platform analytics…</p>;
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Platform analytics are unavailable right now.</p>;
  }

  return (
    <div className="space-y-8 pb-6">
      <AdminPageHeader
        icon={BarChart3}
        title="Platform analytics"
        subtitle="Cross-platform hiring activity, signups, and operational health for GradGateway."
      >
        <Button
          variant="secondary"
          className="rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
          onClick={exportCsv}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsKpiCard
          label="Registered students"
          value={data.totalStudents.toString()}
          hint="Student accounts with profiles on the platform."
        />
        <AnalyticsKpiCard
          label="Registered companies"
          value={data.totalCompanies.toString()}
          hint="Recruiter accounts actively using GradGateway."
        />
        <AnalyticsKpiCard
          label="Platform hire rate"
          value={`${hireRate}%`}
          hint="Hired applications divided by all applications submitted."
        />
        <AnalyticsKpiCard
          label="New signups (7 days)"
          value={data.signupsLast7Days.toString()}
          hint="Students and companies who joined in the last week."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsKpiCard
          label="Total applications"
          value={data.totalApplications.toString()}
          hint="Every application submitted across the platform."
        />
        <AnalyticsKpiCard
          label="Active job posts"
          value={data.activeJobPosts.toString()}
          hint="Openings still accepting applicants today."
        />
        <AnalyticsKpiCard
          label="Open support inquiries"
          value={data.openSupportInquiries.toString()}
          hint="Unreviewed messages from the public help and contact flows."
        />
        <AnalyticsKpiCard
          label="Testimonials queue"
          value={`${data.pendingTestimonials} pending`}
          hint={`${data.publishedTestimonials} published on the homepage.`}
        />
      </div>

      <AnalyticsSection
        title="Operational follow-ups"
        description="Quick links to areas that often need admin attention based on these metrics."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/admin/inquiries"
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Review {data.openSupportInquiries} open inquiries
          </Link>
          <Link
            href="/dashboard/admin/testimonials"
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Curate {data.pendingTestimonials} pending testimonials
          </Link>
          <Link
            href="/dashboard/admin/companies"
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Manage {data.totalCompanies} company accounts
          </Link>
        </div>
      </AnalyticsSection>
    </div>
  );
}
