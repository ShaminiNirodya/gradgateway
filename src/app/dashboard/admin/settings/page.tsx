"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { useToast } from "@/components/ui/toast";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import type { AdminPlatformSettings } from "@/lib/types/admin";
import { cn } from "@/lib/utils";
import { RefreshCw, Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const { show } = useToast();
  const [platformSettings, setPlatformSettings] = useState<AdminPlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const settings = await AdminService.getSettings(token);
      setPlatformSettings(settings);
    } catch (e) {
      show({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Could not load settings.",
        variant: "error",
      });
      setPlatformSettings(null);
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    void load();
  }, [load]);

  const savePlatformSettings = async () => {
    if (!platformSettings) return;
    setSavingPlatform(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const updated = await AdminService.updateSettings(token, {
        allowRegistration: platformSettings.allowRegistration,
        maintenanceMode: platformSettings.maintenanceMode,
      });
      setPlatformSettings(updated);
      show({ title: "Platform settings saved", variant: "success" });
    } catch (e) {
      show({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Could not save platform settings.",
        variant: "error",
      });
    } finally {
      setSavingPlatform(false);
    }
  };

  return (
    <div className="space-y-8 pb-6">
      <AdminPageHeader
        icon={Settings}
        title="Settings"
        subtitle="Platform registration and maintenance controls."
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

      <section className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Platform</h2>
        <p className="mt-1 text-sm text-slate-500">Registration and maintenance controls.</p>
        {platformSettings ? (
          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Allow registration</p>
                <p className="text-xs text-slate-500">Let new students and companies sign up.</p>
              </div>
              <input
                type="checkbox"
                checked={platformSettings.allowRegistration}
                onChange={(e) =>
                  setPlatformSettings((prev) =>
                    prev ? { ...prev, allowRegistration: e.target.checked } : prev
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Maintenance mode</p>
                <p className="text-xs text-slate-500">Block non-admin access to the platform.</p>
              </div>
              <input
                type="checkbox"
                checked={platformSettings.maintenanceMode}
                onChange={(e) =>
                  setPlatformSettings((prev) =>
                    prev ? { ...prev, maintenanceMode: e.target.checked } : prev
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>
            <Button
              className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
              onClick={() => void savePlatformSettings()}
              disabled={savingPlatform}
            >
              {savingPlatform ? "Saving…" : "Save platform settings"}
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">{loading ? "Loading…" : "Could not load platform settings."}</p>
        )}
      </section>
    </div>
  );
}
