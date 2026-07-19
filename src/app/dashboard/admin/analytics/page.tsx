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
          studentBreakdownByUniversity: [],
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

  const formatHiringRate = (value: number) => `${Math.round(value)}%`;

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
        title="Student mix by university and degree"
        description="See how many students come from each university, how many are in each degree program there, and the hiring rate for each group."
      >
        <div className="space-y-4">
          {data.studentBreakdownByUniversity.length === 0 ? (
            <p className="text-sm text-slate-500">No university breakdown data is available yet.</p>
          ) : (
            data.studentBreakdownByUniversity.map((university) => (
              <div key={university.university} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{university.university}</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {university.studentCount} student{university.studentCount === 1 ? "" : "s"} • {formatHiringRate(university.hiringRate)} hiring rate
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Students</p>
                    <p className="text-lg font-extrabold text-slate-900">{university.studentCount}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {university.degrees.length === 0 ? (
                    <p className="text-sm text-slate-500 md:col-span-2">No degree-level data is available for this university yet.</p>
                  ) : (
                    university.degrees.map((degree) => (
                      <div key={`${university.university}-${degree.degree}`} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{degree.degree}</p>
                            <p className="text-xs text-slate-500">{degree.studentCount} student{degree.studentCount === 1 ? "" : "s"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{formatHiringRate(degree.hiringRate)}</p>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">hire rate</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </AnalyticsSection>

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
