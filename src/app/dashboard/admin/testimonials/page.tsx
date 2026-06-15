"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { TestimonialListItem } from "@/lib/types/testimonial";
import { useToast } from "@/components/ui/toast";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminFilterPanel } from "@/components/features/admin/AdminFilterPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CheckCircle2, MessageSquareQuote, RefreshCw, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Published: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-slate-100 text-slate-600",
};

export default function AdminTestimonialsPage() {
  const { show } = useToast();
  const { refresh: refreshStats, markTestimonialsSeen } = useAdminDashboard();
  const [items, setItems] = useState<TestimonialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [toDelete, setToDelete] = useState<TestimonialListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const list = await AdminService.getTestimonials(token, {
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setItems(list);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load testimonials.",
        variant: "error",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, show]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    markTestimonialsSeen();
  }, [markTestimonialsSeen]);

  const setStatus = async (item: TestimonialListItem, status: string) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.setTestimonialStatus(token, item.id, status);
      show({
        title: status === "Published" ? "Published" : status === "Rejected" ? "Rejected" : "Updated",
        variant: "success",
      });
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Could not update testimonial.",
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.deleteTestimonial(token, toDelete.id);
      show({ title: "Deleted", variant: "success" });
      setToDelete(null);
      void load();
      void refreshStats();
    } catch (e) {
      show({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete testimonial.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={MessageSquareQuote}
        title="Community testimonials"
        subtitle="Review submissions from signed-in students and recruiters before they appear on the public homepage."
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

      <AdminFilterPanel>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Pending">Pending review</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilterPanel>

      {loading ? (
        <p className="text-sm text-slate-500">Loading testimonials…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
          No testimonials match your filters.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium leading-relaxed text-slate-700">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {item.authorName}
                    <span className="font-normal text-slate-500"> · {item.authorRole}</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Submitted {new Date(item.createdAt).toLocaleString()}
                    {item.submitterRole ? ` · ${item.submitterRole}` : ""}
                    {item.submitterEmail ? ` · ${item.submitterEmail}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                    statusStyles[item.status] ?? "bg-slate-100 text-slate-600"
                  )}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => void setStatus(item, "Published")}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => void setStatus(item, "Rejected")}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {item.status === "Published" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => void setStatus(item, "Rejected")}
                  >
                    Unpublish
                  </Button>
                )}
                {item.status === "Rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => void setStatus(item, "Published")}
                  >
                    Publish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-red-600 hover:bg-red-50"
                  onClick={() => setToDelete(item)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setToDelete(null);
        }}
        title="Delete testimonial?"
        description="This removes the quote from the admin list. Published items will disappear from the homepage."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
