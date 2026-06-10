"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { SupportInquiryListItem } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";
import { AdminInquiryDetailModal } from "@/components/features/admin/AdminInquiryDetailModal";
import { inquiryTypes } from "@/lib/validators/contact";
import { inferSubmitterRole, inquiryPreview } from "@/lib/utils/support-inquiry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AdminFilterPanel } from "@/components/features/admin/AdminFilterPanel";
import { AdminViewToggle, type AdminViewMode } from "@/components/features/admin/AdminViewToggle";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

export default function AdminInquiriesPage() {
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [inquiries, setInquiries] = useState<SupportInquiryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<AdminViewMode>("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState<SupportInquiryListItem | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<SupportInquiryListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const list = await AdminService.getInquiries(token, {
        status: statusFilter === "all" ? undefined : statusFilter,
        inquiryType: typeFilter === "all" ? undefined : typeFilter,
        submitterRole: roleFilter === "all" ? undefined : roleFilter,
      });
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
  }, [statusFilter, typeFilter, roleFilter, show]);

  useEffect(() => {
    void load();
  }, [load]);

  const markReviewed = async (inquiry: SupportInquiryListItem) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.markInquiryReviewed(token, inquiry.id);
      show({ title: "Marked as reviewed", variant: "success" });
      setSelected(null);
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

  const confirmDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    setDeleting(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.deleteInquiry(token, inquiryToDelete.id);
      show({ title: "Inquiry deleted", variant: "success" });
      if (selected?.id === inquiryToDelete.id) setSelected(null);
      setInquiryToDelete(null);
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete inquiry.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openCount = stats?.openSupportInquiries ?? 0;

  return (
    <div className="space-y-6 pb-6">
      <AdminPageHeader
        icon={MessageSquare}
        title="Help & inquiries"
        subtitle="Support messages from students, companies, and the public contact form — review and respond."
        badge={openCount > 0 ? `${openCount} open` : undefined}
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
          columns={3}
          items={[
            {
              label: "Open",
              value: stats.openSupportInquiries ?? 0,
              highlight: (stats.openSupportInquiries ?? 0) > 0,
            },
            { label: "Total received", value: stats.totalSupportInquiries ?? 0 },
            {
              label: "Reviewed",
              value: (stats.totalSupportInquiries ?? 0) - (stats.openSupportInquiries ?? 0),
            },
          ]}
        />
      )}

      <AdminFilterPanel>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {inquiryTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[170px] rounded-xl">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="Student">Student inquiries</SelectItem>
            <SelectItem value="Company">Company inquiries</SelectItem>
            <SelectItem value="Public">Public / contact</SelectItem>
          </SelectContent>
        </Select>

        <AdminViewToggle viewMode={viewMode} onChange={setViewMode} />
      </AdminFilterPanel>

      <p className="text-sm text-slate-500">
        Showing {inquiries.length} inquir{inquiries.length === 1 ? "y" : "ies"}
      </p>

      {loading ? (
        <p className="rounded-[20px] border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading inquiries…
        </p>
      ) : inquiries.length === 0 ? (
        <p className="rounded-[20px] border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-sm">
          No inquiries match your filters.
        </p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {inquiries.map((inquiry) => (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              onOpen={() => setSelected(inquiry)}
              onDelete={() => setInquiryToDelete(inquiry)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">From</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold">Source</th>
                  <th className="px-5 py-3.5 font-semibold">Message</th>
                  <th className="px-5 py-3.5 font-semibold">Received</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <InquiryListRow
                    key={inquiry.id}
                    inquiry={inquiry}
                    onOpen={() => setSelected(inquiry)}
                    onDelete={() => setInquiryToDelete(inquiry)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <AdminInquiryDetailModal
          inquiry={selected}
          onClose={() => setSelected(null)}
          onMarkReviewed={() => void markReviewed(selected)}
          onDelete={() => setInquiryToDelete(selected)}
        />
      )}

      <ConfirmDialog
        open={Boolean(inquiryToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setInquiryToDelete(null);
        }}
        title="Delete inquiry"
        description={
          inquiryToDelete ? `Delete inquiry from ${inquiryToDelete.name}? This cannot be undone.` : ""
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDeleteInquiry}
      />
    </div>
  );
}

function InquiryCard({
  inquiry,
  onOpen,
  onDelete,
}: {
  inquiry: SupportInquiryListItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const role = inferSubmitterRole(inquiry);

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-800">{inquiry.name}</h3>
          <p className="truncate text-xs text-slate-500">{inquiry.email}</p>
        </div>
        <StatusBadge status={inquiry.status} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          {inquiry.inquiryType}
        </span>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
          {role}
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm text-slate-600">{inquiryPreview(inquiry.message, 90)}</p>
      <p className="mt-2 text-[11px] text-slate-400">
        {new Date(inquiry.createdAt).toLocaleString()}
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" className="flex-1 rounded-xl" onClick={onOpen}>
          Open
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function InquiryListRow({
  inquiry,
  onOpen,
  onDelete,
}: {
  inquiry: SupportInquiryListItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const role = inferSubmitterRole(inquiry);

  return (
    <tr className="border-b border-slate-50 transition hover:bg-slate-50/50 last:border-0">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-800">{inquiry.name}</p>
        <p className="text-xs text-slate-500">
          {inquiry.email}
          {inquiry.phone ? ` · ${inquiry.phone}` : ""}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {inquiry.inquiryType}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
          {role}
        </span>
      </td>
      <td className="max-w-xs px-5 py-4 text-slate-600">
        <p className="line-clamp-2">{inquiryPreview(inquiry.message, 120)}</p>
      </td>
      <td className="px-5 py-4 text-slate-500">
        {new Date(inquiry.createdAt).toLocaleString()}
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={inquiry.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Button size="sm" className="rounded-lg" onClick={onOpen}>
            Open
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
        status === "Open" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"
      )}
    >
      {status}
    </span>
  );
}
