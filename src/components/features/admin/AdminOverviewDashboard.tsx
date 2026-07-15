"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "@/lib/types/admin";
import { cn } from "@/lib/utils";

type AdminOverviewDashboardProps = {
  data: AdminDashboard;
  loading: boolean;
  refreshedAt: Date | null;
  onRefresh: () => void;
};

export function AdminOverviewDashboard({
  data,
  loading,
  refreshedAt,
  onRefresh,
}: AdminOverviewDashboardProps) {
  const hireProgress =
    data.totalApplications > 0
      ? Math.round((data.hiredApplications / data.totalApplications) * 100)
      : 0;

  return (
    <div className="space-y-8 pb-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-800 via-[#3d4f6f] to-[#6C5DD3] px-6 py-8 text-white shadow-lg shadow-slate-900/10 md:px-8 md:py-10">
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-48 rounded-full bg-[#6C5DD3]/30 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Platform overview
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Admin dashboard</h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/80">
              Live metrics from your database — users, hiring activity, and support requests in one
              place.
            </p>
            {refreshedAt && (
              <p className="text-xs text-white/60">
                Last updated {refreshedAt.toLocaleTimeString()}
              </p>
            )}
          </div>
          {/* refresh removed */}
        </div>
      </section>

      {/* Alerts */}
      {(data.openSupportInquiries > 0 || data.suspendedUsers > 0) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {data.openSupportInquiries > 0 && (
            <Link
              href="/dashboard/admin/inquiries"
              className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:border-amber-300 hover:bg-amber-100/80"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    {data.openSupportInquiries} open inquiry
                    {data.openSupportInquiries === 1 ? "" : "ies"}
                  </p>
                  <p className="text-xs text-amber-700">Students and companies are waiting for help</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-amber-600" />
            </Link>
          )}
          {data.suspendedUsers > 0 && (
            <Link
              href="/dashboard/admin/students"
              className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <UserMinus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {data.suspendedUsers} blocked account
                    {data.suspendedUsers === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-slate-500">Review or unblock from Students or Companies</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          )}
        </div>
      )}

      {/* Priority KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          href="/dashboard/admin/inquiries"
          icon={MessageSquare}
          label="Open inquiries"
          value={data.openSupportInquiries}
          sub={`${data.totalSupportInquiries} total received`}
          accent="amber"
          highlight={data.openSupportInquiries > 0}
        />
        <KpiCard
          href="/dashboard/admin/students"
          icon={GraduationCap}
          label="Student profiles"
          value={data.totalStudents}
          sub={`${data.studentAccounts} login accounts`}
          accent="purple"
        />
        <KpiCard
          href="/dashboard/admin/analytics"
          icon={UserPlus}
          label="Signups (7 days)"
          value={data.signupsLast7Days}
          sub="New registrations this week"
          accent="blue"
        />
        <KpiCard
          href="/dashboard/admin/companies"
          icon={Briefcase}
          label="Active job posts"
          value={data.activeJobPosts}
          sub={`${data.expiredJobPosts} expired`}
          accent="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hiring snapshot */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Hiring snapshot</h2>
                <p className="text-xs text-slate-500">Applications to hired</p>
              </div>
            </div>
            <Link
              href="/dashboard/admin/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C5DD3] hover:underline"
            >
              Full analytics
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-800">{data.hiringRate}%</p>
              <p className="text-sm text-slate-500">Hiring rate</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>
                <span className="font-bold text-slate-800">{data.hiredApplications}</span> hired
              </p>
              <p>
                of <span className="font-bold text-slate-800">{data.totalApplications}</span>{" "}
                applications
              </p>
            </div>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6C5DD3] to-[#8b7fe8] transition-all"
              style={{ width: `${Math.min(hireProgress, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">{hireProgress}% of applications reached hired</p>
        </div>

        {/* Platform breakdown */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5">
            <h2 className="font-bold text-slate-800">Platform breakdown</h2>
            <p className="mt-1 text-xs text-slate-500">
              Profiles and live activity — each metric is counted differently
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <MetricTile
              icon={GraduationCap}
              label="Student profiles"
              value={data.totalStudents}
              hint={`${data.studentAccounts} login accounts`}
            />
            <MetricTile
              icon={Building2}
              label="Company profiles"
              value={data.totalCompanies}
              hint={`${data.companyAccounts} login accounts`}
            />
            <MetricTile icon={ClipboardList} label="Projects" value={data.totalProjects} />
            <MetricTile icon={ClipboardCheck} label="Applications" value={data.totalApplications} />
            <MetricTile icon={Briefcase} label="Active jobs" value={data.activeJobPosts} />
            <MetricTile
              icon={MessageSquare}
              label="Open inquiries"
              value={data.openSupportInquiries}
              hint={
                data.openSupportInquiries > 0
                  ? "Needs admin attention"
                  : `${data.totalSupportInquiries} total received`
              }
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            href="/dashboard/admin/inquiries"
            icon={MessageSquare}
            title="Help & inquiries"
            description="Read and respond to support messages"
            stat={`${data.openSupportInquiries} open · ${data.totalSupportInquiries} total`}
            badge={data.openSupportInquiries > 0 ? data.openSupportInquiries : undefined}
          />
          <ActionCard
            href="/dashboard/admin/students"
            icon={GraduationCap}
            title="Students"
            description="Block, unblock, and manage student accounts"
            stat={`${data.totalStudents} profiles · ${data.studentAccounts} accounts`}
          />
          <ActionCard
            href="/dashboard/admin/companies"
            icon={Building2}
            title="Companies"
            description="View employers and block or unblock access"
            stat={`${data.totalCompanies} profiles · ${data.activeJobPosts} live jobs`}
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  href,
  icon: Icon,
  label,
  value,
  sub,
  accent,
  highlight,
}: {
  href: string;
  icon: typeof Users;
  label: string;
  value: number;
  sub: string;
  accent: "amber" | "emerald" | "blue" | "purple";
  highlight?: boolean;
}) {
  const accentMap = {
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-[#6C5DD3]/10 text-[#6C5DD3]",
  };

  return (
    <Link
      href={href}
      className={cn(
        "group rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        highlight && "ring-2 ring-amber-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#6C5DD3]" />
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </Link>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  hint,
  muted,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50/80 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={cn("mt-1 text-xl font-bold", muted ? "text-slate-600" : "text-slate-800")}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  stat,
  badge,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
  stat: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm transition hover:border-[#6C5DD3]/20 hover:shadow-md"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6C5DD3]/10 text-[#6C5DD3] transition group-hover:bg-[#6C5DD3] group-hover:text-white">
        <Icon className="h-5 w-5" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#6C5DD3]" />
        </div>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <p className="mt-2 text-xs font-semibold text-[#6C5DD3]">{stat}</p>
      </div>
    </Link>
  );
}
