"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { useToast } from "@/components/ui/toast";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AdminFilterPanel } from "@/components/features/admin/AdminFilterPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  toFormValues,
  type PlatformContentAudience,
  type PlatformContentFormValues,
  type PlatformContentItem,
  type PlatformContentSection,
  type PlatformContentType,
} from "@/lib/types/platform-content";
import { BookOpen, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { legalPageLabels, legalPageSlugs } from "@/lib/content/legal-pages-fallback";
import { cn } from "@/lib/utils";

const typeLabels: Record<PlatformContentType, string> = {
  Faq: "FAQ",
  Guide: "Guide",
  Article: "Article",
  Legal: "Legal page",
};

const sectionLabels: Record<PlatformContentSection, string> = {
  Public: "Public FAQ page",
  HelpCenter: "Help center",
  Contact: "Contact page",
  Legal: "Footer legal links",
};

const statusStyles: Record<string, string> = {
  Published: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-600",
};

const textareaClass =
  "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3]";

const audienceOptions: PlatformContentAudience[] = ["Student", "Company", "All"];

function defaultSectionForType(type: PlatformContentType): PlatformContentSection {
  if (type === "Guide") return "HelpCenter";
  if (type === "Legal") return "Legal";
  return "Public";
}

function defaultSlugForLegal(slug: string): Partial<PlatformContentFormValues> {
  const title = legalPageLabels[slug as keyof typeof legalPageLabels];
  if (!title) return {};
  return { slug, title, section: "Legal", audiences: ["All"] };
}

export default function AdminContentPage() {
  const { show } = useToast();
  const [items, setItems] = useState<PlatformContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlatformContentItem | null>(null);
  const [form, setForm] = useState<PlatformContentFormValues>(toFormValues());
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<PlatformContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const list = await AdminService.getContent(token, {
        contentType: typeFilter === "all" ? undefined : typeFilter,
        section: sectionFilter === "all" ? undefined : sectionFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setItems(list);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load site content.",
        variant: "error",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, sectionFilter, statusFilter, show]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      faq: items.filter((i) => i.contentType === "Faq").length,
      guide: items.filter((i) => i.contentType === "Guide").length,
      article: items.filter((i) => i.contentType === "Article").length,
      legal: items.filter((i) => i.contentType === "Legal").length,
    }),
    [items]
  );

  const openCreate = (contentType: PlatformContentType = "Faq") => {
    setEditing(null);
    const base = {
      ...toFormValues(),
      contentType,
      section: defaultSectionForType(contentType),
      status: "Draft" as const,
    };
    if (contentType === "Legal") {
      setForm({
        ...base,
        audiences: ["All"],
        ...defaultSlugForLegal("privacy-policy"),
      });
    } else {
      setForm(base);
    }
    setShowForm(true);
  };

  const openEdit = (item: PlatformContentItem) => {
    setEditing(item);
    setForm(toFormValues(item));
    setShowForm(true);
  };

  const toggleAudience = (audience: PlatformContentAudience) => {
    setForm((prev) => {
      const has = prev.audiences.includes(audience);
      const next = has
        ? prev.audiences.filter((a) => a !== audience)
        : [...prev.audiences, audience];
      return { ...prev, audiences: next.length > 0 ? next : ["All"] };
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      show({ title: "Title is required", variant: "error" });
      return;
    }
    if (form.contentType !== "Guide" && form.contentType !== "Legal" && !form.body.trim()) {
      show({ title: "Answer/body is required", variant: "error" });
      return;
    }
    if (form.contentType === "Legal" && !form.body.trim()) {
      show({ title: "Legal page HTML content is required", variant: "error" });
      return;
    }
    if (form.contentType === "Legal" && !form.slug.trim()) {
      show({ title: "Select which legal page to edit", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      if (editing) {
        await AdminService.updateContent(token, editing.id, form);
        show({ title: "Content updated", variant: "success" });
      } else {
        await AdminService.createContent(token, form);
        show({ title: "Content created", variant: "success" });
      }
      setShowForm(false);
      setEditing(null);
      void load();
    } catch (e) {
      show({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Could not save content.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminService.deleteContent(token, toDelete.id);
      show({ title: "Content deleted", variant: "success" });
      setToDelete(null);
      void load();
    } catch (e) {
      show({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete content.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <AdminPageHeader
        icon={BookOpen}
        title="Site content"
        subtitle="Manage FAQs, help guides, and articles shown on public and dashboard help pages."
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
        <Button className="rounded-xl bg-white text-[#6C5DD3] hover:bg-white/90" onClick={() => openCreate("Faq")}>
          <Plus className="mr-2 h-4 w-4" />
          Add content
        </Button>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "FAQs", value: counts.faq },
          { label: "Guides", value: counts.guide },
          { label: "Articles", value: counts.article },
          { label: "Legal pages", value: counts.legal },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <AdminFilterPanel>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Faq">FAQ</SelectItem>
            <SelectItem value="Guide">Guide</SelectItem>
            <SelectItem value="Article">Article</SelectItem>
            <SelectItem value="Legal">Legal page</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            <SelectItem value="Public">Public FAQ</SelectItem>
            <SelectItem value="HelpCenter">Help center</SelectItem>
            <SelectItem value="Contact">Contact</SelectItem>
            <SelectItem value="Legal">Legal pages</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilterPanel>

      <div className="space-y-3">
        {loading && (
          <p className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
            Loading content…
          </p>
        )}
        {!loading && items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No content yet. Add FAQs, guides, or articles to populate your help pages.
          </p>
        )}
        {!loading &&
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-violet-700">
                      {typeLabels[item.contentType]}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      {sectionLabels[item.section]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        statusStyles[item.status ?? "Draft"]
                      )}
                    >
                      {item.status ?? "Draft"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {item.summary || item.body || `${item.steps.length} steps`}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Audiences: {item.audiences.join(", ")} · Order: {item.sortOrder}
                    {item.category ? ` · ${item.category}` : ""}
                    {item.contentType === "Legal" && item.slug ? ` · /${item.slug}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(item)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setToDelete(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editing ? "Edit content" : "Add content"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Published items appear on the matching public or dashboard help page.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.contentType}
                  onValueChange={(value) => {
                    const contentType = value as PlatformContentType;
                    setForm((prev) => ({
                      ...prev,
                      contentType,
                      section: defaultSectionForType(contentType),
                      audiences: contentType === "Legal" ? ["All"] : prev.audiences,
                    }));
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faq">FAQ</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Legal">Legal page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={form.section}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, section: value as PlatformContentSection }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public FAQ page</SelectItem>
                    <SelectItem value="HelpCenter">Help center</SelectItem>
                    <SelectItem value="Contact">Contact page</SelectItem>
                    <SelectItem value="Legal">Legal pages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.contentType === "Legal" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Page</Label>
                  <Select
                    value={form.slug || legalPageSlugs[0]}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, ...defaultSlugForLegal(value) }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {legalPageSlugs.map((slug) => (
                        <SelectItem key={slug} value={slug}>
                          {legalPageLabels[slug]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Slug maps to /{form.slug || "privacy-policy"} on the public site.
                  </p>
                </div>
              )}
              <div className="space-y-2 sm:col-span-2">
                <Label>Title / question</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              {form.contentType !== "Guide" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    {form.contentType === "Faq"
                      ? "Answer"
                      : form.contentType === "Legal"
                        ? "Page content (HTML)"
                        : "Body"}
                  </Label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                    rows={form.contentType === "Legal" ? 14 : 4}
                    className={cn(textareaClass, form.contentType === "Legal" && "font-mono text-xs")}
                    placeholder={
                      form.contentType === "Legal"
                        ? "<section><h2>1. Section title</h2><p>Paragraph text…</p></section>"
                        : undefined
                    }
                  />
                </div>
              )}
              {(form.contentType === "Guide" || form.contentType === "Article") && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Summary</Label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                    rows={2}
                    className={textareaClass}
                  />
                </div>
              )}
              {form.contentType === "Guide" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Steps (one per line)</Label>
                  <textarea
                    value={form.stepsText}
                    onChange={(e) => setForm((prev) => ({ ...prev, stepsText: e.target.value }))}
                    rows={6}
                    className={cn(textareaClass, "font-mono")}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Getting Started"
                  className="rounded-xl"
                />
              </div>
              {form.contentType !== "Legal" && (
                <div className="space-y-2">
                  <Label>Slug (optional)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-id"
                    className="rounded-xl"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Related link URL</Label>
                <Input
                  value={form.relatedLinkHref}
                  onChange={(e) => setForm((prev) => ({ ...prev, relatedLinkHref: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Related link label</Label>
                <Input
                  value={form.relatedLinkLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, relatedLinkLabel: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as PlatformContentFormValues["status"],
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Audiences</Label>
                <div className="flex flex-wrap gap-2">
                  {audienceOptions.map((audience) => {
                    const active = form.audiences.includes(audience);
                    return (
                      <button
                        key={audience}
                        type="button"
                        onClick={() => toggleAudience(audience)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                          active
                            ? "bg-[#6C5DD3] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {audience}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]" onClick={() => void handleSave()} disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this content?"
        description="It will be removed from all public and help pages."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
