"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { signalRService } from "@/lib/services/signalr.service";

/** Starts one shared SignalR connection for the dashboard session. */
export function SignalRConnectionProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      void signalRService.stop();
      return;
    }

    void signalRService.start();
  }, [user, loading]);

  return <>{children}</>;
}
