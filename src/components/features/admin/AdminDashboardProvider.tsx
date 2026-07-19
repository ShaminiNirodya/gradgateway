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
import {
  countUnseenTestimonials,
  markTestimonialsAsSeen,
} from "@/lib/utils/admin-testimonials-badge";

function normalizeDashboard(raw: Partial<AdminDashboard>): AdminDashboard {
  return {
    totalStudents: raw.totalStudents ?? 0,
    totalCompanies: raw.totalCompanies ?? 0,
    totalProjects: raw.totalProjects ?? 0,
    hiringRate: raw.hiringRate ?? 0,
    totalUsers: raw.totalUsers ?? 0,
    activeUsers: raw.activeUsers ?? 0,
    suspendedUsers: raw.suspendedUsers ?? 0,
    studentAccounts: raw.studentAccounts ?? 0,
    companyAccounts: raw.companyAccounts ?? 0,
    adminAccounts: raw.adminAccounts ?? 0,
    totalApplications: raw.totalApplications ?? 0,
    hiredApplications: raw.hiredApplications ?? 0,
    signupsLast7Days: raw.signupsLast7Days ?? 0,
    activeJobPosts: raw.activeJobPosts ?? 0,
    expiredJobPosts: raw.expiredJobPosts ?? 0,
    openSupportInquiries: raw.openSupportInquiries ?? 0,
    totalSupportInquiries: raw.totalSupportInquiries ?? 0,
    pendingTestimonials: raw.pendingTestimonials ?? 0,
  };
}

type AdminDashboardContextValue = {
  data: AdminDashboard | null;
  loading: boolean;
  error: string | null;
  refreshedAt: Date | null;
  newTestimonialsCount: number;
  refresh: () => Promise<void>;
  markTestimonialsSeen: () => void;
};

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [newTestimonialsCount, setNewTestimonialsCount] = useState(0);

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
      const [dashboard, pendingTestimonials] = await Promise.all([
        AdminService.getDashboard(token),
        AdminService.getTestimonials(token, { status: "Pending" }).catch(() => []),
      ]);
      setNewTestimonialsCount(countUnseenTestimonials(pendingTestimonials));
      setData(
        normalizeDashboard({
          ...dashboard,
          pendingTestimonials: pendingTestimonials.length,
        })
      );
      setRefreshedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const markTestimonialsSeen = useCallback(() => {
    markTestimonialsAsSeen();
    setNewTestimonialsCount(0);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <AdminDashboardContext.Provider
      value={{ data, loading, error, refreshedAt, newTestimonialsCount, refresh, markTestimonialsSeen }}
    >
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
