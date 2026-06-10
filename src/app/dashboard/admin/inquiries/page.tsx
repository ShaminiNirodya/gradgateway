"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { SupportInquiryListItem } from "@/lib/types/admin";
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

export default function AdminInquiriesPage() {
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [inquiries, setInquiries] = useState<SupportInquiryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const list = await AdminService.getInquiries(
        token,
        statusFilter === "all" ? undefined : statusFilter
      );
      setInquiries(list);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load inquiries.",
        variant: "error",
      });
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, show]);

  useEffect(() => {
    void load();
  }, [load]);

  const markReviewed = async (inquiry: SupportInquiryListItem) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.markInquiryReviewed(token, inquiry.id);
      show({ title: "Marked as reviewed", variant: "success" });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Could not update inquiry.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Help & inquiries</h1>
        <p className="mt-1 text-sm text-slate-500">
          Messages from the contact form and help requests.
        </p>
      </div>

      {stats && (
        <AdminStatCards
          columns={3}
          items={[
            {
              label: "Open",
              value: stats.openSupportInquiries,
              highlight: stats.openSupportInquiries > 0,
            },
            { label: "Total received", value: stats.totalSupportInquiries },
            {
              label: "Reviewed",
              value: stats.totalSupportInquiries - stats.openSupportInquiries,
            },
          ]}
        />
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="rounded-xl" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-500">Loading…</p>
        ) : inquiries.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No inquiries yet.
          </p>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">{inquiry.name}</h3>
                  <p className="text-sm text-slate-500">
                    {inquiry.email}
                    {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {inquiry.inquiryType} · {new Date(inquiry.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    inquiry.status === "Open"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {inquiry.status}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{inquiry.message}</p>
              {inquiry.attachmentName && (
                <p className="mt-2 text-xs text-slate-500">Attachment: {inquiry.attachmentName}</p>
              )}
              {inquiry.status === "Open" && (
                <Button
                  size="sm"
                  className="mt-4 rounded-xl"
                  onClick={() => void markReviewed(inquiry)}
                >
                  Mark reviewed
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
