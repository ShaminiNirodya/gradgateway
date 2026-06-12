"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminPlatformSettings } from "@/lib/types/admin";
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, RefreshCw, Settings as SettingsIcon, Shield } from "lucide-react";
import { useAdminDashboard } from "@/components/features/admin/AdminDashboardProvider";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AdminStatCards } from "@/components/features/admin/AdminStatCards";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { show } = useToast();
  const { data: stats, refresh: refreshStats } = useAdminDashboard();
  const [settings, setSettings] = useState<AdminPlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
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

  useEffect(() => {
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
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        icon={SettingsIcon}
        title="Platform settings"
        subtitle="Control registration and maintenance mode for the whole GradGateway platform."
        badge={`Updated ${new Date(settings.updatedAt).toLocaleDateString()}`}
        variant="slate"
      >
        <Button
          variant="secondary"
          className="rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
          onClick={() => void load()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
      </AdminPageHeader>

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
          {
            label: "Admin accounts",
            value: stats?.adminAccounts ?? "—",
          },
        ]}
      />

      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Maintenance mode is on. Students and companies cannot use the API until you turn it
            off.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5DD3]/10 text-[#6C5DD3]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Access control</h2>
              <p className="text-xs text-slate-500">Who can sign up and use the platform</p>
            </div>
          </div>

          <SettingRow
            title="User registration"
            description="Allow new student and company sign-ups from the public site."
            checked={settings.allowRegistration}
            onChange={(v) => setSettings({ ...settings, allowRegistration: v })}
          />
          <SettingRow
            title="Maintenance mode"
            description="Block API access for all non-admin users while you perform updates."
            checked={settings.maintenanceMode}
            onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
            danger
          />
        </section>

        <section className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-6">
          <h2 className="font-bold text-slate-800">What these settings do</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <span className="font-semibold text-slate-800">Registration off</span> — new sign-ups
              are blocked; existing users can still log in.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Maintenance on</span> — students and
              companies receive errors on API calls; admins keep full access.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Block account</span> — done from
              Students, Companies, or All users. Blocking hides access and visibility; accounts are
              not deleted and can be unblocked later.
            </li>
          </ul>
        </section>
      </div>

      <div className="flex justify-end">
        <Button
          className="rounded-xl bg-[#6C5DD3] px-8 hover:bg-[#5b4ec4]"
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
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-5 last:border-0">
      <div>
        <p className={cn("font-semibold", danger && checked ? "text-red-600" : "text-slate-900")}>
          {title}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors",
          checked
            ? danger
              ? "bg-red-500"
              : "bg-[#6C5DD3]"
            : "bg-slate-200"
        )}
      >
        <div
          className={cn(
            "h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
