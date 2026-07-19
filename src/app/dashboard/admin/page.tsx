"use client";

import { Button } from "@/components/ui/button";
import { AdminOverviewDashboard } from "@/components/features/admin/AdminOverviewDashboard";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-40 rounded-[24px] bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-[20px] bg-slate-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-52 rounded-[20px] bg-slate-200 lg:col-span-1" />
        <div className="h-52 rounded-[20px] bg-slate-200 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, loading, error, refreshedAt, refresh } = useAdminDashboard();

  if (loading && !data) {
    return <OverviewSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="rounded-[20px] border border-red-100 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Could not load dashboard</h2>
        <p className="mt-2 text-sm text-red-600">{error ?? "No data available."}</p>
        <Button className="mt-6 rounded-xl" onClick={() => void refresh()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <AdminOverviewDashboard
      data={data}
      loading={loading}
      refreshedAt={refreshedAt}
      onRefresh={refresh}
    />
  );
}
