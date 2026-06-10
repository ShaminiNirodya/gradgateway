"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminCompanyListItem } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";

export default function AdminCompaniesPage() {
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [companies, setCompanies] = useState<AdminCompanyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const list = await AdminService.getCompanies(token, {
        search: search.trim() || undefined,
      });
      setCompanies(list);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load companies.",
        variant: "error",
      });
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [search, show]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const removeCompany = async (company: AdminCompanyListItem) => {
    if (
      !confirm(
        `Remove ${company.companyName}? Their account will be disabled and job posts will be taken offline.`
      )
    ) {
      return;
    }
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.removeUser(token, company.userId);
      show({ title: "Company removed", variant: "success" });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Remove failed",
        description: e instanceof Error ? e.message : "Could not remove company.",
        variant: "error",
      });
    }
  };

  const activeCompanies = companies.filter((c) => c.userIsActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Companies</h1>
        <p className="mt-1 text-sm text-slate-500">
          View registered employers and remove accounts that should no longer access the platform.
        </p>
      </div>

      {stats && (
        <AdminStatCards
          columns={4}
          items={[
            { label: "Company profiles", value: stats.totalCompanies },
            { label: "Company accounts", value: stats.companyAccounts },
            { label: "Active on platform", value: activeCompanies.length },
            { label: "Active job posts", value: stats.activeJobPosts },
          ]}
        />
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Input
          placeholder="Search company or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs rounded-xl"
        />
        <Button variant="outline" className="rounded-xl" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-500">Loading…</p>
        ) : companies.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No companies match your search.
          </p>
        ) : (
          companies.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{c.companyName}</h3>
                  <p className="text-sm text-slate-500">
                    {c.industry} · {c.companyEmail}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Account: {c.userEmail} · {c.activeJobCount} active job(s)
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    c.userIsActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {c.userIsActive ? "Active" : "Removed"}
                </span>
              </div>

              {c.userIsActive && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-4 rounded-xl"
                  onClick={() => void removeCompany(c)}
                >
                  Remove company
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
