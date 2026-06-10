"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminUserListItem } from "@/lib/types/admin";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>(
    searchParams.get("status") === "suspended" ? "suspended" : "all"
  );
  const [userToRemove, setUserToRemove] = useState<AdminUserListItem | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "suspended") setActiveFilter("suspended");
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const list = await AdminService.getUsers(token, {
        role: roleFilter === "all" ? undefined : roleFilter,
        search: search.trim() || undefined,
        activeOnly:
          activeFilter === "active" ? true : activeFilter === "suspended" ? false : undefined,
      });
      setUsers(list);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load users.",
        variant: "error",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, activeFilter, show]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const confirmRemoveUser = async () => {
    if (!userToRemove) return;
    setRemoving(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.removeUser(token, userToRemove.id);
      show({ title: "User blocked", variant: "success" });
      setUserToRemove(null);
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Block failed",
        description: e instanceof Error ? e.message : "Could not block user.",
        variant: "error",
      });
    } finally {
      setRemoving(false);
    }
  };

  const restoreUser = async (user: AdminUserListItem) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.setUserActive(token, user.id, true);
      show({ title: "User unblocked", variant: "success" });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Unblock failed",
        description: e instanceof Error ? e.message : "Could not unblock user.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <AdminPageHeader
        icon={Users}
        title="All users"
        subtitle="Search every account — block or unblock access and visibility. No accounts are permanently deleted."
        badge={stats ? `${stats.totalUsers} accounts` : undefined}
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

      <p className="rounded-[14px] border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-900">
        Looking for student profiles with university and degree?{" "}
        <Link href="/dashboard/admin/students" className="font-semibold underline underline-offset-2">
          Go to Students →
        </Link>
      </p>

      {stats && (
        <AdminStatCards
          columns={4}
          items={[
            { label: "Total accounts", value: stats.totalUsers },
            { label: "Active", value: stats.activeUsers },
            { label: "Blocked", value: stats.suspendedUsers, highlight: stats.suspendedUsers > 0 },
            { label: "New (7 days)", value: stats.signupsLast7Days },
          ]}
        />
      )}

      <AdminFilterPanel>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="Student">Student</SelectItem>
            <SelectItem value="Company">Company</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="suspended">Blocked only</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilterPanel>

      <p className="text-sm text-slate-500">
        Showing {users.length} user{users.length === 1 ? "" : "s"}
        {stats
          ? ` · ${stats.studentAccounts} students · ${stats.companyAccounts} companies · ${stats.adminAccounts} admins`
          : ""}
      </p>

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-10 text-center text-slate-500">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No users match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">User</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/50 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{u.displayName ?? "—"}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill active={u.isActive} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u.role !== "Admin" &&
                        (u.isActive ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg"
                            onClick={() => setUserToRemove(u)}
                          >
                            Block
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => void restoreUser(u)}
                          >
                            Unblock
                          </Button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(userToRemove)}
        onOpenChange={(open) => {
          if (!open && !removing) setUserToRemove(null);
        }}
        title="Block user"
        description={
          userToRemove
            ? `Block ${userToRemove.displayName ?? userToRemove.email}? They will lose access and visibility on the platform${
                userToRemove.role === "Company" ? " and their job posts will be hidden" : ""
              }. You can unblock them later.`
            : ""
        }
        confirmLabel="Block"
        variant="danger"
        loading={removing}
        onConfirm={confirmRemoveUser}
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

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    Student: "bg-purple-50 text-purple-700",
    Company: "bg-blue-50 text-blue-700",
    Admin: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[role] ?? "bg-slate-100 text-slate-600"
      )}
    >
      {role}
    </span>
  );
}
