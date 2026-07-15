"use client";

import { useCallback, useEffect, useState } from "react";
import { MailCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminEmailLogItem } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Sent: "bg-emerald-50 text-emerald-700",
  Simulated: "bg-slate-100 text-slate-600",
  Queued: "bg-amber-50 text-amber-700",
  Failed: "bg-rose-50 text-rose-700",
};

export default function AdminEmailLogsPage() {
  const { show } = useToast();
  const [logs, setLogs] = useState<AdminEmailLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const rows = await AdminService.getEmailLogs(token, {
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setLogs(rows);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load email logs.",
        variant: "error",
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, show]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={MailCheck}
        title="Email logs"
        subtitle="Every email the platform has sent or simulated — verification, password resets, and notifications."
        badge={`${logs.length} shown`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by email, template, or purpose..."
            className="h-11 rounded-xl bg-white pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-44 rounded-xl bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Simulated">Simulated</SelectItem>
            <SelectItem value="Queued">Queued</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Recipient</th>
                <th className="px-5 py-3.5 font-semibold">Template</th>
                <th className="px-5 py-3.5 font-semibold">Purpose</th>
                <th className="px-5 py-3.5 font-semibold">Provider</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Loading email logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No email logs match your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{log.toEmail}</p>
                      <p className="text-xs text-slate-400">Account: {log.userEmail}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">{log.templateType}</td>
                    <td className="max-w-[220px] truncate px-5 py-4 text-slate-500" title={log.purpose}>
                      {log.purpose}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{log.provider}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-1 text-xs font-bold",
                          STATUS_STYLES[log.status] ?? "bg-slate-100 text-slate-600"
                        )}
                        title={log.error ?? undefined}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
