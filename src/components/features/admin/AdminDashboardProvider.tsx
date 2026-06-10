"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthService } from "@/lib/services/auth.service";
import { AdminService } from "@/lib/services/admin.service";
import { AdminDashboard } from "@/lib/types/admin";

type AdminDashboardContextValue = {
  data: AdminDashboard | null;
  loading: boolean;
  error: string | null;
  refreshedAt: Date | null;
  refresh: () => Promise<void>;
};

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        setError("Not authenticated.");
        setData(null);
        return;
      }
      const dashboard = await AdminService.getDashboard(token);
      setData(dashboard);
      setRefreshedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AdminDashboardContext.Provider value={{ data, loading, error, refreshedAt, refresh }}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDashboard() {
  const ctx = useContext(AdminDashboardContext);
  if (!ctx) {
    throw new Error("useAdminDashboard must be used within AdminDashboardProvider");
  }
  return ctx;
}
