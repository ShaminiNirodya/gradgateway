"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Hammer, Lock } from "lucide-react";
import { AdminService } from "@/lib/services/admin.service";
import { Button } from "@/components/ui/button";

type GateState = {
  loading: boolean;
  allowRegistration: boolean;
  maintenanceMode: boolean;
};

function usePublicSettings(): GateState {
  const [state, setState] = useState<GateState>({
    loading: true,
    allowRegistration: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    let cancelled = false;
    AdminService.getPublicSettings()
      .then((settings) => {
        if (!cancelled) {
          setState({
            loading: false,
            allowRegistration: settings.allowRegistration,
            maintenanceMode: settings.maintenanceMode,
          });
        }
      })
      .catch(() => {
        // If settings can't be loaded, fail open so the site stays usable.
        if (!cancelled) {
          setState({ loading: false, allowRegistration: true, maintenanceMode: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** Blocks registration forms when an admin has disabled sign-ups. */
export function RegistrationGate({ children }: { children: ReactNode }) {
  const { loading, allowRegistration } = usePublicSettings();

  if (loading) return <>{children}</>;

  if (!allowRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Registration is currently closed</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            New sign-ups are temporarily paused by the platform administrators. Please check back
            later, or contact support if you believe this is a mistake.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="soft">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">Contact support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Shows a full-page maintenance screen for non-admin users when
 * maintenance mode is enabled. The API independently rejects non-admin
 * requests with 503 while maintenance mode is active.
 */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { loading, maintenanceMode } = usePublicSettings();

  if (!loading && maintenanceMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-[#6C5DD3]">
            <Hammer className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">We&apos;ll be right back</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            GradGateway is undergoing scheduled maintenance. Your data is safe — please check back
            in a little while.
          </p>
          <Button asChild variant="soft" className="mt-6">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
