"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, ClipboardList, RefreshCw, MessageSquare } from "lucide-react";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";

export default function AdminDashboardPage() {
  const { data, loading, error, refreshedAt, refresh } = useAdminDashboard();

  if (loading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#6C5DD3]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-red-600">{error ?? "No data"}</p>
        <Button className="mt-4 rounded-xl" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Admin overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live platform metrics from the database
            {refreshedAt ? ` · Updated ${refreshedAt.toLocaleTimeString()}` : ""}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => void refresh()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <AdminStatCards
        items={[
          {
            label: "Open inquiries",
            value: data.openSupportInquiries,
            href: "/dashboard/admin/inquiries",
            highlight: data.openSupportInquiries > 0,
          },
          { label: "Active users", value: data.activeUsers, href: "/dashboard/admin/users" },
          { label: "Signups (7 days)", value: data.signupsLast7Days, href: "/dashboard/admin/users" },
          { label: "Active job posts", value: data.activeJobPosts, href: "/dashboard/admin/companies" },
        ]}
      />

      <AdminStatCards
        columns={6}
        items={[
          { label: "Students", value: data.totalStudents },
          { label: "Companies", value: data.totalCompanies },
          { label: "Projects", value: data.totalProjects },
          { label: "Hiring rate", value: `${data.hiringRate}%` },
          { label: "Applications", value: data.totalApplications },
          { label: "Hired", value: data.hiredApplications },
        ]}
      />

      <AdminStatCards
        columns={6}
        items={[
          { label: "Total accounts", value: data.totalUsers },
          { label: "Removed", value: data.suspendedUsers, href: "/dashboard/admin/users?status=suspended" },
          { label: "Student accounts", value: data.studentAccounts },
          { label: "Company accounts", value: data.companyAccounts },
          { label: "Help requests", value: data.totalSupportInquiries, href: "/dashboard/admin/inquiries" },
          { label: "Expired jobs", value: data.expiredJobPosts },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickLink
          href="/dashboard/admin/inquiries"
          icon={MessageSquare}
          title="Help & inquiries"
          description={`${data.openSupportInquiries} open · ${data.totalSupportInquiries} total received`}
        />
        <QuickLink
          href="/dashboard/admin/users"
          icon={Users}
          title="Manage users"
          description={`${data.activeUsers} active · ${data.suspendedUsers} removed`}
        />
        <QuickLink
          href="/dashboard/admin/companies"
          icon={Building2}
          title="Companies"
          description={`${data.totalCompanies} profiles · ${data.activeJobPosts} active jobs`}
        />
        <QuickLink
          href="/dashboard/admin/settings"
          icon={ClipboardList}
          title="Platform settings"
          description={`${data.adminAccounts} admin · registration & maintenance toggles`}
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-[18px] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="rounded-xl bg-[#6C5DD3]/10 p-3 text-[#6C5DD3]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
