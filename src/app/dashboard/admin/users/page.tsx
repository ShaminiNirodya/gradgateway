"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminUserListItem } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const removeUser = async (user: AdminUserListItem) => {
    if (
      !confirm(
        `Remove ${user.displayName ?? user.email}? They will lose platform access${
          user.role === "Company" ? " and their job posts will go offline" : ""
        }.`
      )
    ) {
      return;
    }
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.removeUser(token, user.id);
      show({ title: "User removed", variant: "success" });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Remove failed",
        description: e instanceof Error ? e.message : "Could not remove user.",
        variant: "error",
      });
    }
  };

  const restoreUser = async (user: AdminUserListItem) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.setUserActive(token, user.id, true);
      show({ title: "User restored", variant: "success" });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Restore failed",
        description: e instanceof Error ? e.message : "Could not restore user.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Users</h1>
        <p className="mt-1 text-sm text-slate-500">View accounts, remove students or companies, or restore access.</p>
      </div>

      {stats && (
        <AdminStatCards
          columns={4}
          items={[
            { label: "Total accounts", value: stats.totalUsers },
            { label: "Active", value: stats.activeUsers },
            { label: "Removed", value: stats.suspendedUsers, highlight: stats.suspendedUsers > 0 },
            { label: "New (7 days)", value: stats.signupsLast7Days },
          ]}
        />
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Input
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs rounded-xl"
        />
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
            <SelectItem value="suspended">Removed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="rounded-xl" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      <p className="text-sm text-slate-500">
        Showing {users.length} user{users.length === 1 ? "" : "s"}
        {stats ? ` · ${stats.studentAccounts} students · ${stats.companyAccounts} companies · ${stats.adminAccounts} admins` : ""}
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading…</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No users match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{u.displayName ?? "—"}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.role}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {u.isActive ? "Active" : "Removed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== "Admin" && (
                        u.isActive ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg"
                            onClick={() => void removeUser(u)}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => void restoreUser(u)}
                          >
                            Restore
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
