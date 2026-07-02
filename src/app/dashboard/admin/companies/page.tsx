"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Briefcase, Mail, RefreshCw, Search } from "lucide-react";
import { AdminViewToggle, type AdminViewMode } from "@/components/features/admin/AdminViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminCompanyListItem } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AdminFilterPanel } from "@/components/features/admin/AdminFilterPanel";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminMessageUserButton } from "@/components/features/admin/AdminMessageUserButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/components/features/admin/AdminPagination";
import type { PagedResult } from "@/lib/types/paged";

const PAGE_SIZE = 20;

export default function AdminCompaniesPage() {
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [paged, setPaged] = useState<PagedResult<AdminCompanyListItem>>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<AdminViewMode>("grid");
  const [companyToRemove, setCompanyToRemove] = useState<AdminCompanyListItem | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const result = await AdminService.getCompanies(token, {
        search: search.trim() || undefined,
        status:
          statusFilter === "active"
            ? "active"
            : statusFilter === "removed"
              ? "blocked"
              : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setPaged(result);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load companies.",
        variant: "error",
      });
      setPaged({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, show]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const companies = paged.items;

  const confirmRemoveCompany = async () => {
    if (!companyToRemove) return;
    setRemoving(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.removeUser(token, companyToRemove.userId);
      show({ title: "Company blocked", variant: "success" });
      setCompanyToRemove(null);
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Block failed",
        description: e instanceof Error ? e.message : "Could not block company.",
        variant: "error",
      });
    } finally {
      setRemoving(false);
    }
  };

  const restoreCompany = async (company: AdminCompanyListItem) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.setUserActive(token, company.userId, true);
      show({ title: "Company unblocked", variant: "success" });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Unblock failed",
        description: e instanceof Error ? e.message : "Could not unblock company.",
        variant: "error",
      });
    }
  };

  const activeCount = companies.filter((c) => c.userIsActive).length;

  return (
    <div className="space-y-6 pb-6">
      <AdminPageHeader
        icon={Building2}
        title="Companies"
        subtitle="Block or unblock company access and visibility — accounts remain in the system and jobs can be restored when unblocked."
        badge={stats ? `${stats.totalCompanies} profiles` : undefined}
        variant="slate"
      >
        <Button
          variant="secondary"
          className="rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </AdminPageHeader>

      {stats && (
        <AdminStatCards
          columns={4}
          items={[
            { label: "Company profiles", value: stats.totalCompanies },
            { label: "Active accounts", value: activeCount },
            { label: "Blocked", value: stats.totalCompanies - activeCount },
            { label: "Active job posts", value: stats.activeJobPosts },
          ]}
        />
      )}

      <AdminFilterPanel>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search company or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="removed">Blocked only</SelectItem>
          </SelectContent>
        </Select>
        <AdminViewToggle viewMode={viewMode} onChange={setViewMode} />
      </AdminFilterPanel>

      <p className="text-sm text-slate-500">
        {paged.totalCount} compan{paged.totalCount === 1 ? "y" : "ies"} total
      </p>

      {loading ? (
        <p className="rounded-[20px] border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading companies…
        </p>
      ) : companies.length === 0 ? (
        <p className="rounded-[20px] border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-sm">
          No companies match your filters.
        </p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              onRemove={() => setCompanyToRemove(c)}
              onRestore={() => void restoreCompany(c)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Company</th>
                  <th className="px-5 py-3.5 font-semibold">Industry</th>
                  <th className="px-5 py-3.5 font-semibold">Contact</th>
                  <th className="px-5 py-3.5 font-semibold">Jobs</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <CompanyListRow
                    key={c.id}
                    company={c}
                    onRemove={() => setCompanyToRemove(c)}
                    onRestore={() => void restoreCompany(c)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={paged.page}
            totalPages={paged.totalPages}
            totalCount={paged.totalCount}
            pageSize={paged.pageSize}
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      )}

      {!loading && companies.length > 0 && viewMode === "grid" && (
        <AdminPagination
          page={paged.page}
          totalPages={paged.totalPages}
          totalCount={paged.totalCount}
          pageSize={paged.pageSize}
          loading={loading}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={Boolean(companyToRemove)}
        onOpenChange={(open) => {
          if (!open && !removing) setCompanyToRemove(null);
        }}
        title="Block company"
        description={
          companyToRemove
            ? `Block ${companyToRemove.companyName}? They will lose access and their profile and job posts will be hidden from the platform. You can unblock them later.`
            : ""
        }
        confirmLabel="Block"
        variant="danger"
        loading={removing}
        onConfirm={confirmRemoveCompany}
      />
    </div>
  );
}

function CompanyCard({
  company,
  onRemove,
  onRestore,
}: {
  company: AdminCompanyListItem;
  onRemove: () => void;
  onRestore: () => void;
}) {
  return (
    <article className="flex flex-col rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-800">{company.companyName}</h3>
            <p className="text-sm text-slate-500">{company.industry || "Industry not set"}</p>
          </div>
        </div>
        <StatusPill active={company.userIsActive} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{company.companyEmail}</span>
        </p>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Login:</span> {company.userEmail}
        </p>
        <p className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
          {company.activeJobCount} active job{company.activeJobCount === 1 ? "" : "s"}
        </p>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Joined {new Date(company.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-50 pt-4">
        <AdminMessageUserButton companyProfileId={company.id} />
        {company.userIsActive ? (
          <Button size="sm" variant="destructive" className="rounded-xl" onClick={onRemove}>
            Block company
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="rounded-xl" onClick={onRestore}>
            Unblock company
          </Button>
        )}
      </div>
    </article>
  );
}

function CompanyListRow({
  company,
  onRemove,
  onRestore,
}: {
  company: AdminCompanyListItem;
  onRemove: () => void;
  onRestore: () => void;
}) {
  return (
    <tr className="border-b border-slate-50 transition hover:bg-slate-50/50 last:border-0">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-800">{company.companyName}</p>
        <p className="text-xs text-slate-500">{company.userEmail}</p>
      </td>
      <td className="px-5 py-4 text-slate-600">{company.industry || "—"}</td>
      <td className="px-5 py-4 text-slate-600">{company.companyEmail}</td>
      <td className="px-5 py-4 text-slate-600">{company.activeJobCount}</td>
      <td className="px-5 py-4 text-slate-500">
        {new Date(company.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-4">
        <StatusPill active={company.userIsActive} />
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex justify-end gap-2">
          <AdminMessageUserButton companyProfileId={company.id} />
          {company.userIsActive ? (
          <Button size="sm" variant="destructive" className="rounded-lg" onClick={onRemove}>
            Block
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="rounded-lg" onClick={onRestore}>
            Unblock
          </Button>
        )}
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
    >
      {active ? "Active" : "Blocked"}
    </span>
  );
}
