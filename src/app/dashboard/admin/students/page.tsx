"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import { AdminMessageUserButton } from "@/components/features/admin/AdminMessageUserButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminUserListItem } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AdminFilterPanel } from "@/components/features/admin/AdminFilterPanel";
import { useRouter } from "next/navigation";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/components/features/admin/AdminPagination";
import type { PagedResult } from "@/lib/types/paged";

const PAGE_SIZE = 20;

export default function AdminStudentsPage() {
  const router = useRouter();
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [paged, setPaged] = useState<PagedResult<AdminUserListItem>>({
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
  const [activeFilter, setActiveFilter] = useState("all");
  const [studentToRemove, setStudentToRemove] = useState<AdminUserListItem | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const result = await AdminService.getUsers(token, {
        role: "Student",
        search: search.trim() || undefined,
        activeOnly:
          activeFilter === "active" ? true : activeFilter === "removed" ? false : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setPaged(result);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load students.",
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
  }, [search, activeFilter, page, show]);

  useEffect(() => {
    setPage(1);
  }, [search, activeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const students = paged.items;

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;
    setRemoving(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.removeUser(token, studentToRemove.id);
      show({ title: "Student blocked", variant: "success" });
      setStudentToRemove(null);
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Block failed",
        description: e instanceof Error ? e.message : "Could not block student.",
        variant: "error",
      });
    } finally {
      setRemoving(false);
    }
  };

  const restoreStudent = async (student: AdminUserListItem) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.setUserActive(token, student.id, true);
      show({ title: "Student unblocked", variant: "success" });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Unblock failed",
        description: e instanceof Error ? e.message : "Could not unblock student.",
        variant: "error",
      });
    }
  };

  const activeCount = students.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 pb-6">
      <AdminPageHeader
        icon={GraduationCap}
        title="Students"
        subtitle="Block or unblock student access and visibility — accounts stay in the system and can be restored anytime."
        badge={stats ? `${stats.totalStudents} profiles` : undefined}
      />

      {stats && (
        <>
          <AdminStatCards
            columns={4}
            items={[
              { label: "Student profiles", value: stats.totalStudents },
              { label: "Active accounts", value: activeCount || stats.studentAccounts },
              {
                label: "Blocked",
                value: stats.suspendedUsers,
                highlight: false,
              },
              { label: "Projects (platform)", value: stats.totalProjects },
            ]}
          />
        </>
      )}

      <AdminFilterPanel>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[150px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="removed">Blocked only</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button
            className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
            onClick={() => router.push("/dashboard/admin/academic-catalog")}
          >
            Go to Universities & degrees
          </Button>
        </div>
      </AdminFilterPanel>

      <p className="text-sm text-slate-500">
        Showing {students.length} student{students.length === 1 ? "" : "s"}
      </p>

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-10 text-center text-slate-500">Loading students…</p>
        ) : students.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No students match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/50 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{s.displayName ?? "—"}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill active={s.isActive} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <AdminMessageUserButton
                          studentProfileId={s.studentProfileId}
                        />
                        {s.isActive ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg min-w-[110px]"
                            onClick={() => setStudentToRemove(s)}
                          >
                            Block
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-lg min-w-[110px]"
                            onClick={() => void restoreStudent(s)}
                          >
                            Unblock
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          page={paged.page}
          totalPages={paged.totalPages}
          totalCount={paged.totalCount}
          pageSize={paged.pageSize}
          loading={loading}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={Boolean(studentToRemove)}
        onOpenChange={(open) => {
          if (!open && !removing) setStudentToRemove(null);
        }}
        title="Block student"
        description={
          studentToRemove
            ? `Block ${studentToRemove.displayName ?? studentToRemove.email}? They will lose access and their profile will be hidden from the platform. You can unblock them later.`
            : ""
        }
        confirmLabel="Block"
        variant="danger"
        loading={removing}
        onConfirm={confirmRemoveStudent}
      />
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
    >
      {active ? "Active" : "Blocked"}
    </span>
  );
}
