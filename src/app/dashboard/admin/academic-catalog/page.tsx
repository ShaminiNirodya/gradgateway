"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AdminFilterPanel } from "@/components/features/admin/AdminFilterPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { AdminAcademicCatalogService } from "@/lib/services/academic-catalog.service";
import { AcademicCatalogService } from "@/lib/services/academic-catalog.service";
import type {
  CatalogDegreeAdmin,
  CatalogUniversityAdmin,
  CatalogUniversityDetail,
} from "@/lib/types/academic-catalog";
import { cn } from "@/lib/utils";

type Tab = "universities" | "degrees";

export default function AdminAcademicCatalogPage() {
  const { show } = useToast();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(
    tabParam === "degrees" ? "degrees" : "universities"
  );
  const [universities, setUniversities] = useState<CatalogUniversityAdmin[]>([]);
  const [degrees, setDegrees] = useState<CatalogDegreeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<CatalogUniversityAdmin | null>(null);
  const [editingDegree, setEditingDegree] = useState<CatalogDegreeAdmin | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [universitySearch, setUniversitySearch] = useState("");

  const [offersOpen, setOffersOpen] = useState(false);
  const [offersUniversity, setOffersUniversity] = useState<CatalogUniversityDetail | null>(null);
  const [selectedDegreeIds, setSelectedDegreeIds] = useState<Set<string>>(new Set());
  const [savingOffers, setSavingOffers] = useState(false);

  const [toDelete, setToDelete] = useState<{ type: Tab; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const [uni, deg] = await Promise.all([
        AdminAcademicCatalogService.getUniversities(token, showHidden),
        AdminAcademicCatalogService.getDegrees(token, showHidden),
      ]);
      setUniversities(uni);
      setDegrees(deg);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load catalog.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showHidden, show]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredUniversities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return universities.filter((u) => !q || u.name.toLowerCase().includes(q));
  }, [universities, search]);

  const filteredDegrees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return degrees.filter((d) => !q || d.name.toLowerCase().includes(q));
  }, [degrees, search]);

  const isDegreeAddMode = tab === "degrees" && !editingDegree;
  const isDegreeFormDisabled = isDegreeAddMode && !selectedUniversityId;
  const filteredUniversitiesForForm = useMemo(() => {
    const q = universitySearch.trim().toLowerCase();
    return universities.filter((u) => !q || u.name.toLowerCase().includes(q));
  }, [universities, universitySearch]);

  const openCreate = () => {
    setEditingUni(null);
    setEditingDegree(null);
    setName("");
    setSortOrder("0");
    setIsActive(true);
    setSelectedUniversityId("");
    setUniversitySearch("");
    setFormOpen(true);
  };

  const openEditUniversity = (item: CatalogUniversityAdmin) => {
    setEditingUni(item);
    setEditingDegree(null);
    setName(item.name);
    setSortOrder(String(item.sortOrder));
    setIsActive(item.isActive);
    setFormOpen(true);
  };

  const openEditDegree = (item: CatalogDegreeAdmin) => {
    setEditingDegree(item);
    setEditingUni(null);
    setName(item.name);
    setSortOrder(String(item.sortOrder));
    setIsActive(item.isActive);
    setFormOpen(true);
  };

  const saveForm = async () => {
    if (!name.trim()) {
      show({ title: "Name required", variant: "error" });
      return;
    }
    if (tab === "degrees" && !editingDegree && !selectedUniversityId) {
      show({ title: "Select a university", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const payload = {
        name: name.trim(),
        isActive,
        sortOrder: Number(sortOrder) || 0,
      };

      if (tab === "universities") {
        if (editingUni) {
          await AdminAcademicCatalogService.updateUniversity(token, editingUni.id, payload);
        } else {
          await AdminAcademicCatalogService.createUniversity(token, payload);
        }
      } else if (editingDegree) {
        await AdminAcademicCatalogService.updateDegree(token, editingDegree.id, payload);
      } else {
        // create degree and, if a university was selected, attach it to that university
        const created = await AdminAcademicCatalogService.createDegree(token, payload);
        if (selectedUniversityId) {
          try {
            const uniDetail = await AdminAcademicCatalogService.getUniversity(token, selectedUniversityId);
            const existing = uniDetail.degrees.map((d) => d.id);
            const next = Array.from(new Set([...existing, created.id]));
            await AdminAcademicCatalogService.setUniversityDegrees(token, selectedUniversityId, next);
          } catch (err) {
            // non-fatal: continue but notify
            show({ title: "Degree created but linking failed", description: err instanceof Error ? err.message : String(err), variant: "warning" });
          }
        }
      }

      AcademicCatalogService.clearCache();
      setFormOpen(false);
      show({ title: "Saved", variant: "success" });
      void load();
    } catch (e) {
      show({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Could not save.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (type: Tab, id: string, next: boolean) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      if (type === "universities") {
        await AdminAcademicCatalogService.setUniversityActive(token, id, next);
      } else {
        await AdminAcademicCatalogService.setDegreeActive(token, id, next);
      }
      AcademicCatalogService.clearCache();
      void load();
    } catch (e) {
      show({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Could not update visibility.",
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      if (toDelete.type === "universities") {
        await AdminAcademicCatalogService.deleteUniversity(token, toDelete.id);
      } else {
        await AdminAcademicCatalogService.deleteDegree(token, toDelete.id);
      }
      AcademicCatalogService.clearCache();
      setToDelete(null);
      show({ title: "Deleted", variant: "success" });
      void load();
    } catch (e) {
      show({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openOffers = async (item: CatalogUniversityAdmin) => {
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const detail = await AdminAcademicCatalogService.getUniversity(token, item.id);
      setOffersUniversity(detail);
      setSelectedDegreeIds(
        new Set(detail.degrees.filter((d) => d.offeringIsActive).map((d) => d.id))
      );
      setOffersOpen(true);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load university degrees.",
        variant: "error",
      });
    }
  };

  const saveOffers = async () => {
    if (!offersUniversity) return;
    setSavingOffers(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      await AdminAcademicCatalogService.setUniversityDegrees(
        token,
        offersUniversity.id,
        Array.from(selectedDegreeIds)
      );
      AcademicCatalogService.clearCache();
      setOffersOpen(false);
      show({ title: "Degree offerings updated", variant: "success" });
      void load();
    } catch (e) {
      show({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Could not update offerings.",
        variant: "error",
      });
    } finally {
      setSavingOffers(false);
    }
  };

  return (
    <div className="space-y-6">
        <AdminPageHeader
        icon={GraduationCap}
        title="Universities & degrees"
        subtitle="Manage the lists used in student registration, profiles, and talent search."
      >
      </AdminPageHeader>

      <AdminFilterPanel>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={tab === "universities" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setTab("universities")}
          >
            Universities ({universities.length})
          </Button>
          <Button
            variant={tab === "degrees" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setTab("degrees")}
          >
            Degrees ({degrees.length})
          </Button>
        </div>
        <Input
          placeholder={`Search ${tab}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm rounded-xl"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox checked={showHidden} onCheckedChange={(v) => setShowHidden(!!v)} />
          Show hidden
        </label>
        <Button className="ml-auto rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add {tab === "universities" ? "university" : "degree"}
        </Button>
      </AdminFilterPanel>

      {loading ? (
        <p className="rounded-[20px] border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading catalog…
        </p>
      ) : tab === "universities" ? (
        <CatalogTable
          empty="No universities found."
          rows={filteredUniversities.map((u) => ({
            id: u.id,
            name: u.name,
            isActive: u.isActive,
            meta: `${u.degreeCount} degree${u.degreeCount === 1 ? "" : "s"}`,
            onEdit: () => openEditUniversity(u),
            onToggle: () => void toggleActive("universities", u.id, !u.isActive),
            onDelete: () => setToDelete({ type: "universities", id: u.id, name: u.name }),
            extraAction: (
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => void openOffers(u)}>
                Degrees
              </Button>
            ),
          }))}
        />
      ) : (
        <CatalogTable
          empty="No degrees found."
          rows={filteredDegrees.map((d) => ({
            id: d.id,
            name: d.name,
            isActive: d.isActive,
            meta: `${d.universityCount} universit${d.universityCount === 1 ? "y" : "ies"}`,
            onEdit: () => openEditDegree(d),
            onToggle: () => void toggleActive("degrees", d.id, !d.isActive),
            onDelete: () => setToDelete({ type: "degrees", id: d.id, name: d.name }),
          }))}
        />
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingUni || editingDegree ? "Edit" : "Add"}{" "}
              {tab === "universities" ? "university" : "degree"}
            </h3>
            <div className="mt-4 space-y-4">
              {tab === "degrees" && !editingDegree && (
                <div className="space-y-2">
                  <Label>University</Label>
                  <Select value={selectedUniversityId} onValueChange={(v) => setSelectedUniversityId(v)}>
                    <SelectTrigger className="rounded-xl" aria-label="Select university">
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-3 pb-0">
                        <Input
                          value={universitySearch}
                          onChange={(e) => setUniversitySearch(e.target.value)}
                          placeholder="Search universities..."
                          className="rounded-xl"
                          autoFocus
                        />
                      </div>
                      {filteredUniversitiesForForm.length === 0 ? (
                        <div className="p-3 text-sm text-slate-500">No universities match your search.</div>
                      ) : (
                        filteredUniversitiesForForm.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  disabled={isDegreeFormDisabled}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(!!v)}
                  disabled={isDegreeFormDisabled}
                />
                Visible to students and companies
              </label>
              {isDegreeFormDisabled && (
                <p className="text-sm text-slate-500">Select a university first to add a degree.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
                disabled={saving || isDegreeFormDisabled}
                onClick={() => void saveForm()}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {offersOpen && offersUniversity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900">Degrees at {offersUniversity.name}</h3>
              <p className="mt-1 text-sm text-slate-500">Select which degrees this university offers.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {degrees.map((degree) => (
                <label
                  key={degree.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50"
                >
                  <Checkbox
                    checked={selectedDegreeIds.has(degree.id)}
                    onCheckedChange={(checked) => {
                      setSelectedDegreeIds((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(degree.id);
                        else next.delete(degree.id);
                        return next;
                      });
                    }}
                  />
                  <span className={cn("text-sm", !degree.isActive && "text-slate-400")}>
                    {degree.name}
                    {!degree.isActive && " (hidden globally)"}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
              <Button variant="outline" className="rounded-xl" onClick={() => setOffersOpen(false)}>
                Cancel
              </Button>
              <Button
                className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
                disabled={savingOffers}
                onClick={() => void saveOffers()}
              >
                {savingOffers ? "Saving…" : "Save offerings"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setToDelete(null);
        }}
        title={`Delete ${toDelete?.type === "universities" ? "university" : "degree"}?`}
        description={
          toDelete
            ? `Delete "${toDelete.name}"? If it is used on student profiles, hide it instead.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function CatalogTable({
  rows,
  empty,
}: {
  empty: string;
  rows: Array<{
    id: string;
    name: string;
    isActive: boolean;
    meta: string;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
    extraAction?: React.ReactNode;
  }>;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-[20px] border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-sm">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-5 py-3.5 font-semibold">Name</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
            {/* Linked column removed per request */}
            <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-50 last:border-0">
              <td className="px-5 py-4 font-medium text-slate-900">{row.name}</td>
              <td className="px-5 py-4">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {row.isActive ? "Visible" : "Hidden"}
                </span>
              </td>
              {/* linked/meta removed */}
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {row.extraAction}
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={row.onEdit}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={row.onToggle}>
                    {row.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-red-600 hover:text-red-700"
                    onClick={row.onDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
