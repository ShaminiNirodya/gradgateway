"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminPlatformSettings } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { Settings as SettingsIcon, AlertTriangle } from "lucide-react";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";

export default function AdminSettingsPage() {
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [settings, setSettings] = useState<AdminPlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) return;
        setSettings(await AdminService.getSettings(token));
      } catch (e) {
        show({
          title: "Load failed",
          description: e instanceof Error ? e.message : "Could not load settings.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [show]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) return;
      const updated = await AdminService.updateSettings(token, {
        allowRegistration: settings.allowRegistration,
        requireCompanyVerification: false,
        maintenanceMode: settings.maintenanceMode,
      });
      setSettings(updated);
      void refreshStats();
      show({ title: "Settings saved", variant: "success" });
    } catch (e) {
      show({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Could not save settings.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#6C5DD3]" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-red-600">Could not load platform settings.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Last saved {new Date(settings.updatedAt).toLocaleString()}
        </p>
      </div>

      {stats && (
        <AdminStatCards
          columns={3}
          items={[
            {
              label: "Registration",
              value: settings.allowRegistration ? "Enabled" : "Disabled",
            },
            {
              label: "Maintenance",
              value: settings.maintenanceMode ? "Active" : "Off",
              highlight: settings.maintenanceMode,
            },
          ]}
        />
      )}

      <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-800">
          <SettingsIcon className="h-5 w-5" />
          <h2 className="font-bold">General</h2>
        </div>

        <SettingRow
          title="User registration"
          description="Allow new student and company sign-ups."
          checked={settings.allowRegistration}
          onChange={(v) => setSettings({ ...settings, allowRegistration: v })}
        />
        <SettingRow
          title="Maintenance mode"
          description="Block access for all non-admin users."
          checked={settings.maintenanceMode}
          onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
          danger
        />
      </div>

      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Maintenance mode is on. Students and companies cannot use the API until you turn it off.</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          className="rounded-xl bg-slate-900 hover:bg-slate-800"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  danger,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
      <div>
        <p className={`font-medium ${danger ? "text-red-600" : "text-slate-900"}`}>{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex h-6 w-11 shrink-0 items-center rounded-full px-1 transition-colors ${
          checked ? "bg-slate-900" : "bg-slate-200"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
